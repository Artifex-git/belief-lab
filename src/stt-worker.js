// Speech to text, on this device. Runs in a worker so the page never freezes.
// Model: Whisper base (multilingual, quantised). Downloaded once, then cached by the browser.
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
env.useWasmCache = false; // load the runtime straight from our own /ort/ files, so no blob: scripts are needed
env.backends.onnx.wasm.wasmPaths = { mjs: "/ort/ort-wasm-simd-threaded.mjs", wasm: "/ort/ort-wasm-simd-threaded.wasm" };
env.backends.onnx.wasm.numThreads = 1;

let asr = null, loading = null;
const post = (m) => self.postMessage(m);

function load() {
  if (asr) return Promise.resolve(asr);
  if (loading) return loading;
  const files = {};
  loading = pipeline("automatic-speech-recognition", "Xenova/whisper-base", {
    device: "wasm", dtype: { encoder_model: "q8", decoder_model_merged: "q8" },
    progress_callback: (p) => {
      if (p.status === "progress" && p.file) { files[p.file] = { l: p.loaded || 0, t: p.total || 0 }; const v = Object.values(files); const t = v.reduce((a, x) => a + x.t, 0); if (t) post({ type: "progress", pct: Math.round(100 * v.reduce((a, x) => a + x.l, 0) / t) }); }
    },
  }).then((p) => { asr = p; post({ type: "ready" }); return p; }).catch((e) => { loading = null; throw e; });
  return loading;
}

self.onmessage = async (e) => {
  const { type, id } = e.data;
  try {
    if (type === "load") { await load(); return; }
    if (type === "transcribe") {
      const p = await load();
      const out = await p(e.data.audio, { language: e.data.lang, task: "transcribe", chunk_length_s: 30, stride_length_s: 5 });
      post({ type: "result", id, text: (out.text || "").trim() });
    }
  } catch (err) { post({ type: "error", id, message: String((err && err.message) || err) }); }
};
