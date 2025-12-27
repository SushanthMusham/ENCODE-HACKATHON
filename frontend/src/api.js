import axios from "axios";

const api = axios.create({
  baseURL: "https://encode-hackathon.onrender.com/api",
});

export default api;
