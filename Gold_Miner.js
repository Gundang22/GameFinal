let ctx;
let background = new Image();
background.src = "GameImage/background.png";
let cramp = new Image();
cramp.src = "GameImage/cramp_dd.png";
let hook = new Image();
hook.src = "GameImage/hook_d.png";
let character = new Image();
character.src = "GameImage/character_dd.png";
let gold = new Image();
gold.src = "GameImage/gold.png";
let startButton = new Image();
startButton.src = "GameImage/gameButton.png";
let rock = new Image();
rock.src = "GameImage/stone.png";
let diamond = new Image();
diamond.src = "GameImage/di.png";
let backboard = new Image();
backboard.src = "GameImage/backboard.png";
let startpage = new Image();
startpage.src = "GameImage/startpage.png";

let start;
let hookAngle;
let hookX, hookY;
let hookInitialX = 453, hookInitialY = 80;
let hookLineX, hookLineY;
let crampX = 425, crampY = 38
let characterX = 470, characterY = 20
let shot = false;
let points = 0;
let hookLength;
let gameTime;
let goalPoints = 0;
let bigMineralSpeed = 0.35, smallMineralSpeed = 0.8, diamondSpeed = 0.95;
let difficulty;
let minerals;

//set up function
function setup(){
    let canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    gameUI();
}

//function that starts the game
function startGame(){
    //initialize values inside game
    setLevel();
    let reverse = false;
    let hookReturn = false;
    let hookSpeedX = 0, hookSpeedY = 0;
    let grabbed = undefined;
    let mineralKind = undefined;

    start = setInterval(
        function(){
            //draws out the canvas
            drawGameObjects();
            gameTime--;

            //if the hook hasn't been shot
            if(shot == false){
                //check which direction the hook swings
                if(reverse == false){
                    hookAngle+=0.05;
                    if(hookAngle > 1.3){
                        reverse = true;
                    }
                }
                else{
                    hookAngle-=0.05;
                    if(hookAngle < -1.3){
                        reverse = false;
                    }
                }
                hookX = hookInitialX - Math.sin(hookAngle)*50;
                hookY = hookInitialY + Math.cos(hookAngle)*50;
            }
            
            else{
                //if the hook isn't about to return 
                if(hookReturn == false){
                    //the speed of hook is determined by it's angle
                    hookSpeedX = Math.sin(hookAngle)*15;
                    hookSpeedY = Math.cos(hookAngle)*15;
                    //move the hook
                    hookX -= hookSpeedX;
                    hookY += hookSpeedY;
                    hookLength += Math.sqrt(Math.pow(hookSpeedX, 2)+Math.pow(hookSpeedY, 2), 2);
                    //check if the hook hits any gold
                    for(let j = 0; j < 5; j++){
                        for(let i = 0; i < minerals[j].length; i++){
                            //check if hits mienrals, each kind of mienral has it's own hit box size
                            //and it's return speed when hit
                            if(j == 1 || j == 3){
                                if(Math.sqrt(Math.pow(minerals[j][i][0]-hookX, 2)+
                                Math.pow(minerals[j][i][1]-hookY, 2))<=35){
                                    mineralKind = j;
                                    grabbed = i;
                                    hookSpeedX = hookSpeedX*bigMineralSpeed;
                                    hookSpeedY = hookSpeedY*bigMineralSpeed;
                                    hookReturn = true;
                                }
                            }
                            else if(j == 0 || j == 2){
                                if(Math.sqrt(Math.pow(minerals[j][i][0]-hookX, 2)+
                                Math.pow(minerals[j][i][1]-hookY, 2))<=25){
                                    mineralKind = j;
                                    grabbed = i;
                                    hookSpeedX = hookSpeedX*smallMineralSpeed;
                                    hookSpeedY = hookSpeedY*smallMineralSpeed;
                                    hookReturn = true;
                                }
                            }
                            else{
                                if(Math.sqrt(Math.pow(minerals[j][i][0]-hookX, 2)+
                                Math.pow(minerals[j][i][1]-hookY, 2))<=15){
                                    mineralKind = j;
                                    grabbed = i;
                                    hookSpeedX = hookSpeedX*diamondSpeed;
                                    hookSpeedY = hookSpeedY*diamondSpeed;
                                    hookReturn = true;
                                }
                            }
                                //store the index of which gold was hit
                        }
                    }
                }
                //if the hook reaches the border or hits the gold, it returns the hook
                else{
                    hookX += hookSpeedX;
                    hookY -= hookSpeedY;
                    hookLength -= Math.sqrt(Math.pow(hookSpeedX, 2)+Math.pow(hookSpeedY, 2), 2);
                    if(mineralKind != undefined && grabbed != undefined){
                        minerals[mineralKind][grabbed][0] += hookSpeedX;
                        minerals[mineralKind][grabbed][1] -= hookSpeedY;
                    }
                    //if hook returns to initial position, it stops there
                    if((hookX >= hookInitialX - Math.sin(hookAngle)*50 && 
                        hookY <= hookInitialY + Math.cos(hookAngle)*50) ||
                        (hookX <= hookInitialX - Math.sin(hookAngle)*50 
                        && hookY <= hookInitialY + Math.cos(hookAngle)*50)){
                        hookReturn = false;
                        shot = false;
                        hookX = hookInitialX - Math.sin(hookAngle)*50;
                        hookY = hookInitialY + Math.cos(hookAngle)*50;
                        hookLength = 30;
                        if(mineralKind != undefined && grabbed != undefined){
                            switch(mineralKind){
                                case 0:
                                    points += 50;
                                    break;
                                case 1:
                                    points += 100;
                                    break;
                                case 2:
                                    points += 10;
                                    break;
                                case 3:
                                    points += 20;
                                    break;
                                case 4:
                                    points += 250;
                            }
                            minerals[mineralKind][grabbed][0] = undefined;
                            minerals[mineralKind][grabbed][1] = undefined;
                            grabbed = undefined;
                            mineralKind = undefined;
                        }
                    }
                }

                //if hook reaches border, hook returns
                if(hookX > 900 || hookX < 0 || hookY > 800){
                    hookReturn = true;
                }
            }

            //when time up, check player score
            if(gameTime <= 0){
                if(points < goalPoints){
                    levelFailed();
                    removeEventListener("click", mouseClick());
                    clearInterval(start);
                }
                else{
                    levelPassed();
                    removeEventListener("click", mouseClick());
                    clearInterval(start);
                }
            }
        }, 50
    )
}

