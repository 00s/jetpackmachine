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
var lastPrize = "";
var spinResult = "";
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
	$("#spin-result").text(spinResult);
}

/* auxiliar function used when player have no more options to play */
function cantPlay(){
	if(confirm("You have neighter money nor tokens.\nWould you like to play again?")){
		window.location.reload(true);
		console.log("Game restarted");
	}
}

/* Check if player have enough tokens and colect one */
function colectToken(){
	if(tokens>0){
		tokens--;
		console.log("token colected. The player have " + coins + " coins and " + tokens + " tokens.");
		return true;
	}else if(coins > TOKEN_VALUE){
		alert("You dont have any tokens, but you can buy some.")
	}else{
		cantPlay();
	}
}

/* add coins */
function buyToken(){
	if(coins >= TOKEN_VALUE){
		coins -= TOKEN_VALUE;
		tokens++;
		console.log("Token bought. The player have "+ tokens +" tokens");
	}
	else if(tokens > 0){
		alert("You don't have enough money, but you still have tokens.");
		console.log("Player doesn't have money, but still have tokens.");
	}else{
		cantPlay();
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
	console.log("betline: " + actualReels);
}


/* Calculate prize acording to symbol combination */
function calculatePrize(symbol){
	var prize = 0;
	switch(symbol){
		case SYMBOL.COIN_JACKPOT:
			prize = 1000;
			lastPrize = "$$$ THE JACKPOT $$$"
			break;
		case SYMBOL.COIN_PRIZE:
			prize = 500;
			lastPrize = "500 COINS"
			break;
		case SYMBOL.ATOM_BLAST:
			prize = 385;
			lastPrize = "385 COINS"
			break;
		case SYMBOL.BIG_BLAST:
			prize = 260;
			lastPrize = "260 COINS"
			break;
		case SYMBOL.SMALL_BLAST:
			prize = 160;
			lastPrize = "160 COINS"
			break;
		case SYMBOL.COIN_BONUS:
			prize = 100;
			lastPrize = "100 COINS"
			break;
		case SYMBOL.DOUBLE_COINS:
			coins += coins;
			lastPrize = "ANOTHER" + coins + " COINS"
			break;
		case SYMBOL.HEAD_START:
			// TODO function for headstart
			lastPrize = "TODO HEAD_START PRIZE"
			break;
		case SYMBOL.EXTRA_SPINS:
			tokens += 3;
			lastPrize = "3 TOKENS"
			break;
		default: // equivalent to SYMBOL.DOUBLE_TOKENS:
			tokens += tokens;
			lastPrize = "ANOTHER"+ tokens +" TOKENS"
			break;
	}
	coins += prize;
}

function checkReels(){
	if(actualReels[0] === actualReels[1] && actualReels[1] === actualReels[2]){
		calculatePrize(actualReels[0]);
		spinResult = "YOU WON " + lastPrize +".";
		console.log("Player won with triple " + actualReels[0] + "combination.");
	}else{
		spinResult = (coins < TOKEN_VALUE && tokens <= 0) ? "GAME OVER" : "TRY AGAIN";
		console.log("Player lost.");
	}
}

/** slot machine interaction **/
$(function (){
	updateScreen();
	$('button').click(function(){
		if(colectToken()){
			betline();
			checkReels();
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
