// Practices from the book's appendices. Wording follows docs/book/follow-the-pull-v20.md closely.
// Appendix B, The Loop Audit. Appendix C, The Excitement Field Guide.

const MARKS = ["Present", "Half-present", "Missing"];
const MOVES = [
  { k: "m_notice", name: "Notice", ch: "Chapters 2–3", q: "Notice. Did you catch the belief running, or did it feel like plain fact?" },
  { k: "m_pause", name: "Pause", ch: "Chapter 4", q: "Pause. Did you hold the verdict open, or seal it in the first four seconds?" },
  { k: "m_read", name: "Read", ch: "Chapter 6", q: "Read. Did you notice the judgment sitting on top of the feeling, or take the whole feeling as the truth?" },
  { k: "m_follow", name: "Follow", ch: "Chapters 10–11", q: "Follow. Did you act on what pulled you, with what you had, or wait for ideal conditions?" },
  { k: "m_release", name: "Release", ch: "Chapter 12", q: "Release. Were you gripping one specific outcome, or open to a usable one?" },
  { k: "m_allow", name: "Allow", ch: "Chapters 13–16", q: "Allow. Did you accept what was real, look for what it offered and let it be, or contest it, or go flat?" },
];

export function auditResult(a) {
  const weight = (m) => ({ Missing: 2, "Half-present": 1 }[a[m.k]] || 0);
  const ranked = MOVES.filter((m) => weight(m) > 0).sort((x, y) => weight(y) - weight(x));
  if (!ranked.length) return "All six moves were present in this moment. That does not happen every time, and it is worth noticing what helped. If the same situation keeps coming back, the deeper questions above are still worth a quiet minute.";
  const top = ranked[0];
  const miss = ranked.filter((m) => weight(m) === 2).map((m) => m.name);
  const half = ranked.filter((m) => weight(m) === 1).map((m) => m.name);
  return `${miss.length ? `Missing: ${miss.join(", ")}. ` : ""}${half.length ? `Half-present: ${half.join(", ")}. ` : ""}\n\nThis is not a verdict on you. It points at one place: ${top.name}. If you want a single chapter to reread this week, make it ${top.ch}. Most stuck moments trace back to one missing move, not all of them at once.`;
}

const FEAR = {
  life: "Protecting my life: a real danger. Heed it.",
  alive: "Announcing my aliveness: excitement about to become real. This one usually means go.",
  rule: "Guarding an old rule: the belief defending itself. It often shows up exactly when you are about to do something the Script forbids. You may have found the edge worth crossing.",
};
const FEAR_OPTS = [["life", "Protecting my life"], ["alive", "Announcing my aliveness"], ["rule", "Guarding an old rule"], ["none", "No fear in it"]];

export function pullResult(a) {
  const lean = [a.dir === "Toward something", a.body === "Expansive", a.kind === "A pull: this feels like me", a.secret === "Yes", a.after === "More like myself"].filter(Boolean).length;
  const hit = /^An? (craving|impulse)/.test(a.kind || "");
  const away = [a.dir === "Away from something", a.body === "Constricting", hit].filter(Boolean).length;
  const out = [];
  out.push(lean >= 4 ? `${lean} of 5 checks lean toward a genuine pull.` : away >= 2 ? "Several signals here look more like moving away from something than toward it. Same fuel, opposite direction." : "The signals are mixed. That is common, and it is information, not a failure.");
  const fk = (FEAR_OPTS.find((o) => o[1] === a.fearkey) || [])[0];
  if (FEAR[fk]) out.push(FEAR[fk]);
  if (a.can === "No") out.push("A red light is not a no. It is a not this one, not yet. Go on green: act on what you can get a handle on today, even if it excites you slightly less. It tends to build toward the thing you cannot yet reach.");
  else out.push("You can act on this today. Go on green.");
  if (hit) out.push("A rule of thumb, not a diagnosis. If a pattern keeps costing you more than it gives, that deserves real support, not just a better filter.");
  return out.join("\n\n");
}

