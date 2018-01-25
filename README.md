# Rock-Paper-Scissors-Lizard-Spock

A simple bot to play this game, following ideas from [this article](https://www.his.se/PageFiles/8158/Henrik_Engstrom.pdf).

The rules are given by Sheldon in episode 8 of season 2 of TBBT (The Big Bang Theory).

---

[Online demo](https://auder.net/rpsls/)

Winning should be difficult after a few dozens of rounds, because it's hard to play at random.

Setting "winner bot" and/or increasing memory can improve bot level.

---

## Technical details

Each potential choice is linked to all outputs in a (neural) network, for
each input in memory. We thus have size of memory x (number of choice)^2 links.
To select a move, the bot computes the sum of all links weights from an activated choice
(that is to say, the value of a memory cell) to each output.
The output with biggest weights sum wins: the move is played.

The reward is then determined from human move: -1 for a loss, 0 for a draw
(except if "winner bot" is selected, in which case a draw = a loss) and 1 for a win.
Weights on the active links are updated positively or negatively depending on reward sign.
All weights are initialized to zero, and since some time is required for learning
the first moves in the game would be quite random.

See RPS\_network\_2.svg file for an illustration with memory=2 and simple RPS.
