// The book's six moves (Notice · Pause · Read · Follow · Release · Allow) on the practices they come from.
// Source: Appendix G "The nineteen moves" (docs/book/follow-the-pull-v13.md). Only practices that match
// an Appendix G exercise by name are mapped; others stay untagged until the owner confirms them.
export const FLOWS = "When it flows: Follow · Release · Allow";
export const STICKS = "When it sticks: Notice · Pause · Read";
export const MOVE_OF = {
  believe: { move: "Notice", ch: 1 },    // Naming the Belief
  threshold: { move: "Notice", ch: 3 },  // The Threshold of Believability
  neutral: { move: "Pause", ch: 4 },     // Hold the Verdict
  rank: { move: "Follow", ch: 10 },      // The Honest Ask
  breaths: { move: "Pause", ch: 5 },
  relaxjudge: { move: "Pause", ch: 6 },
  reel: { move: "Read", ch: 7 },
  echo: { move: "Read", ch: 8 },
  own: { move: "Read", ch: 9 },
  real: { move: "Allow", ch: 13 },
  three: { move: "Allow", ch: 14 },
  have: { move: "Allow", ch: 15 },
  allright: { move: "Allow", ch: 16 },
  pullcheck: { move: "Follow", ch: 10 }, // Appendix C, Chapter 10
  picture: { move: "Release", ch: 12 },  // Pump and Release
};
export const moveTag = (id) => { const m = MOVE_OF[id]; return m ? `${m.move} · Ch ${m.ch}` : ""; };
