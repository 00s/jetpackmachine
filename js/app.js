/* enumeration for SYMBOLS (freeze option prevent keys to be modified)*/
var SYMBOL = Object.freeze({COIN_JACKPOT: 	"Coin Jackpot", 
							COIN_PRIZE: 	"Coin Prize", 
							ATOM_BLAST: 	"Atom Blast", 
							BIG_BLAST: 		"Big Blast", 
							SMALL_BLAST: 	"Small Blast", 
							COIN_BONUS: 	"Coin Bonus", 
							DOUBLE_COINS: 	"Double Coins", 
							HEAD_START: 	"Head Start",
							EXTRA_SPINS: 	"Extra Spins", 
							DOUBLE_TOKENS: 	"Double Tokens"}); 
/* global variables */
var map = new BiMap;
var coins = 1000;
var tokens = 0;
var actualReels = "Coin Jackpot,Coin Jackpot,Coin Jackpot";
var lastPrize = "";
var displayMessage = "PULL THE LEVER";
/* constants */
const TOKEN_VALUE = 50;

/* auxiliar function to initialize bimap distributing weighted values for each key.
 * first key element of the list has always less associated values than the later ones.
 * console.log demonstrates proportions
 */
function loadBiMap(map, set){
	var start = 0;
	var end = 1;
	var firstRange = end - start + 1; // used just for comparative pouposes
	var range;
	// iterate over each list element for seting values dinamically
	$.each(set, function(key, value){
		range = end - start + 1;
		console.log("start: " + start+ "    \tend: " + end + "  \t\t| range: " + range);
		loadMap(map, value, start, end);
		start = end + 1;
		end = Math.floor(range * 1.5 + end);
	});
	console.log((firstRange*100/(start-1)) + "% chance for the first symbol");
	console.log(Math.round(range*100/(start-1)) + "% chance for the last symbol");
}

/* update DOM content */
function updateScreen(){
	$("h2#coins strong").text(coins);
	$("h2#tokens strong").text(tokens);
	$("h1#betline").text(actualReels);
	$("#display").text(displayMessage);
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
		console.log("token colected. The player have " + coins + " Coins and " + tokens + " Tokens.");
		return true;
	}else if(coins > TOKEN_VALUE){
		alert("You dont have any tokens, but you can buy some.")
		console.log("Player tried to pull the lever without insert any tokens. Alert message was shown.");
	}else{
		cantPlay();
	}
}

/* token purchase */
function buyToken(){
	if(coins >= TOKEN_VALUE){
		coins -= TOKEN_VALUE;
		tokens++;
		console.log("Token bought. The player have " + tokens + " tokens");
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
		console.log("Player tried to cashe a token in, but he doesn't have any. Alert message was shown.");
	}
}

/* auxiliar function for loading BiMap */
function loadMap(map, key, start, end){
	var nums = [];
	for(i = start; i <=end; i++){
		nums.push(i);
	}
	map.push(key, nums);
}

/* return a valid reel position */
function spin(){
	var virtualReel = Math.floor(Math.random() * 999999999 + 1); // generate number up to 1 Bi
	virtualReel %= 90; // reduce the options to 90
	return map.val(virtualReel); // return the key given the value 
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
			lastPrize = "$$$ THE JACKPOT $$$"
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
			lastPrize = "ANOTHER " + coins + " COINS"
			coins += coins;
			break;
		case SYMBOL.HEAD_START:
			prize = headStartPrize();
			break;
		case SYMBOL.EXTRA_SPINS:
			tokens += 3;
			lastPrize = "3 TOKENS"
			break;
		case SYMBOL.DOUBLE_TOKENS:
			lastPrize = "ANOTHER "+ tokens +" TOKENS"
			tokens += tokens;
			break;
	}
	// compose lastPrize message for coins prize
	if(prize >0 && prize != 1000){
		lastPrize = prize + " COINS";
	}
	coins += prize;
}

function checkReels(){
	if(actualReels[0] == actualReels[1] && actualReels[1] == actualReels[2]){
		calculatePrize(actualReels[0]);
		displayMessage = "YOU WON " + lastPrize +".";
		console.log("Player won "+ lastPrize + " with " + actualReels[0] + " combination.");
	}else{
		displayMessage = (coins < TOKEN_VALUE && tokens <= 0) ? "GAME OVER" : "TRY AGAIN";
		console.log("Player lost."+ actualReels[0]);
	}
}

/* generate a random number between 50 and 150 for the HEAD_START prize */
function headStartPrize(){
	return Math.floor(Math.random() * 100 + 50);
}

/** slot machine interaction **/
$(function (){
	loadBiMap(map, SYMBOL);
	console.log("Waiting for player moves...");
	updateScreen();
	$('button').click(function(){
		if(colectToken()){
			actualReels = betline();
			console.log("betline:\n 1 - " + actualReels[0]+ "\n 2 - "+ actualReels[1] +"\n 3 - "+ actualReels[2]);
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
