/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import ImageResizer from 'react-native-image-resizer';
import axios from 'axios';
import Orientation from 'react-native-orientation-locker';
import {
  Pressable,
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  GestureResponderEvent,
  Platform,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
  Alert,
  Linking,
  StatusBar
} from 'react-native';
import LottieView from 'lottie-react-native';
import {
  Camera,
  CameraProps as VisionCameraProps,
  PhotoFile,
  Point,
  RecordVideoOptions as VisionRecordVideoOptions,
  TakePhotoOptions as VisionTakePhotoOptions,
  VideoFile,
  useCameraDevice,
} from 'react-native-vision-camera';

// import { ImageEditor, ImageStore, Image } from 'react-native';
import { useAuth } from 'context/AuthContext';

import {
  CameraRoll,
  PhotoIdentifier,
  PhotoIdentifiersPage,
} from '@react-native-camera-roll/camera-roll';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import {
  getCameraPermission,
  getMicrophonePermission,
  getPhotoPermission,
  getStorageOrLibraryPermission,
  getVideoPermission,
} from '@services/event-emitter/permission';

import {Media} from '@services/event-emitter/media';

import RNFS from "react-native-fs";
import data from '../../../data/data';
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers';
const white = 'white';
const yellow = 'yellow';
const black = 'black';

interface CameraProps
  extends Omit<
    VisionCameraProps,
    'device' | 'isActive' | 'photo' | 'video' | 'audio'
  > {
  isActive?: boolean;
}

type RecordVideoOptions = Pick<VisionRecordVideoOptions, 'flash'>;

type TakePhotoOptions = Omit<VisionTakePhotoOptions, 'flash'>;

interface AwesomeCameraProps {
  setIsOpen: Function;
  getData: (data: (PhotoIdentifier | PhotoFile | VideoFile)[]) => void;
  
  themeColor?: string;
  secondaryColor?: string;
  cameraProps?: CameraProps;
  multiSelect?: boolean;
  takePhotoOptions?: TakePhotoOptions;
  recordVideoOptions?: RecordVideoOptions;
  showGallery?: boolean;
  photo?: boolean;
  video?: boolean;
  closeContainerStyle?: StyleProp<ViewStyle>;
  closeIconStyle?: StyleProp<ImageStyle>;
  closeIcon?: ImageSourcePropType;
  renderCloseComponent?: () => React.ReactComponentElement<any>;
  videoContainerStyle?: StyleProp<ViewStyle>;
  videoIconStyle?: StyleProp<ImageStyle>;
  videoIcon?: ImageSourcePropType;
  renderVideoComponent?: () => React.ReactComponentElement<any>;
  flashContainerStyle?: StyleProp<ViewStyle>;
  flashIconStyle?: StyleProp<ImageStyle>;
  flashIcon?: ImageSourcePropType;
  renderFlashComponent?: () => React.ReactComponentElement<any>;
  changeCameraContainerStyle?: StyleProp<ViewStyle>;
  changeCameraIconStyle?: StyleProp<ImageStyle>;
  changeCameraIcon?: ImageSourcePropType;
  renderChangeCameraComponent?: () => React.ReactComponentElement<any>;
  onChange?:(arg:boolean,ar:string)=>void
  onLoading?:(arg:boolean)=>void
}

