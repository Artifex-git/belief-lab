// Minimum distress detection (English + Dutch). Extend, never narrow (docs/SAFETY.md §1).
// Mirrors DISTRESS in src/legacy-app.js; tests/safety keeps the two identical.
export const DISTRESS = /(kill(ing)? myself|suicid|end (it all|my life)|want(ed)? to die|don'?t want to (live|be here)|no reason to (live|go on)|self[- ]?harm|hurt(ing)? myself|better off (dead|without me)|zelfmoord|zelfdoding|niet meer (leven|verder)|dood willen|wil dood|mezelf (iets )?aandoen|er een einde aan (maken|make))/i;
export const distress = (t) => DISTRESS.test(String(t || ""));
