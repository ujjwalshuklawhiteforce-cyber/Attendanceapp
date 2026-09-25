import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  addIconContainer: ViewStyle;
  addIcon: TextStyle;
  header: ViewStyle;
  headerContainer: ViewStyle;
  headerTitle: TextStyle;
  todayCard: ViewStyle;
  content: ViewStyle;
  leftContent: ViewStyle;
  percentContent: ViewStyle;
  statusContent: TextStyle;
  viewTaskbtn: ViewStyle;
  tabBarHeader: ViewStyle;
  tabBarHeaderIndicatorStyle: ViewStyle;
  tabContainer: ViewStyle;
  tabSwitchTabView: ViewStyle;
  marginTop: ViewStyle;
  iconButtonContainer: ViewStyle;
  loadingContainer: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    button: {
      position: "absolute",
      top: ScreenHeight * 0.82,
      width: "80%",
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.white,
      position: "relative",
    },
    
    addIconContainer: {
      padding: ScreenWidth * 0.03,
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      borderRadius: ScreenWidth * 0.04,
    },

    addIcon: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
    },

    header: {
      width: ScreenWidth * 0.9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: ScreenWidth * 0.04,
      paddingBottom: ScreenWidth * 0.04,
    },

    headerContainer: {},

    headerTitle: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
    },

    content: {
      paddingHorizontal: ScreenWidth * 0.08,
      marginTop: ScreenWidth * 0.06,
    },

    todayCard: {
      // backgroundColor: colors.taskCardbg,
      backgroundColor:"rgb(29,91,65)",
      width: ScreenWidth * 0.9,
      borderRadius: ScreenWidth * 0.06,
      flexDirection:"row",
      flexWrap: "wrap",
      padding: ScreenWidth * 0.06,
      justifyContent: "space-between",
      alignItems: "center",
    },

    leftContent: {
      width: "48%"
    },

    statusContent: {
      fontSize: ScreenWidth * 0.04,
      lineHeight: ScreenWidth * 0.06
    },

    percentContent: {
    },

    viewTaskbtn: {
      width: ScreenWidth * 0.3,
      padding: 0,
      marginTop: ScreenWidth * 0.06
    },

    iconButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    // tab

    tabBarHeaderIndicatorStyle: {
      // backgroundColor: colors.taskCardbg,
      backgroundColor:"rgb(29,91,65)",
      height: "100%",
      borderRadius: ScreenWidth * 0.03,
    },

    tabBarHeader: {
      marginHorizontal: ScreenWidth * 0.048,
      marginBottom: ScreenWidth * 0.04,
      backgroundColor: colors.tabHeader,
      borderRadius: ScreenWidth * 0.03,
      shadowColor: "transparent",
    },

    tabContainer: {
      marginHorizontal: ScreenWidth * 0.048,
     
    },

    tabSwitchTabView: {
      width: ScreenWidth,
    },

    marginTop: {
      marginTop: ScreenWidth * 0.06
    }
  });
};
