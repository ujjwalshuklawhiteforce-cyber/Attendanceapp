import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  profileHead: ViewStyle;
  profileImageContainer: ViewStyle;
  profileImage: ImageStyle;
  profileHeaderContent: ViewStyle;
  profileHeaderTitle: TextStyle;
  profileHeaderSubHead: TextStyle;
  contentContainer: ViewStyle;
  mainCard: ViewStyle;
  mainCardImg: ViewStyle;
  mainCardImgLogout: ViewStyle;
  mainCardContent: ViewStyle;
  mainCardContentLogout: ViewStyle;
  mainCardIcon: ViewStyle;
  dotIcon: TextStyle;
  profilePicImageStyle: ImageStyle;
  lineHR: ViewStyle;
  cardTitleName: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },

    profileHead: {
      paddingHorizontal: ScreenWidth * 0.08,
      paddingTop: ScreenWidth * 0.04,
    },

    profileImageContainer: {
      alignItems: "center",
    },

    profileImage: {
      width: ScreenWidth * 0.34,
      height: ScreenWidth * 0.34,
      borderRadius: ScreenWidth * 9, borderColor:"black",borderWidth:1,
    },

    profileHeaderContent: {
      alignContent: "center",
      alignItems: "center",
      marginVertical: ScreenWidth * 0.04,
    },

    profileHeaderTitle: {
      fontSize: ScreenWidth * 0.06,
      fontWeight: "bold",
      textTransform:"capitalize",
    },
    profileHeaderSubHead: {
      fontSize: ScreenWidth * 0.039,
      textTransform:"capitalize", 
      marginTop: ScreenWidth * 0.008,
    },

    contentContainer: {
      paddingHorizontal: ScreenWidth * 0.08,
      marginTop: ScreenWidth * 0.06,
    },

    dotIcon: {
      fontSize: ScreenWidth * 0.06,
    },

    mainCard: {
      width: "100%",
      marginVertical: ScreenWidth * 0.04,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    mainCardImg: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      backgroundColor: colors.lightGray,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: ScreenWidth * 0.9
    },

    mainCardImgLogout: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      backgroundColor: colors.bgDanger,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: ScreenWidth * 0.9
    },

    profilePicImageStyle: {
      width: ScreenWidth * 0.12,
      height: ScreenWidth * 0.12,
      borderRadius: ScreenWidth * 0.5,
    },

    mainCardContent: {
      width: "70%",
    },
    mainCardContentLogout: {
      width: "81%",
    },

    mainCardIcon: {},

    lineHR: {
      width: "100%",
      height: ScreenWidth * 0.001,
      backgroundColor: colors.borderColor,
    },

    cardTitleName: {
      fontSize: ScreenWidth * 0.042,
      fontWeight: "bold",
      textAlign: "left",
      marginBottom: ScreenWidth * 0.01,
    },
  });
};
