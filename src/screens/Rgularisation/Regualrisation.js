import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Modal,
  StatusBar,
  RefreshControl,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../context/AuthContext';

// ─── Config ─────────────────────────────────────────────────────────────────
// Swap this with your real host, e.g. https://whiteforcepayroll.com
const BASE_URL = 'https://whiteforcepayroll.com/admin/api';

// Proof image compression target — kept aggressive since these are just
// verification snapshots, not photos anyone needs full resolution on.
const PROOF_MAX_DIMENSION = 640;
const PROOF_JPEG_QUALITY = 25; // 0-100, lower = smaller file

// Local key for requests that couldn't reach the server — synced back out
// automatically the moment connectivity returns.
const OFFLINE_QUEUE_KEY = 'attendance_regularization_offline_queue';

// ─── Theme — same palette as ManagerApprovalScreen / LeaveCard ──────────────
const C = {
  primary: '#1A4731',
  primaryMid: '#2D6A4F',
  primaryBg: '#E8F0EB',
  bg: '#F2F4F3',
  white: '#FFFFFF',
  border: '#D1DDD6',
  textPrimary: '#0F2419',
  textSub: '#1A4731',
  textMuted: '#4A7060',
  error: '#C0392B',
  success: '#27AE60',
  infoBg: '#E4EEE8',
  shadow: 'rgba(26,71,49,0.12)',
  pendingBg: '#FFF3CD',
  pendingText: '#856404',
  approvedBg: '#D1FAE5',
  approvedText: '#065F46',
  rejectedBg: '#FEE2E2',
  rejectedText: '#991B1B',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];
const SECTION_TABS = [
  { key: 'apply', label: 'Apply', icon: 'edit-calendar' },
  { key: 'history', label: 'History', icon: 'history' },
];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const normalizeStatus = (s) => (s ? s.toLowerCase() : 'pending');

