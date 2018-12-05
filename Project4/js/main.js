// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
"use strict";
const app = new PIXI.Application(640, 480);
document.body.appendChild(app.view);

//constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

//preload images
PIXI.loader.add(["images/Spaceship.png", "images/explosions.png"]).on("progress", e => {
    console.log(`progress=${e.progress}`)
}).load(setup);

// aliases
let stage;

//game vaiables
let startScene;
let gameScene, ship, player2, health1, health2, shootSound, hitSound, fireballSound;
let gameOverScene;

let circles = [];
let bullets = [];
let aliens = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;
let player2fireReady = true;

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

    // #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;

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
    K: 75
});
const keys = [];
window.onkeyup = (e) => {
    //	console.log("keyup=" + e.keyCode);
    keys[e.keyCode] = false;
    if( !keys[32] )
    {
            player2fireReady = true;
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
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });

    // 1 - set up startScene
    // Make the top start label
    let startLabel1 = new PIXI.Text("Arena Shooter");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    //Make the middle start label
    let startLabel2 = new PIXI.Text("Made within the hour of presenting");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    //Make start game button
    let startButton = new PIXI.Text("Oh please no");
    startButton.style = buttonStyle;
    startButton.x = 80;
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
        fontFamily: "Futura",
        stroke: 0xFF0000,
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
    let gameOverText = new PIXI.Text("Game Over!\n      Player X wins!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Would you even call this a game?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

}

function player1healthText()
{
    health1.text = `Player 1 Health: ${ship.health}`
}

function player2healthText()
{
    health2.text = `Player 2 Health: ${player2.health}`
}




function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;

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
        xdir = -1;
        directionplayer1 = directions[1];
    }
    if (keys[38]) {
        ydir = -1;
        directionplayer1 = directions[2];
    }
    if (keys[39]) {
        xdir = 1;
        directionplayer1 = directions[0];
    }
    if (keys[40]) {
        ydir = 1;
        directionplayer1 = directions[3];
    }
    ship.x += xdir * ship.speed;
    ship.y += ydir * ship.speed;
}

function Player2Move() {
    let xdir = 0;
    let ydir = 0;

    if (keys[65]) {
        xdir = -1;
        directionplayer2 = directions[1]
    }
    if (keys[87]) {
        ydir = -1;
        directionplayer2 = directions[2]
    }
    if (keys[68]) {
        xdir = 1;
        directionplayer2 = directions[0]
    }
    if (keys[83]) {
        ydir = 1;
        directionplayer2 = directions[3]
    }
    player2.x += xdir * player2.speed;
    player2.y += ydir * player2.speed;
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
    fireBullet2();
    if(keys[32] && player2fireReady)
    {
            player2fireReady =false;
    }

    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }

    // #5 - Check for Collisions

        for (let b of bullets) {
            //bullets and players
            if (rectsIntersect(b, ship)) 
            {
                if(b.playernum == 2)
                {
                    ship.health -= 1;
                    b.isAlive = false;
                    gameScene.removeChild(b);
                    hitSound.play();
                }
            }
            if( rectsIntersect(b, player2))
            {
                if(b.playernum == 1)
                {
                    player2.health -= 1;
                    b.isAlive = false;
                    gameScene.removeChild(b);
                    hitSound.play();
                }
            }
        }
    player1healthText();
    player2healthText();
    

    // #6 - Now do some clean up
    //get rid of dead bullets
    bullets = bullets.filter(b=>b.isAlive);
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
}

function fireBullet(e) {
    //
    if (paused) return;

    let b = new Bullet(0xFFFFFF, ship.x, ship.y, 1);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();

    //Triple shot logic
    if (levelNum > 1) {
        let c = new Bullet(0xFFFFFF, ship.x - 15, ship.y, 1);
        bullets.push(c);
        gameScene.addChild(c);
        let d = new Bullet(0xFFFFFF, ship.x + 15, ship.y, 1);
        bullets.push(d);
        gameScene.addChild(d);
    }
}

function fireBullet2() {
    if (keys[32]) {
        if (paused) return;
        if( player2fireReady)
            {
               let b = new Bullet(0xFFFFFF, player2.x, player2.y, 2);
            bullets.push(b);
            gameScene.addChild(b);
            shootSound.play();
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
