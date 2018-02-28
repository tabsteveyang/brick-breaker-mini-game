var paddle;
var paddleWidth = 95;
var paddleHeight = 20;
var paddleVelocity = 10;
var paddleFriction = 0.9;
var paddleStrokeWidth = 4;

var ball, ballVelocity;
var ballWidth = 18;
var ballSpeed = 5;

var gameIsStart = false;
var gameJustStart = false;
var gameEnd = false; //false | 'playerWin' | 'gameOver'
var playerLife = 0;
var playTime = 0;
var timmer;

var bricksPlot = [];
var bricksMarginX = 25;
var bricksMarginY = 45;
var bricksMagnification = 30;
var bricksStrokeWidth = 4;
var colorArray = ['#F8F4A6','#E08E45','#F24236','#429EA6','#BDF7B7'];

var canvasWidth = 600;
var canvasHeight = 400;

//p5 will run this function at the start. (it will only run once)
function setup(){
	createCanvas(canvasWidth, canvasHeight);
	ballVelocity = createVector(ballSpeed, ballSpeed);
	bricksInit();
	playTime = 0;
	playerLife = 3;
	timmer = setInterval(function(){playTime++}, 1000);
	gameInit();

}

//function will be called automatically.
function draw(){
	background('#ECEBE4');

	if(gameEnd === "playerWin"){
		drawPlayerWin();
	}
	//A. init object:
	//A-1: paddle:
	fill('lightgrey')
	.noStroke();
	rect(paddle.x, paddle.y, paddleWidth, paddleHeight); //rect(x, y, width, height);
	//A-2: ball:
	fill('grey');
	ellipse(ball.x, ball.y, ballWidth);
	//A-3: bricks:
	bricksPlot.forEach(function(brick){
		fill(brick.color)
			.stroke('gray')
			.strokeWeight(1);
		rect(
			brick.x,
			brick.y,
			bricksMagnification,
			bricksMagnification
		);
		fill('white');
	});

	//B. handle paddle:
	handleKeyPress();
	//C. handle ball:
	handleBall();
	//D. game rules: life & score information
	handleRules();
}
function bricksInit(){
	var XElementsCount = floor(canvasWidth/30-3);
	var YElementsCount = floor(canvasHeight/30/3);

	for(var i=0; i<=YElementsCount; i++){
		for(var j=0; j<=XElementsCount; j++){
			if(floor(random(0,2)) === 1){
				var color = colorArray[i];
				bricksPlot.push({
					x: j * bricksMagnification + bricksMarginX,
					y: i * bricksMagnification + bricksMarginY,
					w: j * bricksMagnification + bricksMarginX + bricksMagnification,
					h: i * bricksMagnification + bricksMarginY + bricksMagnification,
					color: color
				});					
			};
		}
	}
}
function gameInit(){
	var paddleMiddle = width/2 - paddleWidth/2;
	var paddleOriginalHeight = height - (paddleHeight+10);
	var ballMiddle = width/2 - ballWidth/2+10;

	paddle = createVector(paddleMiddle, paddleOriginalHeight);
	ball = createVector(ballMiddle, paddleOriginalHeight-(paddleHeight/2-1));
}
function handleRules(){
	fill('gray')
		.textSize(18)
		.textAlign(LEFT)
		.noStroke();
	text('Life:', 26, 27);
	text('TimeCounter:', 400, 27);
	text(playTime, 520, 27);

	fill('red');
	for(var i=1; i<=playerLife; i++){
		var lifeX = i * 20 + 60;
		var lifeY = 20.5;
		ellipse(lifeX, lifeY, 15, 15);
	}
}
function handleKeyPress(){
	if(keyIsDown(37)){ 			
		//move left
		paddle.x -= paddleVelocity * paddleFriction;
		if(!gameIsStart){
			ball.x -= paddleVelocity * paddleFriction;
			ball.x = constrain(ball.x, 51, width-51);
		}

	}else if(keyIsDown(39)){ 	
		//move right
		paddle.x += paddleVelocity * paddleFriction;
		if(!gameIsStart){
			ball.x += paddleVelocity * paddleFriction;
			ball.x = constrain(ball.x, 51, width-51);
		}
	}else if(keyIsDown(32)){
		if(!gameIsStart){
			gameIsStart = true;
			gameJustStart = true;
		}
	}else if(keyIsDown(13)){
		if(gameEnd === "playerWin" || gameEnd === "gameOver"){
			gameEnd = false;
			//restart the game.
			gameIsStart = false;
			setup(); 
		}
	}
	//make sure the paddle is moving in the range
	paddle.x = constrain(paddle.x, 5, width-(paddleWidth+5));
}
function handleBall(){
	if(gameIsStart){
		if(gameJustStart){
			ball.y -= abs(ballSpeed); //go straight until it hit someting.
			if(ball.x <= 0 || ball.x >= width || ball.y <= 0) gameJustStart = false;
			bricksBallCollideTest();
		}
		if(!gameJustStart){
			ball.x += ballVelocity.x;
			ball.y += ballVelocity.y;

			//hit lefter or right border
			if(ball.x <= 10 || ball.x >= width-10){
				ballVelocity.x *= -1;
				//ballVelocity.y *= -1;
			}
			//hit top
			if(ball.y <= 0){
				//ballVelocity.x *= -1;
				ballVelocity.y *= -1;
			}

			//hit paddle
			if(
				ball.y >= paddle.y-paddleStrokeWidth && 
				ball.y <= paddle.y && 
				ball.x >= paddle.x+paddleStrokeWidth && 
				ball.x <= paddle.x+paddleWidth+paddleStrokeWidth
			){
				ballVelocity.y *= -1;
			}
		
			//hit bricks
			bricksBallCollideTest();

			//hit bottom (lose a life and restart)
			if(ball.y >= height){
				//lose life & check if it is game over or not.
				if(!loseLife()){ //will return true if game is over.
					//restart game
					gameIsStart = false;
					gameInit();
				}else{
					//game over
					gameEnd = "gameOver";
					drawGameover();
				};

			}

							
		}
	}
}
function bricksBallCollideTest(){
	bricksPlot.forEach(function(brick, index){
		if(
			(ball.x >= brick.x-bricksStrokeWidth && ball.x <= brick.w+bricksStrokeWidth+2) &&
			(ball.y >= brick.y-bricksStrokeWidth && ball.y <= brick.h+bricksStrokeWidth)
		){
			gameJustStart = false;
			bricksPlot.splice(index, 1);
			ballVelocity.y *= -1;
		}
	});
	if(bricksPlot.length === 0){ gameEnd = "playerWin"};
}
function loseLife(){
	if(gameEnd !== "playerWin"){
		playerLife--;
		//game over
		if(playerLife <= 0){
			return true;
		}
	}
}
function drawPlayerWin(){
	clearInterval(timmer);
	fill('#BEB7A4')
		.textSize(80)
		.textStyle(BOLD)
		.textAlign(CENTER);
	text('YOU WON!', 290, height/2 - 60);
	fill('#A09A8A')
		.textSize(20)
		.textStyle(NORMAL)
		.textAlign(CENTER);
	text('press enter to restart.', 300, height/2 - 30);
}
function drawGameover(){
	clearInterval(timmer);

	fill('black');
	rect(0, 0, width, height);
	fill('white')
		.textSize(80)
		.textStyle(BOLD)
		.textAlign(CENTER);
	text('GAME OVER!', 290, height/2-60);
	fill('white')
		.textSize(20)
		.textStyle(NORMAL)
		.textAlign(CENTER);
	text('press enter to restart.', 290, height/2);
}