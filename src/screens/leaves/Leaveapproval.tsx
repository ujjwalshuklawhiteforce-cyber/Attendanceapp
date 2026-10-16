import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useAuth } from '../../context/AuthContext';
const { width } = Dimensions.get('window');

const BASE_URL = 'https://whiteforcepayroll.com/admin/api';
const IMAGE_BASE = 'https://whiteforcepayroll.com/admin/';


// ─── Theme — matches EmployeeAllowanceForm ────────────────────────────────────
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

const ALLOWANCE_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];
const LEAVE_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const normalizeStatus = (s) => {
  if (!s) return 'pending';
  if (s === 'accepted') return 'approved';
  return s.toLowerCase();
};

const allowanceLabel = (raw) => {
  if (!raw) return 'Allowance';
  if (raw.startsWith('other:')) return raw.replace('other:', '').trim();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const allowanceIcon = (type) => {
  const map = {
    food: 'restaurant', travel: 'flight', medical: 'local-hospital',
    internet: 'wifi', housing: 'home', fuel: 'local-gas-station',
    bonus: 'card-giftcard',
  };
  const key = (type || '').split(':')[0].toLowerCase();
  return map[key] || 'list-alt';
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
      <Text style={[s.statusPillText, { color: c.text }]}>{c.label}</Text>
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
  const isSuccess = type === 'approved';
  const iconBg = isSuccess ? C.approvedBg : C.rejectedBg;
  const iconColor = isSuccess ? C.approvedText : C.rejectedText;
  const icon = isSuccess ? 'check-circle' : 'cancel';
  const title = isSuccess ? 'Approved!' : 'Rejected';

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={s.popupOverlay}>
        <Animated.View style={[s.popupCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={[s.popupIconOuter, { backgroundColor: iconBg }]}>
            <View style={[s.popupIconInner, { backgroundColor: isSuccess ? C.primary : C.error }]}>
              <MaterialIcons name={icon} size={28} color={C.white} />
            </View>
          </View>
          <Text style={[s.popupTitle, { color: isSuccess ? C.approvedText : C.rejectedText }]}>{title}</Text>
          <Text style={s.popupMessage}>{message || (isSuccess ? 'Request approved successfully.' : 'Request rejected.')}</Text>
          <TouchableOpacity style={s.popupBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.popupBtnText}>Done</Text>
            <MaterialIcons name="arrow-forward" size={16} color={C.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Zoomable Image Modal ─────────────────────────────────────────────────────
const ZoomImageModal = ({ visible, uri, onClose }) => {
  const images = uri ? [{ url: `${IMAGE_BASE}${uri}` }] : [];
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
          <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>{f}</Text>
          <View style={[s.filterCount, isActive && s.filterCountActive]}>
            <Text style={[s.filterCountText, isActive && s.filterCountTextActive]}>{count}</Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ─── Allowance Card ───────────────────────────────────────────────────────────
const AllowanceCard = ({ item, onAccept, onReject, loading }) => {
  const [imgVisible, setImgVisible] = useState(false);
  const norm = normalizeStatus(item.status);
  const isPending = norm === 'pending';
  const imgUrl = item.images ? `${IMAGE_BASE}${item.images}` : null;

  const fmtDateStr = (str) => {
    if (!str) return '—';
    const parts = str.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return str;
  };

  return (
    <View style={s.card}>
      <ZoomImageModal visible={imgVisible} uri={item.images} onClose={() => setImgVisible(false)} />

      {/* Top row */}
      <View style={s.cardTop}>
        <View style={s.cardIconBox}>
          <MaterialIcons name={allowanceIcon(item.allowance)} size={20} color={C.primary} />
        </View>
        <View style={s.cardMeta}>
          <Text style={s.cardTitle}>{allowanceLabel(item.allowance)}</Text>
          <Text style={s.cardSub}>Emp #{item.user_id} · Ref #{item.id}</Text>
        </View>
        <StatusPill status={item.status} />
      </View>

      <View style={s.cardDivider} />

      {/* Details grid */}
      <View style={s.detailsGrid}>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>AMOUNT</Text>
          <Text style={s.detailValue}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>FROM</Text>
          <Text style={s.detailValue}>{fmtDateStr(item.start_date)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>TO</Text>
          <Text style={s.detailValue}>{fmtDateStr(item.end_date)}</Text>
        </View>
      </View>

      {/* Attachment */}
      {imgUrl ? (
        <TouchableOpacity style={s.thumbRow} onPress={() => setImgVisible(true)} activeOpacity={0.8}>
          <Image source={{ uri: imgUrl }} style={s.thumb} resizeMode="cover" />
          <View style={s.thumbMeta}>
            <MaterialIcons name="image" size={12} color={C.textMuted} />
            <Text style={s.thumbLabel}>Tap to view attachment</Text>
          </View>
          <MaterialIcons name="zoom-in" size={18} color={C.primary} />
        </TouchableOpacity>
      ) : null}

      {/* Action buttons — only for pending */}
      {isPending && (
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, s.rejectBtn]}
            onPress={onReject}
            disabled={!!loading}
            activeOpacity={0.8}
          >
            {loading === 'reject' ? (
              <ActivityIndicator color={C.error} size="small" />
            ) : (
              <>
                <MaterialIcons name="close" size={16} color={C.error} />
                <Text style={[s.actionBtnText, { color: C.error }]}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, s.acceptBtn]}
            onPress={onAccept}
            disabled={!!loading}
            activeOpacity={0.8}
          >
            {loading === 'accept' ? (
              <ActivityIndicator color={C.success} size="small" />
            ) : (
              <>
                <MaterialIcons name="check" size={16} color={C.success} />
                <Text style={[s.actionBtnText, { color: C.success }]}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Leave Card ───────────────────────────────────────────────────────────────
const LEAVE_TYPE_MAP = {
  1: 'Sick Leave', 2: 'Casual Leave', 3: 'Annual Leave',
  4: 'Maternity Leave', 5: 'Paternity Leave', 6: 'Unpaid Leave',
  7: 'Compensatory Leave', 8: 'Other',
};

const LeaveCard = ({ item, onAccept, onReject, loading }) => {
  const norm = normalizeStatus(item.status);
  const isPending = norm === 'pending';

  const fmtDate = (str) => {
    if (!str) return '—';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  };

  const leaveLabel = LEAVE_TYPE_MAP[item.leave_type_id] || `Type #${item.leave_type_id}`;
  const initials = (item.candidate_name || 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={s.card}>
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={[s.cardIconBox, { backgroundColor: '#E8F0EB' }]}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.primary }}>{initials}</Text>
        </View>
        <View style={s.cardMeta}>
          <Text style={s.cardTitle}>{item.candidate_name || 'Employee'}</Text>
          <Text style={s.cardSub}>{leaveLabel} · ID #{item.id}</Text>
        </View>
        <StatusPill status={item.status} />
      </View>

      <View style={s.cardDivider} />

      {/* Details grid */}
      <View style={s.detailsGrid}>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>FROM</Text>
          <Text style={s.detailValue}>{fmtDate(item.from_date)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>TO</Text>
          <Text style={s.detailValue}>{fmtDate(item.to_date)}</Text>
        </View>
        <View style={s.detailItem}>
          <Text style={s.detailLabel}>DAYS</Text>
          <Text style={s.detailValue}>{item.total_days || '—'}</Text>
        </View>
      </View>

      {/* Day type + reason row */}
      <View style={[s.leaveInfoRow]}>
        <View style={s.leaveDayTypePill}>
          <MaterialIcons
            name={item.half_full_day === 'half day' ? 'wb-sunny' : 'wb-cloudy'}
            size={12} color={C.primary}
          />
          <Text style={s.leaveDayTypeText}>
            {item.half_full_day
              ? item.half_full_day.charAt(0).toUpperCase() + item.half_full_day.slice(1)
              : 'Full day'}
          </Text>
        </View>
        {item.reason ? (
          <Text style={s.leaveReason} numberOfLines={2}>"{item.reason}"</Text>
        ) : null}
      </View>

      {/* Action buttons — only for pending */}
      {isPending && (
        <>
          <View style={s.cardDivider} />
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.rejectBtn]}
              onPress={onReject}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'reject' ? (
                <ActivityIndicator color={C.error} size="small" />
              ) : (
                <>
                  <MaterialIcons name="close" size={16} color={C.error} />
                  <Text style={[s.actionBtnText, { color: C.error }]}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.acceptBtn]}
              onPress={onAccept}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'accept' ? (
                <ActivityIndicator color={C.success} size="small" />
              ) : (
                <>
                  <MaterialIcons name="check" size={16} color={C.success} />
                  <Text style={[s.actionBtnText, { color: C.success }]}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
const ManagerApprovalScreen = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('allowances');
  const [allowanceFilter, setAllowanceFilter] = useState('All');
  const [leaveFilter, setLeaveFilter] = useState('All');
  const [allowances, setAllowances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [popup, setPopup] = useState({ visible: false, type: null, message: '' });
  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || "{}");
  const userid = parseData?.data?.data?.user_id
  const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
  const tabAnim = useRef(new Animated.Value(0)).current;

  const switchSection = (sec) => {
    setActiveSection(sec);
    Animated.timing(tabAnim, {
      toValue: sec === 'allowances' ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoadingData(true);
    try {
      const [aRes, lRes] = await Promise.all([
        fetch(`${BASE_URL}/get-emp-allowance-manager?user_id=${user_id}`),
        fetch(`${BASE_URL}/leave-request-by-manager?user_id=${user_id}`),
      ]);

      const aText = await aRes.text();
      const lText = await lRes.text();

      console.log('Allowance status:', aRes.status);
      console.log('Allowance raw:', aText);
      console.log('Leave status:', lRes.status);

      // Parse each independently so one failure doesn't break the other
      try {
        const aJson = JSON.parse(aText);
        console.log('Allowance JSON:', JSON.stringify(aJson, null, 2));
        if (aJson.success) setAllowances(aJson.data);
      } catch (e) {
        console.log('Allowance parse failed:', e.message);
        console.log('Allowance raw response was:', aText.slice(0, 500));
      }

      try {
        const lJson = JSON.parse(lText);
        console.log('Leave JSON:', JSON.stringify(lJson, null, 2));
        if (lJson.success) setLeaves(lJson.data);
      } catch (e) {
        console.log('Leave parse failed:', e.message);
      }

    } catch (err) {
      console.log('Network error:', err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (type, id, action) => {
    const key = `${type}_${id}`;
    setActionLoading((prev) => ({ ...prev, [key]: action }));
    try {
      const endpoint =
        type === 'allowance'
          ? action === 'accept'
            ? `${BASE_URL}/emp-allowance-accept?id=${id}`
            : `${BASE_URL}/emp-allowance-reject?id=${id}`
          : action === 'accept'
            ? `${BASE_URL}/leave-accept?id=${id}`
            : `${BASE_URL}/leave-reject?id=${id}`;

      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success !== false) {
        if (type === 'allowance') {
          setAllowances((prev) =>
            prev.map((a) => a.id === id ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a)
          );
        } else {
          setLeaves((prev) =>
            prev.map((l) => l.id === id ? { ...l, status: action === 'accept' ? 'accepted' : 'rejected' } : l)
          );
        }
        setPopup({ visible: true, type: action === 'accept' ? 'approved' : 'rejected', message: json.message || '' });
      }
    } catch (_) { }
    finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const filteredAllowances = allowances.filter((a) =>
    allowanceFilter === 'All' ? true : normalizeStatus(a.status) === allowanceFilter.toLowerCase()
  );
  const filteredLeaves = leaves.filter((l) =>
    leaveFilter === 'All' ? true : normalizeStatus(l.status) === leaveFilter.toLowerCase()
  );

  const allowanceCounts = {
    all: allowances.length,
    pending: allowances.filter((a) => normalizeStatus(a.status) === 'pending').length,
    approved: allowances.filter((a) => normalizeStatus(a.status) === 'approved').length,
    rejected: allowances.filter((a) => normalizeStatus(a.status) === 'rejected').length,
  };
  const leaveCounts = {
    all: leaves.length,
    pending: leaves.filter((l) => normalizeStatus(l.status) === 'pending').length,
    approved: leaves.filter((l) => normalizeStatus(l.status) === 'approved').length,
    rejected: leaves.filter((l) => normalizeStatus(l.status) === 'rejected').length,
  };

  // Animated indicator for section toggle
  const indicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '52%'],
  });

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <ResultPopup
        visible={popup.visible}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ visible: false, type: null, message: '' })}
      />

      {/* ── Header (green, matching allowance list) ── */}
      <View style={s.listHeader}>
        <TouchableOpacity style={s.backBtnHeader} onPress={() => navigation?.goBack()} activeOpacity={0.75}>
          <MaterialIcons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>

        <View style={s.listHeaderTop}>
          <View>
            <Text style={s.listTitle}>Approvals</Text>
            <Text style={s.listSubtitle}>Review pending requests</Text>
          </View>
          <TouchableOpacity style={s.refreshBtn} onPress={() => { setRefreshing(true); fetchData(true); }} activeOpacity={0.75}>
            <MaterialIcons name="refresh" size={20} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Section Toggle — styled like the tab bar */}
        <View style={s.sectionToggle}>
          <Animated.View style={[s.sectionIndicator, { left: indicatorLeft }]} />
          <TouchableOpacity style={s.sectionTab} onPress={() => switchSection('allowances')} activeOpacity={0.75}>
            <MaterialIcons
              name="receipt-long"
              size={15}
              color={activeSection === 'allowances' ? C.primary : 'rgba(255,255,255,0.55)'}
            />
            <Text style={[s.sectionTabText, activeSection === 'allowances' && s.sectionTabTextActive]}>
              Allowances
            </Text>
            {allowanceCounts.pending > 0 && (
              <View style={s.sectionBadge}>
                <Text style={s.sectionBadgeText}>{allowanceCounts.pending}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.sectionTab} onPress={() => switchSection('leaves')} activeOpacity={0.75}>
            <MaterialIcons
              name="event-note"
              size={15}
              color={activeSection === 'leaves' ? C.primary : 'rgba(255,255,255,0.55)'}
            />
            <Text style={[s.sectionTabText, activeSection === 'leaves' && s.sectionTabTextActive]}>
              Leaves
            </Text>
            {leaveCounts.pending > 0 && (
              <View style={[s.sectionBadge, { backgroundColor: C.success }]}>
                <Text style={s.sectionBadgeText}>{leaveCounts.pending}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        {activeSection === 'allowances' ? (
          <FilterTabRow
            filters={ALLOWANCE_FILTERS}
            active={allowanceFilter}
            counts={allowanceCounts}
            onSelect={setAllowanceFilter}
          />
        ) : (
          <FilterTabRow
            filters={LEAVE_FILTERS}
            active={leaveFilter}
            counts={leaveCounts}
            onSelect={setLeaveFilter}
          />
        )}
      </View>

      {/* ── Content ── */}
      {loadingData ? (
        <View style={s.centerState}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.centerStateText}>Loading requests…</Text>
        </View>
      ) : activeSection === 'allowances' ? (
        <FlatList
          data={[...filteredAllowances]}
          keyExtractor={(item) => `allowance_${item.id}`}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(true); }}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="inbox"
              message={`No ${allowanceFilter === 'All' ? '' : allowanceFilter.toLowerCase() + ' '}allowances found.`}
            />
          }
          renderItem={({ item }) => (
            <AllowanceCard
              item={item}
              loading={actionLoading[`allowance_${item.id}`]}
              onAccept={() => handleAction('allowance', item.id, 'accept')}
              onReject={() => handleAction('allowance', item.id, 'reject')}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={(item) => `leave_${item.id}`}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(true); }}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="event-busy"
              message={`No ${leaveFilter === 'All' ? '' : leaveFilter.toLowerCase() + ' '}leaves found.`}
            />
          }
          renderItem={({ item }) => (
            <LeaveCard
              item={item}
              loading={actionLoading[`leave_${item.id}`]}
              onAccept={() => handleAction('leave', item.id, 'accept')}
              onReject={() => handleAction('leave', item.id, 'reject')}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // ── Header (green bar, matches allowance list) ──
  listHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 25 : 16,
    paddingBottom: 0,
  },
  backBtnHeader: {
    paddingTop: 25,
    paddingBottom: 6,
  },
  listHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  listTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  listSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 8,
  },

  // ── Section Toggle (pill inside the green header) ──
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 4,
    height: 48,
    overflow: 'hidden',
    marginBottom: 12,
  },
  sectionIndicator: {
    position: 'absolute',
    top: 4,
    width: '46%',
    height: 40,
    backgroundColor: C.white,
    borderRadius: 11,
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
  sectionTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
  sectionTabTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  sectionBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.pendingBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.pendingText,
  },

  // ── Filter Chips (sits inside green header) ──
  filterRow: {
    paddingBottom: 12,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: C.white,
    borderColor: C.white,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },
  filterChipTextActive: {
    color: C.primary,
    fontWeight: '700',
  },
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountActive: {
    backgroundColor: C.primaryBg,
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  filterCountTextActive: {
    color: C.primary,
  },

  // ── Cards (white, matches AllowanceCard) ──
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    // subtle shadow
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  cardSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  cardDivider: { height: 1, backgroundColor: '#EEF2EF', marginHorizontal: 14 },

  detailsGrid: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.primary },

  // Attachment row
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
    width: 56,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  thumbMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  thumbLabel: { fontSize: 12, color: C.textSub },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: C.approvedBg,
    borderColor: 'rgba(39,174,96,0.3)',
  },
  rejectBtn: {
    backgroundColor: C.rejectedBg,
    borderColor: 'rgba(192,57,43,0.25)',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  // Zoom close
  zoomClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
  },

  // Result Popup
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popupCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  popupIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  popupIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  popupBtn: {
    width: '100%',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  popupBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },

  // Loader & empty
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerStateText: { fontSize: 14, color: C.textSub },

  listContent: { padding: 16, paddingBottom: 32 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  leaveInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
    flexWrap: 'wrap',
  },
  leaveDayTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.infoBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  leaveDayTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  leaveReason: {
    flex: 1,
    fontSize: 12,
    color: C.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSub },
  emptySubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
});

export default ManagerApprovalScreen;