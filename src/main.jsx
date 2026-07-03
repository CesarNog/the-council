import React from "react";
import { createRoot } from "react-dom/client";
import TheCouncil from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TheCouncil />
  </React.StrictMode>
);
