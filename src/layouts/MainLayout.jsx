import { Outlet } from "react-router-dom";
import LayoutHeader from "./LayoutHeader";
import LayoutFooter from "./LayoutFooter";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <div className="page-container">
        <LayoutHeader />
        <main className="content">
          <Outlet /> {/* Trang con (HomePage, SearchPage...) sẽ render ở đây */}
        </main>
      </div>
      <LayoutFooter />
    </div>
  );
}
