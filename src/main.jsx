import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Admin from "./admin";
import Ruleta from "./pages/Ruleta.jsx";

const params = new URLSearchParams(window.location.search);

const adminMode = params.has("admin");
const ruletaMode = params.has("ruleta");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {adminMode ? <Admin /> : ruletaMode ? <Ruleta /> : <App />}
  </React.StrictMode>
);
