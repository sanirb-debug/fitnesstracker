import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

/* Replaces the #boot placeholder in index.html. If this never runs, the
   pulsing "THE CUT / Loading your log" screen is what you're left staring at,
   which is the first thing to check when the page looks stuck. */
createRoot(document.getElementById("root")).render(<App />);
