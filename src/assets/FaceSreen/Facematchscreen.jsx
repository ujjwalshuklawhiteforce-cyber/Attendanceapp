import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
//import loadModel from '../embeddings/loadModal';
// import getImageEmbedding from '../embeddings/getImageEmbedding';
// import cosineSimilarity from '../embeddings/cosineSimilarity';
import cosineSimilarity from 'FaceEmbading/Cosinesimilarity';
import getImageEmbedding from 'FaceEmbading/GetimageEmbading';
import ImagePicker from 'react-native-image-crop-picker';
import Theme from 'FaceEmbading/Theme';
// import { BottomNavAdd, XIcon } from '../Svgs/SvgIcons';
import { BottomNavAdd,XIcon } from 'assets/Svg/svg';
import FaceCaptureModal from 'Facematching/CameraOverlay';
export default function EmbeddingScreen({ navigation}) 
{
  const [similarity, setSimilarity] = useState(null);
  const [image1, setImage1] = useState(null);
  const [showFaceModal1, setShowFaceModal1] = useState(false);
  const [image2, setImage2] = useState(null);
  const [showFaceModal2, setShowFaceModal2] = useState(false);
  const [imageMain, setImageMain] = useState(null);
  const [showFaceModalMain, setShowFaceModalMain] = useState(false);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    if(!image1 || !image2 || imageMain)
    {
      setSimilarity(null);
      setError(null);
    }
  },[image1, image2, imageMain])

  async function getEmbedding() 
  {
    try 
    {
      const embedding1 = await getImageEmbedding(image1.uri);
      const embedding2 = await getImageEmbedding(image2.uri);
      const embeddingMain = await getImageEmbedding(imageMain.uri);

      const sim1 = cosineSimilarity(embedding1, embeddingMain);
      const sim2 = cosineSimilarity(embedding2, embeddingMain);

      console.log('Similarity 1:', sim1 * 100);
      console.log('Similarity 2:', sim2 * 100);

      const averageSim = (sim1 + sim2) / 2;
      setSimilarity((averageSim * 100).toFixed(2));
      console.log('Average Similarity:', averageSim * 100);
      setLoading(false);
    } 
    catch(error) 
    {
      console.log(error);
    }
  }

  function interpretSimilarity(similarity) 
  {
    if (similarity >= 91.5) 
    {
      return { result: 1, message: "Same Person", color: "green" }
    } 
    else if (similarity < 91) 
    {
      return { result: -1, message: "Different Person", color: "red" }
    } 
    else 
    {
      return { result: 0, message: "Not Sure", color: "blue" }
    }
  }

  return (
    <>
    {showFaceModal1 && <FaceCaptureModal onCapture={(image) => { setImage1(image); setShowFaceModal1(false); }} />}
    {showFaceModal2 && <FaceCaptureModal onCapture={(image) => { setImage2(image); setShowFaceModal2(false); }} />}
    {showFaceModalMain && <FaceCaptureModal onCapture={(image) => { setImageMain(image); setShowFaceModalMain(false); }} />}
    <View style={{ flex: 1, alignItems: 'center', padding: 30, paddingTop: 50, position: "relative" }}>
       
      {/*<Text>Model Loaded: {modelLoaded ? '✅' : '❌'}</Text>*/}
      <Text style={styles.title}>Take 2 Reference Photos:</Text>
      <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", gap: 20}}>
          <TouchableOpacity style={styles.button} onPress={()=>{ setShowFaceModal1(true); }}>
            {
              image1 && 
              <TouchableOpacity style={styles.cutButton} onPress={()=>{ setImage1(null); }}>
                <XIcon height={20} width={20} color={Theme.colors.white} />
              </TouchableOpacity>
            }
            {!image1 && <BottomNavAdd height={20} width={20} color={Theme.colors.black0} />}
            {(image1 && image1.uri) && <View style={{height: 120, width: 120, borderRadius: 4, borderWidth: 2, borderColor: Theme.colors.black0, overflow:"hidden", justifyContent:"center", alignItems:"center"}}><Image key={image1.uri} source={{ uri: image1.uri }} resizeMode='contain' style={styles.image} /></View>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={()=>{ setShowFaceModal2(true); }}>
            {
              image2 && 
              <TouchableOpacity style={styles.cutButton} onPress={()=>{ setImage2(null); }}>
                <XIcon height={20} width={20} color={Theme.colors.white} />
              </TouchableOpacity>
            }
            {!image2 && <BottomNavAdd height={20} width={20} color={Theme.colors.black0} />}
            {(image2 && image2.uri) && <View style={{height: 120, width: 120, borderRadius: 4, borderWidth: 2, borderColor: Theme.colors.black0, overflow:"hidden", justifyContent:"center", alignItems:"center"}}><Image key={image2.uri} source={{ uri: image2.uri }} resizeMode='contain' style={styles.image} /></View>}
          </TouchableOpacity>
      </View>

      <Text style={styles.title}>Take Main Photo:</Text>
      <TouchableOpacity style={styles.button} onPress={()=>{ setShowFaceModalMain(true); }}>
        {
          imageMain && 
          <TouchableOpacity style={styles.cutButton} onPress={()=>{ setImageMain(null); }}>
            <XIcon height={20} width={20} color={Theme.colors.white} />
          </TouchableOpacity>
        }
        {!imageMain && <BottomNavAdd height={20} width={20} color={Theme.colors.black0} />}
        {(imageMain && imageMain.uri) && <View style={{height: 120, width: 120, borderRadius: 4, borderWidth: 2, borderColor: Theme.colors.black0, overflow:"hidden", justifyContent:"center", alignItems:"center"}}><Image key={imageMain.uri} source={{ uri: imageMain.uri }} resizeMode='contain' style={styles.image} /></View>}
      </TouchableOpacity>
      <TouchableOpacity style={{paddingVertical: 10, paddingHorizontal: 40, borderRadius: 4, backgroundColor: Theme.colors.primary, marginTop: 30}} onPress={()=>{ if(!image1 || !image2 || !imageMain){ setError("Please take 3 photos"); } else{ setLoading(true); getEmbedding(); } }}>
        <Text style={{color: Theme.colors.white, fontFamily: Theme.fonts.DMSans_Bold18, fontSize: 14}}>Start</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Result:</Text>

      
      {(error && error.length > 0) && <Text style={{ color: 'red' }}>{error}</Text>}
      {loading && <ActivityIndicator size="large" color={Theme.colors.black0} />}
      {(similarity && !loading) && <Text style={[styles.title, { color: interpretSimilarity(similarity).color , textAlign:"center", marginVertical: 0 }]}>{interpretSimilarity(similarity).message}</Text>}
     
    </View>

    </>
  );
}

const styles = StyleSheet.create({
  button:{
    height: 120,
    width: 120,
    borderRadius: 4,
    backgroundColor: Theme.colors.white,
    borderColor: Theme.colors.black0,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent:"center",
    alignItems:"center",
    position:"relative",
  },
  cutButton:{
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.primary,
    justifyContent:"center",
    alignItems:"center",
    position:"absolute",
    top: -15,
    right: -15,
    zIndex: 999
  },
  title:{
    marginVertical: 30,
    width: "100%",
    fontFamily: Theme.fonts.DMSans_Bold18,
    fontSize: 16,
  },
  image:{
    height: 120,
    width: 120,
    backgroundColor: Theme.colors.black0  
  }
});