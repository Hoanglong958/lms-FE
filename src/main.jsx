import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NotificationWrapper } from "@shared/notification";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationWrapper>
        <App />
      </NotificationWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
