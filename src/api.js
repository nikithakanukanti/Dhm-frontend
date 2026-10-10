 import axios from "axios";

const api = axios.create({
  baseURL: "https://dhm-backend.onrender.com",
  withCredentials: true,
});

export default api;