import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import type { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  activityCard: ViewStyle;
  activityLeftCard: ViewStyle;
  activityRightCard: ViewStyle;
  activityLeftCardIcon: ViewStyle;
  activityCardIconsize: TextStyle;
  activityLeftCardText: ViewStyle;
  activityLeftCardTextTitle: TextStyle;
  activityLeftCardTextDate: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    activityCard: {
      padding: ScreenWidth * 0.046,
      width: ScreenWidth * 0.9,
      backgroundColor: colors.white,
      marginVertical: ScreenWidth * 0.016,
      borderRadius: ScreenWidth * 0.04,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    activityLeftCard: {
      flexDirection: "row",
    },

    activityLeftCardText: {
      marginLeft: ScreenWidth * 0.04,
    },

    activityLeftCardTextTitle: {
      fontSize: ScreenWidth * 0.04,
      fontWeight: "bold",
    },

    activityLeftCardTextDate: {
      marginTop: ScreenWidth * 0.006,
      fontSize: ScreenWidth * 0.026,
    },

    activityRightCard: {},

    activityLeftCardIcon: {
      width: ScreenWidth * 0.1,
      height: ScreenWidth * 0.1,
      backgroundColor: "#EAF3FF",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    activityCardIconsize: {
      fontSize: ScreenWidth * 0.06,
      color: colors.primary,
    },
  });
};
