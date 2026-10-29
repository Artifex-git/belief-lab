// Record from the microphone and turn it into text on this device.
export const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.Worker && (window.AudioContext || window.webkitAudioContext));
export const MAX_SECS = 180;

let worker = null, ready = false, nextId = 1;
const waiters = new Map();
let onProgress = () => {};

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./stt-worker.js", import.meta.url), { type: "module" });
  worker.onmessage = (e) => {
    const m = e.data;
    if (m.type === "progress") onProgress(m.pct);
    else if (m.type === "ready") { ready = true; onProgress(100); }
    else if (m.type === "result" || m.type === "error") { const w = waiters.get(m.id); if (w) { waiters.delete(m.id); m.type === "result" ? w.resolve(m.text) : w.reject(new Error(m.message)); } }
  };
  worker.onerror = (e) => { waiters.forEach((w) => w.reject(new Error(e.message || "worker error"))); waiters.clear(); worker = null; ready = false; };
  return worker;
}

/** Start fetching the speech model while the person is still talking. */
export function warmUp(progress) { onProgress = progress || (() => {}); if (ready) onProgress(100); else getWorker().postMessage({ type: "load" }); }
export const modelReady = () => ready;

export function transcribe(audio, lang, progress) {
  if (progress) onProgress = progress;
  return new Promise((resolve, reject) => { const id = nextId++; waiters.set(id, { resolve, reject }); getWorker().postMessage({ type: "transcribe", id, audio, lang }, [audio.buffer]); });
}

function toMono16k(chunks, rate) {
  let n = 0; chunks.forEach((c) => { n += c.length; });
  const all = new Float32Array(n); let o = 0; chunks.forEach((c) => { all.set(c, o); o += c.length; });
  if (rate === 16000) return all;
  const ratio = rate / 16000, len = Math.floor(n / ratio), out = new Float32Array(len);
  for (let i = 0; i < len; i++) { const p = i * ratio, a = Math.floor(p), b = Math.min(a + 1, n - 1), f = p - a; out[i] = all[a] * (1 - f) + all[b] * f; }
  return out;
}

/** Begin recording. Returns { level(), seconds(), stop(), cancel() }. stop() resolves to 16 kHz mono samples. */
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC(); if (ctx.state === "suspended") await ctx.resume();
  const src = ctx.createMediaStreamSource(stream);
  const an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
  const proc = ctx.createScriptProcessor(4096, 1, 1), mute = ctx.createGain(); mute.gain.value = 0;
  const chunks = []; let samples = 0, closed = false;
  proc.onaudioprocess = (e) => { if (closed) return; const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d)); samples += d.length; };
  src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
  const buf = new Uint8Array(an.fftSize);
  const close = () => { if (closed) return; closed = true; try { proc.disconnect(); src.disconnect(); } catch (e) {} stream.getTracks().forEach((t) => t.stop()); try { ctx.close(); } catch (e) {} };
  return {
    level() { an.getByteTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; } return Math.min(1, Math.sqrt(s / buf.length) * 4); },
    seconds: () => samples / ctx.sampleRate,
    stop() { const rate = ctx.sampleRate; close(); return Promise.resolve(toMono16k(chunks, rate)); },
    cancel: close,
  };
}
