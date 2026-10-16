import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Modal,
  StyleSheet,
} from "react-native";
import createStyles from "./ForgotPassword.style";
import { useTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { useNavigation } from "@react-navigation/native";
import { Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// ─── API helpers ─────────────────────────────────────────────────────────────
const BASE = "https://whiteforcepayroll.com/admin/api/employee";

const apiForgotPassword = (mobile) =>
  fetch(`${BASE}/forgot-password?mobile=${mobile}`, { method: "POST" }).then((r) => r.json());

const apiVerifyOTP = (mobile, otp) =>
  fetch(`${BASE}/verify-otp?mobile=${mobile}&otp=${otp}`, { method: "POST" }).then((r) => r.json());

const apiResetPassword = (mobile, otp, password) =>
  fetch(`${BASE}/reset-password?mobile=${mobile}&otp=${otp}&password=${password}`, {
    method: "POST",
  }).then((r) => r.json());

// ─── Custom Alert Popup ───────────────────────────────────────────────────────
const CustomAlert = ({ visible, title, message, onClose, onConfirm, confirmText = "OK" }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View style={alertStyles.overlay}>
      <View style={alertStyles.box}>
        <View style={alertStyles.iconWrap}>
          <Ionicons
            name={title === "Error" || title === "Session Expired" ? "close-circle" : "checkmark-circle"}
            size={48}
            color={title === "Error" || title === "Session Expired" ? "#e53935" : "rgb(29,91,65)"}
          />
        </View>
        <Text style={alertStyles.title}>{title}</Text>
        <Text style={alertStyles.message}>{message}</Text>
        <TouchableOpacity
          style={[
            alertStyles.btn,
            {
              backgroundColor:
                title === "Error" || title === "Session Expired"
                  ? "#e53935"
                  : "rgb(29,91,65)",
            },
          ]}
          onPress={onConfirm || onClose}
        >
          <Text style={alertStyles.btnText}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: ScreenWidth * 0.82,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconWrap: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "bold", color: "#222", marginBottom: 8 },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },
  btn: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PasswordRecoveryScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertOnConfirm, setAlertOnConfirm] = useState(null);

  const showAlert = (title, message, onConfirm = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOnConfirm(() => onConfirm);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertOnConfirm) alertOnConfirm();
  };

  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const timerRef = useRef(null);

  // Phone Validation
  const validatePhone = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) { setPhoneError("Phone number is required"); return false; }
    if (!phoneRegex.test(phone)) { setPhoneError("Please enter a valid 10-digit phone number"); return false; }
    setPhoneError("");
    return true;
  };

  // Step 1 — Send OTP
  const handleSendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const data = await apiForgotPassword(phone);
      setLoading(false);
      const ok =
        data?.returncode === 1 ||
        data?.status === true ||
        data?.success === true ||
        data?.returncode === 0;
      if (ok) {
        setStep(2);
        setTimeLeft(600);
        setOtp(["", "", "", "", "", ""]);
        showAlert("Success", data?.message || `OTP sent to +91 ${phone}`);
      } else {
        showAlert("Error", data?.message || "Could not send OTP. Please check your phone number.");
      }
    } catch {
      setLoading(false);
      showAlert("Error", "Network error. Please try again.");
    }
  };

  // Timer
  useEffect(() => {
    if ((step === 2 || step === 3) && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && (step === 2 || step === 3)) {
      showAlert("Session Expired", "Your session has expired. Please start over.", () => setStep(1));
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? "0" : ""}${s % 60}`;

  // OTP Handlers
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setOtpError("");
    if (text.length === 1 && index < 5) otpRefs.current[index + 1].current?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && otp[index] === "")
      otpRefs.current[index - 1].current?.focus();
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) { setOtpError("Please enter 6-digit OTP"); return; }
    setLoading(true);
    try {
      const data = await apiVerifyOTP(phone, enteredOtp);
      setLoading(false);
      const ok =
        data?.returncode === 1 ||
        data?.status === true ||
        data?.success === true ||
        data?.returncode === 0;
      if (ok) {
        setVerifiedOtp(enteredOtp);
        showAlert("Success", data?.message || "OTP Verified!", () => setStep(3));
      } else {
        setOtpError(data?.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setLoading(false);
      showAlert("Error", "Network error. Please try again.");
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async () => {
    setPasswordError("");
    if (!newPassword || !confirmPassword) { setPasswordError("Please fill both fields"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const data = await apiResetPassword(phone, verifiedOtp, newPassword);
      setLoading(false);
      const ok =
        data?.returncode === 1 ||
        data?.status === true ||
        data?.success === true ||
        data?.returncode === 0;
      if (ok) {
        showAlert(
          "Success",
          data?.message || "Your password has been reset successfully!",
          () => navigation.navigate("LOGIN")
        );
      } else {
        setPasswordError(data?.message || "Failed to reset password. Please try again.");
      }
    } catch {
      setLoading(false);
      showAlert("Error", "Network error. Please try again.");
    }
  };

  const handleFocus = (field) => setFocusedInput(field);
  const handleBlur = () => setFocusedInput("");

  // ==================== PHONE FORM ====================
  const renderPhoneForm = () => (
    <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 130, borderBottomEndRadius: 150, marginTop: ScreenHeight * 0.04, height: ScreenHeight * 0.6, width: ScreenWidth }}>
      <View style={{ width: ScreenWidth, justifyContent: "center" }}>
        <Text style={{ fontSize: 23, fontWeight: "bold", textAlign: "center", marginTop: ScreenHeight * 0.08, color: "black" }}>
          Password <Text style={{ color: "rgb(29,91,65)" }}>Recovery</Text>
        </Text>
        <Text style={{ textAlign: "center", color: "#666", marginTop: 10, paddingHorizontal: 30, fontSize: 14, lineHeight: 22 }}>
          Enter your registered phone number to receive password recovery instructions.
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 100, borderBottomRightRadius: 150, width: ScreenWidth }}>
        <View style={styles.formContainer}>
          <View style={styles.inputField}>
            <Text style={styles.legendFocused}>Phone Number</Text>
            <TextInput
              value={phone}
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
              placeholder="9876543210"
              placeholderTextColor={colors.subtitle}
              onChangeText={(text) => {
                const value = text.replace(/[^0-9]/g, "");
                setPhone(value);
                if (phoneError) validatePhone();
              }}
            />
          </View>

          {phoneError ? <Text style={{ color: "red", fontSize: 12, width: ScreenWidth * 0.72, marginTop: -5, marginBottom: 15 }}>{phoneError}</Text> : null}

          <Text style={{ width: ScreenWidth * 0.35, backgroundColor: "rgb(29,91,65)", height: 4, margin: 20, alignSelf: "center" }} />

          <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
            <View style={styles.button}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ==================== OTP FORM ====================
  const renderOTPForm = () => (
    <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 130, borderBottomEndRadius: 150, marginTop: ScreenHeight * 0.04, height: ScreenHeight * 0.68, width: ScreenWidth }}>
      <View style={{ width: ScreenWidth, justifyContent: "center" }}>
        <Text style={{ fontSize: 23, fontWeight: "bold", textAlign: "center", marginTop: ScreenHeight * 0.08, color: "black" }}>Enter OTP</Text>
        <Text style={{ textAlign: "center", color: "#666", marginTop: 10, paddingHorizontal: 30, fontSize: 14, lineHeight: 22 }}>
          We've sent a 6-digit code to{"\n"}
          <Text style={{ fontWeight: "bold", color: "rgb(29,91,65)", fontSize: 18 }}>+91 {phone}</Text>
        </Text>
        <Text style={{ textAlign: "center", color: "rgb(29,91,65)", marginTop: 8, fontSize: 15 }}>
          Time Remaining: {formatTime(timeLeft)}
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 100, borderBottomRightRadius: 150, width: ScreenWidth }}>
        <View style={styles.formContainer}>
          <View style={{ alignItems: "center", marginVertical: 25 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpRefs.current[index]}
                  style={{
                    width: 48, height: 58, borderWidth: 1.5,
                    borderColor: otpError ? "red" : "rgb(29,91,65)",
                    borderRadius: 12, textAlign: "center", fontSize: 22,
                    fontWeight: "bold", color: "#333", backgroundColor: "#f9f9f9",
                  }}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>
          </View>

          {otpError ? <Text style={{ color: "red", fontSize: 13, textAlign: "center", marginBottom: 15 }}>{otpError}</Text> : null}

          <Text style={{ width: ScreenWidth * 0.35, backgroundColor: "rgb(29,91,65)", height: 4, margin: 20, alignSelf: "center" }} />

          <TouchableOpacity onPress={handleVerifyOTP} disabled={loading}>
            <View style={styles.button}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ==================== NEW PASSWORD FORM ====================
  const renderNewPasswordForm = () => (
    <View style={{
      flex: 1,
      backgroundColor: "white",
      borderTopLeftRadius: 130,
      borderBottomEndRadius: 150,
      marginTop: ScreenHeight * 0.04,
      height: ScreenHeight * 0.72,
      width: ScreenWidth,
    }}>
      <View style={{ width: ScreenWidth, justifyContent: "center" }}>
        <Text style={{ fontSize: 23, fontWeight: "bold", textAlign: "center", marginTop: ScreenHeight * 0.08, color: "black" }}>
          Reset Password
        </Text>
        <Text style={{ textAlign: "center", color: "#666", marginTop: 10, paddingHorizontal: 30, fontSize: 14, lineHeight: 22 }}>
          Create a new strong password for your account.
        </Text>
        <Text style={{ textAlign: "center", color: "rgb(29,91,65)", marginTop: 8, fontSize: 15 }}>
          Time Remaining: {formatTime(timeLeft)}
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: "white", borderTopLeftRadius: 100, borderBottomRightRadius: 150, width: ScreenWidth }}>
        <View style={styles.formContainer}>

          <View style={styles.inputField}>
            <Text style={[styles.legendFocused]} color="black">New Password</Text>
            <TextInput
              value={newPassword}
              style={[styles.input, focusedInput === "newPassword" ? styles.focusInput : styles.blurInput]}
              ref={newPasswordRef}
              autoComplete="off"
              autoCapitalize="none"
              secureTextEntry={!showNewPassword}
              placeholder="***************"
              placeholderTextColor={colors.subtitle}
              onFocus={() => handleFocus("newPassword")}
              onBlur={handleBlur}
              onChangeText={(text) => setNewPassword(text)}
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 30, top: 25 }}
              onPress={() => setShowNewPassword((prev) => !prev)}
            >
              <Ionicons name={showNewPassword ? "eye" : "eye-off"} size={22} color="rgb(29,91,65)" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputField}>
            <Text style={[styles.legendFocused]} color="black">Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              style={[styles.input, focusedInput === "confirmPassword" ? styles.focusInput : styles.blurInput]}
              ref={confirmPasswordRef}
              autoComplete="off"
              autoCapitalize="none"
              secureTextEntry={!showConfirmPassword}
              placeholder="***************"
              placeholderTextColor={colors.subtitle}
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={handleBlur}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 30, top: 25 }}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            >
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={22} color="rgb(29,91,65)" />
            </TouchableOpacity>
          </View>

          {passwordError ? (
            <Text style={{ color: "red", fontSize: 13, textAlign: "center", marginBottom: 15 }}>
              {passwordError}
            </Text>
          ) : null}

          <Text style={{ width: ScreenWidth * 0.35, backgroundColor: "rgb(29,91,65)", height: 4, margin: 20, alignSelf: "center" }} />

          <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
            <View style={styles.button}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: "#1e3830", flex: 1 }}>
      {/* Custom Alert Popup */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={closeAlert}
        onConfirm={alertOnConfirm ? closeAlert : null}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          style={{ backgroundColor: "#1e3830", height: ScreenHeight * 0.5 }}
          source={require("../../../../assets/camera/loginbackground.png")}
        >
          <View style={{ alignItems: "center" }}>
            <Image style={{ width: 200, height: 200, marginTop: 80 }} source={require("../../../../assets/camera/whiteforcelogo.png")} />
          </View>
        </ImageBackground>

        <View style={{ marginTop: -ScreenWidth * 0.35 }}>
          {step === 1 && renderPhoneForm()}
          {step === 2 && renderOTPForm()}
          {step === 3 && renderNewPasswordForm()}
        </View>
      </ScrollView>
    </View>
  );
};

export default PasswordRecoveryScreen;