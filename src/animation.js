import { birthdayAnimation } from "./animations/birthday-animation.js";
import { beerAnimation } from "./animations/time-for-beer.js";
import { weRockAnimation } from "./animations/we-rock-animation.js";
import { welcomeToTeamAnimation } from "./animations/welcome-to-team.js";

// --- Animation Keyword Mapping ---
export const wordsToAnimations = {
  gefeliciteerd: birthdayAnimation,
  bier: beerAnimation,
  voltooid: weRockAnimation,
  nieuwe_collega: welcomeToTeamAnimation,
  jaar_in_dienst: birthdayAnimation,
  goed_bezig: weRockAnimation,
};

