/* global variables */
var stage;
var map = new BiMap;
// Player belongings
var coins = 1000;
var tokens = 1;

var actualReels = ["z","j","z"]; // actual raffled reels // placeholder
var lastReels	= ["z","j","z"]; // last raffled reels // used for flow control
var reelsCanvas	= []; // set of objects representing the reels on Canvas
var buttons 	= [];

var lastPrize = "";
var displayMessage = "PULL THE LEVER";


/* constants */
var TOKEN_VALUE 	= 50; // in coins
var NUMBER_OF_REELS = 3;
var EXTRA_SIMBOLS 	= -175; // used to readjust reel positioning
var REEL_PADDING 	= 50;
var ACC = 0.2; // acceleration
var COLOURS = ["rgba(205,0,0,1)","rgba(0,205,0,1)","rgba(0,0,205,1)"]; // colour reference for buttons

/* enumeration for SYMBOL POSITIONS (freeze option prevent keys to be modified)*/
var POSITION = Object.freeze({	COIN_BONUS:     -970+REEL_PADDING, 
								COIN_JACKPOT:	-99 +REEL_PADDING, 
								BIG_BLAST: 		-200+REEL_PADDING, 
								DOUBLE_TOKENS: 	-300+REEL_PADDING,
								DOUBLE_COINS: 	-395+REEL_PADDING, 
								COIN_PRIZE: 	-485+REEL_PADDING, 
								SMALL_BLAST: 	-585+REEL_PADDING, 
								ATOM_BLAST: 	-685+REEL_PADDING, 
								EXTRA_SPINS: 	-786+REEL_PADDING, 
								HEAD_START: 	-890+REEL_PADDING});

function init(){ 
	// define canvas as stage
	stage = new createjs.Stage("slotmachine");

	initializeReels(reelsCanvas, NUMBER_OF_REELS);
	// ticker setup
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);


    /* 
      	buttons setup 
			0 : lever
			1 : buy token
			2 : cash in
    */
    for(var i=0 ; i<3 ; i++){
    	buttons.push(new createjs.Shape());
    	buttons[i].graphics.beginRadialGradientFill(["rgba(255,255,255,1)", COLOURS[i]], [0, 1], -18, -18, 0, 0, 0, 35).drawCircle(10, 10, 25);
	    buttons[i].x = 4*70;
	    buttons[i].y = (i+1)*40;
    	//Add Shape instance to stage display list.
    	stage.addChild(buttons[i]);
    }

    // add event listener for the buttons
    buttons[0].addEventListener("click", pullTheLever);
    buttons[1].addEventListener("click", buyToken);
    buttons[2].addEventListener("click", cashIn);

	loadBiMap(map, POSITION);
	console.log("Waiting for player moves...");
}

// main loop
function tick(event){
	// iterate over reel colection calling spinReel
	for(var i = 0; i < reelsCanvas.length; i++){
		spinReel(reelsCanvas[i]);
	}
	stage.update();
	updateTextOnScreen();
}
/* update DOM content */
function updateTextOnScreen(){
	$("#display").text(displayMessage);
	$("h2#coins strong").text(coins);
	$("h2#tokens strong").text(tokens);
}

/* spin given reel:
	condition - relativeDistance (from nextStop) must be greater than 0	 */
function spinReel(reel){
	if(reel.relativeDistance > 0){
		reel.spinning = true;
		//return the image to start position after last symbol is shown
		if(reel.y >= POSITION.COIN_JACKPOT){
			reel.y = POSITION.HEAD_START + EXTRA_SIMBOLS;
		}
		// set max speed
		if(reel.relativeDistance <= 500){
			reel.speed -= 0.2;
		}else if( reel.speed < 15){
			reel.speed+= ACC;
		} 
		// update reel position
		reel.y += reel.speed;
		// update reel relativeDistance
		reel.relativeDistance -= reel.speed;
		// log
		//console.log(" y position 		: "+ reel.y);
		//console.log(" speed 			: "+ reel.speed);
		//console.log("relativeDistance 	: "+ reel.relativeDistance); 
	}else{
		reel.y = reel.nextStop; //correct reel position
		reel.relativeDistance = 0; // reset property;
		reel.spinning = false; // end of spinning
		if(lastReels != actualReels && reel === reelsCanvas[2]){
			checkReels(); // check combination
			lastReels = actualReels;
		}
	}
}

// auxiliar funtion returns distance (in pixels) based on number of complete turns
function completeTurn(num){
	return (970)*num;
}

