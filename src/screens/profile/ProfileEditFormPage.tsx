import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View, TextInput, TouchableOpacity, Alert,
  ImageBackground, Modal, Image, Platform, StyleSheet,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import createStyles from "./ProfileEditForm.style";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "context/AuthContext";
import axios from "axios";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import RNFS from 'react-native-fs';
import { ScrollView } from "react-native-gesture-handler";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

// ─── CalendarModal ────────────────────────────────────────────────────────────
function CalendarModal({ visible, selectedDate, onSelect, onClose, title }: {
  visible: boolean;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  title: string;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState((selectedDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate || today).getMonth());

  useEffect(() => {
    if (visible) {
      setViewYear((selectedDate || today).getFullYear());
      setViewMonth((selectedDate || today).getMonth());
    }
  }, [visible]);

  const dim = daysInMonth(viewYear, viewMonth);
  const first = firstDayOfMonth(viewYear, viewMonth);
  const cells = [
    ...Array(first).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];

  const prev = () => viewMonth === 0
    ? (setViewMonth(11), setViewYear(y => y - 1))
    : setViewMonth(m => m - 1);
  const next = () => viewMonth === 11
    ? (setViewMonth(0), setViewYear(y => y + 1))
    : setViewMonth(m => m + 1);

  const isSel = (d: number | null) =>
    d != null && selectedDate != null &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isTod = (d: number | null) =>
    d != null &&
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={cal.overlay}>
        <View style={cal.card}>

          {/* Header */}
          <View style={cal.header}>
            <View style={cal.headerLeft}>
              <Icon name="calendar-outline" type={IconType.Ionicons} color="rgb(29,91,65)" size={20} />
              <Text color="black" style={cal.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={cal.closeBtn}>
              <Icon name="close-outline" type={IconType.Ionicons} color="#555" size={22} />
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={cal.monthNav}>
            <TouchableOpacity onPress={prev} style={cal.navBtn}>
              <Icon name="chevron-back-outline" type={IconType.Ionicons} color="rgb(29,91,65)" size={22} />
            </TouchableOpacity>
            <Text color="black" style={cal.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={next} style={cal.navBtn}>
              <Icon name="chevron-forward-outline" type={IconType.Ionicons} color="rgb(29,91,65)" size={22} />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={cal.weekRow}>
            {DAYS_SHORT.map(d => (
              <Text key={d} color="black" style={cal.weekDay}>{d}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={cal.grid}>
            {cells.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  cal.cell,
                  isSel(day) && cal.cellSel,
                  isTod(day) && !isSel(day) && cal.cellToday,
                ]}
                onPress={() => {
                  if (day) { onSelect(new Date(viewYear, viewMonth, day)); onClose(); }
                }}
                activeOpacity={day ? 0.7 : 1}
                disabled={!day}
              >
                <Text
                  color="black"
                  style={[
                    cal.dayText,
                    isSel(day) && cal.dayTextSel,
                    isTod(day) && !isSel(day) && cal.dayTextToday,
                    !day && { opacity: 0 },
                  ]}
                >
                  {day || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Jump to today */}
          <TouchableOpacity
            style={cal.todayBtn}
            onPress={() => { onSelect(today); onClose(); }}
          >
            <Icon name="today-outline" type={IconType.Ionicons} color="rgb(29,91,65)" size={16} />
            <Text color="black" style={cal.todayBtnText}>Jump to Today</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

// ─── Calendar Styles ──────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700' },
  closeBtn: { padding: 4 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E8F0EB',
    alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: {
    flex: 1, textAlign: 'center',
    fontSize: 12, fontWeight: '700',
    color: '#1A4731', letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  cellSel: { backgroundColor: 'rgb(29,91,65)' },
  cellToday: { backgroundColor: '#E8F0EB' },
  dayText: { fontSize: 14, color: '#0F2419' },
  dayTextSel: { color: '#fff', fontWeight: '700' },
  dayTextToday: { color: 'rgb(29,91,65)', fontWeight: '700' },
  todayBtn: {
    marginTop: 14,
    backgroundColor: '#E8F0EB',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  todayBtnText: { fontSize: 14, fontWeight: '700', color: 'rgb(29,91,65)' },
});

// ─── Main Component ───────────────────────────────────────────────────────────
interface ProfileEditFormScreen { }

const ProfileEditFormScreen: React.FC<ProfileEditFormScreen> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { logout, userInfo, login } = useAuth();

  const parseData = JSON.parse(userInfo ? userInfo : '{}');
  // parseData = axios response object → .data = API body → .data = user object
  const userData = parseData.data?.data ?? {};
  const imagesource = userData?.image;
  const profilename = userData?.name;
  const userid = userData?.user_id;
  const profileimage = parseData['data']?.image ? parseData['data'].image : imagesource;
  const profilenames = parseData['data']?.name ? parseData['data'].name : profilename;
  // ── Read from actual user object (parseData.data.data) ──────────────────────
  const rawDob = userData?.date_of_birth;
  const dob = (rawDob && rawDob !== '1970-01-01') ? rawDob : ''; // skip backend default
  const uino = userData?.uid_no || '';
  const panno = userData?.pan_no || '';
  const employeeCode = userData?.user_regcode || userData?.emp_code || ''; // read-only, not editable

  // ── State ──────────────────────────────────────────────────────────────────
  const [dateOfBirth, setDateOfBirth] = useState<string>(dob || '');
  const [selectedDobDate, setSelectedDobDate] = useState<Date | null>(
    dob ? new Date(dob) : null
  );
  const [imageURI, setImageURI] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uidNo, setUidNo] = useState<string>(uino || '');
  const [panNo, setPanNo] = useState<string>(panno || '');
  const [buttonText, setButtonText] = useState('Update');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const dateOfBirthRef = useRef<TextInput>(null);
  const uidNoRef = useRef<TextInput>(null);
  const panNoRef = useRef<TextInput>(null);

  // ── Load saved data on mount ───────────────────────────────────────────────
  useEffect(() => {
    loadDataFromAsyncStorage();

    // ── Autofill debug logs ──────────────────────────────────────────────────
    console.log('[ProfileEditForm] ── Autofill Data ──');
    console.log('[ProfileEditForm] parseData keys     :', Object.keys(parseData));
    console.log('[ProfileEditForm] userData keys      :', Object.keys(userData));
    console.log('[ProfileEditForm] profilenames       :', profilenames);
    console.log('[ProfileEditForm] employeeCode       :', employeeCode);
    console.log('[ProfileEditForm] userid             :', userid);
    console.log('[ProfileEditForm] profileimage       :', profileimage ? 'URL present' : 'no image');
    console.log('[ProfileEditForm] DOB (raw)          :', rawDob);
    console.log('[ProfileEditForm] DOB (autofill)     :', dob || '(empty — skipped 1970 default)');
    console.log('[ProfileEditForm] UID/Aadhar (raw)   :', userData?.uid_no);
    console.log('[ProfileEditForm] UID (autofill)     :', uino || '(empty)');
    console.log('[ProfileEditForm] PAN (raw)          :', userData?.pan_no);
    console.log('[ProfileEditForm] PAN (autofill)     :', panno || '(empty)');
  }, []);

  const loadDataFromAsyncStorage = async () => {
    try {
      const savedData = await AsyncStorage.getItem('teamMemberDetails');
      if (savedData) {
        const { dateOfBirth: d, uidNo: u, panNo: p } = JSON.parse(savedData);
        if (d) { setDateOfBirth(d); setSelectedDobDate(new Date(d)); }
        if (u) setUidNo(u);
        if (p) setPanNo(p);
      }
    } catch {
      Alert.alert('Error', 'There was an issue loading your data.');
    }
  };

  const saveDataToAsyncStorage = async () => {
    try {
      await AsyncStorage.setItem('teamMemberDetails', JSON.stringify({ dateOfBirth, uidNo, panNo }));
      Alert.alert('Data Saved', 'Your data has been saved successfully.');
    } catch {
      Alert.alert('Error', 'There was an issue saving your data.');
    }
  };

  // ── Image picker ───────────────────────────────────────────────────────────
  const selectAndCropImage = async () => {
    try {
      const image = await ImageCropPicker.openPicker({ mediaType: 'photo', cropping: true });
      setImageURI(image.path);
      RNFS.readFile(image.path, 'base64')
        .then(b64 => setBase64Image(b64))
        .catch(() => Alert.alert('Error', 'Failed to convert image to Base64.'));
    } catch (error: any) {
      if (!error.message?.includes('cancelled')) {
        Alert.alert('Error', 'Failed to select or crop image.');
      }
    }
  };

  // ── API ────────────────────────────────────────────────────────────────────
  const postToApi = async () => {
    const payload = {
      user_id: parseData['data'].user_id || userid,
      date_of_birth: dateOfBirth,
      uid_no: uidNo,
      pan_no: panNo,
      image: base64Image,
    };
    try {
      const response = await axios.post(
        'https://whiteforcepayroll.com/admin/api/edit-profile',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      login(response);
      setModalOpen(true);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // ── Date confirm ───────────────────────────────────────────────────────────
  const handleDateConfirm = (date: Date) => {
    setSelectedDobDate(date);
    setDateOfBirth(date.toISOString().split('T')[0]);
    setDatePickerVisibility(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!dateOfBirth || !uidNo || !panNo) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }
    postToApi();
    return true;
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const renderBackButton = () => (
    <RNBounceable onPress={() => navigation.navigate('HOME' as never)}>
      <View style={styles.addIconContainer}>
        <Icon
          name="chevron-back-outline"
          type={IconType.Ionicons}
          color={colors.iconWhite}
          style={styles.addIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {renderBackButton()}
    </View>
  );

  const renderContent = () => (
    <View style={styles.maincontainer}>

      {/* ── Success Modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={modalOpen}
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(12,11,10,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            height: ScreenWidth * 0.4,
            borderRadius: 10,
            alignItems: 'center',
            width: ScreenWidth * 0.7,
          }}>
            <View>
              <Image
                style={{
                  width: ScreenWidth * 0.17, height: ScreenWidth * 0.17,
                  borderRadius: 50, position: 'absolute', top: -34, left: -35,
                }}
                source={require('../../../assets/camera/ic_launchers.png')}
              />
            </View>
            <TouchableOpacity
              style={{ position: 'absolute', top: 20, right: 15 }}
              onPress={() => setModalOpen(false)}
            >
              <Image
                style={{ width: 15, height: 15 }}
                source={require('../../../assets/camera/close.png')}
              />
            </TouchableOpacity>
            <View style={{
              justifyContent: 'center', flexDirection: 'column',
              alignItems: 'center',
              height: ScreenHeight * 0.2, width: ScreenWidth * 0.7,
            }}>
              <Text color="black" style={{ color: 'black', marginTop: 10 }}>
                Profile edited successfully..
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Profile image ── */}
      <View style={{
        width: ScreenWidth * 0.87, justifyContent: 'center',
        position: 'absolute', top: -70, left: 25,
        flexDirection: 'row',
      }}>
        <Image
          resizeMode="cover"
          source={{ uri: imageURI || profileimage }}
          style={{
            width: ScreenWidth * 0.35, height: ScreenWidth * 0.35,
            borderRadius: ScreenWidth, position: 'relative',
            borderWidth: 2, borderColor: 'white',
          }}
        />
        <TouchableOpacity onPress={selectAndCropImage} style={styles.overlay}>
          <Image
            style={{ width: 18, height: 18 }}
            source={require('../../../assets/camera/draw.png')}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={{ marginTop: 50 }}>

          {/* Name */}
          <View style={{ backgroundColor: 'transparent', marginBottom: 8 }}>
            <Text color="black" style={[styles.headerTitle, { textAlign: 'center', textTransform: 'capitalize' }]}>
              {profilenames}
            </Text>
          </View>

          {/* Employee Code — read-only, not editable */}
          {!!employeeCode && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
              backgroundColor: '#e6f2ec', paddingHorizontal: 14, paddingVertical: 6,
              borderRadius: 50, marginBottom: 18, gap: 6,
            }}>
              <Text color="#1d5b41" style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
                🪪  {employeeCode}
              </Text>
            </View>
          )}

          {/* Date of Birth */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitles} color="black">Date of Birth :</Text>
            <TouchableOpacity
              style={styles.itemValue}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text color="black">
                {dateOfBirth || 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* UID */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle} color="black">UID / Aadhar Number :</Text>
            <TextInput
              ref={uidNoRef}
              style={styles.itemValue}
              value={uidNo}
              placeholder="Enter your UID/Aadhar number"
              onChangeText={setUidNo}
              onFocus={() => setButtonText('Submit')}
              onBlur={() => setButtonText('Update')}
              editable
            />
          </View>

          {/* PAN */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle} color="black">PAN Number :</Text>
            <TextInput
              ref={panNoRef}
              style={styles.itemValue}
              value={panNo}
              onChangeText={setPanNo}
              placeholder="Enter your PAN number"
              onFocus={() => setButtonText('Submit')}
              onBlur={() => setButtonText('Update')}
              editable
            />
          </View>
        </View>

        {/* Submit button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgb(29,91,65)',
              paddingVertical: 12, paddingHorizontal: 20,
              borderRadius: 8, alignItems: 'center', marginTop: 60,
            }}
            onPress={async () => {
              if (validateForm()) {
                if (buttonText === 'Submit') {
                  await saveDataToAsyncStorage();
                } else {
                  dateOfBirthRef.current?.focus();
                }
              }
            }}
          >
            <Text color="white" style={{ color: 'white', fontSize: 19 }}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../../assets/camera/backgroundimage.png')}
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderContent()}

        {/* ── Custom Calendar Picker ── */}
        <CalendarModal
          visible={isDatePickerVisible}
          selectedDate={selectedDobDate}
          onSelect={handleDateConfirm}
          onClose={() => setDatePickerVisibility(false)}
          title="Select Date of Birth"
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ProfileEditFormScreen;
