/* global variables */
var stage;
var map = new BiMap;
var coins = 1000;
var tokens = 0;
var actualReels;
var lastPrize = "";
var displayMessage = "PULL THE LEVER";
/* constants */
var TOKEN_VALUE = 50;
var NUMBER_OF_REELS = 3;
var EXTRA_SIMBOLS = -175;
var REEL_PADDING = 50;

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

// acceleration references for the reels
var acc = 0.2;
// speed ref for the reels (number of pixels)
var reels = [];
var masks = []
var circle;
function init(){ 
	// define canvas as stage
	stage  = new createjs.Stage("slotmachine");

	initializeReels(reels, NUMBER_OF_REELS);

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);


    //Create a Shape
    circle = new createjs.Shape();
    circle.graphics.beginRadialGradientFill(["rgba(255,255,255,1)", "rgba(205,0,0,1)"], [0, 1], -18, -18, 0, 0, 0, 35).drawCircle(10, 10, 25);
    //circle.graphics.beginFill("red").drawCircle(0, 0, 20);
    //Set position of Shape instance.
    circle.x = 4*70;
    circle.y = 40;
    //Add Shape instance to stage display list.
    stage.addChild(circle);

    circle.addEventListener("click", setNextStop);

	loadBiMap(map, POSITION);
	console.log("Waiting for player moves...");
}

// main loop
function tick(event){
	// iterate over reel colection calling spinReel
	for(var i = 0; i < reels.length; i++){
		spinReel(reels[i]);
	}
	stage.update();
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
			reel.speed+= acc;
		} 
		// update reel position
		reel.y += reel.speed;
		// update reel relativeDistance
		reel.relativeDistance -= reel.speed;
		// log
		console.log(" y position 		: "+ reel.y);
		console.log(" speed 			: "+ reel.speed);
		console.log("relativeDistance 	: "+ reel.relativeDistance); 
	}else{
		reel.y = reel.nextStop; //correct reel position
		reel.relativeDistance = 0; // reset property;
		reel.spinning = false; // end of spinning
	}
}

// auxiliar funtion returns distance (in pixels) based on number of complete turns
function completeTurn(num){
	return (970)*num;
}

function setNextStop(){
		if(reelsStopped()){
			var betLine = betline();
			console.log(betLine);
			for(var i = 0; i < reels.length; i++){
					// set next stop
					reels[i].nextStop = betLine[i];
					// calculate relativeDistance according to reel sequence, atualPosition and nextStop
					reels[i].relativeDistance = completeTurn(i+2) + reels[i].nextStop - reels[i].y;
					console.log("next stop " + i + ": " + reels[i].nextStop + ", relative dist.: " + reels[i].relativeDistance);
			}
			console.log("Next stops set.");
		}
}

// check if all reels are stopped
function reelsStopped(){
	var stopped = (!reels[0].spinning && !reels[1].spinning && !reels[2].spinning) ? true : false;
	console.log("reels stopped : " + stopped);
	return stopped;
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
		rectMask.graphics.beginStroke('#fe0') .setStrokeStyle(2).rect(xOffset*i+1, 0, 80, 170);
		// add mask to array, set mask to reel and stage mask
		masks.push(rectMask);
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
function spin(){
	var virtualReel = Math.floor(Math.random() * 90); // generate number up to 90
	return map.val(virtualReel); // return the key given the value 
}
/* return a betline result */
function betline(){
	var reelSet = [];
	for(i = 0; i < 3; i++){
		reelSet.push(spin());
	}
	return reelSet;
}

