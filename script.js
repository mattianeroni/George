
function topWall(obj) {
    return obj.y;
};

function bottomWall(obj) {
    return obj.y + obj.height;
};

function leftWall(obj) {
    return obj.x;
};

function rightWall(obj) {
    return obj.x + obj.width;
};


class Caterpillar {
  constructor (x, y, jumpSize){
    this.width = 110;
    this.height = 100;
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.jumpSize = -jumpSize;

    this.img = new Image();
    this.img.src = 'images/george.png';
  }

  draw (ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  jump () {
    this.vy = this.jumpSize;
  }

  update (ground, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(ground) && this.vy > 0) {
        this.y = topWall(ground) - this.height;
        this.vy = 0;
    }
  }
};




class Ground {
  constructor(windowWidth, windowHeight) {
    this.width = windowWidth;
    this.height = 4;
    this.x = 0;
    this.y = windowHeight - this.height - Math.floor(0.1 * windowHeight);
  }

  draw(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};



class Bad {
  constructor (windowWidth, groundY) {

    let r = Math.random();
    this.img = new Image();
    // --------------------------------------------------------------
    this.type = 0;
    this.img.src =  'images/police.png';
    this.width = 100;
    this.height = 80;
    // -------------------------------------------------------------
    /*
    if (r < 0.3) {
      this.type = 0;
      this.img.src =  'images/bad2.png';
      this.width = 100;
      this.height = 80;
    } else if (r < 0.6){
      this.type = 1;
      this.img.src =  'images/bad.png';
      this.width = 100;
      this.height = 100;
    } else {
      this.type = 2;
      this.width = 16;
      this.height = Math.random() * 60 + 30;
    }*/

    this.x = windowWidth;
    this.y = groundY - this.height;

  }


  draw (ctx) {
    if (this.type === 0 || this.type === 1) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      var oldFill = ctx.fillStyle;
      ctx.fillStyle = "brown";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = oldFill;
    }
  }
};




class Dick {
  constructor (x, y) {
    this.width = 80;
    this.height = 100;
    this.x = x;
    this.y = y;
    this.img = new Image();
    this.img.src = 'images/banana.png';
  }

  draw (ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
};



class Game {

  constructor () {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "brown";
    document.spacePressed = false;
    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " ") this.spacePressed = false;
    });
    this.gravity = 1.5;

    this.ground = new Ground(this.width, this.height);
    this.caterpillar = new Caterpillar(Math.floor(0.1 * this.width), this.ground.y, 35);

    this.enemies = [];
    this.food = [];

    this.runSpeed = -10;
    this.paused = false;
    this.noOfFrames = 0;
  }


  newEnemy (probability){
    if(Math.random() <= probability){
        this.enemies.push(new Bad(this.width, this.ground.y));
    }
  }

  newFood (probability) {
    if(Math.random() <= probability){
        this.food.push(new Dick(this.width, this.ground.y - 400));
    }
  }

  draw () {
    this.context.clearRect(0, 0, this.width, this.height);
    // draw divider line
    this.ground.draw(this.context);
    // draw the dinosaur
    this.caterpillar.draw(this.context);
    //drawing the cactii
    for (let i = 0; i < this.enemies.length; i++){
        this.enemies[i].draw(this.context);
    }
    for (let i = 0; i < this.food.length; i++){
        this.food[i].draw(this.context);
    }

    var oldFill = this.context.fillStyle;
    this.context.fillStyle = "white";
    this.context.fillText(this.score, this.width-40, 30);
    this.context.fillStyle = oldFill;
  }


  update () {
    if(this.paused){
        return;
    }
    if (document.spacePressed == true && bottomWall(this.caterpillar) >= topWall(this.ground)) {
        this.caterpillar.jump();
    }
    this.caterpillar.update(this.ground, this.gravity);

    // Removing old cacti that cross the eft border of the screen
    if(this.enemies.length > 0 && rightWall(this.enemies[0]) < 0) {
        this.enemies.shift();
    }

    // Removing old food
    if(this.food.length > 0 && rightWall(this.food[0]) < 0) {
        this.food.shift();
    }

    // Spawn new food
    this.newFood (0.005);

    // Spawning new cacti
    //Case 1: There are no cacti on the screen
    if(this.enemies.length == 0){
        //Spawn a cactus with high probability
        this.newEnemy(0.5);
    }
    //Case 2: There is atleast one cactus
    else if ( this.enemies.length > 0 && this.width - leftWall(this.enemies[this.enemies.length-1]) > this.jumpDistance + 150)
    {
        this.newEnemy(0.05);
    }

    // Moving the enemies
    for (let i = 0; i < this.enemies.length; i++){
        this.enemies[i].x += this.runSpeed;
    }

    // Moving the food
    for (let i = 0; i < this.food.length; i++){
        this.food[i].x += this.runSpeed;
    }

    //Collision Detection
    for (let i = 0; i < this.enemies.length; i++){
        if(rightWall(this.caterpillar) >= leftWall(this.enemies[i]) && leftWall(this.caterpillar) <= rightWall(this.enemies[i]) && bottomWall(this.caterpillar) >= topWall(this.enemies[i]))
            {
                // COLLISION OCCURED
                this.paused = true;
            }
            this.noOfFrames++;
            this.score = Math.floor(this.noOfFrames/10);
    }

    for (let i = 0; i < this.food.length; i++){
        if(rightWall(this.caterpillar) >= leftWall(this.food[i]) && leftWall(this.caterpillar) <= rightWall(this.food[i]) && topWall(this.caterpillar) <= bottomWall(this.food[i]))
            {
                this.food.splice(i, 1);
            }

    }

    //Jump Distance of the Dinosaur
    // This is a CONSTANT in this gamebecause run speed is constant
    //Equations: time = t * 2 * v / g where v is the jump velocity
    // Horizontal ditance s = vx * t where vx is the run speed
    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.caterpillar.jumpVelocity) / this.gravity);

  }

};


var game = new Game();
function main (timeStamp) {
    game.update();
    game.draw();
    window.requestAnimationFrame(main);
}
var startGame = window.requestAnimationFrame(main);
