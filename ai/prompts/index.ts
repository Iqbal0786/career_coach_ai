import { identityPrompt } from "./identity";
import { behaviorPrompt } from "./behavior";
import { formattingPrompt } from "./formatting";
import { careerCoachPersona } from "./personas/career-coach";

export const careerCoachSystemPrompt = [
  identityPrompt,
  careerCoachPersona,
  behaviorPrompt,
  formattingPrompt,
].join("\n\n");