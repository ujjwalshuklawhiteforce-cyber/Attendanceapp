import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { ExtendedTheme } from "@react-navigation/native";
import fonts from "@fonts";

interface Style {
  container: ViewStyle;
  contentContainer: ViewStyle;
  formContainer: ViewStyle;
  logo: ViewStyle;
  logoSize: ImageStyle;
  headingContainer: ViewStyle;
  heading: TextStyle;
  inputField: ViewStyle;
  legend:TextStyle;
  legendFocused:TextStyle;
  subHeading: TextStyle;
  input: TextStyle;
  inputLabel: TextStyle;
  focusInput: ViewStyle;
  loaderContainer: ViewStyle
  blurInput: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  disabledButton: ViewStyle;
  forgetPass: ViewStyle;
  forgetPassText: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalImageContainer: ViewStyle;
  modalImageregister:ViewStyle;
  modalHeadingContainerregister:ViewStyle
  modalImage: ImageStyle;
  modalHeading: TextStyle;
  modalHeadingContainer: ViewStyle;
  modalSubHeading: TextStyle;
  modalButtonContainer: ViewStyle;
  modalContentregister:ViewStyle;
  modalContainerregister1:ViewStyle;
  modalButton: ViewStyle;
  modalImageContainerregister:ViewStyle;
  modalButtonregister:ViewStyle;
  cameraContainer: ViewStyle;
  camera: ViewStyle;
  buttonContainer: ViewStyle;

