// The Anchor (book Appendix F): what the app offers on a dip day. Pure logic + wording, unit-tested.
// Wording follows docs/book/follow-the-pull-v13.md, Appendix F. Owner approves any change (docs/SAFETY.md §2).

export const DIP_MOOD = 3;
export const isDipMood = (m) => typeof m === "number" && m <= DIP_MOOD;
// Today is a dip day when today's check-in is 3 or lower, or the person said so today.
export const inDip = (todayMood, flaggedDate, today) => isDipMood(todayMood) || flaggedDate === today;
// The Lab is for clear-headed investigation, not rescue: on a dip day it is never offered.
export const routeView = (view, dip) => (dip && view === "lab" ? "anchor" : view);

export const INTRO = "A low patch is often not a malfunction. Sometimes it is a natural turning inward. Approached gently, it usually passes on its own. Do just this, in order.";

export const STEPS = [
  { h: "Name it plainly", t: "“I’m in a dip.” A dip is a passing state, not a verdict on your life or your worth, and not proof the work failed. It’s weather." },
  { h: "Stop feeding it", t: "You don’t have to win the argument running in your head. Set it down. You can pick it back up later if you want to." },
  { h: "Reach for the four C’s", t: "One calm breath. Confident there’s something here. Curious what it is. Creative in how you meet it.", breathe: true },
  { h: "Take the smallest true next step", t: "One small, real thing, however tiny. Motion first. The motivation tends to arrive after you move, not before.", input: true },
  { h: "Be kind to yourself about the dip itself", t: "Being hard on yourself for being down only stacks a second weight on the first. Put the second one down." },
];

export const CAUTION = "One honest caution. If a low mood is deep, lasting, or comes with hopelessness or any thought of harming yourself, that is not a dip to ride out alone. Nothing in this book or this app is a substitute for real support. Reach out to someone you trust, a doctor, a therapist or a crisis line.";
