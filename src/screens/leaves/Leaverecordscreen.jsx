import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toast from 'react-native-toast-message'; // add this import at top

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useAuth } from 'context/AuthContext';
import { isLocationEnabled } from 'react-native-android-location-enabler';
import { ActivityIndicator } from 'react-native-paper';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = 'rgb(29,91,65)';
const PRIMARY_DARK = '#1a5a41';
const PRIMARY_LIGHT = '#ddeee7';
const PRIMARY_MID = '#1a5a41';
const BG = '#ffffff';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#1C1635';
const TEXT_MID = '#6B6585';
const TEXT_LIGHT = '#252525';
const BORDER = '#d1e7dd';
const DISABLED_COLOR = '#cbd5e0';

const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Update the leave type mapping to IDs
const LEAVE_TYPES = [
  { label: 'Sick Leave', id: 1 },
  { label: 'Casual Leave', id: 2 },
  { label: 'Paid Leave', id: 3 },
  { label: 'Other', id: 4 }
];
const DURATIONS = ['Full Day', 'Half Day'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatShort = (d) => d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : 'Select';
const diffDays = (s, e) => (s && e) ? Math.round((e - s) / 86400000) + 1 : 0;

// Helper to check if a date is in the past (before current month)
const isDateBeforeCurrentMonth = (year, month) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  return false;
};

// Helper to get the minimum selectable day for current month
const getMinSelectableDay = (year, month) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // If it's current month and year, return today's date as minimum
  if (year === currentYear && month === currentMonth) {
    return today.getDate();
  }
  // Otherwise, day 1 is fine
  return 1;
};

