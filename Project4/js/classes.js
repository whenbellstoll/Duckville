
//for reference can't actually use though
/*class GameSprite extends PIXI.Sprite{
    super();
    constructor(xpos=0,ypos=0, newname="object")
    {
        this.x = xpos;
        this.y = ypos;
        this.speed = 0;
        this.vectorx = 0;
        this.vectory = 0;
        this.name = newname;
        this.CollisionWithMapChecked = false;
        this.CollisionWithSpriteChecked = false;
        this.PreciseCollision = false;
        this.ActiveCollisionWithSprite = false;
        this.GhostCollisionWithSprite = false;
        this.GhostCollisionWithMap = false;
    }
}*/

class Duck extends PIXI.Sprite{
    constructor(xpos=0,ypos=0, newname="duck")
    {
        super(PIXI.loader.resources["images/duckwalk5.png"].texture);
        this.x = xpos;
        this.y = ypos;
        this.speed = 0;
        this.vectorx = 0;
        this.vectory = 0;
        this.name = newname;
        this.CollisionWithMapChecked = true;
        this.CollisionWithSpriteChecked = true;
        this.PreciseCollision = true;
        this.ActiveCollisionWithSprite = true;
        this.GhostCollisionWithSprite = false;
        this.GhostCollisionWithMap = false;
        this.walkSpeed = 4.25;
        this.jumpStrength = 11.5;
        this.Health = 10;
        this.LeftRight = 1;
        this.FallCounter =0;
        this.OuttaGas = false;
        
    }
}

