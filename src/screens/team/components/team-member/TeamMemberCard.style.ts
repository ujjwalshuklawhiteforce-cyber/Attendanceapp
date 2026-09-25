import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  memberCard: ViewStyle;
  memberImg: ViewStyle;
  memberContent: ViewStyle;
  memberIcon: ViewStyle;
  dotIcon: TextStyle;
  profilePicImageStyle: ImageStyle;
  lineHR: ViewStyle;
  memberName: TextStyle;
  memberEmail: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    dotIcon: {
      fontSize: ScreenWidth * 0.05,
    },

    memberCard: {
      width: ScreenWidth * 0.9,
      marginVertical: ScreenWidth * 0.04,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    memberImg: {},

    profilePicImageStyle: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      borderRadius: ScreenWidth * 0.5,
    },

    memberContent: {
      width: '70%'
    },

    memberIcon: {},
    
    lineHR: {
      width: "100%",
      height: ScreenWidth * 0.001,
      backgroundColor: colors.borderColor,
    },

    memberName: {
      fontSize: ScreenWidth * 0.034,
      fontWeight: "bold",
      textAlign:'left',
      marginBottom: ScreenWidth * 0.01,
    },

    memberEmail: {
      fontSize: ScreenWidth * 0.028,
      fontWeight: "normal",
      textAlign:'left',
    },
  });
};
