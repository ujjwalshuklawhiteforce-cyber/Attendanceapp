import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  leaveCard: ViewStyle;
  cardTitle: TextStyle;
  cardDays: TextStyle;
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

    leaveCard: {
      width: ScreenWidth * 0.43,
      borderWidth: ScreenWidth * 0.002,
      // height: ScreenWidth * 0.4,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.05,
      padding: ScreenWidth * 0.04,
    },

    cardTitle: {
      fontSize: ScreenWidth * 0.039,
      fontWeight: "bold",
      lineHeight: ScreenWidth * 0.0528,
      marginBottom: ScreenWidth * 0.04,
    },

    cardDays: {
      fontSize: ScreenWidth * 0.06,
      fontWeight: "bold",
    },
  });
};
