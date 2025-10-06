import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import HomePage from "@pages/HomePage";
import Login from "@features/login/pages/login";

export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </>
  );
}
