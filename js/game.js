/* global variables */
var stage;
var map = new BiMap;
// Player belongings
var coins = 1000;
var tokens = 1;
// colections
var actualReels = ["x","y","z"]; // actual raffled reels // placeholder
var lastReels	= ["x","y","z"]; // last raffled reels // used for flow control
var reelsCanvas	= []; // set of objects representing the reels on Canvas
var buttons 	= [];
// butons
var btBuyToken;
var btCashIn;
// LEVER
var lever;
// lever ref
var leverPushed = false;
// messages
var msgDisplayMessage;
var msgCoinAmount;
var msgTokenAmount;
// strings ref
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
// config canvas
function init(){ 
	// define canvas as stage
	stage = new createjs.Stage("slotmachine");
	// reels setup
	initializeReels(reelsCanvas, NUMBER_OF_REELS);
	// ticker setup
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);
    /* lever setup */
	redLever =  new createjs.Shape();
	// buttons.push(new createjs.Shape());
	redLever.graphics.beginRadialGradientFill(["rgba(255,255,255,1)", "rgba(180,0,0,1)"], [0, 1], -8, -10, 0, 0, 0, 25).drawCircle(10, 10, 20);
    redLever.x = 290;
    redLever.y = 30;
	// //Add Shape instance to stage display list.
	stage.addChild(redLever);

    btBuyToken = new createjs.Text();
    btCashIn = new createjs.Text();
    msgDisplayMessage = new createjs.Text();
    msgCoinAmount = new createjs.Text();
    msgTokenAmount = new createjs.Text();

    configText(btBuyToken, '26px Squada One', 'yellow', "BUY TOKEN", 20, 180, true);
    configText(btCashIn, '26px Squada One', 'yellow', "CASH IN", 200, 180, true);
    configText(msgDisplayMessage, '46px Squada One', 'red', "", 40, 210, true);
    configText(msgCoinAmount, '26px Squada One', 'white', "", 20, 270, true);
    configText(msgTokenAmount, '26px Squada One', 'white',"", 175, 270, true);

    //mask for display
	var displayMask = new createjs.Shape();
	displayMask.graphics.beginStroke('green').setStrokeStyle(3).rect(-1, 210, 294, 50);
	msgDisplayMessage.mask = displayMask;
	stage.addChild(displayMask);

    // add event listeners for the buttons
    //redLever.addEventListener("click", pullTheLever);
    btBuyToken.addEventListener("click", buyToken);
    btCashIn.addEventListener("click", cashIn);
    btBuyToken.addEventListener("mouseover", over);
    btBuyToken.addEventListener("mouseout", out);
    btCashIn.addEventListener("mouseover", over);
    btCashIn.addEventListener("mouseout", out);
    // enable mouse over
    stage.enableMouseOver(10);
	// lets drag continue to track the mouse when it leaves the canvas:
	stage.mouseMoveOutside = true; 

    redLever.on("pressmove", function(event){
    	// currentTarget will be the container that the event listener was added to:
    	if(event.stageY < 100){
			event.currentTarget.y = event.stageY;
    	}
		// make sure to redraw the stage to show the change:
		stage.update();   
    });
    redLever.on("pressup", function(event) { 
    	if(redLever.y > 30){
    		leverPushed = true;
    	}
    	if(redLever.y > 50){
    		pullTheLever();
    	}
    	console.log("Lever released"); 
    });

	loadBiMap(map, POSITION);
	console.log("Waiting for player moves...");
}
function over(event){
	event.target.color = 'red';
}
function out(event){
	event.target.color = 'yellow';
}

// main loop
function tick(event){
	// iterate over reel colection calling spinReel
	for(var i = 0; i < reelsCanvas.length; i++){
		spinReel(reelsCanvas[i]);
	}
	stage.update();
	updateContent();
}
/* update DOM content */
function updateContent(){
	if(msgDisplayMessage.x < -(msgDisplayMessage.getMeasuredWidth())){
		msgDisplayMessage.x = 295;
	}
	msgDisplayMessage.x -= 2;
	msgCoinAmount.text = "COINS: " + coins;
	msgTokenAmount.text = "TOKENS: " + tokens;
	if(redLever.y > 30 && leverPushed){
		redLever.y -=5;
	}else{
		leverPushed = false;
	}
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
	msgDisplayMessage.text = displayMessage;
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
	var margin = 20
	for (var i = 0; i <numberOfReels; i++){
		var xPosition = (i*xOffset+1) + margin;
		reelsArray.push(new createjs.Bitmap("assets/img/reelz.jpeg"));
		reelsArray[i].relativeDistance = 0; // reference for reel next position
		reelsArray[i].x = xPosition; // space based on img width
		reelsArray[i].speed = 0.5; //start speed
		reelsArray[i].nextStop = POSITION.COIN_BONUS;
		reelsArray[i].spinning = false;

		//mask for reels
		var rectMask = new createjs.Shape();
		rectMask.graphics.beginStroke('grey').setStrokeStyle(3).rect(xPosition, margin, 80, 150);
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

/* auxiliar function for text set up */
function configText(variable, font, color, text, x, y, shadow){
	variable.font = font;
	variable.color = color;
	variable.text = text;
	if(shadow){
		variable.shadow = new createjs.Shadow("grey", 2, 5, 7);
	}
	variable.x = x;
	variable.y = y;
	stage.addChild(variable);
}
