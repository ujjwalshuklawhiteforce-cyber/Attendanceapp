import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { ImageBackground } from "react-native";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.attendance.name";

const TEXT = {
  en: {
    title: "New update is available",
    message:
      "The current version of this application is no longer supported. We apologize for any inconvenience we may have caused",
    button: "Update now",
    switch: "हिंदी",
  },
  hi: {
    title: "नया अपडेट उपलब्ध है",
    message:
      "इस एप्लिकेशन का वर्तमान संस्करण अब समर्थित नहीं है। हुई असुविधा के लिए हमें खेद है।",
    button: "अभी अपडेट करें",
    switch: "English",
  },
};

const ForceUpdateScreen = () => {
  const [language, setLanguage] = useState("en");

  const t = TEXT[language];

  return (
    <ImageBackground
      source={require("./assets/camera/updatebackground3.png")}
      style={styles.container}
    >
      {/* Language Switch */}
      <TouchableOpacity
        style={styles.languageSwitch}
        onPress={() => setLanguage(language === "en" ? "hi" : "en")}
      >
        <Text style={styles.languageText}>{t.switch}</Text>
      </TouchableOpacity>

      {/* Content Card */}
      <View style={styles.card}>
        <Text style={styles.title}>{t.title}</Text>

        <Text style={styles.message}>{t.message}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(PLAY_STORE_URL)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t.button}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default ForceUpdateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    top: "20%",
    alignItems: "center",
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 16,
  },
  vLetter: {
    position: "absolute",
    left: 10,
    top: 20,
    width: 50,
    height: 60,
  },
  vLeftStroke: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 8,
    height: 50,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "20deg" }],
  },
  vRightStroke: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 8,
    height: 50,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "-20deg" }],
  },
  wLetter: {
    position: "absolute",
    right: 10,
    top: 20,
    width: 60,
    height: 60,
  },
  wStroke1: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 6,
    height: 45,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "15deg" }],
  },
  wStroke2: {
    position: "absolute",
    left: 12,
    top: 0,
    width: 6,
    height: 45,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "-15deg" }],
  },
  wStroke3: {
    position: "absolute",
    right: 12,
    top: 0,
    width: 6,
    height: 45,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "15deg" }],
  },
  wStroke4: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 6,
    height: 45,
    backgroundColor: "#2D5F3F",
    transform: [{ rotate: "-15deg" }],
  },
  checkmarkCircle: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D5F3F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2D5F3F",
  },
  checkmark: {
    width: 20,
    height: 20,
    position: "relative",
  },
  checkmarkShort: {
    position: "absolute",
    left: 2,
    bottom: 8,
    width: 3,
    height: 8,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
  },
  checkmarkLong: {
    position: "absolute",
    right: 3,
    bottom: 5,
    width: 3,
    height: 14,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "45deg" }],
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2C3E50",
    letterSpacing: -0.5,
  },
  languageSwitch: {
  position: "absolute",
  top: 40,
  right: 20,
  backgroundColor: "rgba(0,0,0,0.4)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},
languageText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "600",
},

  rocketContainer: {
    position: "absolute",
    top: 80,
    alignItems: "center",
  },
  rocket: {
    alignItems: "center",
  },
  rocketBody: {
    width: 50,
    alignItems: "center",
    position: "relative",
  },
  rocketTop: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#E74C3C",
  },
  rocketMiddle: {
    width: 50,
    height: 80,
    backgroundColor: "#ECF0F1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  window: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#34495E",
    borderWidth: 2,
    borderColor: "#2C3E50",
  },
  finLeft: {
    position: "absolute",
    bottom: 0,
    left: -15,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 30,
    borderRightWidth: 20,
    borderTopColor: "transparent",
    borderRightColor: "#2C5F7C",
  },
  finRight: {
    position: "absolute",
    bottom: 0,
    right: -15,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 30,
    borderLeftWidth: 20,
    borderTopColor: "transparent",
    borderLeftColor: "#2C5F7C",
  },
  flames: {
    alignItems: "center",
    marginTop: -5,
  },
  flameOrange: {
    width: 30,
    height: 35,
    backgroundColor: "#F39C12",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  flameYellow: {
    width: 20,
    height: 25,
    backgroundColor: "#F1C40F",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -25,
  },
  cloudsContainer: {
    position: "absolute",
    bottom: 280,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cloud: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  cloudLeft: {
    marginLeft: -20,
  },
  cloudRight: {
    marginRight: -10,
  },
  cloudCircle1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  cloudCircle2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    marginLeft: -15,
  },
  cloudCircle3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginLeft: -15,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  button: {
    width: "100%",
    backgroundColor:  "#2D5F3F",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});