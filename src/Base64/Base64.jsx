/*import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

const { ImageProcessor } = NativeModules;

export default async function imageToFloatRGB(image) 
{
  try 
  {
    const destPath = `${RNFS.DocumentDirectoryPath}/temp_image.jpg`;
    await RNFS.copyFile(image.path, destPath);

    const floatArrayJS = await ImageProcessor.getFloatRGB(destPath);
    console.log('Got Float RGB array of length:', floatArrayJS.length);

    return floatArrayJS;
  } 
  catch(err) 
  {
    console.error('Failed to get Float RGB array:', err);
    throw err;
  }
}*/

import RNFS from 'react-native-fs';

export default async function imageToFilePath(image) 
{
  try 
  {
    const destPath = `${RNFS.DocumentDirectoryPath}/temp_image.jpg`;
    await RNFS.copyFile(image.path, destPath);

    return destPath;
  } 
  catch(err) 
  {
    console.error('Failed to get Float RGB array:', err);
    throw err;
  }
}