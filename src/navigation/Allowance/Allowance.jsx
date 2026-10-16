
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IonIcon, { IconType } from 'react-native-dynamic-vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import {
  Dimensions,
} from 'react-native';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Platform, Image, Alert,
  SafeAreaView, StatusBar, FlatList, KeyboardAvoidingView,
  ActionSheetIOS, ActivityIndicator, RefreshControl,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker, { types as DocTypes } from 'react-native-document-picker';
import { useAuth } from 'context/AuthContext';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  primary: '#1A4731',
  primaryMid: '#2D6A4F',
  primaryBg: '#E8F0EB',
  bg: '#F2F4F3',
  white: '#FFFFFF',
  border: '#D1DDD6',
  textPrimary: '#0F2419',
  textSub: '#1A4731',
  textMuted: '#1A4731',
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

// ─── Allowance types (dynamic from API, no static list) ───────────────────────
const ALLOWANCE_TYPES = [];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const IMAGE_BASE_URL = 'https://whiteforcepayroll.com/admin/';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const fmtDate = d => d
  ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  : '';
const fmtDateAPI = d => d
  ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  : '';
const fmtDateStr = str => {
  if (!str) return '—';
  const parts = str.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
};
const fmtINR = amount =>
  Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const getStatus = item => {
  if (item.status === 'accepted') return 'approved';
  if (item.status === 'rejected') return 'rejected';
  return 'pending';
};

const iconForAllowance = (name = '') => {
  const n = String(name || '').toLowerCase();
  if (n.includes('fuel')) return 'local-gas-station';
  if (n.includes('travel') || n.includes('tour')) return 'flight';
  if (n.includes('food') || n.includes('meal') || n.includes('lunch') || n.includes('dinner')) return 'restaurant';
  if (n.includes('medical') || n.includes('health')) return 'local-hospital';
  if (n.includes('internet') || n.includes('wifi') || n.includes('broadband')) return 'wifi';
  if (n.includes('house') || n.includes('housing') || n.includes('rent') || n.includes('hra')) return 'home';
  if (n.includes('bonus') || n.includes('reward')) return 'card-giftcard';
  return 'list-alt';
};

