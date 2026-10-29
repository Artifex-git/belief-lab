// The claude.ai viewer blocks the microphone, so the single-file build has no voice recording.
export const supported = false, MAX_SECS = 0, modelReady = () => false;
export const warmUp = () => {}, transcribe = async () => "", startRecording = async () => { throw new Error("unsupported"); };
