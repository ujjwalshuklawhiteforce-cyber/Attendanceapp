import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Modal,
    StatusBar,
    RefreshControl,
    ScrollView,
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useRef } from 'react';

// ─── Config ─────────────────────────────────────────────────────────────────
// Swap this with your real host, e.g. https://whiteforcepayroll.com
const BASE_URL = 'https://whiteforcepayroll.com/admin/api';

// ─── Theme — same palette as AttendanceRegularizationScreen ─────────────────
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
    sundayBg: '#E0E7FF',
    sundayText: '#3730A3',
    holidayBg: '#FCE7F3',
    holidayText: '#9D174D',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];
const SECTION_TABS = [
    { key: 'apply', label: 'Claim', icon: 'event-available' },
    { key: 'history', label: 'History', icon: 'history' },
];

const normalizeStatus = (s) => (s ? s.toLowerCase() : 'pending');

const fmtDateDisplay = (str) => {
    if (!str) return '—';
    const parts = str.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return str;
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

// ─── Type Pill (Sunday / Public Holiday) ─────────────────────────────────────
const TypePill = ({ type }) => {
    const isSunday = (type || '').toLowerCase() === 'sunday';
    const bg = isSunday ? C.sundayBg : C.holidayBg;
    const text = isSunday ? C.sundayText : C.holidayText;
    const icon = isSunday ? 'wb-sunny' : 'celebration';
    return (
        <View style={[s.typePill, { backgroundColor: bg }]}>
            <MaterialIcons name={icon} size={12} color={text} />
            <Text style={[s.typePillText, { color: text }]} numberOfLines={1}>{type || '—'}</Text>
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
    const isSuccess = type === 'success';
    const iconBg = isSuccess ? C.approvedBg : C.rejectedBg;
    const icon = isSuccess ? 'check-circle' : 'error';
    const title = isSuccess ? 'Submitted!' : 'Something went wrong';

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
                    <Text style={s.popupMessage}>
                        {message || (isSuccess ? 'Your Comp-Off accrual request has been submitted.' : 'Please try again.')}
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

const fmtDateAPI = (d) => d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : '';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

// ─── Leave Date Picker Calendar Modal ───────────────────────────────────────
const LeaveCalendarModal = ({ visible, workedDateStr, selectedDate, onSelect, onClose }) => {
    const workedDate = workedDateStr ? new Date(workedDateStr) : new Date();
    workedDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(workedDate);
    maxDate.setDate(maxDate.getDate() + 30);

    const [viewYear, setViewYear] = useState((selectedDate || workedDate).getFullYear());
    const [viewMonth, setViewMonth] = useState((selectedDate || workedDate).getMonth());

    useEffect(() => {
        if (visible) {
            const initDate = selectedDate || workedDate;
            setViewYear(initDate.getFullYear());
            setViewMonth(initDate.getMonth());
        }
    }, [visible, workedDateStr]);

    if (!visible) return null;

    const dim = daysInMonth(viewYear, viewMonth);
    const first = firstDayOfMonth(viewYear, viewMonth);
    const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];

    const prev = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const next = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const isDisabled = (day) => {
        if (!day) return true;
        const d = new Date(viewYear, viewMonth, day);
        d.setHours(0, 0, 0, 0);
        return d < workedDate || d > maxDate;
    };

    const isSel = (day) => {
        if (!day || !selectedDate) return false;
        return selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getFullYear() === viewYear;
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={s.popupOverlay}>
                <View style={s.calCard}>
                    <View style={s.calHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="event" size={20} color={C.primary} />
                            <Text style={s.calTitle}>Select Leave Date</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <MaterialIcons name="close" size={20} color={C.textSub} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>
                        Must be between {fmtDateDisplay(workedDateStr)} and {fmtDateDisplay(fmtDateAPI(maxDate))}
                    </Text>

                    <View style={s.monthNav}>
                        <TouchableOpacity onPress={prev} style={s.navBtn}>
                            <MaterialIcons name="chevron-left" size={22} color={C.primary} />
                        </TouchableOpacity>
                        <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
                        <TouchableOpacity onPress={next} style={s.navBtn}>
                            <MaterialIcons name="chevron-right" size={22} color={C.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.weekRow}>
                        {DAYS_SHORT.map(d => <Text key={d} style={s.weekDay}>{d}</Text>)}
                    </View>

                    <View style={s.calGrid}>
                        {cells.map((day, i) => {
                            const disabled = isDisabled(day);
                            const selected = isSel(day);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        s.calCell,
                                        selected && s.calCellSel,
                                        disabled && day ? { opacity: 0.3 } : null,
                                    ]}
                                    onPress={() => {
                                        if (day && !disabled) {
                                            onSelect(new Date(viewYear, viewMonth, day));
                                            onClose();
                                        }
                                    }}
                                    disabled={!day || disabled}
                                >
                                    <Text style={[s.calDay, selected && s.calDaySel]}>
                                        {day || ''}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ─── Confirm Claim Popup ──────────────────────────────────────────────────────
const ConfirmClaimModal = ({ visible, item, onConfirm, onCancel, submitting }) => {
    const [leaveDate, setLeaveDate] = useState(null);
    const [showCal, setShowCal] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setLeaveDate(null);
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 140, friction: 9 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible || !item) return null;

    return (
        <>
            <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
                <View style={s.popupOverlay}>
                    <Animated.View style={[s.popupCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                        <View style={[s.popupIconOuter, { backgroundColor: C.primaryBg }]}>
                            <View style={[s.popupIconInner, { backgroundColor: C.primary }]}>
                                <MaterialIcons name="event-available" size={28} color={C.white} />
                            </View>
                        </View>
                        <Text style={[s.popupTitle, { color: C.textPrimary }]}>Claim Comp-Off?</Text>
                        <Text style={s.popupMessage}>
                            Worked on {item.formatted_date || fmtDateDisplay(item.date)} ({item.day_name}).
                        </Text>

                        {/* Optional Leave Date Field */}
                        <View style={s.leaveDateSection}>
                            <Text style={s.leaveDateLabel}>TAKE LEAVE ON (OPTIONAL)</Text>
                            <TouchableOpacity
                                style={s.leaveDateField}
                                onPress={() => setShowCal(true)}
                                activeOpacity={0.75}
                            >
                                <Text style={leaveDate ? s.leaveDateText : s.leaveDatePlaceholder}>
                                    {leaveDate ? fmtDateDisplay(fmtDateAPI(leaveDate)) : 'Select leave date (Optional)'}
                                </Text>
                                <MaterialIcons name="calendar-today" size={18} color={leaveDate ? C.primary : C.textMuted} />
                            </TouchableOpacity>
                            {leaveDate && (
                                <TouchableOpacity
                                    style={s.clearLeaveDateBtn}
                                    onPress={() => setLeaveDate(null)}
                                >
                                    <MaterialIcons name="cancel" size={14} color={C.error} />
                                    <Text style={s.clearLeaveDateText}>Clear leave date</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={s.confirmActions}>
                            <TouchableOpacity
                                style={s.dpCancelBtn}
                                onPress={onCancel}
                                activeOpacity={0.75}
                                disabled={submitting}
                            >
                                <Text style={s.dpCancelText} numberOfLines={1}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.dpConfirmBtn, { flex: 1 }, submitting && { opacity: 0.7 }]}
                                onPress={() => onConfirm(leaveDate)}
                                activeOpacity={0.85}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color={C.white} size="small" />
                                ) : (
                                    <Text style={s.dpConfirmText} numberOfLines={1}>
                                        {leaveDate ? 'Submit & Link Leave' : 'Confirm Claim'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            <LeaveCalendarModal
                visible={showCal}
                workedDateStr={item.date}
                selectedDate={leaveDate}
                onSelect={(d) => setLeaveDate(d)}
                onClose={() => setShowCal(false)}
            />
        </>
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
const SectionTabBar = ({ tabs, active, badgeCount, onSelect }) => {
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
                        {tab.key === 'apply' && badgeCount > 0 && (
                            <View style={s.sectionBadge}>
                                <Text style={s.sectionBadgeText} numberOfLines={1}>{badgeCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ─── Eligible Date Card (Apply section) ──────────────────────────────────────
const EligibleDateCard = ({ item, onClaim }) => {
    const daysLeft = item.days_remaining ?? null;
    const isUrgent = daysLeft !== null && daysLeft <= 5;

    return (
        <View style={s.card}>
            <View style={s.cardTop}>
                <View style={s.cardIconBox}>
                    <MaterialIcons name="event-available" size={20} color={C.primary} />
                </View>
                <View style={s.cardMeta}>
                    <Text style={s.cardTitle}>{item.formatted_date || fmtDateDisplay(item.date)}</Text>
                    <Text style={s.cardSub}>{item.day_name}</Text>
                </View>
                <TypePill type={item.type} />
            </View>

            <View style={s.cardDivider} />

            <View style={s.detailsGrid}>
                <View style={s.detailItem}>
                    <Text style={s.detailLabel}>EXPIRES ON</Text>
                    <Text style={s.detailValue}>{item.expiry_date || '—'}</Text>
                </View>
                <View style={s.detailItem}>
                    <Text style={s.detailLabel}>DAYS LEFT</Text>
                    <Text style={[s.detailValue, isUrgent && { color: C.error }]}>
                        {daysLeft !== null ? daysLeft : '—'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={s.claimBtn} onPress={() => onClaim(item)} activeOpacity={0.85}>
                <MaterialIcons name="add-task" size={17} color={C.white} />
                <Text style={s.claimBtnText} numberOfLines={1}>Claim Comp-Off</Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── History Card ─────────────────────────────────────────────────────────────
const CompOffHistoryCard = ({ item }) => {
    return (
        <View style={s.card}>
            <View style={s.cardTop}>
                <View style={s.cardIconBox}>
                    <MaterialIcons name="history" size={20} color={C.primary} />
                </View>
                <View style={s.cardMeta}>
                    <Text style={s.cardTitle}>{fmtDateDisplay(item.worked_date)}</Text>
                    <Text style={s.cardSub}>Ref #{item.id}</Text>
                </View>
                <StatusPill status={item.status} />
            </View>

            <View style={s.cardDivider} />

            <View style={s.detailsGrid}>
                <View style={s.detailItem}>
                    <Text style={s.detailLabel}>WORKED DATE</Text>
                    <Text style={s.detailValue}>{fmtDateDisplay(item.worked_date)}</Text>
                </View>
                <View style={s.detailItem}>
                    <Text style={s.detailLabel}>SUBMITTED</Text>
                    <Text style={s.detailValue}>
                        {item.created_at ? fmtDateDisplay(item.created_at.slice(0, 10)) : '—'}
                    </Text>
                </View>
            </View>

            {(item.leave_date || item.leave_request_id) && (
                <View style={s.linkedLeaveRow}>
                    <MaterialIcons name="event" size={14} color={C.primary} />
                    <Text style={s.linkedLeaveText}>
                        Linked Leave: {item.leave_date ? fmtDateDisplay(item.leave_date) : ''}
                        {item.leave_request_id ? ` (#${item.leave_request_id})` : ''}
                    </Text>
                </View>
            )}
        </View>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, message }) => (
    <View style={s.emptyState}>
        <MaterialIcons name={icon} size={52} color={C.border} />
        <Text style={s.emptyTitle}>{title || 'Nothing here'}</Text>
        <Text style={s.emptySubtitle}>{message}</Text>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CompOffAccrualScreen = ({ navigation }) => {
    const { userInfo } = useAuth();
    const parseData = JSON.parse(userInfo || '{}');
    const userid = parseData?.data?.data?.user_id;
    const user_id = parseData?.data?.user_id ? parseData?.data?.user_id : userid;

    const [activeSection, setActiveSection] = useState('apply'); // 'apply' | 'history'

    // ── Eligible dates (Apply) state ──
    const [eligibleDates, setEligibleDates] = useState([]);
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [refreshingEligible, setRefreshingEligible] = useState(false);
    const [claimTarget, setClaimTarget] = useState(null);
    const [claiming, setClaiming] = useState(false);

    // ── History state ──
    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('All');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshingHistory, setRefreshingHistory] = useState(false);

    const [popup, setPopup] = useState({ visible: false, type: null, message: '' });

    const switchSection = (sec) => setActiveSection(sec);

    // ── Fetch eligible dates ──
    const fetchEligibleDates = async (silent = false) => {
        if (!user_id) return;
        if (!silent) setLoadingEligible(true);
        try {
            const res = await fetch(`${BASE_URL}/compoff/eligible-dates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ user_id }),
            });
            const json = await res.json();
            if (json.status === 'success') {
                setEligibleDates(json.data || []);
            }
        } catch (err) {
            console.log('Comp-Off eligible-dates fetch error:', err);
        } finally {
            setLoadingEligible(false);
            setRefreshingEligible(false);
        }
    };

    // ── Fetch history ──
    const fetchHistory = async (silent = false) => {
        if (!user_id) return;
        if (!silent) setLoadingHistory(true);
        try {
            const res = await fetch(`${BASE_URL}/compoff/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ user_id }),
            });
            const json = await res.json();
            if (json.status === 'success') {
                setHistory(json.data || []);
            }
        } catch (err) {
            console.log('Comp-Off history fetch error:', err);
        } finally {
            setLoadingHistory(false);
            setRefreshingHistory(false);
        }
    };

    useEffect(() => {
        if (activeSection === 'apply') fetchEligibleDates();
        if (activeSection === 'history') fetchHistory();
    }, [activeSection]);

    const filteredHistory = history.filter((h) =>
        historyFilter === 'All' ? true : normalizeStatus(h.status) === historyFilter.toLowerCase()
    );

    const historyCounts = {
        all: history.length,
        pending: history.filter((h) => normalizeStatus(h.status) === 'pending').length,
        approved: history.filter((h) => normalizeStatus(h.status) === 'approved').length,
        rejected: history.filter((h) => normalizeStatus(h.status) === 'rejected').length,
    };

    // ── Submit claim ──
    const handleConfirmClaim = async (selectedLeaveDate) => {
        if (!claimTarget || !user_id) return;
        setClaiming(true);
        try {
            const payload = {
                user_id: Number(user_id),
                worked_date: claimTarget.date,
            };
            if (selectedLeaveDate) {
                payload.leave_date = fmtDateAPI(selectedLeaveDate);
            }

            let res = await fetch(`${BASE_URL}/compoff-accrual/store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),

            });

            if (res.status === 404) {
                res = await fetch(`${BASE_URL}/compoff/apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const json = await res.json();
            console.log("json", json);
            if ((res.ok || res.status === 201) && (json.status === 'success' || json.success)) {
                // Remove the claimed date from the eligible list without a refetch.
                setEligibleDates((prev) => prev.filter((d) => d.date !== claimTarget.date));
                setClaimTarget(null);
                const extraMsg = json.data?.leave_request_id
                    ? ` Linked leave request #${json.data.leave_request_id} created.`
                    : '';
                setPopup({
                    visible: true,
                    type: 'success',
                    message: (json.message || 'Comp-Off Accrual Request submitted successfully.') + extraMsg,
                });
            } else {
                setClaimTarget(null);
                setPopup({
                    visible: true,
                    type: 'error',
                    message: json.message || 'Could not submit request. Please try again.',
                });
            }
        } catch (err) {
            console.log('Comp-Off apply error:', err);
            setClaimTarget(null);
            setPopup({ visible: true, type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setClaiming(false);
        }
    };

    // ── Render: Apply (eligible dates) ──
    const renderApply = () => (
        <>
            {loadingEligible ? (
                <View style={s.centerState}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.centerStateText}>Checking eligible dates…</Text>
                </View>
            ) : (
                <FlatList
                    data={eligibleDates}
                    keyExtractor={(item) => `elig_${item.date}`}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshingEligible}
                            onRefresh={() => { setRefreshingEligible(true); fetchEligibleDates(true); }}
                            colors={[C.primary]}
                            tintColor={C.primary}
                        />
                    }
                    ListHeaderComponent={
                        eligibleDates.length > 0 ? (
                            <View style={s.infoBanner}>
                                <MaterialIcons name="info" size={16} color={C.primary} />
                                <Text style={s.infoBannerText}>
                                    Worked Sundays / holidays from the last 30 days that you haven't claimed yet.
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="event-busy"
                            title="No eligible dates"
                            message="No unclaimed worked Sundays or holidays found in the last 30 days."
                        />
                    }
                    renderItem={({ item }) => (
                        <EligibleDateCard item={item} onClaim={setClaimTarget} />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}

            <ConfirmClaimModal
                visible={!!claimTarget}
                item={claimTarget}
                submitting={claiming}
                onConfirm={handleConfirmClaim}
                onCancel={() => { if (!claiming) setClaimTarget(null); }}
            />
        </>
    );

    // ── Render: History ──
    const renderHistory = () => (
        <>
            <FilterTabRow
                filters={STATUS_FILTERS}
                active={historyFilter}
                counts={historyCounts}
                onSelect={setHistoryFilter}
            />
            {loadingHistory ? (
                <View style={s.centerState}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.centerStateText}>Loading requests…</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => `compoff_${item.id}`}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshingHistory}
                            onRefresh={() => { setRefreshingHistory(true); fetchHistory(true); }}
                            colors={[C.primary]}
                            tintColor={C.primary}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="event-busy"
                            title="No requests"
                            message={`No ${historyFilter === 'All' ? '' : historyFilter.toLowerCase() + ' '}Comp-Off requests found.`}
                        />
                    }
                    renderItem={({ item }) => <CompOffHistoryCard item={item} />}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}
        </>
    );

    const refreshActiveSection = () => {
        if (activeSection === 'apply') {
            setRefreshingEligible(true);
            fetchEligibleDates(true);
        } else {
            setRefreshingHistory(true);
            fetchHistory(true);
        }
    };

    return (
        <View style={s.safe}>
            <StatusBar barStyle="light-content" backgroundColor={C.primary} />

            <ResultPopup
                visible={popup.visible}
                type={popup.type}
                message={popup.message}
                onClose={() => setPopup({ visible: false, type: null, message: '' })}
            />

            {/* Header */}
            <View style={s.listHeader}>
                <TouchableOpacity style={s.backBtnHeader} onPress={() => navigation?.goBack()} activeOpacity={0.75}>
                    <MaterialIcons name="arrow-back" size={22} color={C.white} />
                </TouchableOpacity>

                <View style={s.listHeaderTop}>
                    <View>
                        <Text style={s.listTitle}>Comp-Off Accrual</Text>
                        <Text style={s.listSubtitle}>Claim comp-off for worked Sundays/holidays</Text>
                    </View>
                    <TouchableOpacity style={s.refreshBtn} onPress={refreshActiveSection} activeOpacity={0.75}>
                        <MaterialIcons name="refresh" size={20} color={C.white} />
                    </TouchableOpacity>
                </View>

                {/* Section Toggle */}
                <SectionTabBar
                    tabs={SECTION_TABS}
                    active={activeSection}
                    badgeCount={eligibleDates.length}
                    onSelect={switchSection}
                />
            </View>

            {/* Content */}
            {activeSection === 'apply' ? renderApply() : renderHistory()}
        </View>
    );
};

// ─── Styles — mirrors AttendanceRegularizationScreen theme ────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },

    listHeader: {
        backgroundColor: C.primary,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 16 : 16,
        paddingBottom: 0,
    },
    backBtnHeader: { paddingTop: 35, paddingBottom: 6 },
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

    // Section tab bar — indicator width/position computed in JS (onLayout) in
    // pixels so it lines up exactly with each tab's real boundary.
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

    // Info banner (apply section header)
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: C.infoBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    infoBannerText: { flex: 1, fontSize: 12, color: C.textSub, lineHeight: 17 },

    // Filter chips — fixed height so the row never jumps as counts change
    filterRow: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row' },
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
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    cardIconBox: {
        width: 42, height: 42, borderRadius: 10,
        backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center',
    },
    cardMeta: { flex: 1, minWidth: 0 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    cardSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },

    statusPill: { borderRadius: 20, paddingHorizontal: 10, height: 24, justifyContent: 'center' },
    statusPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

    typePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 20,
        paddingHorizontal: 10,
        height: 24,
        maxWidth: 120,
    },
    typePillText: { fontSize: 11, fontWeight: '700' },

    cardDivider: { height: 1, backgroundColor: '#EEF2EF', marginHorizontal: 14 },

    detailsGrid: { flexDirection: 'row', padding: 12, paddingHorizontal: 14, gap: 8 },
    detailItem: { flex: 1 },
    detailLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.8, marginBottom: 3 },
    detailValue: { fontSize: 14, fontWeight: '700', color: C.primary },

    // Fixed-height claim button so cards stay the same size across the list.
    claimBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 46,
        marginHorizontal: 14,
        marginBottom: 14,
        backgroundColor: C.primary,
        borderRadius: 12,
    },
    claimBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },

    // Zoom close (kept for parity, unused here)
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

    confirmActions: { flexDirection: 'row', gap: 10, width: '100%' },
    // Fixed width + height so Cancel / Confirm never resize between screens.
    dpCancelBtn: {
        width: 96, height: 48,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    },
    dpCancelText: { fontSize: 13, fontWeight: '700', color: C.textMuted },
    dpConfirmBtn: {
        height: 48,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 12, backgroundColor: C.primary,
    },
    dpConfirmText: { fontSize: 13, fontWeight: '700', color: C.white },

    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    centerStateText: { fontSize: 14, color: C.textSub },

    listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },

    emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSub },
    emptySubtitle: { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingHorizontal: 20 },

    // Leave date picker styles
    leaveDateSection: { width: '100%', marginBottom: 20 },
    leaveDateLabel: { fontSize: 11, fontWeight: '700', color: C.textSub, letterSpacing: 0.8, marginBottom: 6 },
    leaveDateField: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12, backgroundColor: C.bg,
    },
    leaveDateText: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
    leaveDatePlaceholder: { fontSize: 13, color: C.textMuted },
    clearLeaveDateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-end' },
    clearLeaveDateText: { fontSize: 12, color: C.error, fontWeight: '600' },
    linkedLeaveRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: C.primaryBg, paddingHorizontal: 14, paddingVertical: 8,
        borderTopWidth: 1, borderTopColor: '#EEF2EF',
    },
    linkedLeaveText: { fontSize: 12, fontWeight: '600', color: C.primary },

    // Calendar Modal styles
    calCard: {
        backgroundColor: C.white, borderRadius: 20,
        padding: 20, width: '90%', maxWidth: 360,
    },
    calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    calTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    navBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' },
    monthLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    weekRow: { flexDirection: 'row', marginBottom: 6 },
    weekDay: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: C.textSub },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    calCellSel: { backgroundColor: C.primary },
    calDay: { fontSize: 13, color: C.textPrimary },
    calDaySel: { color: C.white, fontWeight: '700' },
});

export default CompOffAccrualScreen;