import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});