export const BOOK_PRACTICES = [
  { id: "loopaudit", cat: "find", title: "The Loop Audit", min: 10, pts: 20, tag: "Model", why: "A diagnostic, not a test. Nothing here has a good or bad score. It shows which of the six moves is most worth your attention right now. From Appendix B.",
    steps: [
      { t: "info", q: "Pick one situation from the last few days that didn't sit right.", body: "Lay out the frames in one line each, without analysing yet. Then you will mark each of the six moves as present, half-present or missing, to find the leak, not to grade yourself." },
      { t: "text", k: "facts", q: "What happened? The neutral facts only.", ph: "She said the report needed another pass.", hint: "Chapter 4: what a camera would have recorded." },
      { t: "text", k: "felt", q: "What did you feel?", ph: "Small, then annoyed." },
      { t: "text", k: "did", q: "What did you do?", ph: "I said fine and stayed late." },
      { t: "text", k: "carry", q: "What are you still carrying about it now?", ph: "A sense that I'm never quite good enough." },
      ...MOVES.map((m) => ({ t: "choice", k: m.k, q: m.q, opts: MARKS, hint: m.ch })),
      { t: "info", q: "If the same situation keeps recurring, two harder questions, gently.", body: "What would I have to believe for this to keep happening? (Chapter 1) And what might continuing this be quietly protecting me from? (Chapter 9) These are not accusations. They tend to surface the Script underneath a recurring pattern. Take them to a talk or a Lab if you like." },
      { t: "info", q: "Read the result.", body: (a) => auditResult(a) },
      { t: "text", k: "belief", q: "Optional: if one belief keeps coming up, write it as one plain sentence.", ph: "They don't respect me.", hint: "You can take it through the four questions in the Lab." },
    ] },
  { id: "pullcheck", cat: "pull", title: "Is this a pull?", min: 6, pts: 15, tag: "Model", why: "Excitement gets crossed with anxiety, craving and old conditioning. These checks tell the real signal from its impostors. Rules of thumb, not a diagnosis. From Appendix C.",
    steps: [
      { t: "text", k: "what", q: "What is the excitement about? One line.", ph: "Starting a small pottery class." },
      { t: "choice", k: "dir", q: "Toward or away? Are you moving toward what you want, or away from what you're afraid of?", opts: ["Toward something", "Away from something", "Both", "Not sure"], hint: "Same fuel, opposite direction. The difference tells you almost everything." },
      { t: "choice", k: "body", q: "How does it feel in your body?", opts: ["Expansive", "Constricting", "Mixed", "Can't tell"], hint: "Genuine excitement, even when nervous, tends to open the chest. Fear-driven urgency tends to tighten and brace. The body often knows a beat before the mind does." },
      { t: "choice", k: "kind", q: "Which sounds most like it?", opts: ["A craving: I need this, and the hit fades", "An impulse: make this feeling stop", "A pull: this feels like me", "Not sure"], hint: "A craving wants a feeling. An impulse is often discomfort in a hurry. A pull wants an expression." },
      { t: "choice", k: "secret", q: "Would you still want this if nobody ever found out you'd done it?", opts: ["Yes", "No", "Not sure"] },
      { t: "choice", k: "after", q: "When you've acted on something like this before, how did you feel afterwards?", opts: ["More like myself", "Only briefly relieved", "I haven't yet"] },
      { t: "choice", k: "fearkey", q: "Is there fear in it? If so, which kind?", opts: FEAR_OPTS.map((o) => o[1]), hint: "Three kinds, told apart: is this protecting my life, announcing my aliveness, or guarding an old rule?" },
      { t: "choice", k: "can", q: "Can you act on it today? Is there something concrete you can do?", opts: ["Yes", "No"], hint: "Green light: there is a handle. Red light: the passion is real but there is no handle yet." },
      { t: "info", q: "What this suggests.", body: (a) => pullResult(a) },
      { t: "text", k: "step", q: "What is one thing you can do today on this, or on the closest green light?", ph: "Look up one class near me." },
      { t: "when", k: "when", q: "When?" },
    ],
    commit: (a) => ({ pull: a.what || "A pull", act: a.step, when: a.when }) },
];
