import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  textContainer: ViewStyle;
  text: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },

    textContainer: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
    },

    text: {
      fontSize: ScreenWidth * 0.04,
      fontWeight: 'bold',
    },
  });
};
