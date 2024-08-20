import axios from "axios";

export const BASE_URL = "http://10.0.0.99:8000/api";
// export const BASE_URL = "https://api.oxsaid.net/api";

export const axiosBase = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true,
});
