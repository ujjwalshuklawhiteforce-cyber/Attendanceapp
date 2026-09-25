import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  attendanceCard: ViewStyle;
  attendanceCardHeader: ViewStyle;
  attendanceCardIcon: ViewStyle;
  attendanceCardIconsize: TextStyle;
  attendanceCardTitle: TextStyle;
  timeContainer: ViewStyle;
  timeFont: TextStyle;
  timeSubtitle: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderRadius: 8,
      width: ScreenWidth * 0.9,
      borderColor: colors.borderColor,
      backgroundColor: colors.dynamicBackground,
    },

    attendanceCard: {
      width: ScreenWidth * 0.43,
      // height: ScreenWidth * 0.4,
      backgroundColor: colors.white,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    },

    attendanceCardHeader: {
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
    },
    attendanceCardIcon: {
      width: ScreenWidth * 0.1,
      height: ScreenWidth * 0.1,
      backgroundColor: "#EAF3FF",
      borderRadius: ScreenWidth * 0.03,
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    attendanceCardIconsize: {
      color: colors.primary,
      fontSize: ScreenWidth * 0.06,
    },
    attendanceCardTitle: {
      fontSize: ScreenWidth * 0.036,
      marginLeft: ScreenWidth * 0.02,
      fontWeight: "normal",
    },

    timeContainer: {
      marginVertical: ScreenWidth * 0.02,
    },

    timeFont: {
      fontSize: ScreenWidth * 0.056,
      fontWeight: "bold",
    },

    timeSubtitle: {
      fontSize: ScreenWidth * 0.032,
      fontWeight: "normal",
    },
  });
};
