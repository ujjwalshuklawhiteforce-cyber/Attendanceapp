import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  leaveDetailCard: ViewStyle;
  leaveDetailCardHeader: ViewStyle;
  leaveDetailCardDate: ViewStyle;
  leaveDetailCardStatus: ViewStyle;
  leaveDetailCardStatusText: TextStyle;
  leaveDetailCardDateTitle: TextStyle;
  leaveDetailCardDateText: TextStyle;
  leaveDetailCardContent: ViewStyle;
  lineHR: ViewStyle;
  leaveDetailHeading: TextStyle;
  leaveDetailValue: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      padding: ScreenWidth * 0.046,
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.04,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    leaveDetailCard: {
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      borderRadius: ScreenWidth * 0.04,
      padding: ScreenWidth * 0.05,
      marginVertical: ScreenWidth * 0.02,
      elevation: 2,
    },

    leaveDetailCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
    },

    leaveDetailCardDate: {},

    leaveDetailCardDateTitle: {
      marginBottom: ScreenWidth * 0.01,
    },

    leaveDetailCardDateText: {
      fontWeight: "bold",
      fontSize: ScreenWidth * 0.036,
    },

    leaveDetailCardStatus: {
      padding: ScreenWidth * 0.02,
      borderRadius: ScreenWidth * 0.02,
    },
    leaveDetailCardStatusText: {
      textTransform: "capitalize",
      fontWeight: "normal",
    },

    leaveDetailCardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignContent: "center",
    },

    lineHR: {
      marginVertical: ScreenWidth * 0.028,
      width: "100%",
      height: ScreenWidth * 0.001,
      backgroundColor: colors.subtitle,
    },

    leaveDetailHeading: {
      fontSize: ScreenWidth * 0.031,
    },

    leaveDetailValue: {
      fontSize: ScreenWidth * 0.038,
      fontWeight: "bold",
      marginTop: ScreenWidth * 0.01,
    },
  });
};
