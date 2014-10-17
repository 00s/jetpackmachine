/* enumeration for SYMBOLS (freeze option prevent keys to be modified)*/
var SYMBOL = Object.freeze({COIN_JACKPOT: 	"Coin Jackpot", 
							COIN_PRIZE: 	"Coin Prize", 
							ATOM_BLAST: 	"Atom Blast", 
							BIG_BLAST: 		"Big Blast", 
							SMALL_BLAST: 	"Small Blast", 
							COIN_BONUS: 	"Coin Bonus", 
							EXTRA_SPINS: 	"Extra Spins", 
							SECOND_CHANCE: 	"Second Chance", 
							DOUBLE_COINS: 	"Double Coins", 
							HEAD_START: 	"Head Start"});
/* global variables */
var map = new BiMap;
var coins = 0;
var tokens = 0;
/* initialize bimap with values in descending order of importance. */
loadMap( map, SYMBOL.COIN_JACKPOT	, 0, 0);
loadMap( map, SYMBOL.COIN_PRIZE		, 1, 2); 	
loadMap( map, SYMBOL.ATOM_BLAST		, 3, 6);	
loadMap( map, SYMBOL.BIG_BLAST		, 7, 12);	
loadMap( map, SYMBOL.SMALL_BLAST	, 13, 20);
loadMap( map, SYMBOL.COIN_BONUS		, 21, 30);
loadMap( map, SYMBOL.DOUBLE_COINS	, 31, 42);
loadMap( map, SYMBOL.HEAD_START		, 43, 56);
loadMap( map, SYMBOL.EXTRA_SPINS 	, 57, 72);
loadMap( map, SYMBOL.SECOND_CHANCE 	, 73, 90);

/* return a valid reel position */
function spin(){
	var virtualReel = Math.floor(Math.random() * 999999999 + 1); // generate number up to 1 Bi
	virtualReel %= 90; // reduce the options to 90
	return getRealReel(virtualReel);
}

/* return the key given the value */
function getRealReel(virtualReel){
	return map.val(virtualReel);
}

/* auxiliar function to load BiMap */
function loadMap(map, key, start, end){
	var nums = [];
	for(i = start; i <=end; i++){
		nums.push(i);
	}
	map.push(key, nums);
}

/* return a betline result */
function betline(){
	var reels = [];
	for(i = 0; i < 3; i++){
		reels.push(spin());
	}
	return reels;
}

/* Calculate prize acording to symbol combination */
function calculatePrize(symbol){
	var prize = 0;
	switch(symbol){
		case SYMBOL.COIN_JACKPOT:
			prize = 1000;
			break;
		case SYMBOL.COIN_PRIZE:
			prize = 500;
			break;
		case SYMBOL.ATOM_BLAST:
			prize = 385;
			break;
		case SYMBOL.BIG_BLAST:
			prize = 260;
			break;
		case SYMBOL.SMALL_BLAST:
			prize = 160;
			break;
		case SYMBOL.COIN_BONUS:
			prize = 100;
			break;
		case SYMBOL.DOUBLE_COINS:
			coins += coins;
			break;
		case SYMBOL.HEAD_START:
			// TODO function for headstart
			break;
		case SYMBOL.EXTRA_SPINS:
			tokens += 3;
			break;
		default: // equivalent to SYMBOL.SECOND_CHANCE:
			tokens += 1;
			break;
	}
	coins += prize;
}

$('button').click(function(){
	$('h1').text(betline());
});

