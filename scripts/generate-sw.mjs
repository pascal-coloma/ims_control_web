import { readFileSync, writeFileSync } from "node:fs";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "VITE_");
const apiKey =
  process.env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || "";
const appId =
  process.env.VITE_FIREBASE_WEB_APP_ID || env.VITE_FIREBASE_WEB_APP_ID || "";

const template = readFileSync(
  "public/firebase-messaging-sw.template.js",
  "utf8",
);
const output = template
  .replace("__VITE_FIREBASE_API_KEY__", apiKey)
  .replace("__VITE_FIREBASE_WEB_APP_ID__", appId);

writeFileSync("public/firebase-messaging-sw.js", output);
