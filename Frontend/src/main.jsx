// Main entry point - Renders the App component into the DOM
// This file is the entry point that Vite uses to start the React application

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store/store.js";

// Create root element and render the App component
// This is the React 18 way of rendering the app
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential problems in development
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
