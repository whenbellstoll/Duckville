// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
"use strict";
const app = new PIXI.Application(640, 480);
document.body.appendChild(app.view);

//constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
let player1score = 0;
let player2score = 0;

//Powerup constants
let player1timer = 0;
let player2timer = 0;
let player2SpeedUp = false;
let player1SpeedUp = false;
let player1TripleShot = false;
let player2TripleShot = false;

//look at the local storage and make sure our items are defined.
if (localStorage.getItem("Player1Wins") === null) {
    localStorage.setItem("Player1Wins", "0");
} else {
    player1score = parseInt(localStorage.getItem("Player1Wins"), 10);
}

if (localStorage.getItem("Player2Wins") === null) {
    localStorage.setItem("Player2Wins", "0");
} else {
    player2score = parseInt(localStorage.getItem("Player2Wins"), 10);
}

//preload images
PIXI.loader.add(["images/Spaceship.png", "images/explosions.png", "images/speedUp.png", "images/tripleShot.png", "images/oceanman.png"]).on("progress", e => {
    console.log(`progress=${e.progress}`)
}).load(setup);

// aliases
let stage;

//game vaiables
let startScene;
let gameScene, ship, player2, health1, health2, shootSound, hitSound, fireballSound;
let gameOverScene;

//background
let background;

let circles = [];
let bullets = [];
let speedup = [];
let triple = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let player1fireReady = true;
let player2fireReady = true;
let winningPlayer = "";
let gameOverText;

let directions = ["right", "left", "up", "down"];
let directionplayer1 = "up";
let directionplayer2 = "up";

function setup() {
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    //create background
    background = new Background(0, 0);
    gameScene.addChild(background);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    ship = new Player(320, 3, 3);
    gameScene.addChild(ship);

    player2 = new Player(320, 3, 3);
    gameScene.addChild(player2);



    // #6 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();
    // #8 - Start update loop
    app.ticker.add(gameLoop);


    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

const keyboard = Object.freeze({
    SHIFT: 16,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    D: 68,
    W: 87,
    A: 65,
    S: 83,
    E: 69,
    Z: 90,
    Q: 81,
    C: 67,
    K: 75,
    ENTER: 13
});
const keys = [];
window.onkeyup = (e) => {
    //	console.log("keyup=" + e.keyCode);
    keys[e.keyCode] = false;
    if (!keys[32]) {
        player2fireReady = true;
    }
    if (!keys[13]) {
        player1fireReady = true;
    }
    e.preventDefault();
};

window.onkeydown = (e) => {

    //	console.log("keydown=" + e.keyCode);
    keys[e.keyCode] = true;

    // checking for other keys - ex. 'p' and 'P' for pausing
    var char = String.fromCharCode(e.keyCode);
};



function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xC4B702,
        fontSize: 48,
        fontFamily: "Comic Sans MS"
    });

    // 1 - set up startScene
    // Make the top start label
    let startLabel1 = new PIXI.Text("DuckFight");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Comic Sans MS",
        stroke: 0xC4B702,
        strokeThickness: 6
    });
    startLabel1.x = 85;
    startLabel1.y = 100;
    startScene.addChild(startLabel1);

    //Make the middle start label
    let startLabel2 = new PIXI.Text("In the avian over the sea");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Comic Sans MS",
        fontStyle: "italic",
        stroke: 0xC4B702,
        strokeThickness: 6
    });
    startLabel2.x = 127;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    //Make start game button
    let startButton = new PIXI.Text("Start");
    startButton.style = buttonStyle;
    startButton.x = 250;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); //startGame is a function ref
    startButton.on('pointerover', e => e.target.alpha = 0.7); //concise arrow function
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Comic Sans MS",
        stroke: 0xC4B702,
        strokeThickness: 4
    });
    health1 = new PIXI.Text("Player 1 Health: ");
    health1.style = textStyle;
    health1.x = 5;
    health1.y = 5;
    gameScene.addChild(health1);

    health2 = new PIXI.Text("Player 2 Health");
    health2.style = textStyle;
    health2.x = 5;
    health2.y = 26;
    gameScene.addChild(health2);



    // 3 - set up `gameOverScene`
    // 3A - make game over text
    gameOverText = new PIXI.Text("Game Over!\n      Player X wins!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xC4B702,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Fight again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 200;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);

}

function player1healthText() {
    health1.text = `Player 1 Health: ${ship.health}`
}

function player2healthText() {
    health2.text = `Player 2 Health: ${player2.health}`
}




function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    ship.health = 10;
    player2.health = 10;

    ship.x = 300;
    ship.y = 400;
    player2.x = 400;
    player2.y = 300;
    loadLevel();
    // more to come
}


