class Player extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 1) {
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(.5, .5);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = 10;
    }
}

class Circle extends PIXI.Graphics {
    constructor(radius, color = 0xFF0000, x = 0, y = 0) {
        super();
        this.beginFill(color);
        this.drawCircle(0, 0, radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color = 0xFF0000, x = 0, y = 0, playernum = 1) {
        super();
        this.beginFill(color);
        this.drawRect(-2, -3, 4, 6);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {
            x: 0,
            y: -1
        };
        this.speed = 400;
        this.isAlive = true;
        this.playernum = playernum;
        this.directionB = "";
        if (this.playernum == 1) {
            this.directionB = directionplayer1;
        }
        if (this.playernum == 2) 
        {
            this.directionB = directionplayer2;
        }
        
        if( this.directionB == "up" || this.directionB == "down" )
        {
                this.beginFill(color);
                this.drawRect(-2, -3, 4, 6);
                this.endFill();
        }
        else
        {
            this.beginFill(color);
            this.drawRect(-2, -3, 6, 4);
            this.endFill();
        }
        Object.seal(this);
    }

    move(dt = 1 / 60) {
        
        if (this.directionB == "up") {


            this.x += this.fwd.x * this.speed * dt;
            this.y += this.fwd.y * this.speed * dt;
        }
        if( this.directionB == "down" ){
            this.x += -this.fwd.x * this.speed * dt;
            this.y += -this.fwd.y * this.speed * dt;
        }
        if (this.directionB == "left") {


            this.x += this.fwd.y * this.speed * dt;
            this.y += this.fwd.x * this.speed * dt;
        }
        if (this.directionB == "right") {


            this.x += -this.fwd.y * this.speed * dt;
            this.y += -this.fwd.x * this.speed * dt;
        }
    }
}

class SpeedUp extends PIXI.Sprite {
        constructor(x = 0, y = 0, speed = 1) {
        super(PIXI.loader.resources["images/speedUp.png"].texture);
        this.anchor.set(.5, .5);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.timer = 3;
    }
}

class TripleShot extends PIXI.Sprite {
        constructor(x = 0, y = 0) {
        super(PIXI.loader.resources["images/speedUp.png"].texture);
        this.anchor.set(.5, .5);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.timer = 5;
    }
    
    timeDec(dt = 1/60)
    {
        this.timer -= dt;   
    }
}

class Background extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(PIXI.loader.resources["images/oceanman.png"].texture);
        this.anchor.set(0, 0);
        this.x = x;
        this.y = y;
    }
   timeDec(dt = 1/60)
    {
        this.timer -= dt;   
    }
}

