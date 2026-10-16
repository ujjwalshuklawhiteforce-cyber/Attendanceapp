// NO_MLKIT=1 set karne par iOS pe face-detection autolink nahi hoga
// (simulator build ke liye). Real device build ke liye NO_MLKIT ke bina pod install karo.
const noMlkit = process.env.NO_MLKIT === '1';

module.exports = {
  assets: ["./src/assets/fonts"],
  dependencies: {
    '@react-native-ml-kit/face-detection': noMlkit
      ? { platforms: { ios: null } }
      : {},
  },
};