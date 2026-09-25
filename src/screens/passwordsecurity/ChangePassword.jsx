import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "context/AuthContext";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  primary: "rgb(29,91,65)",
  primaryDark: "rgb(20,65,47)",
  primaryLight: "rgba(29,91,65,0.08)",
  primaryBorder: "rgba(29,91,65,0.25)",
  white: "#FFFFFF",
  bg: "#F4F7F5",
  inputBg: "#FFFFFF",
  inputBorder: "#DDE8E3",
  inputBorderFocus: "rgb(29,91,65)",
  text: "#1A2E26",
  textSub: "#6B8C7E",
  textMuted: "#A0B8AE",
  error: "#D64242",
  errorBg: "#FFF0F0",
  shadow: "rgba(29,91,65,0.12)",
};

// ─── Floating Label Input ─────────────────────────────────────────────────────
const FloatingInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightIcon,
  iconName,
}) => {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -9] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.textMuted, C.primary],
  });

  return (
    <View
      style={[
        fi.wrapper,
        focused && fi.wrapperFocused,
        value && !focused && fi.wrapperFilled,
      ]}
    >
      {/* Left icon */}
      <View style={fi.leftIcon}>
        <Icon
          name={iconName}
          type={IconType.Ionicons}
          size={18}
          color={focused ? C.primary : C.textMuted}
        />
      </View>

      {/* Floating label */}
      <Animated.Text
        style={[fi.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}
      >
        {label}
      </Animated.Text>

      {/* Text field */}
      <TextInput
        style={fi.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        placeholderTextColor="transparent"
        placeholder=" "
      />

      {/* Right slot (eye toggle) */}
      {rightIcon && <View style={fi.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

const fi = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    borderRadius: 14,
    backgroundColor: C.inputBg,
    marginBottom: 18,
    paddingHorizontal: 14,
    height: 58,
    position: "relative",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  wrapperFocused: {
    borderColor: C.inputBorderFocus,
    shadowColor: "rgba(29,91,65,0.2)",
    shadowOpacity: 1,
    elevation: 4,
  },
  wrapperFilled: {
    borderColor: C.primaryBorder,
  },
  leftIcon: {
    marginRight: 10,
    width: 22,
    alignItems: "center",
  },
  label: {
    position: "absolute",
    left: 50,
    backgroundColor: C.inputBg,
    paddingHorizontal: 4,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    paddingTop: 8,
    paddingBottom: 0,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { userInfo } = useAuth();
  const parseData = JSON.parse(userInfo ? userInfo : "{}");
  const navigation = useNavigation();
  const userId = parseData.data?.data?.user_id;

  const handleChangePassword = async () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Please enter your email address.");
      return;
    }
    if (!currentPassword.trim()) {
      Alert.alert("Validation", "Please enter your current password.");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Validation", "Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters.");
      return;
    }

    const apiURL = "https://whiteforcepayroll.com/admin/api/change-password";
    const payload = {
      user_id: parseData["data"]?.user_id || userId,
      email,
      current_password: currentPassword,
      new_password: newPassword,
    };

    try {
      setLoading(true);
      const response = await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (responseData.status === true) {
        setModalOpen(true);
      } else {
        Alert.alert("Error", responseData.message || "Failed to change password.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ show, onPress }) => (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Icon
        name={show ? "eye-off-outline" : "eye-outline"}
        type={IconType.Ionicons}
        size={20}
        color={C.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Success Modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={modalOpen}
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={s.overlay}>
          <View style={s.modalCard}>
            {/* Icon ring */}
            <View style={s.modalIconRing}>
              <View style={s.modalIconInner}>
                <Icon name="checkmark" type={IconType.Ionicons} size={32} color={C.white} />
              </View>
            </View>

            <Text style={s.modalTitle}>Password Updated!</Text>
            <Text style={s.modalSub}>
              Your password has been changed successfully. Please use your new password next time you log in.
            </Text>

            <TouchableOpacity
              style={s.modalBtn}
              onPress={() => {
                setModalOpen(false);
                navigation.goBack();
              }}
              activeOpacity={0.85}
            >
              <Text style={s.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Green Header Banner ── */}
      <View style={s.headerBanner}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" type={IconType.Ionicons} size={22} color={C.white} />
        </TouchableOpacity>

        <View style={s.headerTextBlock}>
          <Text style={s.headerTitle}>Change Password</Text>
          <Text style={s.headerSub}>Keep your account secure</Text>
        </View>

        {/* Decorative lock icon */}
        <View style={s.headerDecor}>
          <Icon name="lock-closed" type={IconType.Ionicons} size={48} color="rgba(255,255,255,0.12)" />
        </View>
      </View>

      {/* ── Form Card ── */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          {/* Info row */}
          <View style={s.infoRow}>
            <View style={s.infoIconBox}>
              <Icon name="information-circle" type={IconType.Ionicons} size={18} color={C.primary} />
            </View>
            <Text style={s.infoText}>
              Enter your current password and choose a strong new one.
            </Text>
          </View>

          <View style={s.divider} />

          {/* Email */}
          <FloatingInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            iconName="mail-outline"
          />

          {/* Current Password */}
          <FloatingInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            iconName="key-outline"
            rightIcon={
              <EyeToggle
                show={showCurrentPassword}
                onPress={() => setShowCurrentPassword((p) => !p)}
              />
            }
          />

          {/* New Password */}
          <FloatingInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            iconName="lock-closed-outline"
            rightIcon={
              <EyeToggle
                show={showNewPassword}
                onPress={() => setShowNewPassword((p) => !p)}
              />
            }
          />

          {/* Strength hint */}
          {newPassword.length > 0 && (
            <View style={s.strengthRow}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    s.strengthBar,
                    newPassword.length >= i * 3 && { backgroundColor: C.primary },
                  ]}
                />
              ))}
              <Text style={s.strengthLabel}>
                {newPassword.length < 4
                  ? "Weak"
                  : newPassword.length < 8
                    ? "Fair"
                    : newPassword.length < 12
                      ? "Good"
                      : "Strong"}
              </Text>
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                <Icon name="lock-closed-outline" type={IconType.Ionicons} size={18} color={C.white} />
                <Text style={s.submitBtnText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  // Header
  headerBanner: {
    backgroundColor: C.primary,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerTextBlock: { flex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  headerDecor: {
    position: "absolute",
    right: -8,
    top: -8,
  },

  // Scroll / card
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: C.textSub,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF4F0",
    marginBottom: 22,
  },

  // Password strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -8,
    marginBottom: 18,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E0EBE6",
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    minWidth: 36,
    textAlign: "right",
  },

  // Submit button
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
    shadowColor: "rgba(29,91,65,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Success Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  modalIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(29,91,65,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  modalIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modalSub: {
    fontSize: 13,
    color: C.textSub,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    height: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ChangePassword;