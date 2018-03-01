function Game(){
    this.isStart = false;
    this.justStart = false;
    this.isEnd = false; //false | 'playerWin' | 'gameOver'
    this.playerLife = 3;
    this.playTime = 0;
    this.timmer = undefined;
    this.canvasWidth = 600;
    this.canvasHeight = 400;
}
