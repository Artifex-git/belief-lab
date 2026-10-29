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

  // ---- Exercises from Chapters 5 to 18, in the book's own steps ----
  { id: "breaths", cat: "steady", title: "The Three Breaths", min: 3, pts: 10, tag: "Model", why: "Breathe, and feel exactly what you're feeling, without editing it. You are practising the pause itself, the small space between the trigger and what you do next. From Chapter 5.",
    steps: [
      { t: "text", k: "feel", q: "What reaction has already fired? A drop in the stomach, a flash of heat, a tightening in the chest?", ph: "A jolt of worry in my chest." },
      { t: "timer", secs: 60, q: "Take three slow breaths. On each one, silently name what is there, as plainly as you can.", hint: "\u201cI'm feeling a jolt of worry.\u201d Don't try to fix it, argue with it, or make it smaller. Just name it accurately, three times." },
      { t: "text", k: "after", q: "What was it like to name it without fixing it?", ph: "It was still there, but it had edges." },
    ] },
  { id: "relaxjudge", cat: "steady", title: "Relax the Judgment", min: 4, pts: 15, tag: "Model", why: "Separate the charge from the judgment sitting on top of it. That separation is the entire skill. From Chapter 6.",
    steps: [
      { t: "text", k: "charge", q: "What is the charge? Racing heart, tight chest, restless energy?", ph: "Racing heart before the call." },
      { t: "text", k: "judge", q: "What judgment have you placed on top of it? Say it plainly.", ph: "I've decided this feeling means something is going wrong." },
      { t: "info", q: "Set the judgment down.", body: "Not by forcing yourself to feel calm, but by returning your attention to the raw sensation underneath, and naming it without the verdict attached: \u201cThis is energy. This is readiness.\u201d" },
      { t: "text", k: "left", q: "What is left once the judgment is set aside?", hint: "Often it is closer to excitement than fear: the same signal, minus the story that made it hard to sit with. You don't need this to work every time.", ph: "A lot of energy. It feels a bit like readiness." },
    ] },
  { id: "reel", cat: "find", title: "Trace the Reel", min: 8, pts: 20, tag: "Model", why: "Walk one oversized reaction backward through the stations, from the Movie to the Script. You are not fixing anything yet, just confirming how the chain runs. From Chapter 7.",
    steps: [
      { t: "info", q: "Pick one reaction from the last few days that felt bigger than the situation warranted.", body: "Seven short lines, one station at a time. One line each." },
      { t: "text", k: "movie", q: "The Movie: what happened, in one sentence?", ph: "My manager changed my plan in the meeting." },
      { t: "text", k: "acting", q: "Acting: what did you do, specifically?", ph: "I nodded and said nothing." },
      { t: "text", k: "dialogue", q: "Dialogue: what story was running in your head?", hint: "Afterwards, mark each sentence as something you saw or something you added.", ph: "She doesn't trust me. Everyone saw." },
      { t: "text", k: "soundtrack", q: "Soundtrack: what judgment was riding on top of the raw feeling? (Chapter 6)", ph: "This feeling is a sign I'm failing." },
      { t: "text", k: "physical", q: "Physical Mind: what instant read fired first, before any of the above?", ph: "Danger." },
      { t: "text", k: "script", q: "Script: what belief would have to be loaded for that instant read to make sense? (Chapter 2)", ph: "If I'm not impressive, I'm not safe.", help: true },
      { t: "info", q: "Director: the moment you felt like you chose your reaction.", body: "Notice where it lands against the rest. Almost always it comes after the chain has already done its work, not before it. The part of you that felt in charge showed up near the end of the reel, not the start." },
    ] },
  { id: "echo", cat: "self", title: "Don't wait for the echo", min: 4, pts: 15, tag: "Model", why: "Stop making outside proof a precondition for believing an inner change is real. That precondition is exactly what keeps the old reel running. From Chapter 8.",
    steps: [
      { t: "text", k: "wait", q: "Where are you waiting for outside proof before you'll let yourself believe an internal change is real?", ph: "I'll believe I'm more confident once people stop interrupting me." },
      { t: "text", k: "act", q: "What is one small, concrete action today that would only make sense if the change were already true?", hint: "Modest and specific, not a grand gesture. Do the action first. Let the feeling and the evidence arrive afterwards, if they arrive at all this week.", ph: "Speak up once in the team meeting." },
      { t: "when", k: "when", q: "When?" },
    ],
    commit: (a) => ({ pull: "Act before the echo", act: a.act, when: a.when }) },
  { id: "own", cat: "find", title: "Own it, don't blame it", min: 6, pts: 15, tag: "Model", why: "Claim your response without self-blame. The second sentence doesn't need the first to be false, small or your fault. It only needs to be asked separately. From Chapter 9.",
    steps: [
      { t: "text", k: "sit", q: "Pick a situation you're currently unhappy with, something recurring and with real weight.", ph: "Meetings where my ideas get taken over." },
      { t: "text", k: "cause", q: "The cause sentence, as honestly as you can state it. It may be entirely external.", ph: "My manager took credit for the idea." },
      { t: "text", k: "own", q: "The ownership sentence: what do you have jurisdiction over, starting now?", ph: "What I can own here is how I prepare for the next meeting." },
      { t: "info", q: "Read them back.", body: "The second sentence didn't need the first one to be false, or small, or your fault. It just needed to be asked separately." },
      { t: "text", k: "protect", q: "Optional, only if this is a pattern you keep repeating: what might continuing this be protecting you from?", hint: "Not what is wrong with you for doing it. What is it quietly keeping safe? You don't have to solve it today.", ph: "It keeps me from being visible." },
    ] },
  { id: "real", cat: "letgo", title: "Say what's real", min: 4, pts: 15, tag: "Model", why: "Stop arguing with a reality that's already closed. Accepting that it happened is not the same as seeing anything good in it. From Chapter 13.",
    steps: [
      { t: "text", k: "what", q: "What have you been quietly resisting acknowledging clearly? State exactly what happened, in one plain sentence.", hint: "No qualifiers. No \u201cbut it's probably not final.\u201d No catastrophizing either. The flat, complete fact, as you'd tell a stranger with no stake in how you feel.", ph: "The project was cancelled." },
      { t: "info", q: "Now a second sentence.", body: "\u201cI'm assuming this belongs here, for reasons I may or may not see yet.\u201d You are not agreeing it's good, and not deciding it's permanent. You are putting down the unconfirmed version you've been carrying, so that what you do next responds to what's real." },
    ] },
  { id: "three", cat: "letgo", title: "The three questions", min: 6, pts: 15, tag: "Model", why: "Find something specific and concrete that a hard experience offered. Take the situation you stated plainly in Say what's real. From Chapter 14.",
    steps: [
      { t: "text", k: "situ", q: "The situation you stated plainly and stopped contesting. In a line?", ph: "The project was cancelled." },
      { t: "text", k: "serve", q: "How does this serve me, exactly the way it is, not the way I wish it had gone?", hint: "Don't force an answer on the first pass. Sit with the question a little longer before deciding there's nothing there." },
      { t: "text", k: "learn", q: "What can I learn here that I couldn't have learned any other way?" },
      { t: "text", k: "take", q: "What is one specific, concrete thing I can take from this into what comes next?", hint: "Specific enough that it would mean something to someone who didn't live through it with you. That is the difference between appreciating something and telling yourself you should." },
    ] },
  { id: "have", cat: "letgo", title: "The already-have reframe", min: 4, pts: 15, tag: "Model", why: "Locate the exact spot where wanting turns into a felt sense of lack. You are not trying to talk yourself out of wanting things. From Chapter 15.",
    steps: [
      { t: "text", k: "want", q: "Notice a sentence that starts with \u201cI want\u201d or \u201cI need\u201d, about something specific. Write it.", ph: "I need this promotion." },
      { t: "text", k: "have", q: "Rewrite it: \u201cI already have what I need. I'm allowing ___ to become visible.\u201d", hint: "Say it the same way you'd have said the old one. Not performed, just stated.", ph: "I already have what I need. I'm allowing my work to become visible." },
      { t: "text", k: "diff", q: "What is different, physically, between the two versions?", hint: "Most people notice the first carries a faint clench, a small tension in the chest or stomach, and the second doesn't, even though the thing wanted hasn't changed.", ph: "The first one tightened my chest." },
    ] },
  { id: "allright", cat: "letgo", title: "Let it be all right", min: 4, pts: 15, tag: "Model", why: "Let this moment be enough on purpose, without giving up a single plan you hold. It is not resignation. From Chapter 16.",
    steps: [
      { t: "text", k: "push", q: "What is currently mid-push? The thing that hasn't resolved, the version of today that doesn't match the one you were insisting on.", ph: "The report isn't finished." },
      { t: "info", q: "Say it plainly, then the harder sentence.", body: "\u201cThis is where I am.\u201d And then, out loud if you can: \u201cAnd I'm letting this be all right. Not finished, not fixed, not what I planned. All right, as it is, right now.\u201d This is not resignation. You are setting down one specific thing: the requirement that it already be different before you're allowed to unclench." },
      { t: "choice", k: "said", q: "Could you say it?", opts: ["Yes", "Partly", "The sentence won't come"] },
      { t: "text", k: "next", q: "Notice, without forcing it: does your very next action feel any different than it would have five minutes ago?", hint: "It might not, the first time. If the sentence won't come, try two questions on whatever you're insisting on: Is it true that this should already be different? Can I absolutely know that? Look for what changes in your body when you ask.", ph: "I took a breath before opening the file." },
    ] },
  { id: "qualifier", cat: "self", title: "Drop the qualifier", min: 3, pts: 10, tag: "Model", why: "Catch the little pre-shrink you add to your own sentences, and leave it off. The qualifier invalidates the sentence in advance. From Chapter 17.",
    steps: [
      { t: "text", k: "hedged", q: "Think of something you said or almost said today with a qualifier in front of it. Write it as you said it.", hint: "\u201cThis is probably silly, but...\u201d \u201cI guess I sort of feel like...\u201d", ph: "I don't know, maybe it's just me, but I kind of want to leave early." },
      { t: "text", k: "plain", q: "Now the same sentence without it. Not louder, not more dramatic, just plain.", ph: "I want to leave early today." },
      { t: "choice", k: "light", q: "Which version took more effort to say?", opts: ["The hedged one", "The plain one", "About the same"], hint: "Most people find the plain one is lighter, once they get past the first flinch." },
    ] },
  { id: "sign", cat: "self", title: "Don't sign it", min: 3, pts: 10, tag: "Model", why: "Catch a self-invalidation as it happens, and decline to endorse the verdict. You are not trying to feel confident, only to refuse to keep endorsing the case against yourself. From Chapter 18.",
    steps: [
      { t: "text", k: "verdict", q: "Think of a small internal dismissal from today. The sentence you almost hedged, the opinion you almost swallowed.", hint: "It has familiar shapes: this is probably obvious; who am I to; it's not that good; they won't want to hear it.", ph: "Who am I to suggest this." },
      { t: "info", q: "Decline to sign it.", body: "Don't argue with it and don't flip it into praise. Recognize it as a verdict you are being asked to sign, a judgment against yourself presented as fact, and say one plain inner sentence: \u201cNoted, but I'm not signing that.\u201d Then do the thing anyway, unedited, or as close to unedited as you can manage this time." },
      { t: "text", k: "do", q: "What will you do or say anyway, as close to unedited as you can?", ph: "Share the suggestion in the channel." },
    ] },
];