function Player1Move() {
    let xdir = 0;
    let ydir = 0;

    if (keys[37]) {
        xdir = -1.5;
        directionplayer1 = directions[1];
    }
    if (keys[38]) {
        ydir = -1.5;
        directionplayer1 = directions[2];
    }
    if (keys[39]) {
        xdir = 1.5;
        directionplayer1 = directions[0];
    }
    if (keys[40]) {
        ydir = 1.5;
        directionplayer1 = directions[3];
    }
    ship.x += xdir * ship.speed;
    ship.y += ydir * ship.speed;
    if (ship.x > sceneWidth) {
        ship.x = 0;
    }
    if (ship.y > sceneHeight) {
        ship.y = 0;
    }
    if (ship.x < 0) {
        ship.x = sceneWidth;
    }
    if (ship.y < 0) {
        ship.y = sceneHeight;
    }
    //ship.x = clamp(ship.x, 0, sceneWidth);
    //ship.y = clamp(ship.y, 0, sceneHeight);
}

function Player2Move() {
    let xdir = 0;
    let ydir = 0;

    if (keys[65]) {
        xdir = -1.5;
        directionplayer2 = directions[1];
    }
    if (keys[87]) {
        ydir = -1.5;
        directionplayer2 = directions[2]
    }
    if (keys[68]) {
        xdir = 1.5;
        directionplayer2 = directions[0]
    }
    if (keys[83]) {
        ydir = 1.5;
        directionplayer2 = directions[3]
    }
    player2.x += xdir * player2.speed;
    player2.y += ydir * player2.speed;
    if (player2.x > sceneWidth) {
        player2.x = 0;
    }
    if (player2.y > sceneHeight) {
        player2.y = 0;
    }
    if (player2.x < 0) {
        player2.x = sceneWidth;
    }
    if (player2.y < 0) {
        player2.y = sceneHeight;
    }
    //player2.x = clamp(player2.x, 0, sceneWidth);
    //player2.y = clamp(player2.y, 0, sceneHeight);
}

function gameLoop() {
    if (paused) return; // keep this commented out for now

    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    // #2 - Move Players
    Player1Move();
    Player2Move();
    //Look for bullets 
    fireBullet();
    if (keys[13] && player1fireReady) {
        player1fireReady = false;
    }

    fireBullet2();
    if (keys[32] && player2fireReady) {
        player2fireReady = false;
    }

    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }

    // #5 - Check for Collisions

    for (let b of bullets) {
        //bullets and players
        if (rectsIntersect(b, ship)) {
            if (b.playernum == 2) {
                ship.health -= 1;
                b.isAlive = false;
                gameScene.removeChild(b);
                hitSound.play();
            }
        }
        if (rectsIntersect(b, player2)) {
            if (b.playernum == 1) {
                player2.health -= 1;
                b.isAlive = false;
                gameScene.removeChild(b);
                hitSound.play();
            }
        }
        b.boundsOut();
    }

    for (let s of speedup) {
        if (rectsIntersect(s, ship)) {
            if (!player1SpeedUp) {
                player1timer = 5;
                ship.speed += s.speed;
                player1SpeedUp = true;
            } else //player recently grabbed the power up
            {
                player1timer = 5;
            }
            this.isAlive = false;
            gameScene.removeChild(s);
        }
        if (rectsIntersect(s, player2)) {
            if (!player2SpeedUp) {
                player2timer = 5;
                player2.speed += s.speed;
                player2SpeedUp = true;
            } else //player recently grabbed the power up
            {
                player2timer = 5;
            }
            this.isAlive = false;
            gameScene.removeChild(s);
        }
        s.timeDec(dt);
        if (s.timer <= 0) {
            this.isAlive = false;
            gameScene.removeChild(s);
        }
    }

    for (let s of triple) {
        if (rectsIntersect(s, ship)) {
            if (!player1TripleShot) {
                player1timer = 5;
                player1TripleShot = true;
            } else //player recently grabbed the power up
            {
                player1timer = 5;
            }
            this.isAlive = false;
            gameScene.removeChild(s);
        }
        if (rectsIntersect(s, player2)) {
            if (!player2TripleShot) {
                player2timer = 5;
                player2TripleShot = true;
            } else //player recently grabbed the power up
            {
                player2timer = 5;
            }
            this.isAlive = false;
            gameScene.removeChild(s);
        }
        s.timeDec(dt);
        if (s.timer <= 0) {
            this.isAlive = false;
            gameScene.removeChild(s);
        }
    }
    player1timer -= dt;

    player2timer -= dt;
    if (player1timer <= 0) {
        if (player1SpeedUp) {
            ship.speed -= 2;
            player1SpeedUp = false;
        }
        if (player1TripleShot) {
            player1TripleShot = false;
        }

    }
    if (player2timer <= 0) {
        if (player2SpeedUp) {
            player2.speed -= 2;
            player2SpeedUp = false;
        }
        if (player2TripleShot) {
            player2TripleShot = false;
        }

    }
    player1healthText();
    player2healthText();
    if (keys[69]) {
        player1score = 0;
        player2score = 0;
    }
    if (player2.health <= 0) {

        player1score += 1;
        localStorage.setItem("Player1Wins", player1score);
        winningPlayer = "\t \t \t     " + player1score + "-" + player2score + "\n   Player 1 wins!";
        end();

    }
    if (ship.health <= 0) {

        player2score += 1;
        localStorage.setItem("Player2Wins", player2score);
        winningPlayer = "\t \t \t     " + player1score + "-" + player2score + "\n   Player 2 wins!";
        end();
    }
    // #6 - Now do some clean up
    //get rid of dead bullets
    bullets = bullets.filter(b => b.isAlive);

    //powerup
    let generation = getRandom(0, 300);
    generation = Math.floor(generation);
    if ( generation == 193) {
        let xpos = getRandom(10, sceneWidth - 10);
        let ypos = getRandom(10, sceneHeight - 10);
        //Spawn Speed Up
        let s = new SpeedUp(xpos, ypos, 2);
        speedup.push(s);
        gameScene.addChild(s);
    }
    if (generation == 230 ) {
        //Spawn Triple shot
        let xpos = getRandom(10, sceneWidth - 10);
        let ypos = getRandom(10, sceneHeight - 10);
        let t = new TripleShot(xpos, ypos);
        triple.push(t);
        gameScene.addChild(t);

    }
}