function pullTheLever(){
		if(reelsStopped()){
			if(colectToken()){
				actualReels = betline();
				console.log(actualReels);
				for(var i = 0; i < reelsCanvas.length; i++){
						// set next stop
						reelsCanvas[i].nextStop = actualReels[i];
						// calculate relativeDistance according to reel sequence, atualPosition and nextStop
						reelsCanvas[i].relativeDistance = completeTurn(i+2) + reelsCanvas[i].nextStop - reelsCanvas[i].y;
						console.log("next stop " + i + ": " + reelsCanvas[i].nextStop + ", relative dist.: " + reelsCanvas[i].relativeDistance);
				}
				console.log("Next stops set.");
			}
		}
}

/* check if all reels are stopped */
function reelsStopped(){
	var stopped = (!reelsCanvas[0].spinning && !reelsCanvas[1].spinning && !reelsCanvas[2].spinning) ? true : false;
	console.log("reels stopped : " + stopped);
	return stopped;
}
/* Check if player have enough tokens and colect one */
function colectToken(){
	if(tokens>0){
		tokens--;
		console.log("token colected. The player has " + coins + " Coins and " + tokens + " Tokens.");
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
		console.log("Token bought. The player has " + tokens + " tokens");
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
/* auxiliar function used when player have no more options to play */
function cantPlay(){
	if(confirm("You have neighter money nor tokens.\nWould you like to play again?")){
		window.location.reload(true);
		console.log("Game restarted");
	}
}
/* Check if the three reels have stopped at the same symbol */
function checkReels(){
	if(actualReels[0] == actualReels[1] || actualReels[1] == actualReels[2]){
		calculatePrize(actualReels[0]);
		displayMessage = "YOU WON " + lastPrize +".";
		console.log("Player won "+ lastPrize + " with " + actualReels[0] + " combination.");
	}else{
		displayMessage = (coins < TOKEN_VALUE && tokens <= 0) ? "GAME OVER" : "TRY AGAIN";
		console.log("Player lost.");
	}
}

/* Calculate prize acording to symbol combination */
function calculatePrize(symbol){
	var prize = 0;
	switch(symbol){
		case POSITION.COIN_JACKPOT:
			prize = 1000;
			lastPrize = "$$$ THE JACKPOT $$$"
			break;
		case POSITION.COIN_PRIZE:
			prize = 500;
			break;
		case POSITION.ATOM_BLAST:
			prize = 385;
			break;
		case POSITION.BIG_BLAST:
			prize = 260;
			break;
		case POSITION.SMALL_BLAST:
			prize = 160;
			break;
		case POSITION.COIN_BONUS:
			prize = 100;
			break;
		case POSITION.DOUBLE_COINS:
			lastPrize = "ANOTHER " + coins + " COINS"
			coins += coins;
			break;
		case POSITION.HEAD_START:
			prize = headStartPrize();
			break;
		case POSITION.EXTRA_SPINS:
			tokens += 3;
			lastPrize = "3 TOKENS"
			break;
		case POSITION.DOUBLE_TOKENS:
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
/* generate a random number between 50 and 150 for the HEAD_START prize */
function headStartPrize(){
	return Math.floor(Math.random() * 100 + 50);
}

// fill up the array with the reels and set up variables
function initializeReels(reelsArray, numberOfReels){

	var xOffset = 85;
	for (var i = 0; i <numberOfReels; i++){
		reelsArray.push(new createjs.Bitmap("assets/img/reelz.jpeg"));
		reelsArray[i].relativeDistance = 0; // reference for reel next position
		reelsArray[i].x = i*xOffset+1; // space based on img width
		reelsArray[i].speed = 0.5; //start speed
		reelsArray[i].nextStop = POSITION.COIN_BONUS;
		reelsArray[i].spinning = false;

		//mask for reels
		var rectMask = new createjs.Shape();
		rectMask.graphics.beginStroke('grey') .setStrokeStyle(3).rect(xOffset*i+1, 0, 80, 170);
		// set mask to reel
		reelsArray[i].mask =rectMask;
		//stage the elements
		stage.addChild(reelsArray[i]);
		stage.addChild(rectMask);
	}
}

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
		mapValuesToKey(map, value, start, end);
		start = end + 1;
		end = Math.floor(range * 1.5 + end);
	});
	console.log((firstRange*100/(start-1)) + "% chance for the first symbol");
	console.log(Math.round(range*100/(start-1)) + "% chance for the last symbol");
}

/* auxiliar function for loading BiMap acording to key and set of values(from 'start' to 'end') */
function mapValuesToKey(map, key, start, end){
	var nums = [];
	for(i = start; i <=end; i++){
		nums.push(i);
	}
	map.push(key, nums);
}

////// BETLINE

/* return a valid reel position */
function reelPosition(){
	var virtualReel = Math.floor(Math.random() * 90); // generate number up to 90
	return map.val(virtualReel); // return the key given the value 
}
/* return a betline result */
function betline(){
	var reelSet = [];
	for(i = 0; i < 3; i++){
		reelSet.push(reelPosition());
	}
	return reelSet;
}