//when mouse clicked, shoot hook
function mouseClick(event){
    shot = true;
}

//function that draws game object
function drawGameObjects(){
    ctx.clearRect(0, 0, 1000, 800);
    ctx.drawImage(background,0 , 0, 1000, 800);
    ctx.drawImage(character, characterX, characterY, 75, 90);
    ctx.drawImage(cramp, crampX, crampY, 85, 85);
    ctx.font = "30px Arial";
    ctx.fillText("Points: "+points, 700, 50);
    ctx.fillText("Goal: "+goalPoints.toFixed(0), 700, 80);
    ctx.fillText("Time Left: "+(gameTime/20).toFixed(0), 30, 50);

    ctx.save();
    ctx.beginPath();
    ctx.translate(hookInitialX, hookInitialY);
    ctx.rotate(hookAngle);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, hookLength);
    ctx.stroke();
    ctx.drawImage(hook, -14, hookLength-20, 28, 50);
    ctx.restore();

    ctx.stroke();
    drawSmallGold();
    drawGold();
    drawRock();
    drawSmallRock();
    drawDiamond();
}

function drawDiamond(){
    for(let i = 0; i < minerals[4].length; i++){
        ctx.drawImage(diamond, minerals[4][i][0]-13, minerals[4][i][1]-13, 30, 30);
        ctx.stroke();
    }
}

//function that draws gold mines
function drawGold(){
    for(let i = 0; i < minerals[1].length; i++){
        ctx.drawImage(gold, minerals[1][i][0]-49, minerals[1][i][1]-54, 100, 100);
    }
}

function drawSmallGold(){
    for(let i = 0; i < minerals[0].length; i++){
        ctx.drawImage(gold, minerals[0][i][0]-25, minerals[0][i][1]-30, 50, 50);
    }
}

function drawRock(){
    for(let i = 0; i < minerals[3].length; i++){
        ctx.drawImage(rock, minerals[3][i][0]-54, minerals[3][i][1]-60, 100, 100);
    }
}

