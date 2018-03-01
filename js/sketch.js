//game info:
var game = new Game();
//paddle:
var paddle = new Paddle();
var paddleInit;
//ball:
var ball = new Ball();
var ballInit;
//bricks:
var brickExample = new Brick();
var bricksPlot = [];
var colorArray = ['#F8F4A6','#E08E45','#F24236','#429EA6','#BDF7B7'];

//p5 will run this function at the start. (it will only run once)
function setup(){
    stageInit();
    game.playTime = 0;
    game.playerLife = 3;
    game.timmer = setInterval(function(){game.playTime++}, 1000);
    gameRestart();
}

//function will be called automatically.
function draw(){
    background('#ECEBE4');
    
    if(game.isEnd === "playerWin"){
        drawPlayerWin();
    }
    //A. init object:
    //A-1: paddle:
    fill(paddle.fill)
        .noStroke();
    rect(paddle.x, paddle.y, paddle.width, paddle.height); //rect(x, y, width, height);
    //A-2: ball:
    fill(ball.fill);
    ellipse(ball.x, ball.y, ball.width);
    //A-3: bricks:
    bricksPlot.forEach(function(brick){
        fill(brick.fill)
            .stroke('gray')
            .strokeWeight(1);
        rect(
            brick.x,
            brick.y,
            brick.magnification,
            brick.magnification
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

function stageInit(){
    //canvas obj:
    createCanvas(game.canvasWidth, game.canvasHeight);
    //paddle obj:
    paddle.middle = width/2 - paddle.width/2;
    paddle.originalHeight = height - (paddle.height + 10);
    paddleInit = createVector(paddle.middle, paddle.originalHeight);
    //ball obj:
    ball.middle = (width / 2);
    ballInit = createVector(ball.middle, paddle.originalHeight - (paddle.height/2 - 1));
    ball.velocity = createVector(ball.speed, ball.speed);
    //bricks obj:
    bricksInit();
}

function bricksInit(){
    var XElementsCount = floor((game.canvasWidth / 30) - 3);
    var YElementsCount = floor(game.canvasHeight / 30 / 3);
    
    for(var i=0; i<=YElementsCount; i++){
        for(var j=0; j<=XElementsCount; j++){
            if(floor(random(0,2)) === 1){
                var color = colorArray[i];
		var brick = new Brick();
                brick.x = j * brick.magnification + brick.marginX;
                brick.y = i * brick.magnification + brick.marginY;
                brick.w = j * brick.magnification + brick.marginX + brick.magnification;
                brick.h = i * brick.magnification + brick.marginY + brick.magnification;
                brick.fill = color;

                bricksPlot.push(brick);                    
            };
        }
    }
}

function gameRestart(){
    //init paddle:
    paddle.x = paddleInit.x;
    paddle.y = paddleInit.y;
    //init ball:
    ball.x = ballInit.x;
    ball.y = ballInit.y;
}

function handleRules(){
    fill('gray')
        .textSize(18)
        .textAlign(LEFT)
        .noStroke();
    text('Life:', 26, 27);
    text('TimeCounter:', 400, 27);
    text(game.playTime, 520, 27);

    fill('red');
    for(var i=1; i<=game.playerLife; i++){
        var lifeX = i * 20 + 60;
        var lifeY = 20.5;
        ellipse(lifeX, lifeY, 15, 15);
    }
}

function handleKeyPress(){
    if(keyIsDown(37)){             
        //move left
        paddle.x -= paddle.velocity * paddle.friction;
        if(!game.isStart){
            ball.x -= paddle.velocity * paddle.friction;
            ball.x = constrain(ball.x, 51, width-51);
        }

    }else if(keyIsDown(39)){     
        //move right
        paddle.x += paddle.velocity * paddle.friction;
        if(!game.isStart){
            ball.x += paddle.velocity * paddle.friction;
            ball.x = constrain(ball.x, 51, width-51);
        }
    }else if(keyIsDown(32)){
        if(!game.isStart){
            game.isStart = true;
            game.justStart = true;
        }
    }else if(keyIsDown(13)){
        if(game.isEnd === "playerWin" || game.isEnd === "gameOver"){
            game.isEnd = false;
            //restart the game.
            game.isStart = false;
            setup(); 
        }
    }
    //make sure the paddle is moving in the range
    paddle.x = constrain(paddle.x, 5, width-(paddle.width+5));
}

function handleBall(){
    if(game.isStart){
        if(game.justStart){
            ball.y -= abs(ball.speed); //go straight until it hit someting.
            if(ball.x <= 0 || ball.x >= width || ball.y <= 0) game.justStart = false;
            bricksBallCollideTest();
        }
        if(!game.justStart){
            ball.x += ball.velocity.x;
            ball.y += ball.velocity.y;
            
            //hit lefter or right border
            if(ball.x <= 10 || ball.x >= width-10){
                ball.velocity.x *= -1;
            }
            //hit top
            if(ball.y <= 0){
                ball.velocity.y *= -1;
            }
            
            //hit paddle
            if(
                ball.y >= paddle.y - paddle.strokeWidth && 
                ball.y <= paddle.y && 
                ball.x >= paddle.x + paddle.strokeWidth && 
                ball.x <= paddle.x + paddle.width + paddle.strokeWidth
            ){
                ball.velocity.y *= -1;
            }
            
            //hit bricks
            bricksBallCollideTest();
            
            //hit bottom (lose a life and restart)
            if(ball.y >= height){
                //lose life & check if it is game over or not.
                if(!loseLife()){ //will return true if game is over.
                    //restart game
                    game.isStart = false;
                    gameRestart();
                }else{
                    //game over
                    game.isEnd = "gameOver";
                    drawGameover();
                };
            }
        }
    }
}

function bricksBallCollideTest(){
    bricksPlot.forEach(function(brick, index){
	//var isHit = collideRectCircle(brick.x, brick.y, brick.w, brick.h, ball.x, ball.y, ball.width);
	//console.log(isHit);
        if(		
            (ball.x >= brick.x - brickExample.strokeWidth && ball.x <= brick.w + brickExample.strokeWidth+2) &&
            (ball.y >= brick.y - brickExample.strokeWidth && ball.y <= brick.h + brickExample.strokeWidth)
	){
            game.justStart = false;
            bricksPlot.splice(index, 1);
            ball.velocity.y *= -1;
        }
    });
    if(bricksPlot.length === 0){ game.isEnd = "playerWin"};
}

function loseLife(){
    if(game.isEnd !== "playerWin"){
        game.playerLife--;
        //game over
        if(game.playerLife <= 0){
            return true;
        }
    }
}

function drawPlayerWin(){
    clearInterval(game.timmer);
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
    clearInterval(game.timmer);

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