const formatAllowanceName = (name = '') => {
  if (!name) return 'Allowance';
  if (name === 'fuel' || name === 'fuel-allowance') return 'Fuel Allowance';
  if (name === 'travel' || name === 'travel-allowance') return 'Travel Allowance';
  if (name === 'food' || name === 'food-allowance') return 'Food Allowance';
  if (name === 'medical' || name === 'medical-allowance') return 'Medical Allowance';
  if (name === 'internet' || name === 'internet-allowance') return 'Internet Allowance';
  if (name === 'housing' || name === 'housing-allowance') return 'Housing Allowance';
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const typeInfo = idOrName => {
  if (!idOrName) return { label: 'Allowance', icon: 'list-alt' };
  return {
    label: formatAllowanceName(idOrName),
    icon: iconForAllowance(idOrName),
  };
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ value, selectedConfig, customLabel, serverConfigs, isLoadingConfigs, onPress }) {
  const ti = typeInfo(value);
  const isPerKm = selectedConfig
    ? Number(selectedConfig.is_per_km) === 1
    : (value === 'fuel' || value === 'fuel-allowance');

  const ratePerKm = (selectedConfig?.rate_per_km && !isNaN(Number(selectedConfig.rate_per_km)) && Number(selectedConfig.rate_per_km) > 0)
    ? Number(selectedConfig.rate_per_km)
    : null;

  const maxLimit = (selectedConfig?.max_limit && !isNaN(Number(selectedConfig.max_limit)) && Number(selectedConfig.max_limit) > 0)
    ? Number(selectedConfig.max_limit)
    : null;

  const displayLabel = value === 'other' && customLabel
    ? customLabel
    : (value ? (selectedConfig ? formatAllowanceName(selectedConfig.allowance_name) : ti.label) : '');

  const hasNoConfigs = !isLoadingConfigs && Array.isArray(serverConfigs) && serverConfigs.length === 0;

  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>ALLOWANCE TYPE</Text>
      <TouchableOpacity style={s.dropdown} onPress={onPress} activeOpacity={0.75}>
        <View style={s.dropdownLeft}>
          <View style={s.dropdownIconBox}>
            <Icon
              name={value ? (selectedConfig ? iconForAllowance(selectedConfig.allowance_name) : ti.icon) : (hasNoConfigs ? 'block' : 'category')}
              size={18}
              color={value ? C.primary : (hasNoConfigs ? C.error : C.textMuted)}
            />
          </View>
          <Text style={displayLabel ? s.dropdownText : s.dropdownPlaceholder}>
            {displayLabel || (isLoadingConfigs ? 'Loading allowance types...' : (hasNoConfigs ? 'No allowance type' : 'Select allowance type'))}
          </Text>
        </View>
        <Icon name="keyboard-arrow-down" size={22} color={C.textSub} />
      </TouchableOpacity>
      {isPerKm && (
        <View style={s.perKmBadge}>
          <Icon name="local-gas-station" size={13} color={C.primary} />
          <Text style={s.perKmBadgeText}>
            Per-KM Claim {ratePerKm ? `(Rate: ₹${ratePerKm}/km)` : '(Rate pending)'}{maxLimit ? ` • Max: ₹${fmtINR(maxLimit)}` : ''}
          </Text>
        </View>
      )}
      {!isPerKm && value && maxLimit && (
        <View style={[s.perKmBadge, { backgroundColor: C.infoBg, borderColor: C.border }]}>
          <Icon name="info-outline" size={13} color={C.primary} />
          <Text style={s.perKmBadgeText}>
            Maximum Claim Limit: ₹{fmtINR(maxLimit)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Amount Input ─────────────────────────────────────────────────────────────
function AmountInput({ value, onChange, error, touched, maxLimit }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error && touched ? C.error : focused ? C.primary : C.border;
  return (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>AMOUNT</Text>
      <View style={[s.amountRow, { borderColor }]}>
        <View style={s.rupeeBox}>
          <Text style={s.rupeeSymbol}>₹</Text>
        </View>
        <TextInput
          style={s.amountInput}
          placeholder="Enter allowance amount"
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="done"
        />
        {value && !error && (
          <View style={s.amountStatus}>
            <Icon name="check-circle" size={18} color={C.success} />
          </View>
        )}
        {error && touched && (
          <View style={s.amountStatus}>
            <Icon name="error" size={18} color={C.error} />
          </View>
        )}
      </View>
      {error && touched ? (
        <View style={s.helperRow}>
          <Icon name="warning" size={12} color={C.error} />
          <Text style={[s.helperText, { color: C.error }]}> {error}</Text>
        </View>
      ) : value && !error ? (
        <View style={s.helperRow}>
          <Icon name="check" size={12} color={C.success} />
          <Text style={[s.helperText, { color: C.success }]}>
            {maxLimit ? `Amount within limit (Max ₹${fmtINR(maxLimit)})` : 'Amount looks good'}
          </Text>
        </View>
      ) : (
        <View style={s.helperRow}>
          <Icon name="info-outline" size={12} color={C.textMuted} />
          <Text style={[s.helperText, { color: C.textMuted }]}>
            {maxLimit ? `Maximum claim limit: ₹${fmtINR(maxLimit)}` : 'Enter the total amount in INR'}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Date Field ───────────────────────────────────────────────────────────────
function DateField({ label, value, onPress }) {
  return (
    <View style={s.dateFieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={s.dateField} onPress={onPress} activeOpacity={0.75}>
        <Text style={value ? s.dateText : s.datePlaceholder}>
          {value ? fmtDate(value) : 'dd/mm/yyyy'}
        </Text>
        <Icon name="calendar-today" size={18} color={value ? C.primary : C.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Calendar Modal ───────────────────────────────────────────────────────────
function CalendarModal({ visible, selectedDate, onSelect, onClose, title, maxDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState((selectedDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate || today).getMonth());

  useEffect(() => {
    if (visible) {
      const initDate = selectedDate || today;
      const baseDate = (maxDate && initDate > maxDate) ? maxDate : initDate;
      setViewYear(baseDate.getFullYear());
      setViewMonth(baseDate.getMonth());
    }
  }, [visible]);

  const dim = daysInMonth(viewYear, viewMonth);
  const first = firstDayOfMonth(viewYear, viewMonth);
  const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  const maxD = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999)
    : null;

  const canGoNext = !maxD || (
    viewYear < maxD.getFullYear() ||
    (viewYear === maxD.getFullYear() && viewMonth < maxD.getMonth())
  );

  const prev = () => viewMonth === 0
    ? (setViewMonth(11), setViewYear(y => y - 1))
    : setViewMonth(m => m - 1);
  const next = () => {
    if (!canGoNext) return;
    viewMonth === 11
      ? (setViewMonth(0), setViewYear(y => y + 1))
      : setViewMonth(m => m + 1);
  };

  const isSel = d => d && selectedDate &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;
  const isTod = d => d &&
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const isDayDisabled = d => {
    if (!d) return true;
    if (maxD) {
      const cellDate = new Date(viewYear, viewMonth, d, 0, 0, 0, 0);
      const maxZero = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 0, 0, 0, 0);
      if (cellDate > maxZero) return true;
    }
    return false;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.calCard}>
          <View style={s.calHeader}>
            <View style={s.calHeaderLeft}>
              <Icon name="event" size={20} color={C.primary} />
              <Text style={s.calTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.calCloseBtn}>
              <Icon name="close" size={20} color={C.textSub} />
            </TouchableOpacity>
          </View>
          <View style={s.monthNav}>
            <TouchableOpacity onPress={prev} style={s.navBtn}>
              <Icon name="chevron-left" size={22} color={C.primary} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity
              onPress={next}
              style={[s.navBtn, !canGoNext && { opacity: 0.3 }]}
              disabled={!canGoNext}
            >
              <Icon name="chevron-right" size={22} color={canGoNext ? C.primary : C.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={s.weekRow}>
            {DAYS_SHORT.map(d => <Text key={d} style={s.weekDay}>{d}</Text>)}
          </View>
          <View style={s.calGrid}>
            {cells.map((day, i) => {
              const disabled = isDayDisabled(day);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.calCell,
                    isSel(day) && s.calCellSel,
                    isTod(day) && !isSel(day) && s.calCellToday,
                    disabled && day && { opacity: 0.28 },
                  ]}
                  onPress={() => {
                    if (day && !disabled) {
                      onSelect(new Date(viewYear, viewMonth, day));
                      onClose();
                    }
                  }}
                  activeOpacity={day && !disabled ? 0.7 : 1}
                  disabled={disabled}
                >
                  <Text style={[
                    s.calDay,
                    isSel(day) && s.calDaySel,
                    isTod(day) && !isSel(day) && s.calDayToday,
                    disabled && day && { color: C.textMuted },
                    !day && { opacity: 0 },
                  ]}>
                    {day || ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={s.todayBtn}
            onPress={() => { onSelect(today); onClose(); }}
          >
            <Icon name="today" size={16} color={C.primary} />
            <Text style={s.todayBtnText}>Jump to Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Allowance Type Sheet ─────────────────────────────────────────────────────
function AllowanceSheet({ visible, selected, serverConfigs, isLoadingConfigs, onSelect, onClose, customLabel, onCustomLabelChange }) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [localCustom, setLocalCustom] = useState(customLabel || '');

  useEffect(() => {
    if (visible) {
      setShowCustomInput(selected === 'other');
      setLocalCustom(customLabel || '');
    }
  }, [visible, selected, customLabel]);

  const items = React.useMemo(() => {
    if (serverConfigs && Array.isArray(serverConfigs) && serverConfigs.length > 0) {
      return serverConfigs.map(cfg => ({
        id: cfg.allowance_name,
        label: formatAllowanceName(cfg.allowance_name),
        icon: iconForAllowance(cfg.allowance_name),
        is_per_km: Number(cfg.is_per_km) === 1 ? 1 : 0,
        rate_per_km: cfg.rate_per_km && Number(cfg.rate_per_km) > 0 ? String(cfg.rate_per_km) : null,
        max_limit: cfg.max_limit && Number(cfg.max_limit) > 0 ? String(cfg.max_limit) : null,
        raw: cfg,
      }));
    }
    return [];
  }, [serverConfigs]);

  const handleSelect = (item) => {
    if (item.id === 'other') {
      onSelect(item.id, item.raw || item);
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      onSelect(item.id, item.raw || item);
      onCustomLabelChange('');
      onClose();
    }
  };

  const handleCustomConfirm = () => {
    if (!localCustom.trim()) {
      Alert.alert('Required', 'Please enter a description for "Other" allowance.');
      return;
    }
    onCustomLabelChange(localCustom.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeaderRow}>
            <Icon name="category" size={20} color={C.primary} />
            <Text style={s.sheetTitle}>Select Allowance Type</Text>
          </View>

          {isLoadingConfigs ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={C.primary} />
              <Text style={{ marginTop: 10, fontSize: 13, color: C.textMuted }}>
                Loading allowance types...
              </Text>
            </View>
          ) : items.length === 0 ? (
            <View style={{ paddingVertical: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: C.primaryBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Icon name="block" size={28} color={C.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>
                No Allowance Type
              </Text>
              <Text style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
                No allowance type configured for you
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active =
                  selected === item.id ||
                  (item.id === 'fuel-allowance' && selected === 'fuel') ||
                  (item.id === 'fuel' && selected === 'fuel-allowance');
                const isPerKm = item.is_per_km === 1;
                const hasMax = item.max_limit && Number(item.max_limit) > 0;
                return (
                  <TouchableOpacity
                    style={[s.sheetItem, active && s.sheetItemActive]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.75}
                  >
                    <View style={[s.sheetIconCircle, active && s.sheetIconCircleActive]}>
                      <Icon name={item.icon} size={18} color={active ? C.white : C.primary} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[s.sheetItemText, active && s.sheetItemTextActive]}>
                        {item.label}
                      </Text>
                      {isPerKm && (
                        <Text style={[s.sheetItemSubText, active && { color: C.primary }]}>
                          Per-KM claim {item.rate_per_km ? `• ₹${item.rate_per_km}/km` : ''}{hasMax ? ` • Max ₹${fmtINR(item.max_limit)}` : ''}
                        </Text>
                      )}
                      {!isPerKm && hasMax && (
                        <Text style={[s.sheetItemSubText, active && { color: C.primary }]}>
                          Max limit: ₹{fmtINR(item.max_limit)}
                        </Text>
                      )}
                    </View>
                    {active && <Icon name="check-circle" size={20} color={C.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* ── Custom input shown when "Other" is selected ── */}
          {showCustomInput && (
            <View style={s.customInputWrapper}>
              <Text style={s.fieldLabel}>DESCRIBE YOUR ALLOWANCE</Text>
              <View style={s.customInputRow}>
                <TextInput
                  style={s.customInput}
                  placeholder="e.g. Relocation, Training, Uniform…"
                  placeholderTextColor={C.textMuted}
                  value={localCustom}
                  onChangeText={setLocalCustom}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCustomConfirm}
                  maxLength={60}
                />
                <TouchableOpacity style={s.customInputConfirm} onPress={handleCustomConfirm}>
                  <Icon name="check" size={20} color={C.white} />
                </TouchableOpacity>
              </View>
              <Text style={[s.helperText, { color: C.textMuted, marginTop: 4 }]}>
                {localCustom.length}/60 characters
              </Text>
            </View>
          )}

          <TouchableOpacity style={s.sheetCancel} onPress={onClose}>
            <Icon name="close" size={16} color={C.textSub} />
            <Text style={s.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Attachment Chip ──────────────────────────────────────────────────────────
function Chip({ file, onRemove }) {
  const isImg = file.type?.startsWith('image/');
  return (
    <View style={s.chip}>
      {isImg && file.uri
        ? <Image source={{ uri: file.uri }} style={s.chipThumb} />
        : <Icon name="insert-drive-file" size={18} color={C.primary} />
      }
      <Text style={s.chipName} numberOfLines={1}>{file.name}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="cancel" size={16} color={C.textSub} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Image Viewer Modal ───────────────────────────────────────────────────────
// At the top, add this import:

// ─── Image Viewer Modal (with pinch-to-zoom) ──────────────────────────────────
function ImageViewerModal({ visible, imageUrl, onClose }) {
  const images = [{ url: imageUrl }];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <ImageViewer
        imageUrls={images}
        enableSwipeDown
        onSwipeDown={onClose}
        onCancel={onClose}
        backgroundColor="rgba(0,0,0,0.95)"
        renderHeader={() => (
          <TouchableOpacity style={s.imageViewerClose} onPress={onClose}>
            <Icon name="close" size={24} color={C.white} />
          </TouchableOpacity>
        )}
        renderIndicator={() => null}
      />
    </Modal>
  );
}
// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    pending: { bg: C.pendingBg, text: C.pendingText, label: 'Pending' },
    approved: { bg: C.approvedBg, text: C.approvedText, label: 'Approved' },
    rejected: { bg: C.rejectedBg, text: C.rejectedText, label: 'Rejected' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <View style={[s.statusPill, { backgroundColor: c.bg }]}>
      <Text style={[s.statusPillText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

// ─── Allowance Card ───────────────────────────────────────────────────────────
function AllowanceCard({ item, onImagePress }) {
  const ti = typeInfo(item.allowance);
  const status = getStatus(item);
  const isFuel =
    (item.total_kms !== null && item.total_kms !== undefined && item.total_kms !== '') ||
    (item.start_meter_reading !== null && item.start_meter_reading !== undefined && item.start_meter_reading !== '') ||
    String(item.allowance || '').toLowerCase().includes('fuel');

  let imagesList = [];
  if (Array.isArray(item.images)) {
    imagesList = item.images;
  } else if (typeof item.images === 'string' && item.images.trim()) {
    try {
      const parsed = JSON.parse(item.images);
      if (Array.isArray(parsed)) imagesList = parsed;
      else imagesList = [item.images];
    } catch {
      imagesList = item.images.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const odometerImgs = [
    item.start_meter_image
      ? {
        uri: item.start_meter_image.startsWith('http')
          ? item.start_meter_image
          : `${IMAGE_BASE_URL}${item.start_meter_image}`,
        label: 'Start Meter',
      }
      : null,
    item.end_meter_image
      ? {
        uri: item.end_meter_image.startsWith('http')
          ? item.end_meter_image
          : `${IMAGE_BASE_URL}${item.end_meter_image}`,
        label: 'End Meter',
      }
      : null,
  ].filter(Boolean);

  return (
    <View style={s.allowCard}>
      {/* Top row */}
      <View style={s.allowCardTop}>
        <View style={s.allowCardIconBox}>
          <Icon name={ti.icon} size={20} color={C.primary} />
        </View>
        <View style={s.allowCardMeta}>
          <Text style={s.allowCardTitle}>{ti.label}</Text>
          <Text style={s.allowCardDate}>Submitted {fmtDateStr(item.start_date)}</Text>
        </View>
        <StatusPill status={status} />
      </View>

      <View style={s.allowCardDivider} />

      {/* Bottom grid */}
      <View style={s.allowCardBottom}>
        <View style={s.allowCardField}>
          <Text style={s.allowCardFieldLabel}>AMOUNT</Text>
          <Text style={s.allowCardFieldValue}>
            {item.amount ? `₹${fmtINR(item.amount)}` : (item.total_kms ? 'Pending rate' : '—')}
          </Text>
        </View>
        <View style={s.allowCardField}>
          <Text style={s.allowCardFieldLabel}>FROM</Text>
          <Text style={s.allowCardFieldValue}>{fmtDateStr(item.start_date)}</Text>
        </View>
        <View style={s.allowCardField}>
          <Text style={s.allowCardFieldLabel}>TO</Text>
          <Text style={s.allowCardFieldValue}>{fmtDateStr(item.end_date)}</Text>
        </View>
      </View>

      {/* Fuel details if per-KM claim */}
      {isFuel && (item.start_meter_reading || item.end_meter_reading || item.total_kms) && (
        <>
          <View style={s.allowCardDivider} />
          <View style={[s.allowCardBottom, { backgroundColor: '#F9FCFA' }]}>
            {item.start_meter_reading ? (
              <View style={s.allowCardField}>
                <Text style={s.allowCardFieldLabel}>START METER</Text>
                <Text style={s.allowCardFieldValueSmall}>{item.start_meter_reading} km</Text>
              </View>
            ) : null}
            {item.end_meter_reading ? (
              <View style={s.allowCardField}>
                <Text style={s.allowCardFieldLabel}>END METER</Text>
                <Text style={s.allowCardFieldValueSmall}>{item.end_meter_reading} km</Text>
              </View>
            ) : null}
            {item.total_kms ? (
              <View style={s.allowCardField}>
                <Text style={s.allowCardFieldLabel}>DISTANCE</Text>
                <Text style={[s.allowCardFieldValueSmall, { color: C.primary, fontWeight: '800' }]}>
                  {item.total_kms} km
                </Text>
              </View>
            ) : null}
            {item.rate_per_km ? (
              <View style={s.allowCardField}>
                <Text style={s.allowCardFieldLabel}>RATE</Text>
                <Text style={s.allowCardFieldValueSmall}>₹{item.rate_per_km}/km</Text>
              </View>
            ) : null}
          </View>
        </>
      )}

      {/* Visit Remarks if present */}
      {item.visit_remarks ? (
        <View style={s.cardRemarksRow}>
          <Icon name="notes" size={14} color={C.textMuted} style={{ marginTop: 2 }} />
          <Text style={s.cardRemarksText} numberOfLines={2}>
            {item.visit_remarks}
          </Text>
        </View>
      ) : null}

      {/* Fuel Odometer Photos */}
      {odometerImgs.length > 0 && (
        <View style={s.odometerCardRow}>
          {odometerImgs.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={s.odometerThumbWrap}
              onPress={() => onImagePress(img.uri)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: img.uri }} style={s.allowCardThumb} resizeMode="cover" />
              <Text style={s.odometerThumbTag}>{img.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Standard Attachment thumbnails */}
      {imagesList.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.allowCardImgRowContainer}>
          {imagesList.map((img, idx) => {
            const imgUrl = img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`;
            return (
              <TouchableOpacity
                key={idx}
                style={s.allowCardImgRow}
                onPress={() => onImagePress(imgUrl)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: imgUrl }}
                  style={s.allowCardThumb}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

// ─── List Screen ──────────────────────────────────────────────────────────────
function AllowanceListScreen({ navigation, userId, onRequest }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const res = await fetch(
        `https://whiteforcepayroll.com/admin/api/get-emp-allowance?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const json = await res.json();
      console.log('Allowance API =>', json);

      if (json.success && Array.isArray(json.data)) {
        // ── inject a dummy status if the API doesn't return one ──
        const withStatus = json.data.map((item, index) => ({
          ...item,
          status: item.status,
        }));
        setData(withStatus);
      } else {
        setData([]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not fetch allowance data. Check your connection.');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = activeTab === 'all'
    ? data
    : data.filter(d => getStatus(d) === activeTab);

  const badgeCount = tab =>
    tab === 'all' ? data.length : data.filter(d => getStatus(d) === tab).length;

  const openImage = url => {
    console.log('IMAGE URL =>', url);

    setViewerUrl(url);
    setViewerVisible(true);
  };
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={s.listHeader}>
        <TouchableOpacity style={{ paddingTop: 10, paddingBottom: 10 }} onPress={() => navigation?.goBack()}>
          <Icon name="arrow-back" size={22} color={'white'} />
        </TouchableOpacity>
        <View style={s.listHeaderTop}>

          <View>
            <Text style={s.listTitle}>Allowances</Text>
            <Text style={s.listSubtitle}>Track your allowance requests</Text>
          </View>
          <TouchableOpacity style={s.requestBtn} onPress={onRequest} activeOpacity={0.8}>
            <Icon name="add" size={18} color={C.white} />
            <Text style={s.requestBtnText}>Request</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[s.tabBadge, activeTab === tab.key && s.tabBadgeActive]}>
                <Text style={[s.tabBadgeText, activeTab === tab.key && s.tabBadgeTextActive]}>
                  {badgeCount(tab.key)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={s.centerState}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.centerStateText}>Loading allowances…</Text>
        </View>
      ) : (
        <FlatList
          data={[...filtered].reverse()}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Icon name="inbox" size={52} color={C.textMuted} />
              <Text style={s.emptyTitle}>
                No {activeTab === 'all' ? '' : activeTab} requests
              </Text>
              <Text style={s.emptySubtitle}>
                Your {activeTab === 'all' ? '' : activeTab + ' '}
                allowance requests will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <AllowanceCard item={item} onImagePress={openImage} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ visible, onViewRequests, onSubmitAnother, data }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onViewRequests}>
      <View style={sm.overlay}>
        <View style={sm.modal}>

          {/* Icon */}
          <View style={sm.iconOuter}>
            <View style={sm.iconInner}>
              <Icon name="check" size={26} color="#FFFFFF" />
            </View>
          </View>

          <Text style={sm.title}>Request submitted!</Text>
          <Text style={sm.subtitle}>
            Your allowance request has been sent for approval. You'll be notified once it's reviewed.
          </Text>

          {/* Detail card */}
          <View style={sm.detailCard}>
            <View style={sm.detailRow}>
              <Text style={sm.detailLabel}>TYPE</Text>
              <Text style={sm.detailValue}>{typeInfo(data?.allowance)?.label || '—'}</Text>
            </View>
            <View style={sm.divider} />
            <View style={sm.detailRow}>
              <Text style={sm.detailLabel}>{data?.isFuel ? 'EST. AMOUNT' : 'AMOUNT'}</Text>
              <Text style={sm.detailValue}>
                {data?.amount ? `₹${fmtINR(data?.amount)}` : (data?.isFuel ? 'Calculated by admin' : '—')}
              </Text>
            </View>
            {data?.totalKms ? (
              <>
                <View style={sm.divider} />
                <View style={sm.detailRow}>
                  <Text style={sm.detailLabel}>TOTAL DISTANCE</Text>
                  <Text style={sm.detailValue}>{data.totalKms} km</Text>
                </View>
              </>
            ) : null}
            <View style={sm.divider} />
            <View style={sm.detailRow}>
              <Text style={sm.detailLabel}>PERIOD</Text>
              <Text style={sm.detailValue}>
                {fmtDate(data?.startDate)} – {fmtDate(data?.endDate)}
              </Text>
            </View>
            <View style={sm.divider} />
            <View style={sm.detailRow}>
              <Text style={sm.detailLabel}>STATUS</Text>
              <View style={sm.pill}>
                <Text style={sm.pillText}>Pending review</Text>
              </View>
            </View>
          </View>

          {/* Reference */}
          <View style={sm.refRow}>
            <Icon name="receipt" size={14} color={C.textSub} />
            <Text style={sm.refText}>Reference</Text>
            <View style={sm.refCode}>
              <Text style={sm.refCodeText}>
                ALW-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={sm.btnPrimary} onPress={onViewRequests} activeOpacity={0.85}>
            <Text style={sm.btnPrimaryText}>View my requests</Text>
            <Icon name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={sm.btnSecondary} onPress={onSubmitAnother} activeOpacity={0.85}>
            <Text style={sm.btnSecondaryText}>Submit another request</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: C.white,
    borderRadius: 9,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  iconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.approvedBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: 20, fontWeight: '700',
    color: C.textPrimary, marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, color: C.textSub,
    textAlign: 'center', lineHeight: 21,
    marginBottom: 24,
  },
  detailCard: {
    width: '100%',
    // backgroundColor: C.bg,
    borderRadius: 9,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11, fontWeight: '700',
    color: C.textMuted, letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 13, fontWeight: '600', color: C.textPrimary,
  },
  divider: { borderWidth: 0.2, borderColor: "black", borderStyle: "dashed" },
  pill: {
    backgroundColor: C.approvedBg,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: C.approvedText },
  refRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 20,
  },
  refText: { fontSize: 12, color: C.textSub },
  refCode: {
    backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2,
  },
  refCodeText: { fontSize: 12, fontWeight: '600', color: C.textPrimary },
  btnPrimary: {
    width: '100%', backgroundColor: C.primary,
    borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    marginBottom: 10,
  },
  btnPrimaryText: { color: C.white, fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    width: '100%', borderRadius: 14,
    paddingVertical: 13, borderWidth: 1.5,
    borderColor: C.primary, alignItems: 'center',
  },
  btnSecondaryText: { color: C.primary, fontSize: 14, fontWeight: '600' },
});
// ─── Odometer Photo Picker ───────────────────────────────────────────────────
function OdometerPhotoPicker({ photo, onPickCamera, onPickGallery, onRemove, onView }) {
  if (!photo) {
    return (
      <View style={s.photoPickerBox}>
        <View style={s.photoPickerActions}>
          <TouchableOpacity style={s.photoPickBtn} onPress={onPickCamera} activeOpacity={0.75}>
            <Icon name="photo-camera" size={18} color={C.primary} />
            <Text style={s.photoPickBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <TouchableOpacity style={s.photoPickBtn} onPress={onPickGallery} activeOpacity={0.75}>
            <Icon name="photo-library" size={18} color={C.primary} />
            <Text style={s.photoPickBtnText}>From Gallery</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.photoHintText}>Capture odometer reading with clear numbers</Text>
      </View>
    );
  }

  return (
    <View style={s.photoPreviewCard}>
      <TouchableOpacity onPress={onView} activeOpacity={0.85}>
        <Image source={{ uri: photo.uri }} style={s.photoPreviewThumb} resizeMode="cover" />
      </TouchableOpacity>
      <View style={s.photoPreviewMeta}>
        <Text style={s.photoPreviewTitle} numberOfLines={1}>
          {photo.name || 'Odometer photo'}
        </Text>
        <Text style={s.photoPreviewSub}>Tap image to view full screen</Text>
        <View style={s.photoBtnRow}>
          <TouchableOpacity style={s.photoRetakeBtn} onPress={onPickCamera} activeOpacity={0.75}>
            <Icon name="refresh" size={13} color={C.primary} />
            <Text style={s.photoRetakeBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.photoRemoveBtn} onPress={onRemove} activeOpacity={0.75}>
            <Icon name="delete-outline" size={14} color={C.error} />
            <Text style={s.photoRemoveBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Request Form Screen ──────────────────────────────────────────────────────
function RequestFormScreen({ navigation, userId, uname, onBack, onSuccess }) {
  const [allowType, setAllowType] = useState('');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [serverConfigs, setServerConfigs] = useState([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true);
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [amtTouched, setAmtTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customAllowLabel, setCustomAllowLabel] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showStartDateCal, setShowStartDateCal] = useState(false);
  const [showEndDateCal, setShowEndDateCal] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: '', title: '', message: '' });

  // Fuel Per-KM specific states
  const [startMeter, setStartMeter] = useState('');
  const [endMeter, setEndMeter] = useState('');
  const [startMeterImage, setStartMeterImage] = useState(null);
  const [endMeterImage, setEndMeterImage] = useState(null);
  // Remark is required for ALL allowance types
  const [remark, setRemark] = useState('');
  const [remarkTouched, setRemarkTouched] = useState(false);
  const [startMeterTouched, setStartMeterTouched] = useState(false);
  const [endMeterTouched, setEndMeterTouched] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);

  // Fetch allowance configurations from server on mount (dynamic, no static assumption)
  useEffect(() => {
    if (!userId) {
      setIsLoadingConfigs(false);
      return;
    }
    const fetchConfigs = async () => {
      try {
        setIsLoadingConfigs(true);
        let res = await fetch(`https://whiteforcepayroll.com/admin/api/allowance-configurations?user_id=${userId}`);

        const json = await res.json();
        if ((json.status || json.success) && Array.isArray(json.data)) {
          setServerConfigs(json.data);
        } else if ((json.status || json.success) && json.data && Array.isArray(json.data.allowances)) {
          setServerConfigs(json.data.allowances);
        } else {
          setServerConfigs([]);
        }
      } catch (e) {
        console.log('[Allowance] Error fetching configurations:', e);
        setServerConfigs([]);
      } finally {
        setIsLoadingConfigs(false);
      }
      
    };
    fetchConfigs();
  }, [userId]);

  const showPopup = (type, title, message) => {
    setPopup({ visible: true, type, title, message });
  };

  const hidePopup = () => {
    setPopup({ visible: false, type: '', title: '', message: '' });
  };

  // Active config resolved dynamically from serverConfigs or selectedConfig
  const activeConfig = React.useMemo(() => {
    if (selectedConfig) return selectedConfig;
    if (!serverConfigs || serverConfigs.length === 0 || !allowType) return null;
    return serverConfigs.find(
      c => c.allowance_name === allowType ||
        c.allowance_name === `${allowType}-allowance` ||
        (allowType === 'fuel' && c.allowance_name === 'fuel-allowance') ||
        (allowType === 'fuel-allowance' && c.allowance_name === 'fuel')
    ) || null;
  }, [selectedConfig, serverConfigs, allowType]);

  // Is Per-KM based on API configuration (no static assumption)
  const isFuel = activeConfig
    ? Number(activeConfig.is_per_km) === 1
    : (allowType === 'fuel' || allowType === 'fuel-allowance');

  // Project Reimbursement — needs start + end date
  const isProjectReimbursement = (() => {
    const name = String(activeConfig?.allowance_name || allowType || '').toLowerCase();
    return name.includes('project') || name.includes('reimb');
  })();

  // Standard allowances (not fuel, not project reimbursement) use a single date
  const useSingleDate = !isFuel && !isProjectReimbursement;

  // Clear dates if fuel selected and previously chosen date is in future
  useEffect(() => {
    if (isFuel) {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (startDate && startDate > todayEnd) setStartDate(null);
      if (endDate && endDate > todayEnd) setEndDate(null);
    }
  }, [isFuel]);

  // Rate per KM strictly from server config: NO static fallback!
  const ratePerKm = (activeConfig?.rate_per_km && !isNaN(Number(activeConfig.rate_per_km)) && Number(activeConfig.rate_per_km) > 0)
    ? Number(activeConfig.rate_per_km)
    : null;

  // Max limit strictly from server config
  const maxLimit = (activeConfig?.max_limit && !isNaN(Number(activeConfig.max_limit)) && Number(activeConfig.max_limit) > 0)
    ? Number(activeConfig.max_limit)
    : null;

  const startNum = parseFloat(startMeter);
  const endNum = parseFloat(endMeter);
  const hasValidReadings = !isNaN(startNum) && !isNaN(endNum) && endNum > startNum;
  const totalKms = hasValidReadings ? (endNum - startNum).toFixed(2) : null;

  // ONLY calculate estimated amount if ratePerKm is available from API data! No static calculation!
  const estimatedAmount = (hasValidReadings && ratePerKm && ratePerKm > 0)
    ? (Number(totalKms) * ratePerKm).toFixed(2)
    : null;

  const amountError = (() => {
    if (isFuel) return '';
    if (!amount) return 'Amount is required';
    if (isNaN(Number(amount))) return 'Enter a valid number';
    if (Number(amount) <= 0) return 'Amount must be greater than 0';
    if (maxLimit && Number(amount) > maxLimit) {
      return `Amount cannot exceed max limit of ₹${fmtINR(maxLimit)}`;
    }
    if (Number(amount) > 1000000) return 'Amount cannot exceed ₹10,00,000';
    return '';
  })();

  const isFormValid = () => {
    if (!allowType) {
      const msg = (!isLoadingConfigs && Array.isArray(serverConfigs) && serverConfigs.length === 0)
        ? 'No allowance type is configured for your account'
        : 'Please select an allowance type';
      Alert.alert('Validation Error', msg);
      return false;
    }

    // Date validation based on allowance type
    if (isFuel || isProjectReimbursement) {
      // Fuel and Project Reimbursement require both start and end date
      if (!startDate) {
        Alert.alert('Validation Error', 'Please select a start date');
        return false;
      }
      if (!endDate) {
        Alert.alert('Validation Error', 'Please select an end date');
        return false;
      }
      if (endDate < startDate) {
        Alert.alert('Validation Error', 'End date cannot be before start date');
        return false;
      }
    } else {
      // All other standard allowances — single date
      if (!startDate) {
        Alert.alert('Validation Error', 'Please select a date');
        return false;
      }
    }

    if (isFuel) {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (startDate > todayEnd || endDate > todayEnd) {
        Alert.alert('Validation Error', 'Future dates are not allowed for fuel allowance.');
        return false;
      }
      if (!startMeter || isNaN(Number(startMeter)) || Number(startMeter) < 0) {
        Alert.alert('Validation Error', 'Please enter a valid start meter reading');
        return false;
      }
      if (!endMeter || isNaN(Number(endMeter))) {
        Alert.alert('Validation Error', 'Please enter a valid end meter reading');
        return false;
      }
      if (Number(endMeter) <= Number(startMeter)) {
        Alert.alert('Validation Error', 'End meter reading must be greater than start meter reading');
        return false;
      }
      if (!startMeterImage) {
        Alert.alert('Validation Error', 'Please upload a photo of start meter reading');
        return false;
      }
      if (!endMeterImage) {
        Alert.alert('Validation Error', 'Please upload a photo of end meter reading');
        return false;
      }
    } else {
      if (!amount || amountError) {
        Alert.alert('Validation Error', 'Please enter a valid amount');
        return false;
      }
      // Attachments are required for non-fuel allowances
      if (!attachments || attachments.length === 0) {
        Alert.alert('Validation Error', 'Please upload at least one attachment (image or file)');
        return false;
      }
    }
    if (!remark.trim()) {
      Alert.alert('Validation Error', 'Remark is required');
      return false;
    }
    return true;
  };

  const pickOdometerPhoto = (type, source) => {
    const opts = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    const cb = response => {
      if (response.didCancel || response.errorCode) {
        if (response.errorMessage) console.log('Camera/Gallery Error:', response.errorMessage);
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        const fileObj = {
          uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `${type}_meter_${Date.now()}.jpg`,
        };
        if (type === 'start') {
          setStartMeterImage(fileObj);
        } else {
          setEndMeterImage(fileObj);
        }
      }
    };

    if (source === 'camera') {
      launchCamera(opts, cb);
    } else {
      launchImageLibrary(opts, cb);
    }
  };

  const handlePickImage = () => {
    const opts = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      selectionLimit: 0,
    };

    const fromLibrary = () =>
      launchImageLibrary(opts, response => {
        if (response.didCancel || response.errorCode) {
          if (response.errorMessage) console.log('Gallery Error =>', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const newFiles = response.assets.map((asset, i) => ({
            uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}_${i}.jpg`,
          }));
          setAttachments(prev => [...prev, ...newFiles]);
        }
      });

    const fromCamera = () =>
      launchCamera(opts, response => {
        if (response.didCancel || response.errorCode) {
          if (response.errorMessage) console.log('Camera Error =>', response.errorMessage);
          return;
        }
        const asset = response.assets?.[0];
        if (asset) {
          const newFile = {
            uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
          };
          setAttachments(prev => [...prev, newFile]);
        }
      });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        buttonIndex => {
          if (buttonIndex === 1) fromCamera();
          if (buttonIndex === 2) fromLibrary();
        }
      );
    } else {
      Alert.alert('Upload Image', 'Choose source', [
        { text: 'Camera', onPress: fromCamera },
        { text: 'Gallery', onPress: fromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handlePickFile = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocTypes.pdf, DocTypes.doc, DocTypes.docx, DocTypes.xls, DocTypes.xlsx, DocTypes.images],
        allowMultiSelection: true,
      });
      if (results && results.length > 0) {
        const newFiles = results.map((r, i) => ({
          name: r.name || `file_${Date.now()}_${i}`,
          type: r.type || 'application/octet-stream',
          uri: r.fileCopyUri || r.uri,
          size: r.size,
        }));
        setAttachments(prev => [...prev, ...newFiles]);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Could not open file picker.');
        console.warn(err);
      }
    }
  };

  const handleRemoveAttachment = indexToRemove => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      // For single-date allowances, send the same date as both start and end
      const effectiveEndDate = useSingleDate ? startDate : endDate;
      formData.append('start_date', fmtDateAPI(startDate));
      formData.append('end_date', fmtDateAPI(effectiveEndDate));
      // Send remark under both field names — API stores it as 'visit_remarks'
      formData.append('remark', remark.trim());
      formData.append('visit_remarks', remark.trim());

      if (isFuel) {
        formData.append('allowance', activeConfig?.allowance_name || 'fuel-allowance');
        formData.append('start_meter_reading', startMeter);
        formData.append('end_meter_reading', endMeter);

        if (startMeterImage) {
          formData.append('images[]', {
            uri: startMeterImage.uri,
            type: startMeterImage.type || 'image/jpeg',
            name: startMeterImage.name || `start_meter_${Date.now()}.jpg`,
          });
        }
        if (endMeterImage) {
          formData.append('images[]', {
            uri: endMeterImage.uri,
            type: endMeterImage.type || 'image/jpeg',
            name: endMeterImage.name || `end_meter_${Date.now()}.jpg`,
          });
        }
      } else {
        const formattedAllowance =
          allowType === 'other'
            ? (customAllowLabel ? `other:${customAllowLabel}` : 'other')
            : (allowType.endsWith('-allowance') ? allowType : `${allowType}-allowance`);
        formData.append('allowance', formattedAllowance);
        formData.append('amount', amount);

        if (attachments && attachments.length > 0) {
          attachments.forEach(att => {
            formData.append('images[]', {
              uri: att.uri,
              type: att.type || 'image/jpeg',
              name: att.name || `receipt_${Date.now()}.jpg`,
            });
          });
        }
      }

      console.log('Submitting allowance formData:', formData);

      let response = await fetch(
        'https://whiteforcepayroll.com/admin/api/emp-allowance-store',
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        }
      );

      if (response.status === 404) {
        response = await fetch(
          'https://whiteforcepayroll.com/api/emp-allowance-store',
          {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
          }
        );
      }

      if (response.status === 404) {
        response = await fetch(
          'https://whiteforcepayroll.com/admin/api/leave-allowance-store',
          {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
          }
        );
      }

      const text = await response.text();
      console.log('Raw Response:', text);

      let data;
      try { data = JSON.parse(text); }
      catch (e) { data = { message: text }; }
      console.log('Parsed Response:', data);

      setIsLoading(false);

      if (response.ok || data.status === true || data.status === 'success' || data.success === true) {
        setSuccessData({
          allowance: isFuel ? (activeConfig?.allowance_name || 'fuel-allowance') : allowType,
          amount: data?.data?.amount || (isFuel ? estimatedAmount : amount),
          startDate,
          endDate,
          isFuel,
          totalKms: data?.data?.total_kms || (isFuel ? totalKms : null),
        });
        setSuccessVisible(true);
        setAllowType('');
        setSelectedConfig(null);
        setAmount('');
        setStartDate(null);
        setEndDate(null);
        setAttachments([]);
        setStartMeter('');
        setEndMeter('');
        setStartMeterImage(null);
        setEndMeterImage(null);
        setRemark('');
        setRemarkTouched(false);
        setAmtTouched(false);
        setStartMeterTouched(false);
        setEndMeterTouched(false);
        onSuccess();
      } else {
        showPopup('error', 'Error', data.message || 'Failed to submit allowance request. Please try again.');
      }
    } catch (error) {
      console.log('Error:', error);
      setIsLoading(false);
      showPopup('error', 'Error', 'An unexpected error occurred. Please check your connection and try again.');
    }
  };

  const selectedType = typeInfo(allowType);
  const infoBannerText = isFuel
    ? (ratePerKm
      ? `Claiming ${selectedType.label} at ₹${ratePerKm}/km${maxLimit ? ` (Max limit: ₹${fmtINR(maxLimit)})` : ''}. Enter your odometer readings and capture start & end photos.`
      : `Claiming ${selectedType.label} on per-KM basis. Enter your odometer readings and capture start & end photos.`)
    : (allowType
      ? `Applying for ${selectedType.label}${maxLimit ? ` (Max limit: ₹${fmtINR(maxLimit)})` : ''}. Ensure you have supporting documents ready.`
      : 'Select an allowance type to see relevant details.');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Icon name="arrow-back" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.pageTitle}>Request Allowance</Text>
          <Text style={s.pageSubtitle}>
            Complete the steps below to submit your allowance request.
          </Text>
          <View style={s.card}>

            {/* Dropdown */}
            <Dropdown
              value={allowType}
              selectedConfig={activeConfig}
              customLabel={allowType === 'other' && customAllowLabel ? customAllowLabel : undefined}
              serverConfigs={serverConfigs}
              isLoadingConfigs={isLoadingConfigs}
              onPress={() => setShowSheet(true)}
            />

            {/* Date Pickers — single date for standard allowances; start+end for fuel & project reimbursement */}
            {(isFuel || isProjectReimbursement) ? (
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <DateField
                    label="START DATE *"
                    value={startDate}
                    onPress={() => setShowStartDateCal(true)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DateField
                    label="END DATE *"
                    value={endDate}
                    onPress={() => setShowEndDateCal(true)}
                  />
                </View>
              </View>
            ) : (
              <View style={{ marginBottom: 16 }}>
                <DateField
                  label="DATE *"
                  value={startDate}
                  onPress={() => setShowStartDateCal(true)}
                />
              </View>
            )}

            {/* ── Fuel Per-KM Form Fields ── */}
            {isFuel ? (
              <>
                {/* Odometer Readings */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>ODOMETER READINGS</Text>
                  <View style={s.meterRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputSubLabel}>START READING (KM)</Text>
                      <View style={[s.meterInputBox, startMeterTouched && !startMeter && s.inputBoxError]}>
                        <Icon name="speed" size={18} color={C.primary} />
                        <TextInput
                          style={s.meterInput}
                          placeholder="e.g. 12450.5"
                          placeholderTextColor={C.textMuted}
                          keyboardType="numeric"
                          value={startMeter}
                          onChangeText={v => { setStartMeter(v); setStartMeterTouched(true); }}
                        />
                      </View>
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.inputSubLabel}>END READING (KM)</Text>
                      <View style={[
                        s.meterInputBox,
                        endMeterTouched && (!endMeter || (startMeter && Number(endMeter) <= Number(startMeter))) && s.inputBoxError
                      ]}>
                        <Icon name="speed" size={18} color={C.primary} />
                        <TextInput
                          style={s.meterInput}
                          placeholder="e.g. 12510.5"
                          placeholderTextColor={C.textMuted}
                          keyboardType="numeric"
                          value={endMeter}
                          onChangeText={v => { setEndMeter(v); setEndMeterTouched(true); }}
                        />
                      </View>
                    </View>
                  </View>
                  {endMeterTouched && startMeter && endMeter && Number(endMeter) <= Number(startMeter) && (
                    <View style={s.helperRow}>
                      <Icon name="warning" size={12} color={C.error} />
                      <Text style={[s.helperText, { color: C.error }]}> End reading must be greater than start reading</Text>
                    </View>
                  )}
                </View>

                {/* Calculation preview card */}
                {totalKms !== null && Number(totalKms) > 0 && (
                  <View style={s.fuelCalcCard}>
                    <View style={s.fuelCalcTop}>
                      <View style={s.fuelCalcItem}>
                        <Text style={s.fuelCalcLabel}>TOTAL DISTANCE</Text>
                        <Text style={s.fuelCalcValue}>{totalKms} km</Text>
                      </View>
                      {ratePerKm ? (
                        <View style={s.fuelCalcItem}>
                          <Text style={s.fuelCalcLabel}>RATE</Text>
                          <Text style={s.fuelCalcValue}>₹{ratePerKm}/km</Text>
                        </View>
                      ) : (
                        <View style={s.fuelCalcItem}>
                          <Text style={s.fuelCalcLabel}>RATE</Text>
                          <Text style={[s.fuelCalcValue, { color: C.textSub }]}>Not configured</Text>
                        </View>
                      )}
                      {estimatedAmount ? (
                        <View style={s.fuelCalcItem}>
                          <Text style={s.fuelCalcLabel}>ESTIMATED CLAIM</Text>
                          <Text style={[s.fuelCalcValue, { color: C.primary }]}>₹{fmtINR(estimatedAmount)}</Text>
                        </View>
                      ) : (
                        <View style={s.fuelCalcItem}>
                          <Text style={s.fuelCalcLabel}>ESTIMATED CLAIM</Text>
                          <Text style={[s.fuelCalcValue, { color: C.textSub }]}>Pending admin rate</Text>
                        </View>
                      )}
                    </View>
                    {maxLimit ? (
                      <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted }}>MAX LIMIT</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.textPrimary }}>₹{fmtINR(maxLimit)}</Text>
                      </View>
                    ) : null}
                  </View>
                )}

                {/* Start Meter Photo */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>START METER PHOTO *</Text>
                  <OdometerPhotoPicker
                    photo={startMeterImage}
                    onPickCamera={() => pickOdometerPhoto('start', 'camera')}
                    onPickGallery={() => pickOdometerPhoto('start', 'library')}
                    onRemove={() => setStartMeterImage(null)}
                    onView={() => { setViewerUrl(startMeterImage?.uri); setViewerVisible(true); }}
                  />
                </View>

                {/* End Meter Photo */}
                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>END METER PHOTO *</Text>
                  <OdometerPhotoPicker
                    photo={endMeterImage}
                    onPickCamera={() => pickOdometerPhoto('end', 'camera')}
                    onPickGallery={() => pickOdometerPhoto('end', 'library')}
                    onRemove={() => setEndMeterImage(null)}
                    onView={() => { setViewerUrl(endMeterImage?.uri); setViewerVisible(true); }}
                  />
                </View>

                {/* Remark — required for Fuel */}
                <View style={s.fieldGroup}>
                  <View style={s.labelRow}>
                    <Text style={s.fieldLabel}>REMARK *</Text>
                  </View>
                  <TextInput
                    style={[s.remarksInput, remarkTouched && !remark.trim() && { borderColor: C.error }]}
                    placeholder="e.g. Visited Client HQ for payroll meeting..."
                    placeholderTextColor={C.textMuted}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    value={remark}
                    onChangeText={v => { setRemark(v); setRemarkTouched(true); }}
                  />
                  {remarkTouched && !remark.trim() && (
                    <View style={s.helperRow}>
                      <Icon name="warning" size={12} color={C.error} />
                      <Text style={[s.helperText, { color: C.error }]}> Remark is required</Text>
                    </View>
                  )}
                  <Text style={s.charCount}>{remark.length}/200</Text>
                </View>
              </>
            ) : (
              /* ── Standard Allowance Form Fields ── */
              <>
                <AmountInput
                  value={amount}
                  onChange={v => { setAmount(v); setAmtTouched(true); }}
                  error={amountError}
                  touched={amtTouched}
                  maxLimit={maxLimit}
                />

                <View style={s.infoBanner}>
                  <Icon name="info" size={18} color={C.primary} style={{ marginTop: 1 }} />
                  <Text style={s.infoText}>{infoBannerText}</Text>
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.fieldLabel}>
                    ATTACHMENTS * {attachments.length > 0 ? `(${attachments.length})` : '(Required)'}
                  </Text>
                  <View style={s.attachRow}>
                    <TouchableOpacity style={s.attachBtn} onPress={handlePickImage} activeOpacity={0.75} disabled={isLoading}>
                      <Icon name="add-photo-alternate" size={20} color={C.primary} />
                      <Text style={s.attachBtnText}>Upload Image</Text>
                    </TouchableOpacity>
                    <View style={{ width: 10 }} />
                    <TouchableOpacity style={s.attachBtn} onPress={handlePickFile} activeOpacity={0.75} disabled={isLoading}>
                      <Icon name="attach-file" size={20} color={C.primary} />
                      <Text style={s.attachBtnText}>Upload File</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.helperRow}>
                    <Icon name="info-outline" size={12} color={C.textMuted} />
                    <Text style={[s.helperText, { color: C.textMuted }]}>
                      {' '}Supported: JPG, PNG, PDF, DOCX (Multiple attachments supported)
                    </Text>
                  </View>

                  {attachments.length > 0 && (
                    <View style={s.chipList}>
                      {attachments.map((file, idx) => (
                        <Chip
                          key={`${file.uri}_${idx}`}
                          file={file}
                          onRemove={() => handleRemoveAttachment(idx)}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Remark — required for all standard allowances */}
                <View style={s.fieldGroup}>
                  <View style={s.labelRow}>
                    <Text style={s.fieldLabel}>REMARK *</Text>
                  </View>
                  <TextInput
                    style={[s.remarksInput, remarkTouched && !remark.trim() && { borderColor: C.error }]}
                    placeholder="e.g. Project reimbursement for client visit, reason for claim..."
                    placeholderTextColor={C.textMuted}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    value={remark}
                    onChangeText={v => { setRemark(v); setRemarkTouched(true); }}
                  />
                  {remarkTouched && !remark.trim() && (
                    <View style={s.helperRow}>
                      <Icon name="warning" size={12} color={C.error} />
                      <Text style={[s.helperText, { color: C.error }]}> Remark is required</Text>
                    </View>
                  )}
                  <Text style={s.charCount}>{remark.length}/200</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[s.submitBtn, isLoading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <>
                <Text style={s.submitText}>Continue</Text>
                <Icon name="arrow-forward" size={20} color={C.white} />
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AllowanceSheet
        visible={showSheet}
        selected={allowType}
        serverConfigs={serverConfigs}
        isLoadingConfigs={isLoadingConfigs}
        onSelect={(id, cfg) => {
          setAllowType(id);
          setSelectedConfig(cfg);
        }}
        onClose={() => setShowSheet(false)}
        customLabel={customAllowLabel}
        onCustomLabelChange={setCustomAllowLabel}
      />
      <Modal transparent animationType="fade" visible={popup.visible} onRequestClose={hidePopup}>
        <View style={s.popupOverlay}>
          <View style={s.popupBox}>
            <Text style={s.popupTitle}>{popup.title}</Text>
            <Text style={s.popupMessage}>{popup.message}</Text>
            <TouchableOpacity style={[s.popupBtn, popup.type === 'success' ? s.successBtn : s.errorBtn]} onPress={hidePopup}>
              <Text style={s.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CalendarModal
        visible={showStartDateCal}
        selectedDate={startDate}
        maxDate={isFuel ? new Date() : undefined}
        onSelect={d => {
          setStartDate(d);
          // If end date is before new start date, clear it
          if (endDate && d > endDate) setEndDate(null);
        }}
        onClose={() => setShowStartDateCal(false)}
        title={useSingleDate ? 'Select Date' : 'Select Start Date'}
      />
      {(isFuel || isProjectReimbursement) && (
        <CalendarModal
          visible={showEndDateCal}
          selectedDate={endDate}
          maxDate={isFuel ? new Date() : undefined}
          onSelect={d => setEndDate(d)}
          onClose={() => setShowEndDateCal(false)}
          title="Select End Date"
        />
      )}
      <SuccessModal
        visible={successVisible}
        data={successData}
        onViewRequests={() => { setSuccessVisible(false); onSuccess(); }}
        onSubmitAnother={() => {
          setSuccessVisible(false);
          setAllowType('');
          setSelectedConfig(null);
          setAmount('');
          setStartDate(null);
          setEndDate(null);
          setAttachments([]);
          setStartMeter('');
          setEndMeter('');
          setStartMeterImage(null);
          setEndMeterImage(null);
          setRemark('');
          setRemarkTouched(false);
          setAmtTouched(false);
          setStartMeterTouched(false);
          setEndMeterTouched(false);
        }}
      />
      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
// ─── Allowance acknowledgement key ─────────────────────────────────────────────────────
export default function EmployeeAllowanceForm({ navigation: navProp }) {
  const navigation = navProp || useNavigation();
  const [screen, setScreen] = useState('list'); // 'list' | 'form'
  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || '{}');
  const userid = parseData?.data?.data?.user_id;
  const user_id = parseData['data']?.user_id ? parseData['data']?.user_id : userid;
  const uname = parseData?.data?.data?.name || 'Employee';
  const is_acknowledgeds = parseData?.data?.data?.is_acknowledged;
  const is_acknowledged = parseData['data']?.is_acknowledged ? parseData['data']?.is_acknowledged : is_acknowledgeds;
  // ── Acknowledgement gate ──
  const ALLOWANCE_ACK_KEY = 'ack_leave_policy_v1';
  const [ackModal, setAckModal] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const checkAcknowledgement = async () => {
        const localAck = await AsyncStorage.getItem(ALLOWANCE_ACK_KEY);
        const shouldShowModal =
          localAck !== 'true' && is_acknowledged === true;

        console.log('[Allowance] ── Acknowledgement Check ──');
        console.log('[Allowance] userInfo          :', userInfo ? 'loaded' : 'NOT loaded (empty)');
        console.log('[Allowance] is_acknowledged   :', is_acknowledged);
        console.log('[Allowance] localAck (storage):', localAck);
        console.log('[Allowance] shouldShowModal   :', shouldShowModal);

        setAckModal(shouldShowModal);
      };
      checkAcknowledgement();
    }, [is_acknowledged, userInfo])
  );

  if (screen === 'form') {
    return (
      <RequestFormScreen
        navigation={navigation}
        userId={user_id}
        uname={uname}
        onBack={() => setScreen('list')}
        onSuccess={() => setScreen('list')}
      />
    );
  }

  return (
    <>
      {/* ── Acknowledgement popup ── */}
      <Modal
        visible={ackModal}
        transparent
        animationType="fade"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={s.ackOverlay}>
          <View style={s.ackCard}>
            <View style={s.ackIconRing}>
              <View style={s.ackIconInner}>
                <IonIcon
                  name="wallet-outline"
                  type={IconType.Ionicons}
                  size={28}
                  color="#fff"
                />
              </View>
            </View>

            <Text style={s.ackTitle}>Policy Acknowledgement</Text>
            <Text style={s.ackBody}>
              Before applying for an allowance, please read and acknowledge our Allowance &amp; Privacy Policy.{'\n\n'}Scroll to the end of the policy and tick the checkbox to proceed.
            </Text>

            <TouchableOpacity
              style={s.ackReadBtn}
              activeOpacity={0.85}
              onPress={() => {
                setAckModal(false); // close popup before navigating
                navigation.navigate('terms', {
                  ackKey: ALLOWANCE_ACK_KEY,
                  title: 'Allowance & Privacy Policy',
                });
              }}
            >
              <IonIcon name="book-outline" type={IconType.Ionicons} size={17} color="#fff" />
              <Text style={s.ackReadBtnText}>Read Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.ackCancelBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={s.ackCancelText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AllowanceListScreen
        navigation={navigation}
        userId={user_id}
        onRequest={() => setScreen('form')}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // ── List screen ──
  listHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingTop: Platform.OS === 'ios' ? 0 : 26,
    paddingBottom: 0,
  },
  listHeaderTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 16,
  },
  listTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  listSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  requestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  requestBtnText: { fontSize: 13, fontWeight: '700', color: C.white },

  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.white },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  tabTextActive: { color: C.white },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  tabBadgeTextActive: { color: C.white },

  listContent: { padding: 16, paddingBottom: 32 },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  centerStateText: { fontSize: 14, color: C.textSub },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSub },
  emptySubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center' },

  // ── Allowance Card ──
  allowCard: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
  },
  allowCardTop: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14,
  },
  allowCardIconBox: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  allowCardMeta: { flex: 1, minWidth: 0 },
  allowCardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  allowCardDate: { fontSize: 12, color: C.textSub, marginTop: 2 },

  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  allowCardDivider: { height: 1, backgroundColor: '#EEF2EF', marginHorizontal: 14 },

  allowCardBottom: {
    flexDirection: 'row', padding: 12, paddingHorizontal: 14, gap: 8,
  },
  allowCardField: { flex: 1 },
  allowCardFieldLabel: {
    fontSize: 10, fontWeight: '700', color: C.textMuted,
    letterSpacing: 0.8, marginBottom: 3,
  },
  allowCardFieldValue: { fontSize: 14, fontWeight: '700', color: C.primary },

  allowCardImgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  allowCardThumb: {
    width: 64, height: 48, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  allowCardImgLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allowCardImgLabelText: { fontSize: 12, color: C.textSub },

  // ── Image Viewer ──
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageViewerImg: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },

  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
  },

  // ── Form header ──
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 34, paddingBottom: 10,
    backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },

  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: C.textPrimary, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: C.textSub, lineHeight: 20, marginBottom: 20 },

  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 20,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 4,
  },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.textSub,
    letterSpacing: 1.1, marginBottom: 8,
  },

  // Dropdown
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: C.white,
  },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  dropdownIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' },
  dropdownText: { fontSize: 15, color: C.textPrimary },
  dropdownPlaceholder: { fontSize: 15, color: C.textMuted },

  // custom
  // Custom "Other" input inside sheet
  customInputWrapper: {
    marginTop: 12,
    backgroundColor: C.infoBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
    backgroundColor: C.white,
  },
  customInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: C.textPrimary,
  },
  customInputConfirm: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Amount
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12, overflow: 'hidden',
  },
  rupeeBox: {
    width: 50, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primaryBg, borderRightWidth: 1.5,
    borderRightColor: C.border, paddingVertical: 15,
  },
  rupeeSymbol: { fontSize: 18, fontWeight: '800', color: C.primary },
  amountInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: C.textPrimary,
  },
  amountStatus: { paddingRight: 12 },
  helperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  helperText: { fontSize: 12 },

  // Dates
  dateRow: { flexDirection: 'row', marginBottom: 20 },
  dateFieldWrap: { flex: 1 },
  dateField: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 13,
  },
  dateText: { fontSize: 14, color: C.textPrimary, flex: 1 },
  datePlaceholder: { fontSize: 13, color: C.textMuted, flex: 1 },

  // Info banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.infoBg, borderRadius: 12, padding: 14, marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: C.primary, lineHeight: 19 },

  // Attachments
  attachRow: { flexDirection: 'row' },
  attachBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12, borderStyle: 'dashed',
    paddingVertical: 14, backgroundColor: C.bg,
  },
  attachBtnText: { fontSize: 13, fontWeight: '600', color: C.primary },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 },
  allowCardImgRowContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primaryBg, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: C.border,
  },
  chipThumb: { width: 22, height: 22, borderRadius: 4 },
  chipName: { fontSize: 12, color: C.textPrimary, maxWidth: 100 },
  changeAttachBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primaryBg, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: C.border,
  },
  changeAttachText: { fontSize: 12, fontWeight: '600', color: C.primary },

  // Submit
  submitBtn: {
    marginTop: 20, backgroundColor: C.primary, borderRadius: 16,
    paddingVertical: 17, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  // Overlay
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },

  // Allowance sheet
  sheet: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20, maxHeight: '80%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: C.border,
    alignSelf: 'center', marginVertical: 12,
  },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  sheetItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sheetItemActive: {
    backgroundColor: C.primaryBg, marginHorizontal: -20, paddingHorizontal: 20,
  },
  sheetIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' },
  sheetIconCircleActive: { backgroundColor: C.primary },
  sheetItemText: { flex: 1, fontSize: 15, color: C.textPrimary },
  sheetItemTextActive: { color: C.primary, fontWeight: '700' },
  sheetCancel: {
    marginTop: 14, paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
  },
  sheetCancelText: { fontSize: 15, fontWeight: '600', color: C.textSub },

  // Calendar
  calCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  calHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16,
  },
  calHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  calTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
  calCloseBtn: { padding: 4 },
  monthNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: C.textSub, letterSpacing: 0.5 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center', borderRadius: 50,
  },
  calCellSel: { backgroundColor: C.primary },
  calCellToday: { backgroundColor: C.primaryBg },
  calDay: { fontSize: 14, color: C.textPrimary },
  calDaySel: { color: C.white, fontWeight: '700' },
  calDayToday: { color: C.primary, fontWeight: '700' },
  todayBtn: {
    marginTop: 14, backgroundColor: C.primaryBg, borderRadius: 12,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },

  todayBtnText: { fontSize: 14, fontWeight: '700', color: C.primary },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  popupIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  popupMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  popupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  successBtn: { backgroundColor: '#4CAF50' },
  errorBtn: { backgroundColor: '#F44336' },
  popupBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // ── Acknowledgement modal ──
  ackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  ackCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  ackIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(26,71,49,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ackIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  ackBody: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ackReadBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    elevation: 4,
  },
  ackReadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  ackCancelBtn: {
    height: 42,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackCancelText: {
    fontSize: 14,
    color: '#A0B8AE',
    fontWeight: '600',
  },

  // ── Per-KM badge / subtitle ──
  perKmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: C.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  perKmBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  sheetItemSubText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  // ── Odometer meter inputs ──
  inputSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  meterInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  meterInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: C.textPrimary,
    paddingVertical: 0,
  },
  inputBoxError: {
    borderColor: C.error,
    backgroundColor: '#FFF8F8',
  },

  // ── Fuel Calculation card ──
  fuelCalcCard: {
    backgroundColor: '#F3F9F5',
    borderWidth: 1,
    borderColor: '#C2DFD0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  fuelCalcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelCalcItem: {
    alignItems: 'center',
  },
  fuelCalcLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  fuelCalcValue: {
    fontSize: 10,
    fontWeight: '800',
    color: C.textPrimary,
  },

  // ── Odometer photo picker ──
  photoPickerBox: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
  },
  photoPickerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  photoPickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 10,
  },
  photoPickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  photoHintText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },

  // ── Photo preview ──
  photoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  photoPreviewThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: C.bg,
  },
  photoPreviewMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  photoPreviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 2,
  },
  photoPreviewSub: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 6,
  },
  photoBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoRetakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoRetakeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.primary,
  },
  photoRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoRemoveBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.error,
  },

  // ── Visit Remarks ──
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalTag: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.6,
  },
  remarksInput: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: C.textPrimary,
    minHeight: 76,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: C.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  // ── Fuel Card / Details in AllowanceCard ──
  allowCardFieldValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textPrimary,
  },
  cardRemarksRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FCFDFD',
  },
  cardRemarksText: {
    flex: 1,
    fontSize: 11,
    color: C.textSub,
    lineHeight: 16,
  },
  odometerCardRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  odometerThumbWrap: {
    position: 'relative',
  },
  odometerThumbTag: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: C.white,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    borderRadius: 4,
    paddingVertical: 1,
  },
});