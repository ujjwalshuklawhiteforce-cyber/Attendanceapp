import { URLS } from "@shared-constants";
import axios from "axios";

/**
 * A common function to make POST API calls using Axios.
 * @param {string} url - The URL to make the POST request to.
 * @param {Object} data - The data to be sent in the POST request.
 * @param {Object} [headers={}] - Optional headers to be sent in the request.
 * @returns {Promise<Object>} - A promise that resolves to the response data.
 */
export const postApi = async (
  url: string,
  data: object,
  headers: object = {}
): Promise<object> => {
  try {
    console.log(data);
    const response = await axios.post(URLS.baseURL + url, data);
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
    throw error;
  }
};

export const getApiThirdParty = async (
  url: string,
): Promise<object> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
    throw error;
  }
};
