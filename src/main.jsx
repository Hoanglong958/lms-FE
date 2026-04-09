import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NotificationWrapper } from "@shared/notification";
import { ThemeProvider } from "@shared/contexts/ThemeContext";
import "./index.css";
import "./ckeditor.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NotificationWrapper>
          <App />
        </NotificationWrapper>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
