import React, { useState } from 'react';
import { View, Image, Alert, TouchableOpacity, Modal } from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { ScreenWidth } from '@freakycoder/react-native-helpers';
import { Text } from '@rneui/base';
import ImageCropPicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileViewScreen = () => {
  const { logout, userInfo, login } = useAuth();
  const [base64Image, setBase64Image]         = useState(null);
  const [imageURI, setImageURI]               = useState(null);
  const [dob, setdob]                         = useState();
  const [panid, setpanid]                     = useState('');
  const [uid, setuid]                         = useState();
  const [statuss, setstatus]                  = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false); // 👈 new

  const parseData    = JSON.parse(userInfo ? userInfo : '{}');
  const imagesource  = parseData.data?.data?.image;
  const userid       = parseData.data?.data?.user_id;
  const navigation   = useNavigation();

  const profileimage = parseData['data'].image ? parseData['data'].image : imagesource;
  const pandata      = parseData['data'].image ? parseData['data'].pan_no : '';
  const uiddata      = parseData['data'].image ? parseData['data'].uid_no : '';
  const dobdata      = parseData['data'].image ? parseData['data'].date_of_birth : '';

  const profileScreen = () => navigation.navigate('HOME');

  const selectAndCropImage = async () => {
    const savedData = await AsyncStorage.getItem('teamMemberDetails');
    if (savedData) {
      const { dateOfBirth, uidNo, panNo } = JSON.parse(savedData);
      setpanid(panNo);
      setuid(uidNo);
      setdob(dateOfBirth);
    }
    try {
      const image = await ImageCropPicker.openPicker({ mediaType: 'photo', cropping: true });
      setImageURI(image.path);
      RNFS.readFile(image.path, 'base64')
        .then(base64String => setBase64Image(base64String))
        .catch(error => {
          console.error('Error converting to Base64:', error);
          Alert.alert('Error', 'Failed to convert image to Base64.');
        });
    } catch (error) {
      if (!error.message.includes('cancelled')) {
        Alert.alert('Error', 'Failed to select or crop image.');
      }
    }
  };

  const postToApi = async () => {
    const payload = {
      user_id:       parseData['data'].user_id || userid,
      date_of_birth: dob   ? dob   : dobdata,
      uid_no:        uid   ? uid   : uiddata,
      pan_no:        panid ? panid : pandata,
      image:         base64Image,
    };
    try {
      const response = await axios.post(
        'https://whiteforcepayroll.com/admin/api/edit-profile',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      login(response);
      setstatus(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to post data to the API.');
    }
  };

  const activeImage = imageURI || profileimage;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>

      {/* ── Top Bar ── */}
      <View style={{
        position: 'absolute', top: 60, left: 10,
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', width: '100%',
      }}>
        <View style={{ flexDirection: 'row', gap: 70, alignItems: 'center' }}>
          <TouchableOpacity onPress={profileScreen}>
            <Image style={{ width: 20, height: 20 }} source={require('../../../assets/camera/left-arrow.png')} />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20 }}>Profile Picture</Text>
        </View>
        <TouchableOpacity onPress={selectAndCropImage}>
          <Image style={{ width: 20, height: 20, marginRight: 40 }} source={require('../../../assets/camera/edit.png')} />
        </TouchableOpacity>
      </View>

      {/* ── Tappable Profile Image ── */}
      <TouchableOpacity activeOpacity={0.85} onPress={() => setImageViewerVisible(true)}>
        <Image
          resizeMode="cover"
          source={{ uri: activeImage }}
          style={{ width: ScreenWidth * 0.94, height: ScreenWidth * 0.94 }}
        />
      </TouchableOpacity>

      {/* ── Zoom Image Viewer Modal ── */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={[{ url: activeImage }]}
          enableSwipeDown
          onSwipeDown={() => setImageViewerVisible(false)}
          onCancel={() => setImageViewerVisible(false)}
          backgroundColor="rgba(0,0,0,0.97)"
          renderHeader={() => (
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              style={{ position: 'absolute', top: 50, right: 20, zIndex: 999 }}
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          renderIndicator={() => null}
        />
      </Modal>

      {/* ── Cancel / Done Buttons ── */}
      {imageURI && (
        <View style={{
          display: statuss ? 'none' : 'flex',
          gap: 200, flexDirection: 'row',
          position: 'absolute', bottom: 50,
        }}>
          <TouchableOpacity onPress={() => setImageURI('')}>
            <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={postToApi}>
            <Text style={{ color: 'white', fontSize: 20 }}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileViewScreen;