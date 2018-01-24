const nChoice = 5,; //fixed for this game

// Rewards matrix. Order: rock, lizard, Spock, scissors, paper
const rewards = Array.from(Array(nChoice)).map( i => { //lines
	return Array.from(Array(nChoice)).map( j => { //columns
		// i against j: gain from i viewpoint
		if (j == (i+1) % nChoice || j == (i+3) % nChoice)
			return 1; //I win :)
		else if ((i+1) % nChoice == j || j == (i+2) % nChoice)
			return -1; //I lose :(
		else
			return 0;
	});
});

const symbols = [ "Rock", "Lizard", "Spock", "Scissors", "Paper" ];

new Vue({
	el: "#rpsls",
	data: {
		humanMove: -1, //integer in 0...nChoice-1
		nInput: 5, //default
		humanHistory: [ ], //your nInput last moves, stored (oldest first)
		gameState: 0, //total points of the computer
		drawIsLost: false, //normal (or true: draw is considered loss)
		rewards: [ ], //initialized at first human move with new nInput
		weights: [ ], //same as above
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
		// Play a move given current data (*after* human move: trigger onChange)
		play: function() {
			let candidates = [ ];
			Array.from(Array(nChoice)).forEach( i => {
				// Sum all weights from an activated input to this output
				let sumWeights = this.weights[i].reduce( (acc,input,j) => {
					if (this.humanHistory.length <= j)
						return 0;
					return input[ this.humanHistory[j] ];
				}, 0 );
				let currentValue = {
					val: sumWeights,
					index: i
				};
				if (candidates.length == 0 || sumWeights > candidates[0].val)
					candidates = [ currentValue ];
				else if (sumWeights == candidates[0].val)
					candidates.push(currentValue);
			});
			// Pick a choice at random in maxValue (total random for first move)
			let randIdx = Math.floor((Math.random() * candidates.length) + 1);
			this.updateGameState(candidates[randIdx]);
		},
		updateGameState: function(move) {
			let reward = rewards[move.val][this.humanMove]; //viewpoint of computer
			this.gameState += reward;
			this.updateWeights(reward, move.index);
		},
		updateWeights: function(reward, index) {
			let delta = Math.sign(reward);
			if (this.drawIsLost && reward == 0)
				delta = -1;
			this.weights[index].forEach( (input,i) => {
				if (i < this.humanHistory.length)
					input[ this.humanHistory[i] ] += delta;
			});
			this.postUpdate();
		},
		// Finalize weights update
		postUpdate: function() {
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
			// Update human moves history
			this.humanHistory.push(coup_adversaire);
			this.humanHistory.shift();
		},
  },
};
