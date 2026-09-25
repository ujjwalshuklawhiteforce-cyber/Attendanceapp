import { getApiThirdParty } from "./api.service";

export const capitalizeEachWord = (str: any) =>
  str.replace(/\b\w/g, (char: any) => char.toUpperCase());

export const getLocationName = async (latitude: any, longitude: any) => {
  try {
    const response: any = await getApiThirdParty(
      // `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=6651be68828d6665858162jul22d676`
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=API_KEY`
    );

    if (response) {
      return response?.["results"]?.[1]?.["address_components"];
    }

    return "Unknown location";
  } catch (error) {
    console.error(error);
    return "Error fetching location name";
  }
};