  camImageContainer: ViewStyle;
  camImage: ImageStyle;
  camButton: ViewStyle;
  camBackButton: ViewStyle;
  camButtonContainer: ViewStyle;
  camButtons: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      alignItems: "flex-start",
      // backgroundColor: colors.white,
      // padding: ScreenWidth * 0.06,
    
//  backgroundColor:"rgb(29,91,65)",
width:ScreenWidth*1,
height:ScreenHeight*1

},

    contentContainer: {
     
    },

    logo: {
      width: ScreenWidth * 0.2,
      height: ScreenWidth * 0.2,
    
    },

    logoSize: {
      width: ScreenWidth * 0.2,
      height: ScreenWidth * 0.2,
    
    },

    headingContainer: {
      // marginTop: ScreenWidth * 0.06,
      width: ScreenWidth * 1,
      height:ScreenHeight*0.29, justifyContent:"center",
      alignItems:"center"
     
    },

    heading: {
      fontFamily: fonts.lexend.medium,
      fontSize: ScreenWidth * 0.08,
      letterSpacing: 0.6,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999, // Makes sure the loader appears above all content
    },

    subHeading: {
      marginTop: ScreenWidth * 0.02,
      letterSpacing: 0.4,
      fontSize: ScreenWidth * 0.036,
    },

    formContainer: {
      marginTop: ScreenWidth * 0.1,
      // height:ScreenHeight*0.5,
      // backgroundColor:"green",
      width:ScreenWidth*1,
      justifyContent:"center",
      display:"flex",
      alignItems:"center"

    },

    inputField: {
      position: "relative",
      marginBottom: ScreenWidth * 0.04,
      // width:ScreenWidth*0.1,
      
    },

    inputLabel: {
      position: "absolute",
      left: 0,
      paddingHorizontal: ScreenWidth * 0.04,
      paddingVertical: ScreenWidth * 0.03,
      fontSize: ScreenWidth * 0.028,
      
      
    },

    input: {
      margin: 10,
      width: ScreenWidth * 0.72,
    
    position:"relative",
      // height: ScreenWidth * 0.14,
      borderWidth: ScreenWidth * 0.003,
      borderRadius: ScreenWidth * 0.08,
      fontSize: ScreenWidth * 0.039,
      paddingHorizontal: ScreenWidth * 0.04,
      // paddingTop: ScreenWidth * 0.062,
      // zIndex: 99,
      color:"black",
      height:ScreenHeight*0.052,
    },

    blurInput: {
      borderColor: colors.black,
    },
    legend: {
      // position: 'absolute',
      // top: 15,
      // left: 10,
      // fontSize: 18, 
      // // fontWeight:"bold",
      // color: '#aaa',
      // zIndex: 1,
      // transition: 'all 0.3s ease',
    },
    legendFocused: {
      top: -6,
      position:"absolute",
      left: 50,
      fontSize:14,
      //  fontWeight:"bold",
      color: '#1D5B41',
      backgroundColor:"white",
      padding:3,
      zIndex:1,
    },
    focusInput: {
      borderColor: "rgb(29,91,65)",
    },
    validInput: {},
    invalidInput: {},

    button: {
      // marginTop: 30,
      // backgroundColor: colors.primary,
       backgroundColor:"rgb(29,91,65)",
      paddingVertical: ScreenWidth * 0.03,
      paddingHorizontal: ScreenWidth * 0.3,
      borderRadius: 30,
      alignItems: "center",
    },
    

    buttonText: {
      fontSize: ScreenWidth * 0.042,
     color:"white"
    },
    disabledButton: {
      backgroundColor: colors.primary,
      paddingVertical: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.06,
      borderRadius: 10,
      alignItems: "center",
      opacity: 0.6,
    },

    forgetPass: {
      alignItems: "center",
      marginBottom: ScreenWidth * 0.06,
    },

    forgetPassText: {
      fontSize: ScreenWidth * 0.034, 
        color:"rgb(29,91,65)",
    },

    modalContainer: {
      width: ScreenWidth,
      height: ScreenHeight,
      backgroundColor: colors.blackOverlay,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    modalContainerregister: {
      // backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 1,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      alignItems: "center",
      justifyContent: "center",
    },
    modalContainerregister1: {
      // backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 1,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      alignItems: "center",
      justifyContent: "center",
    },
    modalContent: {
      backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 0.5,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      alignItems: "center",
      justifyContent: "center",
    },
    modalContentregister: {
      // backgroundColor: colors.white,
      width: ScreenWidth,
      height: ScreenHeight * 0.5,
      borderTopLeftRadius: ScreenWidth * 0.06,
      borderTopRightRadius: ScreenWidth * 0.06,
      alignItems: "center",
      justifyContent: "center",
      gap:30
    },
    modalImageContainer: {
      width: ScreenWidth * 0.3,
      height: ScreenWidth * 0.5,
      // backgroundColor: colors.lightGray,
    },
  
    modalImageContainerregister: {
      width: ScreenWidth * 1,
      height: ScreenWidth * 0.5,
      display:"flex",
      alignItems:"center",
      // backgroundColor: colors.lightGray,
      borderRadius: 100,
    },
    modalImage: {
      width: ScreenWidth * 0.3,
      height: ScreenWidth * 0.5,
      borderRadius: 100,
      flex: 1,
    },
    modalImageregister: {
      width: ScreenWidth * 0.3,
      height: ScreenWidth * 0.3,
      borderRadius: 100,
      flex: 1,
    },

    modalHeading: {
      fontFamily: fonts.lexend.medium,
      fontSize: ScreenWidth * 0.06,
      letterSpacing: 0.6,
      color:"rgb(29,91,65)"
    },

    modalHeadingContainer: {
      marginTop: ScreenWidth * 0.06,
      width: ScreenWidth,
      alignContent: "center",
      alignItems: "center",
    },
    modalHeadingContainerregister: {
      marginTop: ScreenWidth * 0.06,
      width: ScreenWidth,
      alignContent: "center",
      alignItems: "center",
    },
    modalSubHeading: {
      marginTop: ScreenWidth * 0.02,
      letterSpacing: 0.4,
      fontSize: ScreenWidth * 0.036,
      alignItems: "center",
      textAlign: "center",
    },

    modalButtonContainer: {
      marginTop: ScreenWidth * 0.06,
    },

    modalButton: {
      width: ScreenWidth * 0.8,
      backgroundColor: "rgb(29,91,65)",
      paddingVertical: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.06,
      borderRadius: 10,
      alignItems: "center",
    },
    modalButtonregister:{
      width: ScreenWidth * 0.8,
      backgroundColor: "white",
      paddingVertical: ScreenWidth * 0.04,
      paddingHorizontal: ScreenWidth * 0.06,
      borderRadius: 10,
      alignItems: "center",
    },
    camera: {
      position: "absolute",
      width: ScreenWidth,
      height: ScreenHeight,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },

    buttonContainer: {
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      width: ScreenWidth,
      bottom: ScreenHeight * 0.02,
      padding: 20,
      zIndex: 9999,
    },

    camButton: {
      height: 80,
      width: 80,
      borderRadius: 40,
      //ADD backgroundColor COLOR GREY
      backgroundColor: "#B2BEB5",

      alignSelf: "center",
      borderWidth: 4,
      borderColor: "white",
      zIndex: 9999,
    },

    cameraContainer: {
      position: "absolute",
      top: 0,
      right: 0,
      width: ScreenWidth,
      height: ScreenHeight,
      zIndex: 9,
    },

    camBackButton: {
      backgroundColor: "rgba(0,0,0,0.0)",
      position: "absolute",
      justifyContent: "center",
      width: ScreenWidth,
      top: 0,
      padding: 20,
    },
    camButtonContainer: {
      backgroundColor: "rgba(0,0,0,0.2)",
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      width: ScreenWidth,
      bottom: 0,
      padding: 20,
    },
    camButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: ScreenWidth,
    },

    camImageContainer: {
      position: "relative",
      flex: 1,
      width: ScreenWidth,
      height: ScreenHeight,
      aspectRatio: 9 / 16,
      zIndex: 99,
    },

    camImage: {
      width: ScreenWidth,
      height: ScreenHeight,
      aspectRatio: 9 / 16,
    },
    // ////
    
  });
};
