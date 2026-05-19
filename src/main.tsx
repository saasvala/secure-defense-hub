import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedData } from "./lib/seed";

// Seed default roles + Super Admin account before any auth check
seedData();

createRoot(document.getElementById("root")!).render(<App />);