// ─── CustomDatePicker ─────────────────────────────────────────────────────────
const CustomDatePicker = ({ visible, selectedDate, onDateSelect, onClose }) => {
  const today = new Date();

  // Initialize with selected date or current date
  const [year, setYear] = useState(selectedDate?.getFullYear() || today.getFullYear());
  const [month, setMonth] = useState(selectedDate?.getMonth() || today.getMonth());
  const [day, setDay] = useState(selectedDate?.getDate() || today.getDate());

  const dayScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const yearScrollRef = useRef(null);
  const navigation = useNavigation();
  // Reset to current date when modal opens
  useEffect(() => {
    if (visible) {
      const dateToUse = selectedDate || today;
      setYear(dateToUse.getFullYear());
      setMonth(dateToUse.getMonth());
      setDay(dateToUse.getDate());
    }
  }, [visible]);

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => today.getFullYear() - 25 + i);

  // Auto-scroll to selected values
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        // Scroll day picker
        if (dayScrollRef.current) {
          dayScrollRef.current.scrollTo({
            y: (day - 1) * 44 - 88,
            animated: true
          });
        }
        // Scroll month picker
        if (monthScrollRef.current) {
          monthScrollRef.current.scrollTo({
            y: month * 44 - 88,
            animated: true
          });
        }
        // Scroll year picker
        if (yearScrollRef.current) {
          const yearIndex = years.indexOf(year);
          yearScrollRef.current.scrollTo({
            y: yearIndex * 44 - 88,
            animated: true
          });
        }
      }, 100);
    }
  }, [visible, day, month, year]);

  // Adjust day if it exceeds the new month's days or if selecting current month
  useEffect(() => {
    const maxDays = daysInMonth(year, month);
    const minDay = getMinSelectableDay(year, month);

    if (day > maxDays) {
      setDay(maxDays);
    } else if (day < minDay) {
      setDay(minDay);
    }
  }, [year, month]);

  // Check if a day is disabled (in the past for current month)
  const isDayDisabled = (d) => {
    const minDay = getMinSelectableDay(year, month);
    return d < minDay;
  };

  // Check if a month is disabled (in the past)
  const isMonthDisabled = (m) => {
    return isDateBeforeCurrentMonth(year, m);
  };

  const handleMonthSelect = (m) => {
    if (isMonthDisabled(m)) {
      Alert.alert(
        'Invalid Selection',
        'Cannot select dates from previous months',
        [{ text: 'OK' }]
      );
      return;
    }
    setMonth(m);
  };

  const handleDaySelect = (d) => {
    if (isDayDisabled(d)) {
      Alert.alert(
        'Invalid Selection',
        'Cannot select past dates',
        [{ text: 'OK' }]
      );
      return;
    }
    setDay(d);
  };

  const handleConfirm = () => {
    // Final validation before confirming
    const selectedDateTime = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (selectedDateTime < todayStart) {
      Alert.alert(
        'Invalid Date',
        'Cannot select dates in the past. Please select today or a future date.',
        [{ text: 'OK' }]
      );
      return;
    }

    onDateSelect(selectedDateTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={dp.container}>
          {/* Header with current selection */}
          <View style={dp.header}>
            <View style={dp.headerLeft}>
              <Icon
                name="event"
                type="MaterialIcons"
                size={22}
                color={PRIMARY}
              />
              <Text style={dp.selectedDate}>
                {day} {MONTHS_SHORT[month]} {year}
              </Text>
            </View>
            <TouchableOpacity style={dp.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Icon
                name="close"
                type="MaterialIcons"
                size={18}
                color={PRIMARY}
              />
            </TouchableOpacity>
          </View>

          {/* Pickers row */}
          <View style={dp.pickersRow}>
            {/* Day Picker */}
            <View style={dp.pickerSection}>
              <Text style={dp.pickerLabel}>Day</Text>
              <View style={dp.pickerWrapper}>
                <ScrollView
                  ref={dayScrollRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  style={dp.pickerScroll}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={{ height: 88 }} />
                  {days.map((d) => {
                    const disabled = isDayDisabled(d);
                    return (
                      <TouchableOpacity
                        key={d}
                        style={dp.pickerItem}
                        onPress={() => handleDaySelect(d)}
                        activeOpacity={disabled ? 1 : 0.7}
                        disabled={disabled}
                      >
                        <Text style={[
                          dp.pickerItemText,
                          d === day && dp.pickerItemTextSelected,
                          disabled && dp.pickerItemTextDisabled
                        ]}>
                          {d.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ height: 88 }} />
                </ScrollView>
              </View>
            </View>

            {/* Month Picker */}
            <View style={dp.pickerSection}>
              <Text style={dp.pickerLabel}>Month</Text>
              <View style={dp.pickerWrapper}>
                <View style={dp.selectionIndicator} />
                <ScrollView
                  ref={monthScrollRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  style={dp.pickerScroll}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={{ height: 88 }} />
                  {MONTHS_SHORT.map((m, index) => {
                    const disabled = isMonthDisabled(index);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={dp.pickerItem}
                        onPress={() => handleMonthSelect(index)}
                        activeOpacity={disabled ? 1 : 0.7}
                        disabled={disabled}
                      >
                        <Text style={[
                          dp.pickerItemText,
                          index === month && dp.pickerItemTextSelected,
                          disabled && dp.pickerItemTextDisabled
                        ]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={{ height: 88 }} />
                </ScrollView>
              </View>
            </View>

            {/* Year Picker */}
            <View style={dp.pickerSection}>
              <Text style={dp.pickerLabel}>Year</Text>
              <View style={dp.pickerWrapper}>
                <View style={dp.selectionIndicator} />
                <ScrollView
                  ref={yearScrollRef}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  style={dp.pickerScroll}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={{ height: 88 }} />
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={dp.pickerItem}
                      onPress={() => setYear(y)}
                      activeOpacity={0.7}
                    >
                      <Text style={[dp.pickerItemText, y === year && dp.pickerItemTextSelected]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: 88 }} />
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={dp.actions}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={dp.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dp.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Icon
                name="check"
                type="MaterialIcons"
                size={18}
                color={WHITE}
              />
              <Text style={dp.confirmTxt}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const dp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 40, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: WHITE,
    borderRadius: 24,
    width: '90%',
    maxWidth: 380,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: PRIMARY_LIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedDate: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY_DARK,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pickersRow: {
    flexDirection: 'row',
    height: 240,
    paddingHorizontal: 12,
    marginVertical: 20,
    gap: 8,
  },
  pickerSection: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: PRIMARY_DARK,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  pickerWrapper: {
    flex: 1,
    position: 'relative',
  },

  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_MID,
  },
  pickerItemTextSelected: {
    fontSize: 18,
    fontWeight: '900',
    color: PRIMARY_DARK,
  },
  pickerItemTextDisabled: {
    color: DISABLED_COLOR,
    textDecorationLine: 'line-through',
    opacity: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BORDER,
  },
  cancelTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_MID,
  },
  confirmBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmTxt: {
    fontSize: 15,
    fontWeight: '800',
    color: WHITE,
  },
});

// ─── DateRangeBar ─────────────────────────────────────────────────────────────
const DateRangeBar = ({ startDate, endDate, onPressStart, onPressEnd }) => (
  <View style={drb.row}>
    <TouchableOpacity
      style={[drb.box, startDate && drb.boxActive]}
      onPress={onPressStart}
      activeOpacity={0.8}
    >
      <Text style={drb.label}>FROM</Text>
      <Text style={[drb.date, !startDate && drb.placeholder]}>{formatShort(startDate)}</Text>
    </TouchableOpacity>

    <View style={drb.mid}>
      <Text style={drb.arrow}>→</Text>
      {startDate && endDate
        ? <Text style={drb.days}>{diffDays(startDate, endDate)} day{diffDays(startDate, endDate) !== 1 ? 's' : ''}</Text>
        : null
      }
    </View>

    <TouchableOpacity
      style={[drb.box, endDate && drb.boxActive]}
      onPress={onPressEnd}
      activeOpacity={0.8}
    >
      <Text style={drb.label}>TO</Text>
      <Text style={[drb.date, !endDate && drb.placeholder]}>{formatShort(endDate)}</Text>
    </TouchableOpacity>
  </View>
);

const drb = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  box: {
    flex: 1, backgroundColor: WHITE, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  boxActive: {
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  label: {
    fontSize: 9, fontWeight: '800', color: PRIMARY_MID,
    letterSpacing: 1.3, marginBottom: 3,
  },
  date: { fontSize: 12, fontWeight: '700', color: TEXT_DARK },
  placeholder: { color: TEXT_LIGHT, fontWeight: '500' },
  mid: { alignItems: 'center', gap: 2 },
  arrow: { fontSize: 16, color: PRIMARY, fontWeight: '700' },
  days: { fontSize: 9, fontWeight: '700', color: PRIMARY_MID, letterSpacing: 0.4 },
});

// ─── SectionCard & SectionLabel ───────────────────────────────────────────────
const SectionCard = ({ children }) => <View style={sh.card}>{children}</View>;
const SectionLabel = ({ icon, text, required }) => (
  <View style={sh.labelRow}>
    <Text style={sh.labelIcon}>{icon}</Text>
    <Text style={sh.labelText}>{text}</Text>
    {required && <Text style={sh.req}> *</Text>}
  </View>
);

// ─── ApplyLeaveSheet ──────────────────────────────────────────────────────────
// const ApplyLeaveSheet = ({ onClose }) => {
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [leaveType, setLeaveType] = useState(null);
//   const [duration, setDuration] = useState(null);
//   const [reason, setReason] = useState('');
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
//   const { userInfo } = useAuth();
//   const parseData = JSON.parse(userInfo || "{}");

//   const userid = parseData?.data?.data?.user_id
//   const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
//   const data = JSON.parse(userInfo ? userInfo : {});
//   const uname = data?.data?.data?.name;
//   const imagese = data.data?.data?.image;
//   // Calculate total days
//   const calculateTotalDays = () => {
//     if (startDate && endDate) {
//       return diffDays(startDate, endDate);
//     }
//     return 0;
//   };

// const handleapplyrequest = async () => {
//   try {
//     // USER DATA
//     const userData =
//       await AsyncStorage.getItem(
//         'userData'
//       );

//     const parsedUserData =
//       JSON.parse(userData);

//     console.log(
//       'USER DATA =>',
//       parsedUserData
//     );

//     const candidateName =
//       parsedUserData?.data?.data
//         ?.name || 'Employee';

//     // USER ID
//     const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
//     // CLIENT ID
//     const client_id = parseData["data"]?.data?.client_id || 0;

//     // DATE FORMAT
//     const formatDate = date => {
//       if (!date) return '';

//       const year =
//         date.getFullYear();

//       const month = String(
//         date.getMonth() + 1
//       ).padStart(2, '0');

//       const day = String(
//         date.getDate()
//       ).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     };

//     // TOTAL DAYS
//     const totalDays =
//       calculateTotalDays?.() || 1;

//     // FORM DATA
//     const formData =
//       new FormData();

//     formData.append(
//       'user_id',
//       String(user_id)
//     );

//     formData.append(
//       'candidate_name',
//       candidateName
//     );

//     formData.append(
//       'leave_type_id',
//       String(leaveType || '')
//     );

//     formData.append(
//       'from_date',
//       formatDate(startDate)
//     );

//     formData.append(
//       'to_date',
//       formatDate(endDate)
//     );

//     formData.append(
//       'total_days',
//       String(totalDays)
//     );

//     formData.append(
//       'reason',
//       reason || ''
//     );

//     formData.append(
//       'half_full_day',
//       duration === 'Full Day'
//         ? 'full day'
//         : 'half day'
//     );

//     formData.append(
//       'status',
//       'pending'
//     );

//     formData.append(
//       'client_id',
//       String(client_id)
//     );

//     console.log(
//       'FORM DATA =>',
//       formData
//     );

//     // API CALL
//     const response = await fetch(
//       'https://whiteforcepayroll.com/admin/api/leave-request',
//       {
//         method: 'POST',
//         headers: {
//           Accept:
//             'application/json',
//         },
//         body: formData,
//       }
//     );

//     // RAW RESPONSE
//     const responseText =
//       await response.text();

//     console.log(
//       'STATUS =>',
//       response.status
//     );

//     console.log(
//       'RAW RESPONSE =>',
//       responseText
//     );

//     // JSON PARSE
//     let data = {};

//     try {
//       data = JSON.parse(
//         responseText
//       );
//     } catch (e) {
//       console.log(
//         'JSON PARSE ERROR =>',
//         e
//       );
//     }

//     console.log(
//       'PARSED DATA =>',
//       data
//     );

//     // SUCCESS
//     if (response.ok) {
//       Alert.alert(
//         'Success',
//         data?.message ||
//           'Leave request submitted successfully'
//       );

//       // RESET FORM
//       setStartDate(null);
//       setEndDate(null);
//       setLeaveType(null);
//       setDuration(null);
//       setReason('');

//       onClose();
//     } else {
//       // VALIDATION ERROR
//       if (data?.errors) {
//         const firstErrorKey =
//           Object.keys(
//             data.errors
//           )[0];

//         const firstErrorMessage =
//           data.errors[
//             firstErrorKey
//           ]?.[0];

//         Alert.alert(
//           'Validation Error',
//           firstErrorMessage ||
//             'Please check your inputs'
//         );
//       } else {
//         Alert.alert(
//           'Error',
//           data?.message ||
//             `Server Error (${response.status})`
//         );
//       }
//     }
//   } catch (error) {
//     console.log(
//       'REQUEST ERROR =>',
//       error
//     );

//     Alert.alert(
//       'Error',
//       'Something went wrong'
//     );
//   }
// };
//   return (
//     <View style={sh.sheet}>
//       <View style={sh.handle} />

//       {/* Header */}
//       <View style={sh.header}>
//         <View style={sh.headerContent}>
//           <Text style={sh.title}>Apply Leave</Text>
//           <Text style={sh.subtitle}>Fill in the details below</Text>
//         </View>
//         <TouchableOpacity style={sh.closeBtn} onPress={onClose} activeOpacity={0.7}>
//           <Text style={sh.closeText}>✕</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={sh.scroll}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* Dates */}
//         <SectionCard>
//           <SectionLabel
//             icon={
//               <Icon
//                 name="calendar-month"
//                 type="MaterialIcons"
//                 size={18}
//                 color={PRIMARY}
//               />
//             }
//             text="Select Date Range"
//             required
//           />
//           <Text style={sh.hint}>
//             Tap the date fields to select your leave period
//           </Text>
//           <DateRangeBar
//             startDate={startDate}
//             endDate={endDate}
//             onPressStart={() => setShowStartPicker(true)}
//             onPressEnd={() => setShowEndPicker(true)}
//           />
//         </SectionCard>

//         {/* Leave type */}
//         <SectionCard>
//           <SectionLabel
//             icon={
//               <Icon
//                 name="event-note"
//                 type="MaterialIcons"
//                 size={18}
//                 color={PRIMARY}
//               />
//             }
//             text="Leave Type"
//             required
//           />
//           <View style={sh.chipWrap}>
//             {LEAVE_TYPES.map(type => (
//               <TouchableOpacity
//                 key={type.id}
//                 style={[sh.chip, leaveType === type.id && sh.chipOn]}
//                 onPress={() => setLeaveType(type.id)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[sh.chipTxt, leaveType === type.id && sh.chipTxtOn]}>
//                   {type.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </SectionCard>

//         {/* Duration */}
//         <SectionCard>
//           <SectionLabel
//             icon={
//               <Icon
//                 name="schedule"
//                 type="MaterialIcons"
//                 size={18}
//                 color={PRIMARY}
//               />
//             }
//             text="Duration"
//             required
//           />
//           <View style={sh.durRow}>
//             {DURATIONS.map(d => (
//               <TouchableOpacity
//                 key={d}
//                 style={[sh.durBtn, duration === d && sh.durBtnOn]}
//                 onPress={() => setDuration(d)}
//                 activeOpacity={0.8}
//               >
//                 <Icon
//                   name={d === "Full Day" ? "wb-sunny" : "brightness-3"}
//                   type="MaterialIcons"
//                   size={18}
//                   color={duration === d ? PRIMARY : TEXT_MID}
//                 />
//                 <Text style={[sh.durTxt, duration === d && sh.durTxtOn]}>{d}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </SectionCard>

//         {/* Reason */}
//         <SectionCard>
//           <SectionLabel
//             icon={
//               <Icon
//                 name="feedback"
//                 type="MaterialIcons"
//                 size={18}
//                 color={PRIMARY}
//               />
//             }
//             text="Reason"
//             required
//           />
//           <TextInput
//             style={sh.input}
//             placeholder="Briefly describe the reason for your leave..."
//             placeholderTextColor={TEXT_LIGHT}
//             multiline
//             numberOfLines={4}
//             value={reason}
//             onChangeText={setReason}
//             textAlignVertical="top"
//           />
//         </SectionCard>

//         {/* Actions */}
//         <View style={sh.actions}>
//           <TouchableOpacity style={sh.cancelBtn} onPress={onClose} activeOpacity={0.7}>
//             <Text style={sh.cancelTxt}>Cancel</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             onPress={handleapplyrequest} 
//             style={sh.submitBtn} 
//             activeOpacity={0.85}
//           >
//             <Text style={sh.submitTxt}>Submit Request →</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Custom Date Pickers */}
//       <CustomDatePicker
//         visible={showStartPicker}
//         selectedDate={startDate}
//         onDateSelect={setStartDate}
//         onClose={() => setShowStartPicker(false)}
//       />
//       <CustomDatePicker
//         visible={showEndPicker}
//         selectedDate={endDate}
//         onDateSelect={setEndDate}
//         onClose={() => setShowEndPicker(false)}
//       />
//     </View>
//   );
// };
// ─── ApplyLeaveSheet ──────────────────────────────────────────────────────────
const ApplyLeaveSheet = ({ onClose }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveType, setLeaveType] = useState(null);
  const [duration, setDuration] = useState(null);
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  // ── NEW: dynamic leave types & allocated days ──
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(true);
  const [maxAllocatedDays, setMaxAllocatedDays] = useState(null);
  const [allocatedLoading, setAllocatedLoading] = useState(false);

  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || "{}");
  const userid = parseData?.data?.data?.user_id;
  const user_id = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
  const [popup, setPopup] = useState({ visible: false, type: '', title: '', message: '' });
  const is_acknowledged = parseData?.data?.data?.is_acknowledged;

  const showPopup = (type, title, message) => {
    setPopup({ visible: true, type, title, message });
  };

  const hidePopup = () => {
    setPopup({ visible: false, type: '', title: '', message: '' });
  };
  const client_id =
    parseData?.data?.data?.client_id ??
    parseData?.data?.client_id;  // const client_id =  79;
  // 
  // ── Fetch leave types on mount ──
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        setLeaveTypesLoading(true);
        const response = await fetch(
          `https://whiteforcepayroll.com/admin/api/leave-list-client-wise?client_id=${client_id}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
        const data = await response.json();
        if (data?.success && Array.isArray(data?.data)) {
          setLeaveTypes(data.data); // [{ id, name }, ...]
        }
      } catch (error) {
        console.log('LEAVE TYPES FETCH ERROR =>', error);
        showPopup('error', 'Error', 'Failed to load leave types');
      } finally {
        setLeaveTypesLoading(false);
      }
    };
    fetchLeaveTypes();
  }, []);
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      maxAllocatedDays !== null
    ) {
      const days = calculateTotalDays();

      if (days > maxAllocatedDays) {
        showPopup(
          'error',
          'Maximum Leave Exceeded',
          `Maximum allowed is ${maxAllocatedDays} day(s)`
        );

        setEndDate(null);
      }
    }
  }, [startDate, endDate, maxAllocatedDays]);

  // ── Fetch allocated days when leave type changes ──
  const handleLeaveTypeSelect = async (typeId) => {
    setLeaveType(typeId);
    setMaxAllocatedDays(null);
    setAllocatedLoading(true);
    try {
      const response = await fetch(
        `https://whiteforcepayroll.com/admin/api/leave-allocated-by-client?client_id=${client_id}&leave_id=${typeId}`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );
      const data = await response.json();
      console.log('ALLOCATED DAYS DATA =>', data);
      if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
        setMaxAllocatedDays(parseInt(data.data[0].days, 10));
      } else {
        setMaxAllocatedDays(null);
      }
    } catch (error) {
      console.log('ALLOCATED DAYS FETCH ERROR =>', error);
      setMaxAllocatedDays(null);
    } finally {
      setAllocatedLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (startDate && endDate) return diffDays(startDate, endDate);
    return 0;
  };

  const handleapplyrequest = async () => {
    const totalDays = calculateTotalDays();

    if (!startDate || !endDate) {
      showPopup('error', 'Validation', 'Please select leave dates');
      return;
    }

    if (!leaveType) {
      showPopup('error', 'Validation', 'Please select leave type');
      return;
    }

    if (!duration) {
      showPopup('error', 'Validation', 'Please select duration');
      return;
    }

    if (!reason.trim()) {
      showPopup('error', 'Validation', 'Please enter reason');
      return;
    }

    // Check against allocated days
    if (
      maxAllocatedDays !== null &&
      totalDays > maxAllocatedDays
    ) {
      showPopup(
        'error',
        'Leave Limit Exceeded',
        `You selected ${totalDays} day(s), but maximum approved leave for this type is ${maxAllocatedDays} day(s).`
      );
      return;
    }

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = JSON.parse(userData);
      const candidateName = parsedUserData?.data?.data?.name || 'Employee';
      const uid = parseData["data"]?.user_id ? parseData["data"]?.user_id : userid;
      const cid = parseData["data"]?.data?.client_id || 0;

      const formatDate = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const totalDays = calculateTotalDays?.() || 1;
      const formData = new FormData();
      formData.append('user_id', String(uid));
      formData.append('candidate_name', candidateName);
      formData.append('leave_type_id', String(leaveType || ''));
      formData.append('from_date', formatDate(startDate));
      formData.append('to_date', formatDate(endDate));
      formData.append('total_days', String(totalDays));
      formData.append('reason', reason || '');
      formData.append('half_full_day', duration === 'Full Day' ? 'full day' : 'half day');
      formData.append('status', 'pending');
      formData.append('client_id', String(cid));

      const response = await fetch(
        'https://whiteforcepayroll.com/admin/api/leave-request',
        { method: 'POST', headers: { Accept: 'application/json' }, body: formData }
      );
      const responseText = await response.text();
      let resData = {};
      try { resData = JSON.parse(responseText); } catch (e) { }
      console.log('RESPONSE =>', response);
      console.log('RESPONSE TEXT =>', responseText);

      if (response.ok) {
        showPopup('success', 'Leave Requested', resData?.message || 'Leave request submitted successfully');
        setStartDate(null); setEndDate(null);
        setLeaveType(null); setDuration(null);
        setReason(''); setMaxAllocatedDays(null);
        onClose();
      } else {
        if (resData?.errors) {
          const key = Object.keys(resData.errors)[0];
          showPopup('error', 'Validation Error', resData.errors[key]?.[0] || 'Please check your inputs');
        } else {
          showPopup('error', 'Server Error', resData?.message || `Server Error (${response.status})`);
        }
      }
    } catch (error) {
      console.log('REQUEST ERROR =>', error);
      showPopup('error', 'Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={sh.sheet}>
      <View style={sh.handle} />

      {/* Header */}
      <View style={sh.header}>
        <View style={sh.headerContent}>
          <Text style={sh.title}>Apply Leave</Text>
          <Text style={sh.subtitle}>Fill in the details below</Text>
        </View>
        <TouchableOpacity style={sh.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={sh.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sh.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dates */}
        <SectionCard>
          <SectionLabel
            icon={<Icon name="calendar-month" type="MaterialIcons" size={18} color={PRIMARY} />}
            text="Select Date Range"
            required
          />
          <Text style={sh.hint}>Tap the date fields to select your leave period</Text>
          <DateRangeBar
            startDate={startDate}
            endDate={endDate}
            onPressStart={() => setShowStartPicker(true)}
            onPressEnd={() => setShowEndPicker(true)}
          />
        </SectionCard>

        {/* Leave type — dynamic */}
        <SectionCard>
          <SectionLabel
            icon={<Icon name="event-note" type="MaterialIcons" size={18} color={PRIMARY} />}
            text="Leave Type"
            required
          />

          {leaveTypesLoading ? (
            <View style={sh.loadingRow}>
              <Icon name="hourglass-empty" type="MaterialIcons" size={16} color={PRIMARY_MID} />
              <Text style={sh.loadingText}>Loading leave types…</Text>
            </View>
          ) : (
            <View style={sh.chipWrap}>
              {leaveTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[sh.chip, leaveType === type.id && sh.chipOn]}
                  onPress={() => handleLeaveTypeSelect(type.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[sh.chipTxt, leaveType === type.id && sh.chipTxtOn]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Max allocated days banner */}
          {leaveType !== null && (
            <View style={sh.allocatedBanner}>
              {allocatedLoading ? (
                <>
                  <Icon name="hourglass-empty" type="MaterialIcons" size={14} color={PRIMARY_MID} />
                  <Text style={sh.allocatedText}>Checking allocation…</Text>
                </>
              ) : maxAllocatedDays !== null ? (
                <>
                  <Icon name="info-outline" type="MaterialIcons" size={15} color={PRIMARY_DARK} />
                  <Text style={sh.allocatedText}>
                    Max approval:{' '}
                    <Text style={sh.allocatedBold}>{maxAllocatedDays} {maxAllocatedDays === 1 ? 'day' : 'days'}</Text>
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="warning-amber" type="MaterialIcons" size={15} color="#D97706" />
                  <Text style={[sh.allocatedText, { color: '#D97706' }]}>
                    No allocation found for this leave type
                  </Text>
                </>
              )}
            </View>
          )}
        </SectionCard>

        {/* Duration */}
        <SectionCard>
          <SectionLabel
            icon={<Icon name="schedule" type="MaterialIcons" size={18} color={PRIMARY} />}
            text="Duration"
            required
          />
          <View style={sh.durRow}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[sh.durBtn, duration === d && sh.durBtnOn]}
                onPress={() => setDuration(d)}
                activeOpacity={0.8}
              >
                <Icon
                  name={d === 'Full Day' ? 'wb-sunny' : 'brightness-3'}
                  type="MaterialIcons"
                  size={18}
                  color={duration === d ? PRIMARY : TEXT_MID}
                />
                <Text style={[sh.durTxt, duration === d && sh.durTxtOn]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Reason */}
        <SectionCard>
          <SectionLabel
            icon={<Icon name="feedback" type="MaterialIcons" size={18} color={PRIMARY} />}
            text="Reason"
            required
          />
          <TextInput
            style={sh.input}
            placeholder="Briefly describe the reason for your leave..."
            placeholderTextColor={TEXT_LIGHT}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />
        </SectionCard>

        {/* Actions */}
        <View style={sh.actions}>
          <TouchableOpacity style={sh.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={sh.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleapplyrequest} style={sh.submitBtn} activeOpacity={0.85}>
            {
              loading ? (
                <ActivityIndicator size="small" color={WHITE} />

              ) : (
                <Text style={sh.submitTxt}>Submit Request → </Text>
              )
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal transparent animationType="fade" visible={popup.visible} onRequestClose={hidePopup}>
        <View style={sh.popupOverlay}>
          <View style={sh.popupBox}>
            <Text style={sh.popupTitle}>{popup.title}</Text>
            <Text style={sh.popupMessage}>{popup.message}</Text>
            <TouchableOpacity style={[sh.popupBtn, popup.type === 'success' ? sh.successBtn : sh.errorBtn]} onPress={hidePopup}>
              <Text style={sh.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomDatePicker
        visible={showStartPicker}
        selectedDate={startDate}
        onDateSelect={setStartDate}
        onClose={() => setShowStartPicker(false)}
      />
      <CustomDatePicker
        visible={showEndPicker}
        selectedDate={endDate}
        onDateSelect={setEndDate}
        onClose={() => setShowEndPicker(false)}
      />
    </View>
  );
};
const sh = StyleSheet.create({
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 28, borderTopRightRadius: 13,
    maxHeight: SCREEN_HEIGHT * 0.94,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#C8C0DC',
    alignSelf: 'center',
    marginTop: 10, marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: { fontSize: 20, fontWeight: '800', color: TEXT_DARK },
  subtitle: { fontSize: 12, color: TEXT_LIGHT, marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
    flexShrink: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 13,
    color: PRIMARY_MID,
    fontWeight: '600',
  },
  allocatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    // backgroundColor: PRIMARY_LIGHT,
    // borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    // borderWidth: 1,
    // borderColor: BORDER,
  },
  allocatedText: {
    fontSize: 12,
    color: PRIMARY_DARK,
    fontWeight: '600',
  },
  allocatedBold: {
    fontWeight: '900',
    color: PRIMARY,
  },
  closeText: { fontSize: 13, color: TEXT_MID, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32 },

  // section card
  card: {
    backgroundColor: WHITE, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: BORDER,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 12,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  labelIcon: { fontSize: 16, marginRight: 6 },
  labelText: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  req: { fontSize: 14, color: PRIMARY, fontWeight: '800' },
  hint: {
    fontSize: 11, color: PRIMARY_MID, fontWeight: '600',
    letterSpacing: 0.3, marginBottom: 10, textAlign: 'center',
  },

  // chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 50, backgroundColor: BG,
    borderWidth: 1.5, borderColor: BORDER,
  },
  chipOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipTxt: { fontSize: 13, fontWeight: '600', color: TEXT_MID },
  chipTxtOn: { color: WHITE },

  // duration
  durRow: { flexDirection: 'row', gap: 10 },
  durBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 14,
    backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER,
  },
  durBtnOn: { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY },
  durEmoji: { fontSize: 16 },
  durTxt: { fontSize: 13, fontWeight: '600', color: TEXT_MID },
  durTxtOn: { color: PRIMARY, fontWeight: '700' },

  // reason
  input: {
    backgroundColor: BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: TEXT_DARK,
    minHeight: 96, lineHeight: 22,
  },

  // action buttons
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 16,
    backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: BORDER,
  },
  cancelTxt: { fontSize: 14, fontWeight: '700', color: TEXT_MID },
  submitBtn: {
    flex: 2.2, paddingVertical: 15, borderRadius: 16,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 7,
  },
  submitTxt: { fontSize: 14, fontWeight: '800', color: WHITE, letterSpacing: 0.3 },
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
});

// ─── Acknowledgement key (must match the one passed to TermsAndConditions) ────
const LEAVE_ACK_KEY = 'ack_leave_policy_v1';

// ─── LeaveRecordsScreen ───────────────────────────────────────────────────────
// ─── LeaveRecordsScreen ───────────────────────────────────────────────────────
const LeaveRecordsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // ── Acknowledgement gate ──
  const [ackChecked, setAckChecked] = useState(false);   // whether we've loaded the value
  const [ackModal, setAckModal] = useState(false);        // show popup?
  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || "{}");
  const is_acknowledgeds = parseData?.data?.data?.is_acknowledged;
  const is_acknowledged = parseData['data']?.is_acknowledged ? parseData['data']?.is_acknowledged : is_acknowledgeds;  // ── Map leave_type_id → label + color + icon ──
  const getLeaveTypeMeta = (leaveTypeId) => {
    switch (leaveTypeId) {
      case 1:
        return {
          label: 'Sick Leave',
          color: '#E07B54',
          icon: { name: 'medical-services', type: 'MaterialIcons' },
        };
      case 2:
        return {
          label: 'Casual Leave',
          color: '#48B896',
          icon: { name: 'account-clock', type: 'MaterialCommunityIcons' },
        };
      case 3:
        return {
          label: 'Paid Leave',
          color: '#2D5B41',
          icon: { name: 'event-available', type: 'MaterialIcons' },
        };
      case 4:
      default:
        return {
          label: 'Other',
          color: '#6B6585',
          icon: { name: 'event-note', type: 'MaterialIcons' },
        };
    }
  };

  // ── Fetch leave records from API ──
  const fetchLeaveRecords = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = JSON.parse(userData);
      const user_id = parsedUserData?.data?.data?.user_id || 2;
      const response = await fetch(
        `https://whiteforcepayroll.com/admin/api/leave-request-report?user_id=${user_id}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('JSON PARSE ERROR =>', e);
      }

      if (data?.status && Array.isArray(data?.data?.data)) {
        // Transform API records into the shape our UI expects
        const mapped = data.data.data.map((item) => {
          const meta = getLeaveTypeMeta(item.leave_type_id);
          return {
            id: item.id,
            label: meta.label,
            fromDate: new Date(item.from_date),
            toDate: new Date(item.to_date),
            totalDays: parseInt(item.total_days, 10),
            status: item.status,          // 'pending' | 'approved' | 'rejected'
            color: meta.color,
            icon: meta.icon,
            description: item.reason || '',
          };
        });
        setLeaveRecords(mapped);
      } else {
        setLeaveRecords([]);
      }
    } catch (error) {
      console.log('FETCH ERROR =>', error);
      Alert.alert('Error', 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  // ── Re-check acknowledgement every time the screen gains focus ──
  // (so returning from the Terms screen clears the gate automatically)

  useFocusEffect(
    useCallback(() => {
      if (!userInfo) return; // wait until userInfo is loaded
      const checkAcknowledgement = async () => {
        const localAck = await AsyncStorage.getItem(LEAVE_ACK_KEY);
        const shouldShowModal =
          localAck !== 'true' && is_acknowledged === true;

        console.log('[LeaveScreen] ── Acknowledgement Check ──');
        console.log('[LeaveScreen] userInfo          :', userInfo ? 'loaded' : 'NOT loaded (empty)');
        console.log('[LeaveScreen] is_acknowledged   :', is_acknowledged);
        console.log('[LeaveScreen] localAck (storage):', localAck);
        console.log('[LeaveScreen] shouldShowModal   :', shouldShowModal);

        setAckModal(shouldShowModal);
      };
      checkAcknowledgement();
    }, [is_acknowledged, userInfo])
  );

  // Fetch on mount; re-fetch after a new leave is submitted
  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  // Filter records based on selected tab
  const filteredRecords = selectedTab === 'all'
    ? leaveRecords
    : leaveRecords.filter((record) => record.status === selectedTab);

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#D1FAE5', text: '#059669', label: 'Approved' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const tabs = [
    { key: 'all', label: 'All', count: leaveRecords.length },
    { key: 'approved', label: 'Approved', count: leaveRecords.filter((r) => r.status === 'approved').length },
    { key: 'pending', label: 'Pending', count: leaveRecords.filter((r) => r.status === 'pending').length },
    { key: 'rejected', label: 'Rejected', count: leaveRecords.filter((r) => r.status === 'rejected').length },
  ];

  return (
    <SafeAreaView style={bg.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── Acknowledgement popup ── */}
      <Modal
        visible={ackModal}
        transparent
        animationType="fade"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={bg.ackOverlay}>
          <View style={bg.ackCard}>
            {/* Icon */}
            <View style={bg.ackIconRing}>
              <View style={bg.ackIconInner}>
                <Icon
                  name="document-text-outline"
                  type={IconType.Ionicons}
                  size={28}
                  color="#fff"
                />
              </View>
            </View>

            <Text style={bg.ackTitle}>Policy Acknowledgement</Text>
            <Text style={bg.ackBody}>
              Before applying for leave, please read and acknowledge our Leave &amp; Privacy Policy.
              {'\n\n'}Scroll to the end of the policy and tick the checkbox to proceed.
            </Text>

            <TouchableOpacity
              style={bg.ackReadBtn}
              activeOpacity={0.85}
              onPress={() => {
                setAckModal(false); // close popup before navigating
                navigation.navigate('terms', {
                  ackKey: LEAVE_ACK_KEY,
                  title: 'Leave & Privacy Policy',
                });
              }}
            >
              <Icon
                name="book-outline"
                type={IconType.Ionicons}
                size={17}
                color="#fff"
              />
              <Text style={bg.ackReadBtnText}>Read Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={bg.ackCancelBtn}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={bg.ackCancelText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Top bar */}
      <View style={bg.topBar}>
        <View>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Icon name="arrow-back" size={22} color={'black'} />
          </TouchableOpacity>
          <Text style={bg.pageTitle}>Leave Records</Text>
        </View>
        <TouchableOpacity
          style={bg.applyBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Icon name="calendar-check" type="FontAwesome5" size={16} color="#fff" />
          <Text style={bg.applyTxt}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={bg.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={bg.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[bg.tab, selectedTab === tab.key && bg.tabActive]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[bg.tabText, selectedTab === tab.key && bg.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[bg.tabBadge, selectedTab === tab.key && bg.tabBadgeActive]}>
                <Text style={[bg.tabBadgeText, selectedTab === tab.key && bg.tabBadgeTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leave Records */}
      <ScrollView
        style={bg.cardsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={bg.cardsContent}
      >
        {loading ? (
          <View style={bg.emptyState}>
            <Text style={bg.emptyText}>Loading leave records…</Text>
          </View>
        ) : filteredRecords.length === 0 ? (
          <View style={bg.emptyState}>
            <Icon name="event-busy" type="MaterialIcons" size={64} color={TEXT_LIGHT} />
            <Text style={bg.emptyText}>No {selectedTab} leaves found</Text>
          </View>
        ) : (
          filteredRecords.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View
                key={item.id}
                style={[bg.card, { borderLeftColor: item.color, borderLeftWidth: 5 }]}
              >
                <View style={bg.cardHeader}>
                  <View style={bg.cardIconSection}>
                    <View style={[bg.cardIconBg, { backgroundColor: item.color + '20' }]}>
                      <Icon
                        name={item.icon.name}
                        type={item.icon.type}
                        size={28}
                        color={item.color}
                      />
                    </View>
                    <View style={bg.cardTitleSection}>
                      <Text style={bg.cardTitle}>{item.label}</Text>
                      <Text style={bg.cardSubtitle}>{item.description}</Text>
                    </View>
                  </View>
                  <View style={[bg.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[bg.statusText, { color: statusStyle.text }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>

                {/* Date Information */}
                <View style={bg.cardBody}>
                  <View style={bg.dateRow}>
                    <View style={bg.dateItem}>
                      <Icon name="calendar-today" type="MaterialIcons" size={14} color={TEXT_MID} />
                      <Text style={bg.dateLabel}>From</Text>
                      <Text style={bg.dateValue}>{formatShort(item.fromDate)}</Text>
                    </View>
                    <Icon name="arrow-forward" type="MaterialIcons" size={16} color={item.color} />
                    <View style={bg.dateItem}>
                      <Icon name="event" type="MaterialIcons" size={14} color={TEXT_MID} />
                      <Text style={bg.dateLabel}>To</Text>
                      <Text style={bg.dateValue}>{formatShort(item.toDate)}</Text>
                    </View>
                  </View>

                  <View style={bg.daysBox}>
                    <Icon name="today" type="MaterialIcons" size={16} color={item.color} />
                    <Text style={[bg.daysText, { color: item.color }]}>
                      {item.totalDays} {item.totalDays === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={bg.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <ApplyLeaveSheet
            onClose={() => {
              setModalVisible(false);
              fetchLeaveRecords(); // refresh list after submission
            }}
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const bg = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 16,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: TEXT_LIGHT,
    letterSpacing: 1.2
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: TEXT_DARK,
    marginTop: 4,
  },
  applyBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  applyTxt: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '800'
  },

  // Tab Bar
  tabBar: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
    gap: 8,
  },
  tabActive: {
    borderBottomColor: PRIMARY,
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MID,
  },
  tabTextActive: {
    color: PRIMARY,
  },
  tabBadge: {
    backgroundColor: BG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: PRIMARY_DARK,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEXT_MID,
  },
  tabBadgeTextActive: {
    color: WHITE,
  },

  // Cards container
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  cardIconSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  cardIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitleSection: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: 11,
    color: TEXT_LIGHT,
    fontWeight: '500',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  cardBody: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    marginBottom: 22,
  },

  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  dateLabel: {
    fontSize: 9,
    color: TEXT_LIGHT,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_DARK,
  },

  daysBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 12,
  },

  daysText: {
    fontSize: 14,
    fontWeight: '900',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 14,
    color: TEXT_LIGHT,
    fontWeight: '600',
    marginTop: 16,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20,10,40,0.45)',
  },

  // ── Acknowledgement modal styles ──
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
    backgroundColor: 'rgba(29,91,65,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ackIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2E26',
    marginBottom: 10,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  ackBody: {
    fontSize: 13,
    color: '#6B8C7E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ackReadBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: 'rgba(29,91,65,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
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
});

export default LeaveRecordsScreen;