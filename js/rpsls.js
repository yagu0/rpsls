const nChoice = 5; //fixed for this game

const symbols = [ "Rock", "Lizard", "Spock", "Scissors", "Paper" ];

// Same order as in symbols
const messages = [
	[ "=",             "crushes",        "is vaporized by", "cruches",           "is covered by"   ],
	[ "is crushed by", "=",              "poisons",         "is decapitated by", "eats"            ],
	[ "vaporizes",     "is poisoned by", "=",               "smashes",           "is disproved by" ],
	[ "is crushed by", "decapitates",    "is smashed by",   "=",                 "cuts"            ],
	[ "covers",        "is eaten by",    "disproves",       "is cut by",         "="               ],
];

// Rewards matrix, order as in symbols
const rewards = Array.from(Array(nChoice)).map( (e,i) => { //lines
	return Array.from(Array(nChoice)).map( (f,j) => { //columns
		// i against j: gain from i viewpoint
		if (j == (i+1) % nChoice || j == (i+3) % nChoice)
			return 1; //I win :)
		else if (i != j)
			return -1; //I lose :(
		return 0; //i==j
	});
});

new Vue({
	el: "#rpsls",
	data: {
		nInput: 5, //default
		humanHistory: [ ], //your nInput last moves, stored (oldest first)
		humanMove: -1,
		gameState: 0, //total points of the human
		compMove: -1, //last move played by computer
		drawIsLost: false, //normal (or true: draw is considered loss)
		rewards: [ ], //initialized at first human move with new nInput
		weights: [ ], //same as above
		symbols: symbols,
		messages: messages,
	},
	created: function() {
		this.reinitialize();
	},
	methods: {
		// Called on nInput change
		reinitialize: function() {
			// weights[i][j][k]: output i -- input j/choice k
			this.weights = Array.from(Array(nChoice)).map( i => {
				return Array.from(Array(this.nInput)).map( j => {
					return Array.from(Array(nChoice)).map( k => {
						return 0;
					});
				})
			});
			if (this.humanHistory.length > this.nInput)
				this.humanHistory.splice(this.nInput);
		},
		// Play a move given current data (*after* human move)
		play: function(humanMove) {
			this.humanMove = humanMove;
			let candidates = [ ];
			Array.from(Array(nChoice)).forEach( (e,i) => {
				// Sum all weights from an activated input to this output
				let sumWeights = this.weights[i].reduce( (acc,input,j) => {
					if (this.humanHistory.length <= j)
						return 0;
					return input[ this.humanHistory[j] ];
				}, 0 );
				let move = {
					val: sumWeights,
					index: i,
				};
				if (candidates.length == 0 || sumWeights > candidates[0].val)
					candidates = [move];
				else if (sumWeights == candidates[0].val)
					candidates.push(move);
			});
			// Pick a choice at random in maxValue (total random for first move)
			let randIdx = Math.floor(Math.random() * candidates.length);
			this.compMove = candidates[randIdx].index;
			// Update game state
			let reward = rewards[this.compMove][humanMove]; //viewpoint of computer
			this.gameState -= reward;
			this.updateWeights(reward);
			// Update human moves history
			this.humanHistory.push(humanMove);
			if (this.humanHistory.length > this.nInput)
				this.humanHistory.shift();
		},
		updateWeights: function(reward) {
			let delta = Math.sign(reward);
			if (this.drawIsLost && reward == 0)
				delta = -1;
			this.weights[this.compMove].forEach( (input,i) => {
				if (i < this.humanHistory.length)
					input[ this.humanHistory[i] ] += delta;
			});
			// Re-center the weights
			let sumAllWeights = this.weights.reduce( (a,output) => {
				return a + output.reduce( (b,input) => {
					return b + input.reduce( (c,choiceWeight) => {
						return c + choiceWeight;
					}, 0);
				}, 0);
			}, 0);
			let meanWeight = sumAllWeights / (this.nInput * nChoice * nChoice);
			this.weights.forEach( output => {
				output.forEach( input => {
					for (let i=0; i<input.length; i++)
						input[i] -= meanWeight;
				});
			});
		},
		imgSource: function(symbol) {
			return "img/" + symbol + ".png";
		},
	},
});
