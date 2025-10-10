import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import HomePage from "@pages/HomePage";
import Login from "@features/login/pages/login";
import BlogList from "../pages/BlogList";
import Posts from "../pages/Posts";
import BlogDetail from "../pages/BlogDetail";
import SearchPage from "../features/login/pages/SearchPage";




export default function AppRouter() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/bai-viet" element={<BlogList />} />
          <Route path="/bai-viet/:id" element={<BlogDetail />} />
          <Route path="/baiviet" element={<Posts />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Routes>
    </>
  );
}