const pad2 = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toTimeStr = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const fmtDateDisplay = (str) => {
  if (!str) return '—';
  const parts = str.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
};
const fmtTimeDisplay = (d) => {
  if (!d) return 'HH:MM';
  let h = d.getHours();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad2(h)}:${pad2(d.getMinutes())} ${period}`;
};
const fmtFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

// ─── Date helpers for the custom calendar popup ──────────────────────────────
const stripTime = (d) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};
const isSameDay = (a, b) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getMonthMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

// ─── Time helpers for the custom time popup ─────────────────────────────────
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => i);   // 0..59
const TIME_ITEM_H = 44;

const to12Hour = (date) => {
  const d = date || new Date();
  let h = d.getHours();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return { hour: h, minute: d.getMinutes(), period };
};

const from12Hour = (hour, minute, period, baseDate) => {
  let h = hour % 12;
  if (period === 'PM') h += 12;
  const d = new Date(baseDate || new Date());
  d.setHours(h, minute, 0, 0);
  return d;
};

// ─── Proof image compression ────────────────────────────────────────────────
// Runs every picked/captured image through a resize + re-encode pass so the
// uploaded proof stays tiny regardless of what the camera/gallery handed us.
// Returns null on failure so callers can fall back to the original asset.
const compressProofImage = async (uri) => {
  try {
    const resized = await ImageResizer.createResizedImage(
      uri,
      PROOF_MAX_DIMENSION,
      PROOF_MAX_DIMENSION,
      'JPEG',
      PROOF_JPEG_QUALITY,
      0,
      undefined,
      false,
      { mode: 'contain', onlyScaleDown: true },
    );
    return resized; // { uri, path, size, width, height, name }
  } catch (err) {
    console.log('Proof image compression error:', err);
    return null;
  }
};

// ─── Offline queue helpers ───────────────────────────────────────────────────
// A tiny local queue of regularization requests that failed to reach the
// server (no network, or the server itself was unreachable). Each entry
// carries everything needed to rebuild the multipart request later. Entries
// are removed the moment they're successfully posted.
const readOfflineQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log('Offline queue read error:', err);
    return [];
  }
};

const writeOfflineQueue = async (queue) => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.log('Offline queue write error:', err);
  }
};

const buildRegularizationFormData = (payload) => {
  const formData = new FormData();
  formData.append('user_id', String(payload.user_id));
  formData.append('date', payload.date);
  formData.append('regularization_type', payload.regularization_type);
  if (payload.check_in_time) formData.append('check_in_time', payload.check_in_time);
  if (payload.check_out_time) formData.append('check_out_time', payload.check_out_time);
  formData.append('reason', payload.reason);
  // proof_file is optional/nullable — only append when the user attached one
  if (payload.proof_uri) {
    formData.append('proof_file', {
      uri: payload.proof_uri,
      type: payload.proof_type,
      name: payload.proof_name,
    });
  }
  return formData;
};

// Throws on transport/network failure so callers can tell "server said no"
// apart from "couldn't even reach the server".
const postRegularization = async (payload) => {
  const formData = buildRegularizationFormData(payload);
  const res = await fetch(`${BASE_URL}/store-attendance-regularize`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });
  const json = await res.json();
  return { ok: json.status === true, json };
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const norm = normalizeStatus(status);
  const cfg = {
    pending: { bg: C.pendingBg, text: C.pendingText, label: 'Pending' },
    approved: { bg: C.approvedBg, text: C.approvedText, label: 'Approved' },
    rejected: { bg: C.rejectedBg, text: C.rejectedText, label: 'Rejected' },
  };
  const c = cfg[norm] || cfg.pending;
  return (
    <View style={[s.statusPill, { backgroundColor: c.bg }]}>
      <Text style={[s.statusPillText, { color: c.text }]} numberOfLines={1}>{c.label}</Text>
    </View>
  );
};

// ─── Result Popup ─────────────────────────────────────────────────────────────
const ResultPopup = ({ visible, type, message, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const cfg = {
    success: { iconBg: C.approvedBg, iconColor: C.primary, icon: 'check-circle', title: 'Submitted!', titleColor: C.approvedText },
    offline: { iconBg: C.pendingBg, iconColor: C.pendingText, icon: 'cloud-off', title: 'Saved Offline', titleColor: C.pendingText },
    error: { iconBg: C.rejectedBg, iconColor: C.error, icon: 'error', title: 'Something went wrong', titleColor: C.rejectedText },
  };
  const c = cfg[type] || cfg.error;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={s.popupOverlay}>
        <Animated.View style={[s.popupCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={[s.popupIconOuter, { backgroundColor: c.iconBg }]}>
            <View style={[s.popupIconInner, { backgroundColor: c.iconColor }]}>
              <MaterialIcons name={c.icon} size={28} color={C.white} />
            </View>
          </View>
          <Text style={[s.popupTitle, { color: c.titleColor }]}>{c.title}</Text>
          <Text style={s.popupMessage}>
            {message || 'Your regularization request has been submitted.'}
          </Text>
          <TouchableOpacity style={s.popupBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.popupBtnText} numberOfLines={1}>Done</Text>
            <MaterialIcons name="arrow-forward" size={16} color={C.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Zoomable Image Modal ─────────────────────────────────────────────────────
const ZoomImageModal = ({ visible, uri, onClose }) => {
  const images = uri ? [{ url: uri }] : [];
  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="fade">
      <ImageViewer
        imageUrls={images}
        enableSwipeDown
        onSwipeDown={onClose}
        onCancel={onClose}
        renderHeader={() => (
          <TouchableOpacity style={s.zoomClose} onPress={onClose}>
            <MaterialIcons name="close" size={22} color={C.white} />
          </TouchableOpacity>
        )}
        backgroundColor="rgba(0,0,0,0.95)"
        renderIndicator={() => null}
      />
    </Modal>
  );
};

// ─── Custom Date Picker Popup (replaces the third-party date modal) ─────────
const CustomDatePickerModal = ({ visible, value, onConfirm, onCancel, maximumDate, minimumDate }) => {
  const [viewDate, setViewDate] = useState(value || new Date());
  const [selected, setSelected] = useState(value || new Date());
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setViewDate(value || new Date());
      setSelected(value || new Date());
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const maxD = maximumDate ? stripTime(maximumDate) : null;
  const minD = minimumDate ? stripTime(minimumDate) : null;

  const isDisabled = (d) => {
    if (!d) return true;
    if (maxD && d > maxD) return true;
    if (minD && d < minD) return true;
    return false;
  };

  const nextMonthDisabled = !!maxD && year === maxD.getFullYear() && month === maxD.getMonth();
  const prevMonthDisabled = !!minD && year === minD.getFullYear() && month === minD.getMonth();

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const t = new Date();
    setViewDate(t);
    if (!isDisabled(stripTime(t))) setSelected(t);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <View style={s.dpOverlay}>
        <Animated.View style={[s.dpCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={s.dpHeader}>
            <TouchableOpacity
              onPress={goPrevMonth}
              disabled={prevMonthDisabled}
              style={s.dpNavBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="chevron-left" size={22} color={prevMonthDisabled ? C.border : C.primary} />
            </TouchableOpacity>
            <Text style={s.dpHeaderText}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity
              onPress={goNextMonth}
              disabled={nextMonthDisabled}
              style={s.dpNavBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="chevron-right" size={22} color={nextMonthDisabled ? C.border : C.primary} />
            </TouchableOpacity>
          </View>

          <View style={s.dpWeekRow}>
            {DAY_NAMES.map((d, i) => (
              <Text key={i} style={s.dpWeekLabel}>{d}</Text>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={s.dpWeekRow}>
              {week.map((d, di) => {
                const disabled = isDisabled(d);
                const sel = d && isSameDay(d, selected);
                const isToday = d && isSameDay(d, new Date());
                return (
                  <TouchableOpacity
                    key={di}
                    style={[s.dpDayCell, sel && s.dpDayCellSelected]}
                    disabled={disabled}
                    onPress={() => d && setSelected(d)}
                    activeOpacity={0.7}
                  >
                    {d ? (
                      <Text
                        style={[
                          s.dpDayText,
                          disabled && s.dpDayTextDisabled,
                          isToday && !sel && s.dpDayTextToday,
                          sel && s.dpDayTextSelected,
                        ]}
                      >
                        {d.getDate()}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <View style={s.dpFooter}>
            <TouchableOpacity style={s.dpTodayBtn} onPress={goToday} activeOpacity={0.75}>
              <MaterialIcons name="today" size={14} color={C.primary} />
              <Text style={s.dpTodayText} numberOfLines={1}>Today</Text>
            </TouchableOpacity>
            <View style={s.dpFooterActions}>
              <TouchableOpacity style={s.dpCancelBtn} onPress={onCancel} activeOpacity={0.75}>
                <Text style={s.dpCancelText} numberOfLines={1}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.dpConfirmBtn}
                onPress={() => onConfirm(selected)}
                activeOpacity={0.85}
              >
                <Text style={s.dpConfirmText} numberOfLines={1}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Custom Time Picker Popup (replaces DateTimePickerModal for time) ───────
const CustomTimePickerModal = ({ visible, value, onConfirm, onCancel, title }) => {
  const initial = to12Hour(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const init = to12Hour(value);
      setHour(init.hour);
      setMinute(init.minute);
      setPeriod(init.period);
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      // Snap the wheels to the current value once the lists have laid out.
      const t = setTimeout(() => {
        hourListRef.current?.scrollToOffset({ offset: (init.hour - 1) * TIME_ITEM_H, animated: false });
        minuteListRef.current?.scrollToOffset({ offset: init.minute * TIME_ITEM_H, animated: false });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [visible, value]);

  if (!visible) return null;

  const snapHour = (idx) => {
    const clamped = Math.max(0, Math.min(HOURS_12.length - 1, idx));
    setHour(HOURS_12[clamped]);
  };
  const snapMinute = (idx) => {
    const clamped = Math.max(0, Math.min(MINUTES_60.length - 1, idx));
    setMinute(MINUTES_60[clamped]);
  };

  const handleConfirm = () => onConfirm(from12Hour(hour, minute, period, value));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <View style={s.dpOverlay}>
        <Animated.View style={[s.tpCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={s.dpHeaderText}>{title || 'Select Time'}</Text>

          <View style={s.tpPreviewRow}>
            <Text style={s.tpPreviewText}>{pad2(hour)}:{pad2(minute)} {period}</Text>
          </View>

          <View style={s.tpColumnsRow}>
            <View pointerEvents="none" style={s.tpHighlight} />

            <View style={s.tpColumnWrap}>
              <FlatList
                ref={hourListRef}
                data={HOURS_12}
                keyExtractor={(i) => `h_${i}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={TIME_ITEM_H}
                decelerationRate="fast"
                getItemLayout={(_, i) => ({ length: TIME_ITEM_H, offset: TIME_ITEM_H * i, index: i })}
                onMomentumScrollEnd={(e) => snapHour(Math.round(e.nativeEvent.contentOffset.y / TIME_ITEM_H))}
                contentContainerStyle={{ paddingVertical: TIME_ITEM_H }}
                style={s.tpColumn}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.tpCell}
                    activeOpacity={0.7}
                    onPress={() => {
                      setHour(item);
                      hourListRef.current?.scrollToOffset({ offset: (item - 1) * TIME_ITEM_H, animated: true });
                    }}
                  >
                    <Text style={[s.tpCellText, item === hour && s.tpCellTextActive]}>{pad2(item)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <Text style={s.tpColon}>:</Text>

            <View style={s.tpColumnWrap}>
              <FlatList
                ref={minuteListRef}
                data={MINUTES_60}
                keyExtractor={(i) => `m_${i}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={TIME_ITEM_H}
                decelerationRate="fast"
                getItemLayout={(_, i) => ({ length: TIME_ITEM_H, offset: TIME_ITEM_H * i, index: i })}
                onMomentumScrollEnd={(e) => snapMinute(Math.round(e.nativeEvent.contentOffset.y / TIME_ITEM_H))}
                contentContainerStyle={{ paddingVertical: TIME_ITEM_H }}
                style={s.tpColumn}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.tpCell}
                    activeOpacity={0.7}
                    onPress={() => {
                      setMinute(item);
                      minuteListRef.current?.scrollToOffset({ offset: item * TIME_ITEM_H, animated: true });
                    }}
                  >
                    <Text style={[s.tpCellText, item === minute && s.tpCellTextActive]}>{pad2(item)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={s.tpPeriodWrap}>
              {['AM', 'PM'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[s.tpPeriodBtn, period === p && s.tpPeriodBtnActive]}
                  onPress={() => setPeriod(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.tpPeriodText, period === p && s.tpPeriodTextActive]} numberOfLines={1}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.dpFooter}>
            <TouchableOpacity style={s.dpCancelBtn} onPress={onCancel} activeOpacity={0.75}>
              <Text style={s.dpCancelText} numberOfLines={1}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.dpConfirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={s.dpConfirmText} numberOfLines={1}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Camera / Gallery chooser for the proof file ────────────────────────────
const ImageSourceModal = ({ visible, onPickCamera, onPickGallery, onCancel }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={s.isOverlay} activeOpacity={1} onPress={onCancel}>
        <Animated.View
          style={[s.isSheet, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={s.isHandle} />
          <Text style={s.isTitle}>Add Proof</Text>
          <Text style={s.isSubtitle}>Choose how you'd like to attach your proof</Text>

          <View style={s.isOptionsRow}>
            <TouchableOpacity style={s.isOption} onPress={onPickCamera} activeOpacity={0.8}>
              <View style={s.isOptionIconBox}>
                <MaterialIcons name="photo-camera" size={24} color={C.primary} />
              </View>
              <Text style={s.isOptionText} numberOfLines={1}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.isOption} onPress={onPickGallery} activeOpacity={0.8}>
              <View style={s.isOptionIconBox}>
                <MaterialIcons name="photo-library" size={24} color={C.primary} />
              </View>
              <Text style={s.isOptionText} numberOfLines={1}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.isCancelBtn} onPress={onCancel} activeOpacity={0.75}>
            <Text style={s.isCancelText} numberOfLines={1}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Filter Tab Row ───────────────────────────────────────────────────────────
const FilterTabRow = ({ filters, active, counts, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={s.filterRow}
  >
    {filters.map((f) => {
      const isActive = active === f;
      const count = counts[f.toLowerCase()] ?? 0;
      return (
        <TouchableOpacity
          key={f}
          onPress={() => onSelect(f)}
          style={[s.filterChip, isActive && s.filterChipActive]}
          activeOpacity={0.75}
        >
          <Text style={[s.filterChipText, isActive && s.filterChipTextActive]} numberOfLines={1}>{f}</Text>
          <View style={[s.filterCount, isActive && s.filterCountActive]}>
            <Text style={[s.filterCountText, isActive && s.filterCountTextActive]} numberOfLines={1}>{count}</Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ─── Section Tab Bar (pixel-accurate sliding indicator) ─────────────────────
const SectionTabBar = ({ tabs, active, pendingCount, onSelect }) => {
  const containerWidth = useRef(0);
  const [ready, setReady] = useState(false);
  const [tabWidth, setTabWidth] = useState(0);
  const [padding, setPadding] = useState(4);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = tabs.findIndex((t) => t.key === active);

  useEffect(() => {
    if (tabWidth > 0) {
      Animated.timing(indicatorAnim, {
        toValue: activeIndex,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, tabWidth]);

  const onContainerLayout = (e) => {
    const w = e.nativeEvent.layout.width;
    containerWidth.current = w;
    const pad = 4; // matches sectionToggle padding in styles
    const innerWidth = w - pad * 2;
    setPadding(pad);
    setTabWidth(innerWidth / tabs.length);
    setReady(true);
  };

  const translateX = indicatorAnim.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => i * tabWidth),
  });

  return (
    <View style={s.sectionToggle} onLayout={onContainerLayout}>
      {ready && (
        <Animated.View
          style={[
            s.sectionIndicator,
            {
              left: padding,
              width: tabWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={s.sectionTab}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.75}
          >
            <MaterialIcons
              name={tab.icon}
              size={15}
              color={isActive ? C.primary : 'rgba(255,255,255,0.55)'}
            />
            <Text style={[s.sectionTabText, isActive && s.sectionTabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
            {tab.key === 'history' && pendingCount > 0 && (
              <View style={s.sectionBadge}>
                <Text style={s.sectionBadgeText} numberOfLines={1}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Offline Sync Banner ──────────────────────────────────────────────────────
// Shown whenever there are locally-queued requests waiting to reach the
// server. Visible across both the Apply and History tabs so it's never
// out of sight while something is still pending.
const OfflineSyncBanner = ({ count, syncing, onRetry, onDiscard }) => {
  if (!count) return null;
  return (
    <View style={s.offlineBanner}>
      <MaterialIcons name="cloud-off" size={16} color={C.pendingText} />
      <Text style={s.offlineBannerText} numberOfLines={1}>
        {count} request{count > 1 ? 's' : ''} waiting to sync
      </Text>
      <TouchableOpacity
        style={s.offlineBannerBtn}
        onPress={onRetry}
        disabled={syncing}
        activeOpacity={0.75}
      >
        {syncing ? (
          <ActivityIndicator size="small" color={C.pendingText} />
        ) : (
          <Text style={s.offlineBannerBtnText} numberOfLines={1}>Retry</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDiscard}
        disabled={syncing}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <MaterialIcons name="close" size={16} color={C.pendingText} />
      </TouchableOpacity>
    </View>
  );
};

// ─── History Card ─────────────────────────────────────────────────────────────
// Alignment notes:
// - Header row is top-aligned (not center) so the status pill pins to the
//   top-right corner regardless of how many lines the title/subtitle wrap to.
// - The icon + title/subtitle block sits at the top of the row too, next to
//   the pill, instead of being vertically centered against the icon box.
// - The three detail columns are center-aligned with thin dividers between
//   them so PUNCH IN / PUNCH OUT / SUBMITTED line up identically card to card.
// - The proof thumbnail row keeps the thumbnail, label, and zoom icon on one
//   consistent baseline via alignItems: 'center'.
const RegularizationCard = ({ item, onViewProof }) => {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.cardIconBox}>
          <MaterialIcons name="edit-calendar" size={20} color={C.primary} />
        </View>
        <View style={s.cardMeta}>
          <Text style={s.cardTitle} numberOfLines={1}>{fmtDateDisplay(item.date)}</Text>
          <Text style={s.cardSub} numberOfLines={1}>Ref #{item.id}</Text>
        </View>
        <StatusPill status={item.status} />
      </View>

      <View style={s.cardDivider} />

      <View style={s.detailsGrid}>
        <View style={s.detailItem}>
          <Text style={s.detailLabel} numberOfLines={1}>PUNCH IN</Text>
          <Text style={s.detailValue} numberOfLines={1}>{item.in_time ? item.in_time.slice(0, 5) : '—'}</Text>
        </View>
        <View style={s.detailDivider} />
        <View style={s.detailItem}>
          <Text style={s.detailLabel} numberOfLines={1}>PUNCH OUT</Text>
          <Text style={s.detailValue} numberOfLines={1}>{item.out_time ? item.out_time.slice(0, 5) : '—'}</Text>
        </View>
        <View style={s.detailDivider} />
        <View style={s.detailItem}>
          <Text style={s.detailLabel} numberOfLines={1}>SUBMITTED</Text>
          <Text style={s.detailValue} numberOfLines={1}>
            {item.created_at ? fmtDateDisplay(item.created_at.slice(0, 10)) : '—'}
          </Text>
        </View>
      </View>

      {item.reason ? (
        <View style={s.reasonRow}>
          <Text style={s.reasonText} numberOfLines={2}>"{item.reason}"</Text>
        </View>
      ) : null}

      {item.proof_file_url ? (
        <TouchableOpacity
          style={s.thumbRow}
          onPress={() => onViewProof(item.proof_file_url)}
          activeOpacity={0.8}
        >
          {/pdf$/i.test(item.proof_file_url) ? (
            <View style={[s.thumb, s.thumbPdf]}>
              <MaterialIcons name="picture-as-pdf" size={20} color={C.primary} />
            </View>
          ) : (
            <Image source={{ uri: item.proof_file_url }} style={s.thumb} resizeMode="cover" />
          )}
          <View style={s.thumbMeta}>
            <MaterialIcons name="attach-file" size={12} color={C.textMuted} />
            <Text style={s.thumbLabel} numberOfLines={1}>Tap to view proof</Text>
          </View>
          <MaterialIcons name="zoom-in" size={18} color={C.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, message }) => (
  <View style={s.emptyState}>
    <MaterialIcons name={icon} size={52} color={C.border} />
    <Text style={s.emptyTitle}>No requests</Text>
    <Text style={s.emptySubtitle}>{message}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AttendanceRegularizationScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || '{}');
  const userid = parseData?.data?.data?.user_id;
  const user_id = parseData?.data?.user_id ? parseData?.data?.user_id : userid;

  const [activeSection, setActiveSection] = useState('apply'); // 'apply' | 'history'

  // ── History state ──
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [zoomUri, setZoomUri] = useState(null);

  // ── Apply form state ──
  const [date, setDate] = useState(new Date());
  const [inTime, setInTime] = useState(null);
  const [outTime, setOutTime] = useState(null);
  const [reason, setReason] = useState('');
  const [proofFile, setProofFile] = useState(null); // { uri, type, name, size }
  const [compressingProof, setCompressingProof] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [inTimePickerVisible, setInTimePickerVisible] = useState(false);
  const [outTimePickerVisible, setOutTimePickerVisible] = useState(false);
  const [imageSourceVisible, setImageSourceVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: null, message: '' });

  // ── Offline queue state ──
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const syncingRef = useRef(false);       // guards against overlapping sync passes
  const prevConnected = useRef(null);     // tracks last known connectivity state

  const switchSection = (sec) => setActiveSection(sec);

  // ── Fetch history ──
  const fetchHistory = async (silent = false) => {
    if (!user_id) return;
    if (!silent) setLoadingHistory(true);
    try {
      const res = await fetch(`${BASE_URL}/regularization/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          user_id

        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setHistory(json.data || []);
        console.log(json.data)
      }
    } catch (err) {
      console.log('Regularization history fetch error:', err);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'history') fetchHistory();
  }, [activeSection]);

  // ── Offline queue: sync pass ──
  // Walks every locally-queued request in order and tries to POST it. A
  // request that the server accepts is removed from the queue immediately
  // (so it's never resubmitted); a genuine transport failure stops the pass
  // early since connectivity is presumably still down, leaving the rest
  // queued for the next attempt.
  const syncOfflineQueue = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncingQueue(true);

    let queue = await readOfflineQueue();
    let syncedAny = false;

    for (const item of queue) {
      try {
        const result = await postRegularization(item);
        if (result.ok) {
          queue = queue.filter((q) => q.localId !== item.localId);
          await writeOfflineQueue(queue);
          setOfflineQueueCount(queue.length);
          syncedAny = true;
        }
      } catch (err) {
        console.log('Offline queue sync paused, still unreachable:', err);
        break;
      }
    }

    setSyncingQueue(false);
    syncingRef.current = false;
    if (syncedAny && activeSection === 'history') fetchHistory(true);
  }, [activeSection]);

  // Clear all locally-queued items (user manually discards stuck requests).
  const clearOfflineQueue = useCallback(async () => {
    await writeOfflineQueue([]);
    setOfflineQueueCount(0);
  }, []);

  // Load queue on mount — try to flush only if items exist.
  useEffect(() => {
    (async () => {
      const queue = await readOfflineQueue();
      setOfflineQueueCount(queue.length);
      if (queue.length) syncOfflineQueue();
    })();
  }, []);

  // Auto-retry ONLY when connectivity transitions from offline → online.
  // Using prevConnected ref avoids triggering on the initial NetInfo
  // event that fires immediately on mount (which caused the repeat loop).
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = !!(state.isConnected && state.isInternetReachable !== false);
      if (isOnline && prevConnected.current === false) {
        syncOfflineQueue();
      }
      prevConnected.current = isOnline;
    });
    return () => unsubscribe();
  }, [syncOfflineQueue]);

  const filteredHistory = history.filter((h) =>
    historyFilter === 'All' ? true : normalizeStatus(h.status) === historyFilter.toLowerCase()
  );

  const historyCounts = {
    all: history.length,
    pending: history.filter((h) => normalizeStatus(h.status) === 'pending').length,
    approved: history.filter((h) => normalizeStatus(h.status) === 'approved').length,
    rejected: history.filter((h) => normalizeStatus(h.status) === 'rejected').length,
  };

  // ── Proof file: camera / gallery response handler ──
  // Every picked/captured asset is run through compressProofImage before it
  // ever touches state, so what gets previewed is exactly what gets uploaded
  // — no surprise multi-MB camera originals slipping through.
  const handleImagePickerResponse = async (response) => {
    setImageSourceVisible(false);
    if (response.didCancel || response.errorCode) {
      if (response.errorCode) {
        console.log('Image picker error:', response.errorCode, response.errorMessage);
      }
      return;
    }
    const asset = response.assets && response.assets[0];
    if (!asset) return;

    setCompressingProof(true);
    const compressed = await compressProofImage(asset.uri);
    setCompressingProof(false);

    if (compressed) {
      setProofFile({
        uri: compressed.uri,
        type: 'image/jpeg',
        name: asset.fileName || `proof_${Date.now()}.jpg`,
        size: compressed.size,
      });
    } else {
      // Compression failed for some reason — fall back to the original
      // rather than blocking the user from attaching proof at all.
      setProofFile({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `proof_${Date.now()}.jpg`,
        size: asset.fileSize,
      });
    }
  };

  const handleCameraPick = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, includeBase64: false, saveToPhotos: true },
      handleImagePickerResponse
    );
  };

  const handleGalleryPick = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, includeBase64: false },
      handleImagePickerResponse
    );
  };

  // ── Submit apply form ──
  // Derive regularization_type from which time fields are filled
  const getRegularizationType = () => {
    if (inTime && outTime) return 'both';
    if (inTime) return 'checkin_missing';   // user is supplying the missing check-in
    if (outTime) return 'checkout_missing'; // user is supplying the missing check-out
    return null;
  };

  const validateApplyForm = () => {
    if (!date) return 'Please select a date.';
    if (!inTime && !outTime) return 'Please select punch-in or punch-out time.';
    if (!reason.trim()) return 'Please enter a reason.';
    // proof_file is optional — no hard requirement
    return null;
  };

  const resetApplyForm = () => {
    setDate(new Date());
    setInTime(null);
    setOutTime(null);
    setReason('');
    setProofFile(null);
  };

  const handleSubmit = async () => {
    const errorMsg = validateApplyForm();
    if (errorMsg) {
      Alert.alert('Missing information', errorMsg);
      return;
    }
    if (!user_id) {
      Alert.alert('Error', 'Unable to identify user. Please log in again.');
      return;
    }

    const payload = {
      localId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user_id,
      date: toDateStr(date),
      regularization_type: getRegularizationType(),
      check_in_time: inTime ? `${toTimeStr(inTime)}:00` : null,
      check_out_time: outTime ? `${toTimeStr(outTime)}:00` : null,
      reason: reason.trim(),
      // proof_file is optional — only include when the user attached one
      proof_uri: proofFile ? proofFile.uri : null,
      proof_type: proofFile ? proofFile.type : null,
      proof_name: proofFile ? proofFile.name : null,
    };

    setSubmitting(true);
    try {
      const result = await postRegularization(payload);

      if (result.ok) {
        resetApplyForm();
        setPopup({
          visible: true,
          type: 'success',
          message: result.json.message || 'Attendance regularization request submitted successfully.',
        });
      } else {
        setPopup({
          visible: true,
          type: 'error',
          message: result.json.message || 'Could not submit request. Please try again.',
        });
      }
    } catch (err) {
      // Network unreachable or server down — don't lose the request. Save
      // it locally and it'll go out automatically once connectivity (or
      // the server) is back, without the user having to redo anything.
      console.log('Regularization submit error, queueing offline:', err);
      const queue = await readOfflineQueue();
      queue.push(payload);
      await writeOfflineQueue(queue);
      setOfflineQueueCount(queue.length);

      resetApplyForm();
      setPopup({
        visible: true,
        type: 'offline',
        message: "You're offline right now. This request has been saved and will submit automatically once you're back online.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render: Apply Form ──
  const renderApplyForm = () => (
    <ScrollView
      style={s.formScroll}
      contentContainerStyle={s.formContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.inputField}>
        <Text style={s.inputLabel}>Date</Text>
        <TouchableOpacity style={s.pickerInput} onPress={() => setDatePickerVisible(true)} activeOpacity={0.8}>
          <Text style={s.pickerInputText} numberOfLines={1}>{toDateStr(date)}</Text>
          <MaterialIcons name="calendar-today" size={18} color={C.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.rowFields}>
        <View style={[s.inputField, s.flex1, { marginRight: 8 }]}>
          <Text style={s.inputLabel}>Punch In</Text>
          <TouchableOpacity style={s.pickerInput} onPress={() => setInTimePickerVisible(true)} activeOpacity={0.8}>
            <Text style={s.pickerInputText} numberOfLines={1}>{fmtTimeDisplay(inTime)}</Text>
            <MaterialIcons name="login" size={18} color={C.primary} />
          </TouchableOpacity>
        </View>
        <View style={[s.inputField, s.flex1, { marginLeft: 8 }]}>
          <Text style={s.inputLabel}>Punch Out</Text>
          <TouchableOpacity style={s.pickerInput} onPress={() => setOutTimePickerVisible(true)} activeOpacity={0.8}>
            <Text style={s.pickerInputText} numberOfLines={1}>{fmtTimeDisplay(outTime)}</Text>
            <MaterialIcons name="logout" size={18} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={s.hintText}>Fill at least one of punch in / punch out.</Text>

      <View style={s.inputField}>
        <Text style={s.inputLabel}>Reason</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          style={[s.input, s.textArea]}
          placeholder="e.g. Forgot to punch out"
          placeholderTextColor={C.textMuted}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={s.inputField}>
        <View style={s.proofLabelRow}>
          <Text style={s.inputLabel}>Proof File</Text>
          <Text style={s.optionalBadge}>Optional</Text>
        </View>
        <TouchableOpacity
          style={s.proofPicker}
          onPress={() => setImageSourceVisible(true)}
          activeOpacity={0.8}
          disabled={compressingProof}
        >
          {compressingProof ? (
            <>
              <View style={s.proofPlaceholderIconBox}>
                <ActivityIndicator size="small" color={C.primary} />
              </View>
              <Text style={s.proofPlaceholderText} numberOfLines={2}>Compressing image…</Text>
            </>
          ) : proofFile ? (
            <>
              <Image source={{ uri: proofFile.uri }} style={s.proofPreview} resizeMode="cover" />
              <View style={s.proofPickedMeta}>
                <Text style={s.proofPickedText} numberOfLines={1} ellipsizeMode="middle">{proofFile.name}</Text>
                {fmtFileSize(proofFile.size) ? (
                  <Text style={s.proofPickedSize} numberOfLines={1}>{fmtFileSize(proofFile.size)}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => setProofFile(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="cancel" size={20} color={C.error} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={s.proofPlaceholderIconBox}>
                <MaterialIcons name="add-a-photo" size={20} color={C.primary} />
              </View>
              <Text style={s.proofPlaceholderText} numberOfLines={2}>Tap to attach proof — camera or gallery (optional)</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[s.submitBtn, submitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color={C.white} size="small" />
        ) : (
          <>
            <MaterialIcons name="send" size={18} color={C.white} />
            <Text style={s.submitBtnText} numberOfLines={1}>Submit Request</Text>
          </>
        )}
      </TouchableOpacity>

      <CustomDatePickerModal
        visible={datePickerVisible}
        value={date}
        maximumDate={new Date()}
        onConfirm={(d) => { setDate(d); setDatePickerVisible(false); }}
        onCancel={() => setDatePickerVisible(false)}
      />
      <CustomTimePickerModal
        visible={inTimePickerVisible}
        value={inTime}
        title="Punch In Time"
        onConfirm={(d) => { setInTime(d); setInTimePickerVisible(false); }}
        onCancel={() => setInTimePickerVisible(false)}
      />
      <CustomTimePickerModal
        visible={outTimePickerVisible}
        value={outTime}
        title="Punch Out Time"
        onConfirm={(d) => { setOutTime(d); setOutTimePickerVisible(false); }}
        onCancel={() => setOutTimePickerVisible(false)}
      />
      <ImageSourceModal
        visible={imageSourceVisible}
        onPickCamera={handleCameraPick}
        onPickGallery={handleGalleryPick}
        onCancel={() => setImageSourceVisible(false)}
      />
    </ScrollView>
  );

  // ── Render: History ──
  const renderHistory = () => (
    <>
      <View style={{ marginBottom: 20, backgroundColor: "#fffdfdff" }}>
        <FilterTabRow
          filters={STATUS_FILTERS}
          active={historyFilter}
          counts={historyCounts}
          onSelect={setHistoryFilter}
        />
      </View>
      {loadingHistory ? (
        <View style={s.centerState}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.centerStateText}>Loading requests…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => `reg_${item.id}`}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchHistory(true); }}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="event-busy"
              message={`No ${historyFilter === 'All' ? '' : historyFilter.toLowerCase() + ' '}requests found.`}
            />
          }
          renderItem={({ item }) => (
            <RegularizationCard item={item} onViewProof={setZoomUri} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </>
  );

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <ResultPopup
        visible={popup.visible}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ visible: false, type: null, message: '' })}
      />
      <ZoomImageModal visible={!!zoomUri} uri={zoomUri} onClose={() => setZoomUri(null)} />

      {/* Header */}
      <View style={s.listHeader}>
        <TouchableOpacity style={s.backBtnHeader} onPress={() => navigation?.goBack()} activeOpacity={0.75}>
          <MaterialIcons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>

        <View style={s.listHeaderTop}>
          <View>
            <Text style={s.listTitle}>Attendance Regularization</Text>
            <Text style={s.listSubtitle}>Fix a missed punch-in or punch-out</Text>
          </View>
          {activeSection === 'history' && (
            <TouchableOpacity
              style={s.refreshBtn}
              onPress={() => { setRefreshing(true); fetchHistory(true); }}
              activeOpacity={0.75}
            >
              <MaterialIcons name="refresh" size={20} color={C.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Section Toggle */}
        <SectionTabBar
          tabs={SECTION_TABS}
          active={activeSection}
          pendingCount={historyCounts.pending}
          onSelect={switchSection}
        />
      </View>

      <OfflineSyncBanner
        count={offlineQueueCount}
        syncing={syncingQueue}
        onRetry={syncOfflineQueue}
        onDiscard={clearOfflineQueue}
      />

      {/* Content */}
      {activeSection === 'apply' ? renderApplyForm() : renderHistory()}
    </View>
  );
};

// ─── Styles — mirrors ManagerApprovalScreen theme ─────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  listHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    paddingBottom: 0,
  },
  backBtnHeader: { paddingTop: 25, paddingBottom: 6 },
  listHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  listTitle: { fontSize: 20, fontWeight: '800', color: C.white },
  listSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    width: 38,
    height: 38,
  },

  // Section tab bar — indicator width/position are computed in JS (onLayout)
  // in pixels rather than hardcoded percentages, so it lines up exactly with
  // each tab's real boundary no matter the screen width or badge content.
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 4,
    height: 48,
    marginBottom: 14,
    position: 'relative',
  },
  sectionIndicator: {
    position: 'absolute',
    top: 4,
    height: 40,
    backgroundColor: C.white,
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTab: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 5,
  },
  sectionTabText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
  sectionTabTextActive: { color: C.primary, fontWeight: '700' },
  sectionBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.pendingBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sectionBadgeText: { fontSize: 10, fontWeight: '700', color: C.pendingText },

  // Offline sync banner — sits between the header and content on both tabs.
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.pendingBg,
    borderWidth: 1,
    borderColor: '#F5E3A8',
  },
  offlineBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: C.pendingText },
  offlineBannerBtn: {
    height: 26, minWidth: 50,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(133,100,4,0.12)',
  },
  offlineBannerBtnText: { fontSize: 11, fontWeight: '700', color: C.pendingText },

  // Filter chips — fixed height so the row never jumps as counts change
  filterRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, flexDirection: 'row' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    marginRight: 8,
    gap: 5,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  filterChipTextActive: { color: C.white, fontWeight: '700' },
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: C.primary },
  filterCountTextActive: { color: C.white },

  // Cards
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  // Top-aligned (not centered) so the status pill pins to the top-right
  // corner cleanly regardless of how tall the title/subtitle block is.
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  cardIconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  // Top-aligned against the icon box (not vertically centered), and
  // reserves room on the right so long dates never crash into the pill.
  cardMeta: { flex: 1, minWidth: 0, justifyContent: 'flex-start', paddingRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  cardSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  statusPill: {
    borderRadius: 20, paddingHorizontal: 10, height: 24,
    justifyContent: 'center', flexShrink: 0,
  },
  statusPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  cardDivider: { height: 1, backgroundColor: '#EEF2EF', marginHorizontal: 14 },

  // Three equal-width, center-aligned columns with thin vertical dividers so
  // PUNCH IN / PUNCH OUT / SUBMITTED line up identically across every card,
  // no matter how short or long the individual values are.
  detailsGrid: { flexDirection: 'row', alignItems: 'stretch', padding: 12, paddingHorizontal: 14 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailDivider: { width: 1, backgroundColor: '#EEF2EF', marginHorizontal: 4 },
  detailLabel: {
    fontSize: 10, fontWeight: '700', color: C.textMuted,
    letterSpacing: 0.8, marginBottom: 3, textAlign: 'center',
  },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.primary, textAlign: 'center' },

  reasonRow: { paddingHorizontal: 14, paddingBottom: 10 },
  reasonText: { fontSize: 12, color: C.textMuted, fontStyle: 'italic', lineHeight: 17 },

  thumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
    paddingTop: 10,
    marginTop: 2,
  },
  thumb: {
    width: 56, height: 42, borderRadius: 8,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg,
  },
  thumbPdf: { alignItems: 'center', justifyContent: 'center' },
  thumbMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 },
  thumbLabel: { fontSize: 12, color: C.textSub, flexShrink: 1 },

  // Apply form
  formScroll: { flex: 1 },
  formContent: { padding: 16, paddingBottom: 40 },
  rowFields: { flexDirection: 'row' },
  flex1: { flex: 1 },
  inputField: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: C.textSub, marginBottom: 6, letterSpacing: 0.3 },
  hintText: { fontSize: 11, color: C.textMuted, marginTop: -10, marginBottom: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.white,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },

  // Fixed-size trigger buttons for date / time — height never changes
  // whether they show a placeholder or a chosen value.
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: C.white,
  },
  pickerInputText: { fontSize: 14, color: C.textPrimary, fontWeight: '600', flexShrink: 1 },

  // Fixed-size proof picker — same height with or without a selected file.
  proofPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 72,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: C.primaryBg,
  },
  proofPreview: { width: 44, height: 44, borderRadius: 8 },
  proofPlaceholderIconBox: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  proofPickedMeta: { flex: 1, minWidth: 0 },
  proofPickedText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  proofPickedSize: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  proofPlaceholderText: { flex: 1, fontSize: 12, color: C.textMuted, lineHeight: 16 },
  proofLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  optionalBadge: {
    fontSize: 10, fontWeight: '700', color: C.textMuted,
    backgroundColor: C.primaryBg, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 1,
    overflow: 'hidden',
  },

  // Fixed-size submit button — same height whether idle, loading, or disabled.
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    backgroundColor: C.primary,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },

  // Zoom close
  zoomClose: { position: 'absolute', top: 50, right: 20, zIndex: 999 },

  // Popup
  popupOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  popupCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 28,
    width: '100%', alignItems: 'center',
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 10,
  },
  popupIconOuter: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  popupIconInner: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  popupTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  popupMessage: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  popupBtn: {
    width: '100%', height: 52,
    backgroundColor: C.primary, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  popupBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },

  // Custom date picker popup
  dpOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  dpCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  dpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dpNavBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primaryBg,
  },
  dpHeaderText: { fontSize: 15, fontWeight: '700', color: C.textPrimary, textAlign: 'center' },
  dpWeekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dpWeekLabel: {
    width: `${100 / 7}%`, textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: C.textMuted, paddingVertical: 6,
  },
  dpDayCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  dpDayCellSelected: { backgroundColor: C.primary },
  dpDayText: { fontSize: 13, fontWeight: '600', color: C.textPrimary },
  dpDayTextDisabled: { color: C.border },
  dpDayTextToday: { color: C.primary, fontWeight: '800' },
  dpDayTextSelected: { color: C.white, fontWeight: '800' },
  dpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },
  dpTodayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    height: 36, paddingHorizontal: 10,
    borderRadius: 10, backgroundColor: C.primaryBg,
  },
  dpTodayText: { fontSize: 12, fontWeight: '700', color: C.primary },
  dpFooterActions: { flexDirection: 'row', gap: 10 },
  // Fixed width + height so Cancel / Confirm never resize between screens.
  dpCancelBtn: {
    width: 96, height: 42,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
  },
  dpCancelText: { fontSize: 13, fontWeight: '700', color: C.textMuted },
  dpConfirmBtn: {
    width: 110, height: 42,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, backgroundColor: C.primary,
  },
  dpConfirmText: { fontSize: 13, fontWeight: '700', color: C.white },

  // Custom time picker popup
  tpCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  tpPreviewRow: { marginTop: 6, marginBottom: 10 },
  tpPreviewText: { fontSize: 22, fontWeight: '800', color: C.primary, letterSpacing: 0.5 },
  tpColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TIME_ITEM_H * 3,
    width: '100%',
    position: 'relative',
  },
  tpColumnWrap: { width: 64, height: TIME_ITEM_H * 3 },
  tpColumn: { flex: 1 },
  tpCell: { height: TIME_ITEM_H, alignItems: 'center', justifyContent: 'center' },
  tpCellText: { fontSize: 17, fontWeight: '600', color: C.border },
  tpCellTextActive: { fontSize: 20, fontWeight: '800', color: C.primary },
  tpColon: { fontSize: 20, fontWeight: '800', color: C.primary, marginHorizontal: 2 },
  tpHighlight: {
    position: 'absolute',
    left: 8,
    right: 84,
    top: TIME_ITEM_H,
    height: TIME_ITEM_H,
    // backgroundColor: C.primaryBg,
    borderRadius: 10,
  },
  tpPeriodWrap: { marginLeft: 12, gap: 8 },
  tpPeriodBtn: {
    width: 48, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1.5, borderColor: C.border,
  },
  tpPeriodBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  tpPeriodText: { fontSize: 12, fontWeight: '700', color: C.textMuted },
  tpPeriodTextActive: { color: C.white },

  // Camera / Gallery action sheet
  isOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  isSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: 'center',
  },
  isHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, marginBottom: 14,
  },
  isTitle: { fontSize: 16, fontWeight: '800', color: C.textPrimary, marginBottom: 4 },
  isSubtitle: { fontSize: 12, color: C.textMuted, marginBottom: 18, textAlign: 'center' },
  isOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  // Fixed width + height option cards regardless of label length.
  isOption: {
    width: 96, height: 92,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg,
    gap: 8,
  },
  isOptionIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  isOptionText: { fontSize: 13, fontWeight: '700', color: C.textPrimary },
  isCancelBtn: {
    width: '100%', height: 50,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: C.primaryBg,
  },
  isCancelText: { fontSize: 14, fontWeight: '700', color: C.primary },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerStateText: { fontSize: 14, color: C.textSub },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSub },
  emptySubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
});

export default AttendanceRegularizationScreen;