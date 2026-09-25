import { Alert } from "react-native";
import DeviceInfo from "react-native-device-info";

// 🔁 Compare versions safely
const compareVersions = (v1, v2) => {
  const a = v1.split(".").map(Number);
  const b = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const num1 = a[i] || 0;
    const num2 = b[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

const VERSION_API =
  "https://whiteforcepayroll.com/admin/api/get-app-version";
 
export const checkForceUpdate = async () => {
  try {
    const currentVersion = DeviceInfo.getVersion(); // e.g. "1.3.5"

    const response = await fetch(VERSION_API);

    if (!response.ok) {
      console.warn("Version API failed:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("Version API response:", data);

    const MIN_VERSION = `${data?.data}`; // ✅ FIX HERE
        // const MIN_VERSION = `1.5.7`; // ✅ FIX HERE

console.log("wdd", MIN_VERSION)
    if (!MIN_VERSION) {
      console.warn("App version missing in API");
      return false;
    }

    // 🔴 TRUE → force update required
    return compareVersions(currentVersion, MIN_VERSION) < 0;
  } catch (error) {
    console.log("Version check failed:", error);
    return false;
  }
};
