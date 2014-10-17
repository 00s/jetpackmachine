/* enumeration for SYMBOLS (freeze option prevent keys to be modified)*/
var SYMBOL = Object.freeze({COIN_JACKPOT: 	"Coin Jackpot", 
							COIN_PRIZE: 	"Coin Prize", 
							ATOM_BLAST: 	"Atom Blast", 
							BIG_BLAST: 		"Big Blast", 
							SMALL_BLAST: 	"Small Blast", 
							COIN_BONUS: 	"Coin Bonus", 
							EXTRA_SPINS: 	"Extra Spins", 
							DOUBLE_TOKENS: 	"Double Tokens", 
							DOUBLE_COINS: 	"Double Coins", 
							HEAD_START: 	"Head Start"});
/* global variables */
var map = new BiMap;
var coins = 1000;
var tokens = 0;
var actualReels = "PULL THE LEVER";
/* constants */
const TOKEN_VALUE = 50;
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
loadMap( map, SYMBOL.DOUBLE_TOKENS 	, 73, 90);

/* update DOM content */
function updateScreen(){
	$("h2#coins strong").text(coins);
	$("h2#tokens strong").text(tokens);
	$("h1#betline").text(actualReels);
}

/* Check if player have enough tokens */
function checkTokens(){
	if(tokens>0){
		tokens--;
		return true;
		console.log("token consumed. The player have " + coins + " coins and " + tokens + " tokens.");
	}else{
		alert("You don't have tokens.");
	}
}

/* return 90% of token value if player wants to cash the token in */
function cashIn(){
	if(tokens>0){
		tokens--;
		coins += (TOKEN_VALUE*0.9);
		console.log("token cashed in. The player have " + coins + " coins and " + tokens + " tokens.")
	}else{
		alert("You don't have tokens to be cashed in.");
	}
}

/* return a valid reel position */
function spin(){
	var virtualReel = Math.floor(Math.random() * 999999999 + 1); // generate number up to 1 Bi
	virtualReel %= 90; // reduce the options to 90
	return map.val(virtualReel); // return the key given the value 
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
	actualReels = reels + "";
}

/* add coins */
function buyToken(){
	if(coins >= TOKEN_VALUE){
		coins -= TOKEN_VALUE;
		tokens++;
		console.log("Token bought. The player have "+ tokens +" tokens");
	}
	else{
		confirm("You don't have enough money. Would you like to play again?");
	}
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
		default: // equivalent to SYMBOL.DOUBLE_TOKENS:
			tokens += tokens;
			break;
	}
	coins += prize;
}

/** slot machine controls **/

// LEVER
$(function (){
	updateScreen();
	$('button').click(function(){
		if(checkTokens()){
			betline();
		}
		updateScreen();
	});
	$('#buy-token').click(function(){
		buyToken();
		updateScreen();
	});
	$('#cash-in').click(function(){
		cashIn();
		updateScreen();
	});
	

});
