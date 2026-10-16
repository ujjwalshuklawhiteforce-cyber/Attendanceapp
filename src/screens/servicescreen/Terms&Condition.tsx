// import { ScreenHeight } from '@freakycoder/react-native-helpers';
// import React from 'react';
// import { ScrollView, Text, View, StyleSheet, Button } from 'react-native';
// import Icon, { IconType } from "react-native-dynamic-vector-icons";
// import { useNavigation } from '@react-navigation/native';
// import { TouchableOpacity } from 'react-native';

// const TermsAndConditions = () => {
//   const navigation=useNavigation();
//   return (
//     <View style={styles.container}>
//       <View style={{flexDirection:"row", alignItems:"center",gap:75, padding:5 ,marginTop:10}}>
//         <TouchableOpacity  onPress={() => navigation.goBack()}  style={{}}>
//      <Icon 
//           name="chevron-back-outline"
//           type={IconType.Ionicons}
//           color="black"
//         //   color={colors.iconBlack}
//           style={styles.addIcon}
//         />
//      </TouchableOpacity>
//         <Text style={styles.title}><Text style={{color:"green"}}>Privacy</Text> Policy</Text>
//       </View>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.paragraph}>
//           This Privacy Policy explains how we collect, use, and protect your personal information when you use our HR Attendance App. By using the app, you agree to the collection and use of information in accordance with this policy.
//         </Text>
//         <Text style={styles.sectionTitle}>1. Information We Collect</Text>
//         <Text style={styles.paragraph}>
//           We collect personal information such as your name, employee ID, attendance records, and other relevant data required for attendance management.
//         </Text>

//         <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
//         <Text style={styles.paragraph}>
//           Your personal information is used to track attendance, generate reports, and improve the efficiency of the app. We do not share your personal data with third parties unless required by law.
//         </Text>

//         <Text style={styles.sectionTitle}>3. Data Security</Text>
//         <Text style={styles.paragraph}>
//           We use industry-standard encryption to protect your data. All personal information is stored securely and access is restricted to authorized personnel only.
//         </Text>

//         <Text style={styles.sectionTitle}>4. Your Rights</Text>
//         <Text style={styles.paragraph}>
//           You have the right to request access to your personal information, request corrections, or delete your data by contacting us at any time.
//         </Text>

//         <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
//         <Text style={styles.paragraph}>
//           We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify you of significant changes.
//         </Text>

//         <Text style={styles.paragraph}>
//           By continuing to use the app, you agree to the terms of this Privacy Policy.
//         </Text>

//         <View style={styles.buttonContainer}>
//           {/* <Button
//             title="I Agree"
//             onPress={() => navigation.goBack()}
//             color="#4CAF50"
//           /> */}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 23,
//     overflow:"scroll",
//     backgroundColor: '#FAFAFA',
//     // position:"relative",
//     // height:ScreenHeight*1,
//   },
//   scrollContainer: {
//     paddingBottom: 80,
//     // marginTop:50,
//     marginBottom:90,

//     marginTop:10,
//   },
//   title: {
//     fontSize: 23,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: '600',
//     color: '#2C3E50',
//     marginTop: 20,
//     marginBottom: 5,
//   },
//   paragraph: {
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 20,
//     textAlign: 'justify',
//     marginBottom: 15,
//   },
//   buttonContainer: {
//     marginTop: 30,
//     borderRadius: 5,
//     overflow: 'hidden',
//   },
// });

// export default TermsAndConditions;
import { ScreenHeight } from '@freakycoder/react-native-helpers';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from 'context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── AsyncStorage key for per-screen acknowledgements ─────────────────────────
export const ACK_KEYS = {
  LEAVE: 'ack_leave_policy_v1',
  ALLOWANCE: 'aack_leave_policy_v1',
};

const ALLOWANCE_ACK_KEY = 'ack_leave_policy_v1';

// API endpoint jo backend me employee ka acknowledged status update karta hai
const ACK_API_URL = 'https://whiteforcepayroll.com/admin/api/acknowledge-privacy-policy';

const HOLIDAY_LIST = [
  { name: 'New Year', date: '01 Jan 2026' },
  { name: 'Makar Sankranti', date: '14 Jan 2026' },
  { name: 'Republic Day', date: '26 Jan 2026' },
  { name: 'Holi', date: '04 Mar 2026' },
  { name: 'Eid ul-Fitr', date: '20 Mar 2026' },
  { name: 'Independence Day', date: '15 Aug 2026' },
  { name: 'Rakshabandhan', date: '28 Aug 2026' },
  { name: 'Janmashtami', date: '04 Sept 2026' },
  { name: 'Gandhi Jayanti', date: '02 Oct 2026' },
  { name: 'Dussehra / Vijaya Dashami', date: '20 Oct 2026' },
  { name: 'Diwali', date: '09 Nov 2026' },
  { name: 'Guru Nanak Jayanti', date: '24 Nov 2026' },
  { name: 'Christmas Day', date: '25 Dec 2026' },
];

