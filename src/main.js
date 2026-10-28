import "./app.css";
import "./extra.css";
import "./platform.js";
import { startTelemetry } from "./telemetry.js";
startTelemetry();
import "./legacy-app.js";
import { startAppUi, updatePrompt } from "./app-ui.js";
import { mountPill, flushQueue } from "./feedback.js";
import { registerSW } from "virtual:pwa-register";

startAppUi();
mountPill();
flushQueue();
addEventListener("online", flushQueue);
const update = registerSW({ onNeedRefresh: () => updatePrompt(() => update(true)) });
