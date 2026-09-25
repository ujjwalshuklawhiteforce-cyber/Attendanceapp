import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ExtendedTheme } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  headerContainer: ViewStyle;
  headerTitle: TextStyle;
  overlay:ViewStyle;
  addIconContainer: ViewStyle;
  addIcon: TextStyle;
  contentContainer: TextStyle;
  itemContainer: ViewStyle;
  itemTitle: TextStyle;
  itemValue: TextStyle;
  maincontainer:ViewStyle;
  itemTitles:TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({

    container: {
      flex: 1,
      alignItems: "center",
      height:ScreenHeight*0.4,
      // backgroundColor: colors.white,
      position: "relative",
  // backgroundColor:"rgb(29,91,65)"
    },

    header: {
      width: ScreenWidth * 0.9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: ScreenWidth * 0.02,
    },

    headerContainer: {
      flex: 1,
      justifyContent: "center",
      // marginRight: ScreenWidth * 0.09,
    },

    headerTitle: {
      fontSize: ScreenWidth * 0.05,
      fontWeight: "bold",
      color:"black"
    },

    addIconContainer: {
      padding: ScreenWidth * 0.03,
      borderColor: colors.lightGray,
      borderWidth: ScreenWidth * 0.004,
      borderRadius: ScreenWidth * 0.04,
    },

    addIcon: {
      fontSize: ScreenWidth * 0.04,
      fontWeight: "bold",
    },

    contentContainer: {
      width: ScreenWidth,
      padding: ScreenWidth * 0.09,
      // marginTop:-70,
    },
    maincontainer:{
      width: ScreenWidth,
      backgroundColor:"white",
      height:ScreenHeight*1,
      marginTop:130,
      borderTopStartRadius:50,   
         borderTopEndRadius:50,
         position:"relative"

    },
    itemContainer: {
      borderBottomColor: colors.line,
      borderBottomWidth: ScreenWidth * 0.002,
      marginBottom: ScreenWidth * 0.04,
    },

    itemTitle: {
paddingBottom:5,
      fontSize: ScreenWidth * 0.037,
      color:"black",
      fontWeight:"600" 
    },
    itemTitles: {
      paddingBottom: 12,
      fontSize: ScreenWidth * 0.037,
      color:"black",
      fontWeight:"600" 
    },
    overlay:{
      // ...StyleSheet.absoluteFillObject, // Covers the entire screen
      backgroundColor: "white", 
     
bottom:0, right:ScreenWidth*0.28,position:"absolute" , padding:7, borderRadius:50,
    }
,
    itemValue: {
     marginBottom:10,
      fontSize: ScreenWidth * 0.042, 
      
      color:"black",
    borderBottomWidth:1,
    paddingBottom:8,
    borderBottomColor:"black"
    },

  });
};