// ─── TermsAndConditions ────────────────────────────────────────────────────────
// Props from route.params (when navigated with acknowledge mode):
//   ackKey  – the AsyncStorage key to write when user confirms
//   title   – optional header title override
const TermsAndConditions = ({ clientname }) => {
  const navigation = useNavigation();
  const route = useRoute();

  // route params — safe defaults so the screen also works as plain read-only
  const ackKey = route.params?.ackKey ?? ALLOWANCE_ACK_KEY;
  const headerTitle = route.params?.title ?? null;
  const isAcknowledgeMode = !!ackKey;

  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo || '{}');
  const clientName = parseData['data']?.client_name ? parseData['data']?.client_name : parseData?.data?.data?.client_name || 'Company';
  const isVahara = clientName == 'Varaha ClimateAg Private Limited';
  console.log('[Terms&Condition] clientName :', clientName);
  console.log('[Terms&Condition] isVahara   :', isVahara);
  const is_acknowledgeds = parseData?.data?.data?.is_acknowledged;
  const is_acknowledged = parseData['data']?.is_acknowledged ? parseData['data']?.is_acknowledged : is_acknowledgeds;

  // ── Scroll-to-end detection ──
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAck, setShowAck] = useState(false);

  // Checkbox pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  // Reveal the checkbox when acknowledgement not yet stored

  useEffect(() => {
    if (!userInfo) return; // wait until userInfo is loaded
    const checkAcknowledgement = async () => {
      const localAck = await AsyncStorage.getItem(ALLOWANCE_ACK_KEY);
      const shouldShowAck =
        localAck !== 'true' && is_acknowledged === true;

      console.log('[Terms&Condition] ── Acknowledgement Check ──');
      console.log('[Terms&Condition] userInfo          :', userInfo ? 'loaded' : 'NOT loaded (empty)');
      console.log('[Terms&Condition] is_acknowledged   :', is_acknowledged);
      console.log('[Terms&Condition] localAck (storage):', localAck);
      console.log('[Terms&Condition] shouldShowAck     :', shouldShowAck);

      setShowAck(shouldShowAck);

      if (shouldShowAck) {
        Animated.spring(checkOpacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }).start();
      }
    };

    checkAcknowledgement();
  }, [is_acknowledged, userInfo]);


  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 30; // trigger 30 px before the very end
    const reachedEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (reachedEnd && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleCheckToggle = () => {
    setChecked((prev) => !prev);
    // Tiny bounce when tapped
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirm = async () => {
    if (!checked) {
      Alert.alert('Please agree', 'Tick the checkbox to acknowledge the policy before continuing.');
      return;
    }

    // user_id logged-in user ke response se nikal rahe hain
    // (agar backend me field ka naam alag hai to yahi line adjust kar lena)
    const userId = parseData?.data?.data?.id ?? parseData?.data?.data?.user_id;

    if (!userId) {
      console.log('Ack API skipped: user_id not found in userInfo ->', parseData);
      Alert.alert('Error', 'Could not identify user. Please re-login and try again.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(ACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();

      // Success = API returned status:true (is_acknowledged flips false after acknowledge)
      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Acknowledge API failed');
      }

      // API confirm hone ke baad hi local flag save karo, taaki server aur device sync me rahein
      await AsyncStorage.setItem(ackKey, 'true');
      navigation.goBack();
    } catch (e) {
      console.log('Ack save error:', e);
      Alert.alert('Error', 'Could not save acknowledgement. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    console.log('TermsAndConditions clientName:', parseData, 'ackKey:', ackKey);
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon
            name="chevron-back-outline"
            type={IconType.Ionicons}
            color="rgb(29,91,65)"
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.title}>
          {headerTitle ?? (
            <>
              <Text style={{ color: 'rgb(29,91,65)' }}>Privacy</Text> Policy
            </>
          )}
        </Text>
      </View>

      {/* ── Acknowledge hint banner (only in ack mode) ── */}
      {isAcknowledgeMode && showAck && (
        <View style={styles.hintBanner}>
          <Icon name="arrow-down-circle-outline" type={IconType.Ionicons} size={16} color="rgb(29,91,65)" />
          <Text style={styles.hintText}>
            Please acknowledge the policy to continue
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.paragraph}>
          This Privacy Policy explains how we collect, use, and protect your personal information when you use our HR Attendance App. By using the app, you agree to the collection and use of information in accordance with this policy.
        </Text>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect personal information such as your name, employee ID, attendance records, and other relevant data required for attendance management.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your personal information is used to track attendance, generate reports, and improve the efficiency of the app. We do not share your personal data with third parties unless required by law.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We use industry-standard encryption to protect your data. All personal information is stored securely and access is restricted to authorized personnel only.
        </Text>

        <Text style={styles.sectionTitle}>4. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to request access to your personal information, request corrections, or delete your data by contacting us at any time.
        </Text>

        <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify you of significant changes.
        </Text>

        <Text style={styles.paragraph}>
          By continuing to use the app, you agree to the terms of this Privacy Policy.
        </Text>

        {isVahara && (
          <View style={styles.policySection}>
            <Text style={styles.mainSectionTitle}>Consultant Holiday and Leave Policy</Text>
            <Text style={styles.subNote}>Applicable to all engaged consultants</Text>

            <Text style={styles.sectionTitle}>Holiday Policy</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.4 }]}>Holiday Name</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
              </View>
              {HOLIDAY_LIST.map((holiday, index) => (
                <View
                  key={holiday.name}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, { flex: 1.4 }]}>{holiday.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{holiday.date}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Leave Policy</Text>

            <Text style={styles.leaveTitle}>Casual Leave</Text>
            <Text style={styles.paragraph}>
              Each consultant accrues one casual leave per month, credited on the 1st of the month (or, in the joining month, on a pro rata basis from the date of joining). Unused casual leave carries forward to subsequent months but lapses entirely at the end of the financial year. Casual leave may be availed as a full day or a half day (first half or second half); when taking a half day, the consultant must clock in for the remaining four hours of that day. All casual leave requires prior approval from the manager before it can be availed.
            </Text>

            <Text style={styles.leaveTitle}>Compensatory Off</Text>
            <Text style={styles.paragraph}>
              A consultant who works on a Sunday or a company holiday is eligible to apply for a compensatory off in lieu of that day. To be credited, the consultant must have clocked in and clocked out on the day worked, and the compensatory off must be approved by the manager.
            </Text>

            <Text style={styles.leaveTitle}>Unpaid Leave</Text>
            <Text style={styles.paragraph}>
              Unpaid leave is available to consultants, but the dates and duration must be approved by the manager in advance. For unpaid leave extending beyond two days, supporting documentation — such as a medical certificate or other substantial proof — must be submitted along with the request.
            </Text>

            <Text style={styles.leaveTitle}>Work from Home</Text>
            <Text style={styles.paragraph}>
              Consultants based at the Head Office or the Bangalore office may work from home up to once a week, capped at four days per month, subject to prior manager approval. This benefit applies only to consultants specifically designated as eligible for it.
            </Text>
          </View>
        )}

        {/* ── Last line marker ── */}
        <Text style={styles.lastLine}>
          By reading and understanding this policy, you confirm that you have reviewed all the terms and conditions stated above.
        </Text>

        {/* ── Acknowledgement Checkbox (only visible if not previously acknowledged) ── */}
        {isAcknowledgeMode && showAck && (
          <Animated.View style={[styles.ackBox, { opacity: checkOpacity }]}>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={handleCheckToggle}
              activeOpacity={0.75}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  checked && styles.checkboxChecked,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {checked && (
                  <Icon
                    name="checkmark"
                    type={IconType.Ionicons}
                    size={14}
                    color="#fff"
                  />
                )}
              </Animated.View>
              <Text style={styles.checkLabel}>
                I have read and agree to the above policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, (!checked || saving) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              activeOpacity={0.85}
              disabled={!checked || saving}
            >
              <Icon name="checkmark-circle-outline" type={IconType.Ionicons} size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>
                {saving ? 'Saving…' : 'Confirm & Continue'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.buttonContainer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: '#fff',
    position: 'relative',
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(29,91,65,0.07)',
  },
  title: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(29,91,65,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hintText: {
    fontSize: 12,
    color: 'rgb(29,91,65)',
    fontWeight: '600',
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    textAlign: 'justify',
    marginBottom: 15,
  },
  lastLine: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },

  // ── Acknowledge box ──
  ackBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(29,91,65,0.25)',
    padding: 18,
    marginTop: 6,
    marginBottom: 10,
    shadowColor: 'rgba(29,91,65,0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgb(29,91,65)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgb(29,91,65)',
    borderColor: 'rgb(29,91,65)',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmBtn: {
    backgroundColor: 'rgb(29,91,65)',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Vahara policy extras ──
  policySection: {
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  mainSectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 3,
  },
  subNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 10,
  },
  leaveTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tableRowAlt: {
    backgroundColor: '#F5F5F5',
  },
  tableHeaderRow: {
    backgroundColor: '#2C3E50',
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 12,
    color: '#555',
  },
  tableHeaderCell: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default TermsAndConditions;