import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  LeaveApplyCard: ViewStyle;
  LeaveApplyHeader: ViewStyle;
  LeaveApplyImageContainer: ViewStyle;
  LeaveApplyImage: ImageStyle;
  LeaveApplyTextContainer: ViewStyle;
  LeaveApplyNameText: TextStyle;
  LeaveApplyDateText: TextStyle;
  LeaveApplyButtons: ViewStyle;
  Button: ViewStyle;
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

    LeaveApplyCard: {
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      borderRadius: ScreenWidth * 0.04,
      padding: ScreenWidth * 0.05,
      marginVertical: ScreenWidth * 0.02,
      elevation: 2,
    },

    LeaveApplyHeader: {
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
    },
    LeaveApplyImageContainer: {},

    LeaveApplyImage: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      borderRadius: ScreenWidth * 0.5,
    },

    LeaveApplyTextContainer: {
      marginLeft: ScreenWidth * 0.04,
    },

    LeaveApplyNameText: {
      fontSize: ScreenWidth * 0.03,
      fontWeight: "normal",
    },

    LeaveApplyDateText: {
      fontSize: ScreenWidth * 0.036,
      fontWeight: "bold",
    },

    LeaveApplyButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: ScreenWidth * 0.03,
    },

    Button: {
      width: ScreenWidth * 0.38,
    },
  });
};
