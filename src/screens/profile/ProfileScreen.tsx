import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { Modal, Touchable } from "react-native";
import { Image, ImageBackground, ScrollView, View } from "react-native";
import createStyles from "./ProfileScreen.style";
import { useTheme } from "@react-navigation/native";
import Text from "@shared-components/text-wrapper/TextWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonButton } from "@screens/common/button/CommonButton";
import { useNavigation } from "@react-navigation/native";
import RNBounceable from "@freakycoder/react-native-bounceable";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { ScreenHeight, ScreenWidth } from "@freakycoder/react-native-helpers";
import { useAuth } from "context/AuthContext";
import data from '../../data/data';
import Navigation from "navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Pressable } from "react-native";
import * as NavigationService from 'react-navigation-helpers';
const profileURI =
  "https://images.unsplash.com/photo-1639747280804-dd2d6b3d88ac?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
import AsyncStorage from "@react-native-async-storage/async-storage";
const ProfileScreen: React.FC = () => {
  const { logout, userInfo, isAdmin } = useAuth();
  const navigation = useNavigation();
  const [modal, setmodal] = useState(false)
  const handleNavigateToProfile = () => {
    navigation.navigate('profile'); // 'Profile' should match the name of your profile screen in the navigator
  };
  const handleNavigateToTerms = () => {
    // 'Profile' should match the name of your profile screen in the navigator
    navigation.navigate('privacy'); // 'Profile' should match the name of your profile screen in the navigator
  };
  const handleNavigateToTermss = () => {
    navigation.navigate("terms");
  };
  const profileedit = () => {
    navigation.navigate('profiledit');
  }
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const parseData = JSON.parse(userInfo ? userInfo : {});
  const imagesource = parseData.data?.data?.image;
  const finalImageSource =
    imagesource ??
    parseData?.data?.image ??
    null;

  const name = parseData.data?.data?.name;
  const designation = parseData.data?.data?.designation;
  const [designationss, setdesignationss] = useState()
  const savedData = AsyncStorage.getItem("teamMemberDetails");
  const designations = parseData["data"].designation ? parseData["data"].designation : designation
  const loadDataFromAsyncStorage = async () => {
    try {
      const savedData = await AsyncStorage.getItem("teamMemberDetails");
      if (savedData) {
        const { position, mobileNumber, email, address, supportiveDocs } = JSON.parse(savedData);
        setdesignationss(position)
      }
      else {
        setdesignationss(designations)
      }
    } catch (error) {
      Alert.alert("Error", "There was an issue loading your data.");
    }
  };
  const logoutApp = async () => {
    logout()
  };
  useEffect(() => {
    loadDataFromAsyncStorage()
  })
  const renderArrowButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="chevron-forward-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderProfileButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="person-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderChangePasswordButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="lock-closed-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderTermCondButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="reader-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderRegularisationButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="time-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderLeaveButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="calendar-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderCompOffButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="swap-horizontal-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );
  const allowanceButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="wallet-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const renderPolicyButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="shield-checkmark-outline"
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );
  const renderHelpButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="help-circle-outline"   // 👈 changed to help icon
          type={IconType.Ionicons}
          color={colors.iconBlack}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );


  const renderLogoutButton = () => (
    <RNBounceable>
      <View>
        <Icon
          name="log-out-outline"
          type={IconType.Ionicons}
          color={colors.danger}
          style={styles.dotIcon}
        />
      </View>
    </RNBounceable>
  );

  const profilePicture = () => (
    <View style={styles.profileImageContainer}>
      <View>
        <TouchableOpacity onPress={profileedit}>
          <Image
            resizeMode="cover"
            source={{
              uri:
                finalImageSource ? finalImageSource :
                  "https://t4.ftcdn.net/jpg/11/28/72/75/360_F_1128727502_ce2UdfqSn42Ia48OeSy7a6UBX590HZnJ.jpg"
            }} style={styles.profileImage}
          />
        </TouchableOpacity>


      </View>


    </View>
  );

  const profileHeader = () => (
    <View style={styles.profileHead}>
      {profilePicture()}
      <View style={styles.profileHeaderContent}>
        <Text color={colors.titleSecond} style={styles.profileHeaderTitle}>
          {parseData["data"]?.name ? parseData["data"]?.name : name}
          {/* {parseData.data.data?.name} */}
        </Text>
        <Text color={colors.title} style={styles.profileHeaderSubHead}>
          {designationss}
        </Text>
      </View>
      <CommonButton
        style={""}
        textColor={colors.white}
        customStyle={{ backgroundColor: "rgb(29,91,65)" }}
        text="Edit Profile"
        iconName=""
        onPress={handleNavigateToProfile}
      />
    </View>
  );

  const content = () => (
    <View style={styles.contentContainer}>
      {/* <RNBounceable onPress={handleNavigateToProfile}>
        <View style={styles.mainCard}>
          <View style={styles.mainCardImg}>{renderProfileButton()}</View>
          <View style={styles.mainCardContent}>
            <Text style={styles.cardTitleName} color={colors.titleSecond}>
               Change your Password
            </Text>
          </View>
          <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
        </View>
        <View style={styles.lineHR} />
      </RNBounceable> */}
      {!isAdmin &&
        <RNBounceable onPress={() => { navigation.navigate("Rgularisation") }} >
          <View style={styles.mainCard}>
            <View style={styles.mainCardImg}>{renderRegularisationButton()}</View>
            <View style={styles.mainCardContent}>
              <Text style={styles.cardTitleName} color={colors.titleSecond}>
                Regularisation
              </Text>
            </View>
            <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
          </View>
          <View style={styles.lineHR} />
        </RNBounceable>
      }

      <RNBounceable onPress={() => { navigation.navigate("changepassword") }}>
        <View style={styles.mainCard}>
          <View style={styles.mainCardImg}>{renderChangePasswordButton()}</View>
          <View style={styles.mainCardContent}>
            <Text style={styles.cardTitleName} color={colors.titleSecond}>
              Change Password
            </Text>
          </View>
          <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
        </View>
        <View style={styles.lineHR} />
      </RNBounceable>
      {!isAdmin &&
        <RNBounceable onPress={() => { navigation.navigate("LEAVE") }} >
          <View style={styles.mainCard}>
            <View style={styles.mainCardImg}>{renderLeaveButton()}</View>
            <View style={styles.mainCardContent}>
              <Text style={styles.cardTitleName} color={colors.titleSecond}>
                Apply for Leave
              </Text>
            </View>
            <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
          </View>
          <View style={styles.lineHR} />
        </RNBounceable>
      }
      {!isAdmin &&
        <RNBounceable onPress={() => { navigation.navigate("compoff") }} >
          <View style={styles.mainCard}>
            <View style={styles.mainCardImg}>{renderCompOffButton()}</View>
            <View style={styles.mainCardContent}>
              <Text style={styles.cardTitleName} color={colors.titleSecond}>
                Compensatory Off
              </Text>
            </View>
            <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
          </View>
          <View style={styles.lineHR} />
        </RNBounceable>
      }

      {
        !isAdmin &&
        <RNBounceable onPress={() => { navigation.navigate("ALLOWANCE") }} >
          <View style={styles.mainCard}>
            <View style={styles.mainCardImg}>{allowanceButton()}</View>
            <View style={styles.mainCardContent}>
              <Text style={styles.cardTitleName} color={colors.titleSecond}>
                Apply for Allowance
              </Text>
            </View>
            <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
          </View>
          <View style={styles.lineHR} />
        </RNBounceable>
      }
      <RNBounceable onPress={handleNavigateToTerms}>
        <View style={styles.mainCard}>
          <View style={styles.mainCardImg}>{renderTermCondButton()}</View>
          <View style={styles.mainCardContent}>
            <Text style={styles.cardTitleName} color={colors.titleSecond}>
              Terms & Condition
            </Text>
          </View>
          <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
        </View>
        <View style={styles.lineHR} />
      </RNBounceable>

      <RNBounceable onPress={handleNavigateToTermss} >
        <View style={styles.mainCard}>
          <View style={styles.mainCardImg}>{renderPolicyButton()}</View>
          <View style={styles.mainCardContent}>
            <Text style={styles.cardTitleName} color={colors.titleSecond}>
              Privacy Policy
            </Text>
          </View>
          <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
        </View>
        <View style={styles.lineHR} />
      </RNBounceable>

      {/* <RNBounceable onPress={()=>{navigation.navigate("refrencevideo")}} >
        <View style={styles.mainCard}>
          <View style={styles.mainCardImg}>{renderHelpButton()}</View>
          <View style={styles.mainCardContent}>
            <Text style={styles.cardTitleName} color={colors.titleSecond}>
           Get Help
            </Text>
          </View>
          <View style={styles.mainCardIcon}>{renderArrowButton()}</View>
        </View>
        <View style={styles.lineHR} />
      </RNBounceable> */}
      <RNBounceable onPress={logoutApp}>
        <View style={styles.mainCard}>
          <View style={styles.mainCardImgLogout}>{renderLogoutButton()}</View>
          <View style={styles.mainCardContentLogout}>
            <Text style={[styles.cardTitleName]} color={colors.danger}>
              Log Out
            </Text>
          </View>
        </View>
      </RNBounceable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal}
        onRequestClose={() => setmodal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => { setmodal(false) }}>

          <View style={{}}>
            <Image
              resizeMode="cover"
              source={{ uri: parseData["data"].image ? parseData["data"].image : imagesource }}
              style={styles.profileImages}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {profileHeader()}
      <ScrollView>{content()}</ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
