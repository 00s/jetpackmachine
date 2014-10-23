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

/* enumeration for SYMBOL POSITIONS (freeze option prevent keys to be modified)*/
var POSITION = Object.freeze({	COIN_BONUS: 	0, 
								COIN_JACKPOT:	-99, 
								BIG_BLAST: 		-200, 
								DOUBLE_TOKENS: 	-300,
								DOUBLE_COINS: 	-395, 
								COIN_PRIZE: 	-485, 
								SMALL_BLAST: 	-585, 
								ATOM_BLAST: 	-685, 
								EXTRA_SPINS: 	-786, 
								HEAD_START: 	-890});

// acceleration references for the reels
var acc = 0.2;
// speed ref for the reels (number of pixels)
var reels = [];
var circle;
function init(){ 
	// define canvas as stage
	stage  = new createjs.Stage("slotmachine");

	initializeReels(reels, NUMBER_OF_REELS);
	// add initilized reels to stage
	reels.forEach(function (entry){
		stage.addChild(entry);
	});

	// set frame Ticker frame rate
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);

    //Create a Shape
    circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 40);
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
	condition - relativeDistance (from nextStop) must be greater than 0	
 */
function spinReel(reel){
	if(reel.relativeDistance > 0){
		reel.spinning = true;
		//return the image to start position after last symbol is shown
		if(reel.y >= 0){
			reel.y -= reel.image.height;
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
	return reels[0].image.height*num;
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
	for (var i = 0; i <numberOfReels; i++){
		reelsArray.push(new createjs.Bitmap("assets/img/reel.jpeg"));
		reelsArray[i].relativeDistance = 0; // reference for reel next position
		reelsArray[i].y = POSITION.COIN_JACKPOT; // start position
		reelsArray[i].x = i*80; // space based on img width
		reelsArray[i].speed = 0.5; //start speed
		reelsArray[i].nextStop = POSITION.COIN_JACKPOT;
		reelsArray[i].spinning = false;
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

