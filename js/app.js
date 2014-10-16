/* enumeration for SYMBOLS (freeze option prevent keys to be modified)*/
var SYMBOL = Object.freeze({COIN_JACKPOT: 	0, 
							COIN_PRIZE: 	1, 
							ATOM_BLAST: 	2, 
							BIG_BLAST: 		3, 
							SMALL_BLAST: 	4, 
							COIN_BONUS: 	5, 
							EXTRA_SPINS: 	6, 
							SECOND_CHANCE: 	7, 
							DOUBLE_COINS: 	8, 
							HEAD_START: 	9});
/* global variables */
var map = new BiMap;
/* initialize bimap with values in descending order of importance. */
loadMap( map, SYMBOL.COIN_JACKPOT	, 0, 0);
loadMap( map, SYMBOL.COIN_PRIZE		, 1, 2); 	
loadMap( map, SYMBOL.ATOM_BLAST		, 3, 6);	
loadMap( map, SYMBOL.BIG_BLAST		, 7, 12);	
loadMap( map, SYMBOL.SMALL_BLAST	, 13, 20);
loadMap( map, SYMBOL.COIN_BONUS		, 21, 30);
loadMap( map, SYMBOL.EXTRA_SPINS	, 31, 42);
loadMap( map, SYMBOL.SECOND_CHANCE	, 43, 56);
loadMap( map, SYMBOL.DOUBLE_COINS	, 57, 72);
loadMap( map, SYMBOL.HEAD_START		, 73, 90);

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

$(console.log("betline: " + betline()));