const AwesomeCamera = (props: AwesomeCameraProps) => {
  const {
    setIsOpen,
    getData,
    cameraProps,
    themeColor = yellow,
    secondaryColor = black,
    multiSelect = true,
    takePhotoOptions,
    recordVideoOptions,
    showGallery = true,
    photo = true,
    video = true,
    closeContainerStyle,
    closeIconStyle,
    closeIcon,
    renderCloseComponent,
    videoContainerStyle,
    videoIconStyle,
    videoIcon,
    renderVideoComponent,
    flashContainerStyle,
    flashIconStyle,
    flashIcon,
    renderFlashComponent,
    changeCameraContainerStyle,
    changeCameraIconStyle,
    changeCameraIcon,
    renderChangeCameraComponent,
    onChange,
    onLoading
  } = props;

  const {
    photoButton,
    bottomOuter,
    videoStyle,
    imageStyle,
    bottomInner,
    flashStyle,
    changeCamStyle,
    isVideoStyle,
    flexDirection,
    borderWidth,
    closeButtonStyle,
    focus,
    centerText,
  } = styles;
  const [base64String, setBase64String] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTorch, setIsTorch] = useState<boolean>(false);
  const [hasStoragePermission, setHasStoragePermission] =
    useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] =
    useState<boolean>(false);
  const [photos, setPhotos] = useState<PhotoIdentifiersPage>();
  const [selectedImage, setSelectedImage] = useState<
    (PhotoFile | VideoFile | PhotoIdentifier)[]
  >([]);
  const [media, setMedia] = useState<(PhotoFile | VideoFile)[]>([]);
  const [focused, setFocused] = useState<Point>();
  const [frontCamera, setIsFrontCamera] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image,setimage]=useState <string>()
  const { userInfo,} = useAuth();

  const getIsPhotos = () => {
    let isPhoto = true;
    if (photo && video) {
      isPhoto = true;
    } else if (video) {
      isPhoto = false;
    } else if (photo) {
      isPhoto = true;
    }
    return isPhoto;
  };

  const [isPhotos, setIsPhotos] = useState<boolean>(getIsPhotos());

  const backCameraDevice = useCameraDevice('front');
  const frontCameraDevice = useCameraDevice('back');
  const camera = useRef<Camera>(null);

  useEffect(() => {
    managePermissions();
      Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    if (hasStoragePermission) {
      getPhotosDetails();
    }
  }, [hasStoragePermission]);

  useEffect(() => {
    if (frontCameraDevice === undefined || backCameraDevice === undefined) {
      Alert.alert('No Camera Found.', 'Please check your device.', [
        {text: 'OK', onPress: () => setIsOpen(false)},
       
      ]);

    }
  }, [frontCameraDevice, backCameraDevice]);
  // checking api
  const parseData = JSON.parse(userInfo ? userInfo : {});
  const parse=parseData.data?.data?.image;
  const parsedata= parseData["data"].image
    const imagesource=parsedata?parsedata:parse;
  // Example image URLs
// Image 1 URL
  // const image2 = imagesource; // Image 2 URL
