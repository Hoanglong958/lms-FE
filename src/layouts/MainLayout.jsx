import LayoutHeader from "./LayoutHeader";
import LayoutFooter from "./LayoutFooter";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <LayoutHeader />
      <main>
        <Outlet />
      </main>
      <LayoutFooter />
    </div>
  );
}
