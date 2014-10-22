var stage;
var reel0, reel1, reel2;
// references for reels positioning
var POS_REEL1 = 80, POS_REEL2 =160;
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

function init(){ 
	stage  = new createjs.Stage("slotmachine");
	reels = [];
	for (var i = 0; i <3; i++){
		reels.push(new createjs.Bitmap("assets/img/reel.jpeg"));
	}
	
	reels[1].x = POS_REEL1;
	reels[1].y = POSITION.DOUBLE_TOKENS;
	reels[2].x = POS_REEL2;
	reels[2].y = POSITION.HEAD_START;

	reels.forEach(function (entry){
		stage.addChild(entry);
	});
	 
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);
}
/*
function handleClick(event){
	console.log("clicked");
}
function tick(event){
	stage.update();
}	
*/