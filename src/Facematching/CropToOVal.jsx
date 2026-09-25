import { Image } from "react-native";
import ImageEditor from "@react-native-community/image-editor";

export default async function cropToOval(uri, faceBounds, isFrontCamera = false) {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, async (realWidth, realHeight) => {
      try {
        let { left: x, top: y, width: w, height: h } = faceBounds.frame;

        // optional: nudge crop right or down if you want
        const nudgeX = 690; // + moves right, - moves left
        const nudgeY = -310;  // + moves down, - moves up

        x += nudgeX;
        y += nudgeY;

        w = w + 40;
        h = h + 540;

        const cropData = {
          offset: { x, y },
          size: { width: w, height: h },
          displaySize: { width: w, height: h },
          resizeMode: "contain",
        };

        const croppedUri = await ImageEditor.cropImage(uri, cropData);
        resolve(croppedUri);
      } catch (err) {
        reject(err);
      }
    }, reject);
  });
}