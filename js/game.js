var stage;
var spinning = false;
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

function init(){ 
	stage  = new createjs.Stage("slotmachine");

	initializeReels(reels, NUMBER_OF_REELS);

	reels.forEach(function (entry){
		stage.addChild(entry);
	});
	reels[0].nextStop = POSITION.BIG_BLAST
	reels[1].nextStop = POSITION.HEAD_START
	reels[2].nextStop = POSITION.EXTRA_SPINS
	reels[0].relativeDistance = reels[0].image.height*2 + reels[0].nextStop - reels[0].y;
	reels[1].relativeDistance = reels[1].image.height*3 + reels[1].nextStop - reels[1].y;
	reels[2].relativeDistance = reels[2].image.height*4 + reels[2].nextStop - reels[2].y;

	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);
}
/*
function handleClick(event){
	console.log("clicked");
}
*/
function tick(event){
	spin(this.reels[0]);
	spin(this.reels[1]);
	spin(this.reels[2]);
	stage.update();
}
/* spin the image */
function spin(reel){
	if(reel.relativeDistance > 0){
		//return the image to start position after last symbol is shown
		if(reel.y >= 0){
			reel.y -= reel.image.height;
		}

		if( reel.speed < 15){
			reel.speed+= acc;
		}else if(reel.relativeDistance <= 500){
			reel.speed-=reel.relativeDistance/1000;
		}
		reel.y += reel.speed;
		console.log(" y position 		: "+ reel.y);
		console.log(" speed and acc 	: "+ reel.speed + " - " + acc);
		console.log("relativeDistance 	: "+ reel.relativeDistance); 
		reel.relativeDistance -= reel.speed;
	}else{
		//correct reel position
		reel.y = reel.nextStop;
	}
		
}
// fill up the array with the reels
function initializeReels(reelsArray, numberOfReels){
	for (var i = 0; i <numberOfReels; i++){
		reelsArray.push(new createjs.Bitmap("assets/img/reel.jpeg"));
		reelsArray[i].relativeDistance = 0; // reference for reel next position
		reelsArray[i].y = POSITION.COIN_JACKPOT; // start position
		reelsArray[i].x = i*80; // space based on img width
		reelsArray[i].speed = 0.5; //start speed
		reelsArray[i].nextStop = POSITION.COIN_JACKPOT;
	}
}
function pull(){

}

