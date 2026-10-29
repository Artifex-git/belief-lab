import "./app.css";
import "./extra.css";
import "./platform.js";
import { startTelemetry } from "./telemetry.js";
startTelemetry();
import { runGate } from "./access.js";
import info from "./build-info.json";
import { registerSW } from "virtual:pwa-register";

const hosted = info.channel !== "local" && !(window.claude && window.claude.use && !window.__blShim);
if (hosted) await runGate();
await import("./legacy-app.js");
const { startAppUi, updatePrompt } = await import("./app-ui.js");
const { mountPill, flushQueue } = await import("./feedback.js");

startAppUi();
mountPill();
flushQueue();
addEventListener("online", flushQueue);
const update = registerSW({ onNeedRefresh: () => updatePrompt(() => update(true)) });
