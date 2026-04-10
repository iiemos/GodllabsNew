import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { NotificationProvider } from "./components/Notification";
import { WalletProvider } from "./contexts/WalletContext";
import "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