function end() {
    paused = true;
    //clear out level
    circles.forEach(c => gameScene.removeChild(c));
    circles = [];

    bullets.forEach(b => gameScene.removeChild(b));
    bullets = [];

    explosions.forEach(e => gameScene.removeChild(e));
    explosions = [];

    gameOverScene.visible = true;
    gameScene.visible = false;
    gameOverText.text = winningPlayer;
}

function fireBullet(e) {
    if (keys[13]) {
        if (paused) return;
        if (player1fireReady) {
            let b = new Bullet(0xFFFFFF, ship.x, ship.y, 1);
            bullets.push(b);
            gameScene.addChild(b);
            shootSound.play();
            if (player1TripleShot) {
                if (directionplayer1 == "up" || directionplayer1 == "down") {
                    let b2 = new Bullet(0xFFFFFF, ship.x + 10, ship.y, 1);
                    let b3 = new Bullet(0xFFFFFF, ship.x - 10, ship.y, 1);
                    bullets.push(b2);
                    gameScene.addChild(b2);
                    bullets.push(b3);
                    gameScene.addChild(b3);
                }
                if (directionplayer1 == "left" || directionplayer1 == "right") {
                    let b2 = new Bullet(0xFFFFFF, ship.x, ship.y + 10, 1);
                    let b3 = new Bullet(0xFFFFFF, ship.x, ship.y - 10, 1);
                    bullets.push(b2);
                    gameScene.addChild(b2);
                    bullets.push(b3);
                    gameScene.addChild(b3);
                }

            }
        }

    }
}

function fireBullet2() {
    if (keys[32]) {
        if (paused) return;
        if (player2fireReady) {
            let b = new Bullet(0xFFFFFF, player2.x, player2.y, 2);
            bullets.push(b);
            gameScene.addChild(b);
            shootSound.play();
            if (player2TripleShot) {
                if (directionplayer2 == "up" || directionplayer2 == "down") {
                    let b2 = new Bullet(0xFFFFFF, player2.x + 10, player2.y, 1);
                    let b3 = new Bullet(0xFFFFFF, player2.x - 10, player2.y, 1);
                    bullets.push(b2);
                    gameScene.addChild(b2);
                    bullets.push(b3);
                    gameScene.addChild(b3);
                }
                if (directionplayer2 == "left" || directionplayer2 == "right") {
                    let b2 = new Bullet(0xFFFFFF, player2.x, player2.y + 10, 1);
                    let b3 = new Bullet(0xFFFFFF, player2.x, player2.y - 10, 1);
                    bullets.push(b2);
                    gameScene.addChild(b2);
                    bullets.push(b3);
                    gameScene.addChild(b3);
                }

            }
        }

    }

}

function loadLevel() {
    paused = false;
}

function loadSpriteSheet() {
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i * width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

function createExplosion(x, y, frameWidth, frameHeight) {
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x = x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}