// python api logic  on there .............
  // const handleCompare = async (localImagePath: string) => {
  //   onLoading && onLoading(true)
  //   try {
  //     const imageBase64 = await RNFS.readFile(localImagePath, "base64");
  
      
  
  //     const requestData = {
  //       stored_images: [`${imageBase64}`, `${imageBase64}`, `${imageBase64}`],
  //       clicked_image:imageBase64,
  //     };

  
  //     console.log("Payload sent to API:", JSON.stringify(imageBase64));

  //     const response = await axios.post("https://happyhire.co.in/match_faces", requestData, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  // onLoading && onLoading(false)
  //     console.log("Face Match Result:", response.data,response.status);
  //      if(response.data.match_found===true){
  //       onChange && onChange(true)
  //      }
  //      else{
  //       onChange && onChange(false)
  //      }
  //   } catch (error) {
  //     if (error.response) {
  //       console.error(
  //         "Face Match API Error:",
  //         error.response.status,
  //         error.response.data
  //       );
      
  //     } else if (error.request) {
  //       console.error("No response received from Face Match API:", error.request);
  //     } else {
  //       console.error("Error in Face Match API Request:", error.message);
  //     }
  //   }
  // };
  // python api logic  end on there .............
  
  const handleCompare = async (localImagePath: string) => {
  
    // const imageUrl=imagesource;
    // if (!localImagePath || !imageUrl) {
    //   setError("Please provide valid images.");
    //   console.log("please submit your valid images")
    //   console.log(imagesource)
    //   return;
    // }
  
    // setLoading(true);
    // setError(null);
    // setResult(null); // Clear previous result
    // onLoading && onLoading(true)
    // onLoading && onLoading(false)

    try {
      // Convert the local image path to Base64
      const imageBase64 = await RNFS.readFile(localImagePath, "base64");
      onChange && onChange(true,imageBase64) 
      onLoading && onLoading(true)}
      catch{
        Alert.alert("Error", "unable to capture")
      }
    //   const formData = new FormData();
    //   formData.append("api_key", "hSqAIM5GR9ghV9etZYYMBtUeJyWaNUmi"); // Your Face++ API key
    //   formData.append("api_secret", "n3CTvkK5Bhg6-9p08McGDsjwOENrxv47"); // Your Face++ API secret
    //   formData.append("image_base64_1", imageBase64); // Local image in Base64 format
    //   formData.append("image_url2", imageUrl); // Second image as URL
  
    //   const response = await axios.post(
    //     "https://api-us.faceplusplus.com/facepp/v3/compare",
    //     formData,
    //     { headers: { "Content-Type": "multipart/form-data" } }
    //   );
    //   console.log("imagees",imagesource)

    //   if (response.data && response.data.confidence) {
    //     setResult(response.data); // Update result if valid data is received
    //     const confidence = response.data.confidence;
    //     if (confidence >= 70) {
    //       // Alert.alert("Match", `The faces match with a confidence of `);
    //       onChange && onChange(true,imageBase64)
    //     } else {
    //       // Alert.alert("No Match", "The faces do not match ");
    //       // onChange && onChange(false)
    //       // onChange && onChange(false,imageBase64)
    //     }
    //   } else {
    //     // Alert.alert("No valid result returned from Attendance App.");
    //     // onChange && onChange(false,imageBase64)
    //   }
    // } catch (error) {
    //   // setError("Failed to compare faces. Please try again.");
    //   console.error(error);
    //   // Alert.alert("Error", error.message || "An error occurred");
      
    // } finally {
    //   setLoading(false);
    // }
  };

  // const convertPathToBase64 = async (path: string) => {
  //   try {
  //     const response = await fetch(path);
  //     const blob = await response.blob();

  //     const base64Data = await new Promise<string>((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result as string);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });

  //     setBase64String(base64Data);
     
  //   } catch (error) {
  //     console.error("Error converting path to Base64:", error);
  //   }
  // };
  // const handleCompare = async (localImagePath: string) => {
 
  //   onLoading && onLoading(true);
  //   try {
  //     // const user=userid;
      
  //     const resizedImage = await ImageResizer.createResizedImage(
  //       localImagePath,
  //       100, 
  //       100, 
  //     'PNG',
      
  //       50
  //     );
  // console.log("imagesss",imagesource)
   
  //     const imageBase64 = await RNFS.readFile(resizedImage.uri, "base64");
  
  //     const requestData = {
  //       stored_images: [`${image}`, `${image}`, `${image}`],
  //       clicked_image: imageBase64,
  //     };
  //     // console.log("Payload sent to API:", imageBase64a);
  
  //     const response = await axios.post("https://happyhire.co.in/match_faces", requestData, {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  
  //     onLoading && onLoading(false);
  //     console.log("Face Match Result:", response.data, response.status);
  //     console.log(image)
  
  //     if (response.data.match_found === true) {
  //       onChange &&onChange (true,imageBase64);
  //     } else {
  //       onChange &&onChange(false ,imageBase64);
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       console.error(
  //         "Face Match API Error:",
  //         error.response.status,
  //         error.response.data
  //       );
  //     } else if (error.request) {
  //       console.error("No response received from Face Match API:", error.request);
  //     } else {
  //       console.error("Error in Face Match API Request:", error.message);
  //     }
  //   }
  // };

  const getPhotosDetails = async () => {
    if (showGallery) {
      const items = await CameraRoll.getPhotos({
        first: 20,
        assetType: (photo && video && 'All') || (video && 'Videos') || 'Photos',
      });
      setPhotos(items);
    }
  };

  const managePermissions = async () => {
    try {
      if (showGallery) {
        const isStoragePermission = await getStorageOrLibraryPermission();
        let videoPermission = false;
        let photoPermission = false;
        if (Number(Platform.Version) >= 33) {
          if (photo) {
            photoPermission = await getPhotoPermission();
          }
          if (video) {
            videoPermission = await getVideoPermission();
          }
        }

        setHasStoragePermission(
          (Number(Platform.Version) < 33 && isStoragePermission) ||
            (photo && video && photoPermission && videoPermission) ||
            (photo && !video && photoPermission) ||
            (!photo && video && videoPermission),
        );

        // if (
        //   !(
        //     (Number(Platform.Version) < 33 && isStoragePermission) ||
        //     (photo && video && photoPermission && videoPermission) ||
        //     (photo && !video && photoPermission) ||
        //     (!photo && video && videoPermission)
        //   )
        // ) {
        //   Alert.alert(
        //     'No Storage Permission Found.',
        //     'Please provide storage permission to select images from gallery.',
        //     [
        //       {
        //         text: 'OK',
        //         onPress: () => {
        //           Linking.openSettings();
        //         },
        //       },
        //       {
        //         text: 'Cancel',
        //         onPress: () => {
        //           setIsOpen(false);
        //         },
        //       },
        //     ],
        //   );
        // }
      }
      if (!hasMicrophonePermission && video) {
        const microphonePermission = await getMicrophonePermission();
        setHasMicrophonePermission(microphonePermission);
        if (!microphonePermission) {
          Alert.alert(
            'No Microphone Permission Found.',
            'Please provide microphone permission to use camera.',
            [
              {
                text: 'OK',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  setIsOpen(false);
                },
              },
            ],
          );
        }
      }
      if (!hasCameraPermission) {
        const cameraPermission = await getCameraPermission();
        setHasCameraPermission(cameraPermission);
        if (!cameraPermission) {
          Alert.alert(
            'No Camera Permission Found.',
            'Please provide camera permission to use camera.',
            [
              {
                text: 'OK',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  setIsOpen(false);
                },
              },
            ],
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMorePhotos = async () => {
    try {
      if (photos?.page_info.has_next_page && showGallery) {
        const items = await CameraRoll.getPhotos({
          first: 20,
          assetType:
            (photo && video && 'All') || (video && 'Videos') || 'Photos',
          after: photos?.page_info.end_cursor,
        });
        setPhotos({
          edges: [...photos?.edges, ...items.edges],
          page_info: items.page_info,
        });
      }
    } catch (error) {}
  };

  const takePicture = async () => {
    try {
      if (camera.current && photo) {
        const snapshot = await camera?.current.takePhoto({
          ...takePhotoOptions,
          flash: (isTorch && 'on') || 'off',
        });
      snapshot.path = `file://${snapshot.path}`;
        const newMedia = [snapshot, ...media];
        setMedia(newMedia);

        setSelectedImage([snapshot]);
        checkOut([snapshot])
        if (!multiSelect) {
          setSelectedImage([snapshot]);
        } else {
          setSelectedImage([...selectedImage, snapshot]);
        }
      }
    } catch (e) {
      console.log("fewfwfrw",e);
      console.log("checking imgae",media)
    }
  };
//   const takePicture = async () => {
//     try {
//         if (camera.current && photo) {
//             const snapshot = await camera.current.takePhoto({
//                 ...takePhotoOptions,
//                 flash: isTorch ? 'on' : 'off',
//             });

//             if (snapshot && snapshot.path) {
//                 snapshot.path = `file:///${snapshot.path}`;
//                 const newMedia = [snapshot, ...media];
//                 setMedia(newMedia);

//                 // Check if multiSelect is enabled
//                 setSelectedImage(multiSelect ? [...selectedImage, snapshot] : [snapshot]);
//             } else {
//                 console.log("Snapshot or snapshot.path is undefined", snapshot);
//             }
//         } else {
//             console.log("Camera reference or photo is not defined");
//         }
//     } catch (e) {
//         console.error("Error taking picture:", e);
//         alert("Selected Image State:", selectedImage);
//     }
// };

  const startRecording = () => {
    try {
      if (!video) {
        return;
      }
      if (!hasMicrophonePermission) {
        throw new Error('No Microphone Permission Found.');
      }

      if (camera.current) {
        setIsRecording(true);
        camera.current.startRecording({
          ...recordVideoOptions,
          flash: (isTorch && 'on') || 'off',

          onRecordingFinished: (v: VideoFile) => {
            const newMedia = [v, ...media];
            setMedia(newMedia);

            if (!multiSelect) {
              setSelectedImage([v]);
            } else {
              setSelectedImage([...selectedImage, v]);
            }
          },

          onRecordingError: error => console.error(error),
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
// 
  // const checkOut = () => {
  //   getData(selectedImage);
  //   setIsOpen(false);
  // };
  // const checkOut = () => {
  //   getData(selectedImage); // Call getData first
  //   setTimeout(() => {
  //     setIsOpen(false);
  //  // Call setIsOpen(false) after a small delay
  //   }, 2000); // Delay of 100ms, adjust as needed
  // };

  const checkOut=(selectedImage :any[])=>{
getData(selectedImage)
// handleConvert(selectedImage[0].path)
// handleConvert(selectedImage[0].path)

handleCompare (selectedImage[0].path)
// onChange && onChange(true,selectedImage[0].path)
// setimage(`${`)
//  submitCheckInOut
setIsOpen(false)
// submitCheckInOut()
  }
  const stopRecording = async () => {
    setIsRecording(false);
    if (camera.current && isRecording) {
      await camera.current.stopRecording();
    }
  };

  const onFocus = async (e: GestureResponderEvent) => {
    try {
      if (
        (!frontCamera && backCameraDevice?.supportsFocus) ||
        (frontCamera && frontCameraDevice?.supportsFocus)
      ) {
        e.persist();
        const event = e.nativeEvent;
        let point: Point = {
          x: Math.round(event.pageX - 25),
          y: Math.round(event.pageY - 25),
        };
        setFocused({x: point.x - 25, y: point.y - 25});
        await camera?.current?.focus(point);
      }
    } catch (error: any) {
    } finally {
      setFocused(undefined);
    }
  };

  const onPressItem = (obj: PhotoFile | VideoFile | PhotoIdentifier) => {
    if (multiSelect) {
      let selected = [...selectedImage];
      const index = selected.indexOf(obj);
      (index === -1 && selected.push(obj)) || selected.splice(index, 1);
      setSelectedImage(selected);
    } else {
      setSelectedImage([obj]);
    }
  };

  const onPressChangeCamera = () => {
    setIsFrontCamera(!frontCamera);
    setIsTorch(false);
  };

  const identifyVideo = (obj: VideoFile) => {
    if (obj.duration) {
      return (
        <>
          {(renderVideoComponent !== undefined && renderVideoComponent()) || (
            <View style={[isVideoStyle, videoContainerStyle]}>
              <Image
                source={videoIcon ?? require('@assets/images/camera/video.png')}
                style={[styles.flashIconStyle, videoIconStyle]}
              />
              
            </View>

          )}
        </>
      );
    } else {
      return null;
    }
  };

  // const renderHeader = () => (
  //   <View style={flexDirection}>
  //     {(media.length &&
  //       media.map((obj: PhotoFile | VideoFile, index: number) => {
  //         const isSelected = selectedImage.includes(obj);
  //         return (
  //           <Pressable
  //             style={styles.center}
  //             key={index}
  //             onPress={() => onPressItem(obj)}>
  //             <Image
  //               onError={e => console.log(e)}
  //               source={{uri: `${obj.path}`}}
  //               style={[
  //                 imageStyle,
  //                 borderWidth,
  //                 {borderColor: (isSelected && themeColor) || 'transparent'},
  //               ]}
  //             />
  //             {identifyVideo(obj as VideoFile)}
  //           </Pressable>
  //         );
  //       })) ||
  //       null}
  //   </View>
  // );

  const focusedView = () =>
    focused && <View style={[focus, {top: focused.y, left: focused.x}]} />;

  // const renderItem = ({item}: {item: PhotoIdentifier}) => {
  //   const selectedImages = selectedImage as PhotoIdentifier[];
  //   const index = selectedImages.indexOf(item);
  //   return (
  //     <Media
  //       index={index}
  //       item={item}
  //       onPressItem={onPressItem}
  //       themeColor={themeColor!}
  //       renderVideoComponent={renderVideoComponent}
  //       videoContainerStyle={videoContainerStyle}
  //       videoIcon={videoIcon}
  //       videoIconStyle={videoIconStyle}
  //     />
  //   );
  // };

  const getBottomView = () => {
    return (
      <View style={styles.bottomViewContainer}>
        <Pressable
          onPress={() => setIsPhotos(false)}
          style={[
            styles.videoText,
            {
              backgroundColor: (isPhotos && 'transparent') || themeColor,
            },
          ]}>
          {/* <Text style={styles.blackColor}>{'Video'}</Text> */}
        </Pressable>
        {/* <Pressable
          onPress={() => setIsPhotos(true)}
          style={[
            styles.photoText,
            {
              backgroundColor: (isPhotos && themeColor) || 'transparent',
            },
          ]}>
          <Text style={styles.blackColor}>{'Photo'}</Text>
        </Pressable> */}
      </View>
    );
  };

  if (!hasCameraPermission) {
    return (
      <Pressable style={centerText} onPress={() => setIsOpen(false)}>
        <Text>No Camera Permission Found. Click here to close camera</Text>
      </Pressable>
    );
  }

  return (
    <>

      {(hasCameraPermission &&
        ((frontCamera && frontCameraDevice !== undefined) ||
          backCameraDevice !== undefined) && (
          <Camera
            {...cameraProps}
            ref={camera}
            onError={error => console.log(error)}
            style={[StyleSheet.absoluteFill, cameraProps?.style]}
            device={(frontCamera && frontCameraDevice!) || backCameraDevice!}
            isActive
            photo={photo}
            video={video}
            
          
            focusable
            audio
            enableZoomGesture
          />
        )) ||
        null}

      {(photo && video && (
        <GestureHandlerRootView style={StyleSheet.absoluteFill}>
              <View style={{flex:1,justifyContent:"center",alignItems:"center", width:ScreenHeight*2}} >
            
      </View>
          <PanGestureHandler
            onGestureEvent={e => {
              if (isPhotos && e.nativeEvent.translationX > 0) {
                setIsPhotos(false);
              } else if (!isPhotos && e.nativeEvent.translationX < 0) {
                setIsPhotos(true);
              }
            }}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onTouchEnd={e =>
                (frontCameraDevice?.supportsFocus ||
                  backCameraDevice?.supportsFocus) &&
                onFocus(e)
              }
            />
          </PanGestureHandler>
        </GestureHandlerRootView>
      )) ||
        null}

      <Pressable
        style={[closeButtonStyle, closeContainerStyle]}
        onPress={() => setIsOpen(false)}>
        {(renderCloseComponent !== undefined && renderCloseComponent()) || (
          <Image
            source={closeIcon ?? require('@assets/images/camera/close.png')}
            style={[styles.flashIconStyle, closeIconStyle]}
          />
        )}
      </Pressable>
      

      <View style={bottomOuter}>
        {/* <FlatList
          showsHorizontalScrollIndicator={false}
          data={photos?.edges}
          horizontal
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={getMorePhotos}
        /> */}

        {/* <CheckoutBtn
          selectedImage={selectedImage}
          themeColor={themeColor}
          onPressCheckout={checkOut}
          secondaryColor={secondaryColor}
        /> */}

        <View style={bottomInner}>
          <Pressable
            onPress={() => setIsTorch(prev => !prev)}
            disabled={frontCamera}
            style={[
              flashStyle,
              {backgroundColor: (isTorch && white) || 'transparent'},
              flashContainerStyle,
            ]}>
            {(renderFlashComponent !== undefined && renderFlashComponent()) || (
              <Image
                source={flashIcon ?? require('@assets/images/camera/flash.png')}
                style={[styles.flashIconStyle, flashIconStyle]}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (isPhotos) {
                takePicture();
               
              } else {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }
            }}
            style={photoButton}>
            <View style={isRecording && videoStyle} />
          </Pressable>

          <View>
            <Pressable
            style={[changeCamStyle, changeCameraContainerStyle]}
            onPress={onPressChangeCamera}>
            {(renderChangeCameraComponent !== undefined &&
              renderChangeCameraComponent()) || (
              <Image
                source={changeCameraIcon ?? require('@assets/images/camera/swap.png')}
                style={[styles.changeCameraIconStyle, changeCameraIconStyle]}
              />
            )}
          </Pressable>
          </View>
        </View>

        <View>{(photo && video && getBottomView()) || null}</View>
      </View>

      {focusedView()}
    </>
  );
};

const CheckoutBtn = (props: {
  selectedImage: (PhotoFile | VideoFile | PhotoIdentifier)[];
  themeColor: string;
  secondaryColor: string;
  onPressCheckout: () => void;
}) => {
  const {selectedImage, themeColor, secondaryColor, onPressCheckout} = props;
  const {checkButtonStyle, selectedLength, tick} = styles;

  if (!selectedImage.length) {
    return null;
  }

  return (
    <Pressable
      style={[checkButtonStyle, {backgroundColor: themeColor}]}
      onPress={onPressCheckout}>
      <Text style={[{color: secondaryColor}, selectedLength]}>
        {selectedImage.length}
      </Text>
      <Text style={[{color: secondaryColor}, tick]}>{' ✓'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  photoButton: {
    height: 80,
    width: 80,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStyle: {
    backgroundColor: 'red',
    height: 60,   
    width: 60,
    alignSelf: 'center',
    borderRadius: 30,
  },
  bottomOuter: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
  },
  imageStyle: {
    height: 80,
    width: 80,
    margin: 2,
  },
  bottomInner: {
    flex: 1,
    marginBottom: 7,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flashStyle: {
    borderColor: white,
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeCamStyle: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: -20,
    flexDirection: 'row',
  },
  isVideoStyle: {
    position: 'absolute',
    alignSelf: 'center',
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#ffffff90',
  },
  flexDirection: {flexDirection: 'row'},
  borderWidth: {borderWidth: 1},
  centerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonStyle: {
    top: 50,
    position: 'absolute',
    left: 50,
  },
  focus: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: white,
  },
  center: {justifyContent: 'center', alignItems: 'center'},
  tick: {
    fontSize: 20,
  },
  selectedLength: {
    fontSize: 17,
  },
  changeCameraIconStyle: {
    height: 20,
    width: 20,
    tintColor: 'white',
  },
  flashIconStyle: {
    height: 20,
    width: 20,
  },
  blackColor: {
    color: 'black',
  },
  bottomViewContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 5,
  },
  videoText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  photoText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 5,
    borderRadius: 15,
  },
  centerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AwesomeCamera;