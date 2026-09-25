// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import Video from 'react-native-video';

// const VideoPlayer = () => {
//   return (
//     <View style={styles.container}>
//       <Video
//         source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }} // online video URL
//         style={styles.video}
//         controls={true} // shows play/pause and seek bar
//         resizeMode="contain" // adjust the aspect ratio
//         paused={false} // autoplay on load
//           onError={(error) => console.log('Video Error:', error)}
//         onLoadStart={() => console.log('Loading video...')}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   video: {
//     flex: 1,
//   },
// });

// export default VideoPlayer;
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = () => {
  return (
    <View style={styles.container}>
      <Video
        // source={{
        //   uri: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        // }}
         source={require('../../../../../assets/camera/video.mp4')} 
        style={styles.video}
        controls
        resizeMode="contain"
        paused={false}
        useTextureView={false} // ✅ important for Android
        onError={(e) => console.log('Video Error:', e)}
        onLoadStart={() => console.log('Loading video...')}
        onLoad={(data) => console.log('Video loaded ✅', data)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
    backgroundColor: 'black',
    zIndex: 1,
    elevation: 1,
  },
});

export default VideoPlayer;
