import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppRouter from "@routes/AppRouter.jsx";

export default function App() {
  // Auto-login logic (DISABLED - uncomment to enable)
  // useEffect(() => {
  //   const checkLogin = async () => {
  //     const token = localStorage.getItem("accessToken");
  //     console.log("🔍 Checking token:", token ? "Token exists" : "No token found");

  //     if (!token) {
  //       try {
  //         console.log("🔐 Auto-logging in...");
  //         const response = await axios.post(
  //           "http://localhost:3999/api/v1/auth/login",
  //           {
  //             gmail: "tuanbach.nk@gmail.com",
  //             password: "Bach123@",
  //           },
  //           {
  //             headers: { "Content-Type": "application/json" },
  //           }
  //         );

  //         console.log("📡 Login response:", response.data);
  //         const { accessToken, user } = response.data.data || response.data;

  //         if (accessToken) {
  //           localStorage.setItem("accessToken", accessToken);
  //           localStorage.setItem("loggedInUser", JSON.stringify(user));
  //           console.log("✅ Auto-login successful! Token saved:", accessToken.substring(0, 20) + "...");
  //           console.log("👤 User:", user);
  //           // Optional: Force reload or state update if needed, but AppRouter should pick it up or next nav
  //           window.location.reload();
  //         } else {
  //           console.error("❌ No accessToken in response");
  //         }
  //       } catch (error) {
  //         console.error("❌ Auto-login failed:", error.message);
  //         console.error("Error details:", error.response?.data || error);
  //       }
  //     } else {
  //       console.log("✅ Token already exists, skipping auto-login");
  //     }
  //   };

  //   checkLogin();
  // }, []);

  return <AppRouter />;
}
