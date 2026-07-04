import React from "react";
import { createRoot } from "react-dom/client";
import TheCouncil from "./App.jsx";
import "./styles.css";

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("tab-hidden", document.hidden);
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TheCouncil />
  </React.StrictMode>
);