function drawSmallRock(){
    for(let i = 0; i < minerals[2].length; i++){
        ctx.drawImage(rock, minerals[2][i][0]-25, minerals[2][i][1]-30, 50, 50);
    }
}

//main page and user interface
function gameUI(){
    difficulty = 1 ;
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.drawImage(startpage, 0, 0, 1000, 800);
    ctx.drawImage(startButton, 80, 400);
    addEventListener("click", UIstartGame);
}

//button function to start game
function UIstartGame(event){
    if(event.clientX > 89 && event.clientX < 289 && event.clientY > 487 && event.clientY < 537){
        removeEventListener("click", UIstartGame);
        levelStartTransition();
    }
}

//level transition
function levelStartTransition(){
    ctx.clearRect(0, 0, 1000, 800);
    ctx.drawImage(backboard, 0, 0, 1000, 800);
    goalPoints += 300*(1+difficulty/8);
    ctx.font = "40px Ariel";
    ctx.fillText("Your goal: "+goalPoints.toFixed(0), 360, 400);
    let startTransition = setTimeout(startGame, 3000);
}

//level passed page
function levelPassed(){
    if(difficulty < 4){
        difficulty += 1;
    }
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.drawImage(backboard, 0, 0, 1000, 800);
    ctx.font = "30px Ariel";
    ctx.fillText("Greate Job!", 400, 350);
    ctx.fillText("You Have Passed the Level", 310, 380);
    //move to the next level
    let nextLevel = setTimeout(levelStartTransition, 5000);
}

//level failed page
function levelFailed(){
    difficulty = 1;
    goalPoints = 0;
    points = 0;
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.drawImage(backboard, 0, 0, 1000, 800);
    ctx.font = "30px Ariel";
    ctx.fillText("You Failed!", 380, 350);
    ctx.fillText("Good Luck Next Time", 310, 380);
    //return to main page
    let returnUI = setTimeout(gameUI, 5000);
}

//function to initialize values of game and generates minerals
function setLevel(){
    hookX = hookInitialX, hookY = hookInitialY, hookAngle = 0;
    hookLength = 30;
    shot = false;
    gameTime = 1200;
    minerals = new Array(5);
    addEventListener("click", mouseClick);

    //randomly generate each minerals and store them inside an array
    let n = Math.floor(Math.random() * 3 + 7);

    //small gold
    smallGoldArray = new Array(n);
    for(let i = 0; i < n; i++){
        Coordinate = new Array(2);
        Coordinate[0] = Math.floor(Math.random()*900 + 30);
        Coordinate[1] = Math.floor(Math.random()*600 + 140);
        smallGoldArray[i] = Coordinate;
    }
    minerals[0] = smallGoldArray;

    //big golad
    n = Math.floor(Math.random() * 2 + 4 - difficulty/2.5);
    goldArray = new Array(n);
    for(let i = 0; i < n; i++){
        Coordinate = new Array(2);
        Coordinate[0] = Math.floor(Math.random()*900 + 30);
        Coordinate[1] = Math.floor(Math.random()*600 + 140);
        goldArray[i] = Coordinate;
    }
    minerals[1] = goldArray;

    //small rock
    n = Math.floor(Math.random() * 2 + 2);
    smallRockArray = new Array(n);
    for(let i = 0; i < n; i++){
        Coordinate = new Array(2);
        Coordinate[0] = Math.floor(Math.random()*900 + 30);
        Coordinate[1] = Math.floor(Math.random()*600 + 140);
        smallRockArray[i] = Coordinate;
    }
    minerals[2] = smallRockArray;

    //big rock
    n = Math.floor(Math.random() * (3+difficulty)/2 + 3);
    RockArray = new Array(n);
    for(let i = 0; i < n; i++){
        Coordinate = new Array(2);
        Coordinate[0] = Math.floor(Math.random()*900 + 30);
        Coordinate[1] = Math.floor(Math.random()*600 + 140);
        RockArray[i] = Coordinate;
    }
    minerals[3] = RockArray;

    //diamond
    n = Math.floor(Math.random() * 3);
    diamondArray = new Array(n);
    for(let i = 0; i < n; i++){
        Coordinate = new Array(2);
        Coordinate[0] = Math.floor(Math.random()*900 + 30);
        Coordinate[1] = Math.floor(Math.random()*600 + 140);
        diamondArray[i] = Coordinate;
    }
    minerals[4] = diamondArray;
}