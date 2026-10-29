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
  pullcheck: { move: "Follow", ch: 10 }, // Appendix C, Chapter 10
  picture: { move: "Release", ch: 12 },  // Pump and Release
};
export const moveTag = (id) => { const m = MOVE_OF[id]; return m ? `${m.move} · Ch ${m.ch}` : ""; };
