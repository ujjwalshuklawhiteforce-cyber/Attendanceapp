import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from "react-native-safe-area-context";
import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAuth } from "context/AuthContext";
import { Image } from "react-native";
import axios from "axios";
import { ScreenWidth } from "@freakycoder/react-native-helpers";

interface ProfileEditScreen { }

const ProfileEditScreen: React.FC<ProfileEditScreen> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { userInfo, login } = useAuth();
  const { colors } = theme;

  // ── Parse user data (support full userData shape after AuthContext fix) ───────
  const parseData = JSON.parse(userInfo || "{}");
  const userData = parseData?.data?.data ?? parseData?.data ?? {};

  const imagesource = userData?.image;
  const userid = userData?.user_id;
  const fullName = userData?.name || "Employee";
  // ── Employee Code: display only — NOT editable ──────────────────────────────
  const employeeCode = userData?.user_regcode || userData?.emp_code || "";

  // ── Auto-fill from API only if value is non-empty ────────────────────────────
  // DOB: skip the backend default "1970-01-01"
  const apiDob = (userData?.date_of_birth && userData.date_of_birth !== "1970-01-01")
    ? userData.date_of_birth : "";
  const apiUid = userData?.uid_no || "";
  const apiPan = userData?.pan_no || "";

  // ── Console log: autofill values for debugging ───────────────────────────────


  // ── Editable state ────────────────────────────────────────────────────────────
  const [dateOfBirth, setDateOfBirth] = useState(apiDob);
  const [uidNo, setUidNo] = useState(apiUid);
  const [panNo, setPanNo] = useState(apiPan);
  const [imageURI, setImageURI] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const profileimage = imageURI || imagesource
    || "https://t4.ftcdn.net/jpg/11/28/72/75/360_F_1128727502_ce2UdfqSn42Ia48OeSy7a6UBX590HZnJ.jpg";

  const uidNoRef = useRef<TextInput>(null);
  const panNoRef = useRef<TextInput>(null);

  // ── Select profile image ──────────────────────────────────────────────────────
  const selectImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) { Alert.alert("Error", response.errorMessage); return; }
      if (response.assets?.length) setImageURI(response.assets[0].uri!);
    });
  };
  useEffect(() => {
    console.log('[ProfileEdit] ── Autofill Data ──');
    console.log('[ProfileEdit] parseData shape    :', Object.keys(parseData));
    console.log('[ProfileEdit] userData shape     :', Object.keys(userData));
    console.log('[ProfileEdit] fullName           :', fullName);
    console.log('[ProfileEdit] employeeCode       :', employeeCode);
    console.log('[ProfileEdit] DOB (raw)          :', userData?.date_of_birth);
    console.log('[ProfileEdit] DOB (autofill)     :', apiDob || '(empty — skipped 1970 default)');
    console.log('[ProfileEdit] UID/Aadhar (raw)   :', userData?.uid_no);
    console.log('[ProfileEdit] UID (autofill)     :', apiUid || '(empty)');
    console.log('[ProfileEdit] PAN (raw)          :', userData?.pan_no);
    console.log('[ProfileEdit] PAN (autofill)     :', apiPan || '(empty)');
    console.log('[ProfileEdit] image              :', imagesource ? 'URL present' : 'no image');
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────────
  const postToApi = async () => {
    const payload: any = { user_id: userid, date_of_birth: dateOfBirth, uid_no: uidNo, pan_no: panNo };
    if (base64Image) payload.image = base64Image;
    try {
      const response = await axios.post(
        "https://whiteforcepayroll.com/admin/api/edit-profile",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      login(response);
      console.log("[ProfileEdit] Response:", response.data);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("[ProfileEdit] Error:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const validateAndSubmit = () => {
    if (!dateOfBirth && !uidNo && !panNo) {
      Alert.alert("Validation Error", "Please fill at least one field.");
      return;
    }
    postToApi();
  };

  const handleDateConfirm = (date: Date) => {
    setDateOfBirth(date.toISOString().split("T")[0]);
    setDatePickerVisibility(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <RNBounceable onPress={() => navigation.goBack()}>
          <View style={s.backBtn}>
            <Icon name="chevron-back-outline" type={IconType.Ionicons} color={colors.iconBlack} size={22} />
          </View>
        </RNBounceable>
        <Text color={colors.titleSecond} style={s.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Avatar + camera button ── */}
        <View style={s.avatarRow}>
          <Image resizeMode="cover" source={{ uri: profileimage }} style={s.avatar} />
          <TouchableOpacity onPress={selectImage} style={s.editIconBtn}>
            <Icon name="camera-outline" type={IconType.Ionicons} color="#fff" size={16} />
          </TouchableOpacity>
        </View>

        {/* ── Full name (display only) ── */}
        <Text color="black" style={s.nameText}>{fullName}</Text>

        {/* ── Employee code badge — read-only title ── */}
        {!!employeeCode && (
          <View style={s.codeBadge}>
            <Icon name="id-card-outline" type={IconType.Ionicons} color="#1d5b41" size={15} />
            <Text color="#1d5b41" style={s.codeText}>{employeeCode}</Text>
          </View>
        )}

        {/* ── Editable fields card ── */}
        <View style={s.card}>

          {/* Date of Birth */}
          <Text color="#555" style={s.label}>Date of Birth</Text>
          <TouchableOpacity style={s.input} onPress={() => setDatePickerVisibility(true)} activeOpacity={0.8}>
            <Icon name="calendar-outline" type={IconType.Ionicons} color="#1d5b41" size={16} style={{ marginRight: 8 }} />
            <Text color={dateOfBirth ? "black" : "#aaa"} style={s.inputText}>
              {dateOfBirth || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>

          {/* UID / Aadhar */}
          <Text color="#555" style={s.label}>UID / Aadhar Number</Text>
          <View style={s.input}>
            <Icon name="finger-print-outline" type={IconType.Ionicons} color="#1d5b41" size={16} style={{ marginRight: 8 }} />
            <TextInput
              ref={uidNoRef}
              style={s.inputText}
              value={uidNo}
              onChangeText={setUidNo}
              placeholder="Enter Aadhar number"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={12}
            />
          </View>

          {/* PAN */}
          <Text color="#555" style={s.label}>PAN Number</Text>
          <View style={s.input}>
            <Icon name="document-text-outline" type={IconType.Ionicons} color="#1d5b41" size={16} style={{ marginRight: 8 }} />
            <TextInput
              ref={panNoRef}
              style={s.inputText}
              value={panNo}
              onChangeText={setPanNo}
              placeholder="Enter PAN number"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
        </View>

        {/* ── Submit button ── */}
        <TouchableOpacity style={s.submitBtn} onPress={validateAndSubmit} activeOpacity={0.85}>
          <Icon name="checkmark-outline" type={IconType.Ionicons} color="#fff" size={18} style={{ marginRight: 6 }} />
          <Text color="#fff" style={s.submitText}>Update Profile</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Date Picker ── */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        date={dateOfBirth ? new Date(dateOfBirth) : new Date()}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f0f5f2", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  avatarRow: { alignItems: "center", marginTop: 28, marginBottom: 8, position: "relative" },
  avatar: { width: ScreenWidth * 0.28, height: ScreenWidth * 0.28, borderRadius: ScreenWidth * 0.14, borderWidth: 3, borderColor: "rgb(29,91,65)" },
  editIconBtn: { position: "absolute", bottom: 0, right: ScreenWidth * 0.34, backgroundColor: "#1d5b41", padding: 7, borderRadius: 50 },
  nameText: { textAlign: "center", fontSize: 18, fontWeight: "700", marginTop: 10 },
  codeBadge: { flexDirection: "row", alignItems: "center", alignSelf: "center", gap: 6, backgroundColor: "#e6f2ec", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, marginTop: 6, marginBottom: 20 },
  codeText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  card: { marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 16, padding: 18, elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f7f6", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#e0e8e4" },
  inputText: { flex: 1, fontSize: 14, color: "#222" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, marginTop: 24, backgroundColor: "rgb(29,91,65)", paddingVertical: 14, borderRadius: 12, elevation: 3 },
  submitText: { fontSize: 16, fontWeight: "700" },
})
export default ProfileEditScreen;

