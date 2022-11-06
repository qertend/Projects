const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasLab = document.getElementById('labyrinthGen');
const ctxLab = canvasLab.getContext("2d");
let grid = 8; // number of rows and coloumns in labyrinth, will be modifiable by user
let speed = 0.3; // sets the movement and turn speed of the tanks, will be modifiable by user
let bulletLifetime = 3500; // bullet lifetime in milliseconds, will be modifiable by user
let maxBulletCount = 3;//max number of bullets per player, will be modifiable by user
let keyBuffer = [];
let hWalls = []; // array of horizontal walls
let vWalls = []; // array of vertical walls

// initialize event listeners
window.addEventListener("keydown", function(event) {keyBuffer[event.code] = event.type == "keydown";});
window.addEventListener("keyup", function(event) {keyBuffer[event.code] = event.type == "keydown";});
document.getElementById("regen").addEventListener("click", generateLabyrinth);

class Bullet { // very much incomplete and incorrect
    constructor(direction, x, y) {
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.timeShot = Date.now();
    }
    verticalBounce() {
        this.direction = 360 - this.direction;
    }
    horizontalBounce() {
        if (this.direction < 180) {
            this.direction = 180 - this.direction;
        }
        else {
            this.direction = 540 - this.direction;
        }
    }
}

class Tank {
    constructor(width, height, x, y, keyForward, keyBackward, keyLeft, keyRight, keyShoot) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.keyForward = keyForward;
        this.keyBackward = keyBackward;
        this.keyLeft = keyLeft;
        this.keyRight = keyRight;
        this.keyShoot = keyShoot;
        this.bullets = new Set();
        this.keyShootPressed = false;
        keyBuffer[this.keyForward] = false;
        keyBuffer[this.keyBackward] = false;
        keyBuffer[this.keyLeft] = false;
        keyBuffer[this.keyRight] = false;
        keyBuffer[this.keyShoot] = false;
    }
    update() {
        if (keyBuffer[this.keyShoot] && !this.keyShootPressed) { // Shoot
            this.shoot();
            this.keyShootPressed = true;
        }
        else if (!keyBuffer[this.keyShoot]) {
            this.keyShootPressed = false;
        }
        for (let x of this.bullets) {
            if (Date.now() - x.timeShot > bulletLifetime) {
                this.bullets.delete(x);
            }
        }
        if (keyBuffer[this.keyForward]) { this.move(-speed);} // Forwards
        if (keyBuffer[this.keyBackward]) { this.move(speed);} // Backwards
        if (keyBuffer[this.keyLeft]) { this.rotate(-speed);} // Left
        if (keyBuffer[this.keyRight]) { this.rotate(speed);} // Right
    }
    check(direction, rotation_, x_) {
        //returns true if move is valid, false if invalid
        let ls1, ls2;
        switch (direction) {
            //collisions with vertical lines
            case "v":
                ls1 = mcd("v", this.width, this.height, rotation_, this.y, (x_ % (canvas.width/grid))); //wall to the left
                ls2 = mcd("v", this.width, this.height, rotation_, this.y, (x_ % (canvas.width/grid)-(canvas.width/grid))); //wall to the right
                if (!ls1 && !ls2) {
                    return true;
                }
                else {
                    //ls1 has collision, aka ls2 returns false
                    if (!ls2) {
                        if (ls1[0] > ls1[1]) {ls1.reverse();}
                        let i = Math.floor(x_/(canvas.width/grid));
                        let j1 = Math.floor(ls1[0]/(canvas.width/grid));
                        let j2 = Math.floor(ls1[1]/(canvas.width/grid));
                        if (vWalls[i][j1] || vWalls[i][j2]) { // if there is a wall at either point
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    //ls2 has collision, aka ls1 returns false
                    else {
                        if (ls2[0] > ls2[1]) {ls2.reverse();}
                        let i = Math.floor(x_/(canvas.width/grid))+1;
                        let j1 = Math.floor(ls2[0]/(canvas.width/grid));
                        let j2 = Math.floor(ls2[1]/(canvas.width/grid));
                        if (vWalls[i][j1] || vWalls[i][j2]) { // if there is a wall at either point
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
            //collisions with horizontal lines
            case "h":
                ls1 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid))); // wall above
                ls2 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid)-(canvas.height/grid))); // wall below
                if (!ls1 && !ls2) {
                    return true;
                }
                else {
                    //ls1 has collision, aka ls2 returns false
                    if (!ls2) {
                        if (ls1[0] > ls1[1]) {ls1.reverse();}
                        let i1 = Math.floor(ls1[0]/(canvas.height/grid));
                        let i2 = Math.floor(ls1[1]/(canvas.height/grid));
                        let j = Math.floor(x_/(canvas.height/grid));
                        if (hWalls[i1][j] || hWalls[i2][j]) { // if there is a wall at either point
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    //ls2 has collision, aka ls1 returns false
                    else {
                        if (ls2[0] > ls2[1]) {ls2.reverse();}
                        let i1 = Math.floor(ls2[0]/(canvas.height/grid));
                        let i2 = Math.floor(ls2[1]/(canvas.height/grid));
                        let j = Math.floor(x_/(canvas.height/grid))+1;
                        if (hWalls[i1][j] || hWalls[i2][j]) { // if there is a wall at either point
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                }
        }
    }
    shoot() {
        if (this.bullets.size < maxBulletCount) {
            this.bullets.add(new Bullet(this.rotation, this.x, this.y));
        }
    }
    move(speed) {
        let rotationRad = redTank.rotation*Math.PI/180;
        if (this.check("v", this.rotation, this.x + speed * Math.sin(-rotationRad)) && this.check("h", this.rotation, this.y + speed * Math.cos(-rotationRad))) {
            // checks if out of bounds on X axis
            if (this.x + speed * Math.sin(-rotationRad) < canvas.width && this.x + speed * Math.sin(-rotationRad) > 0) {
                this.x += speed * Math.sin(-rotationRad);
            }
            // checks if out of bounds on Y axis
            if (this.y + speed * Math.cos(-rotationRad) < canvas.height && this.y + speed * Math.cos(-rotationRad ) > 0) {
                this.y += speed * Math.cos(-rotationRad);
            }
        }
    }
    rotate(speed) {
        if (this.check("v", this.rotation + speed, this.x) && this.check("h", this.rotation + speed, this.y)) {
            this.rotation += speed;
        }
    }
}

const redTankImg = new Image(); // creates red tank sprite
redTankImg.src = "redTank.png";
redTankImg.width /= (grid*1.5); // adjusts Tank image X size to half of grid size
redTankImg.height /= (grid*1.5); // adjusts Tank image Y size to half of grid size

const redTank = new Tank(redTankImg.width, redTankImg.height, 350, 350, "KeyW", "KeyS", "KeyA", "KeyD", "Space"); // replace static values with variables e.g. p1Forward

// DO NOT ASK HOW IT WORKS, IT JUST DOES. I SPENT WAY TOO MUCH TIME ON IT TO KNOW ANYMORE
function mcd(direction, width_, height_, rotation_, rectCoord, x_) { // mcd stands for Magic Collision Detector
    /*direction: input str:"v" for vertical, str:"h" for horizontal collision points 
    width_: rectangle's horizontal dimension at 0 degrees
    height_: rectangle's vertical dimension at 0 degrees
    rotation_: rectangle's rotation in degrees
    rectCoord: rectangle's center coordinate (Y if direction is "v", X if direction is "h")
    x_ : offset between collision line and rectangle center point*/
    let l1, // collision point one (return 0 if no collision is detected)
    l2, // collision point two (same here)
    l; // distance betwwen l1 and l2 (isn't returned)
    let mirror = false; // true if x_ is negative
    switch (direction) {
        case "v":
            rotation_ = (rotation_ % 360 + 360) % 360;
            break;
        case "h":
            rotation_ = (rotation_ % 360 + 450) % 360;
            break;
        default:
            console.error("incorrect direction: " + direction);
            return;
        }

    if (x_ < 0) {
        mirror = true;
        x_ = -x_;
    }
    // at angles 0 or 180
    if (rotation_ == 0 || rotation_ == 180) {
        if (x_ <= width_/2) {
            l = height_;
            l1 = rectCoord - l/2;
            l2 = l1 + l;
        }
        else {
            l = -1;
            l1 = 0;
            l2 = 0;
        }
    }
    // at angles 0 - 90 OR angles 180 - 270
    else if (rotation_ < 90 || (rotation_ > 180 && rotation_ < 270)) {
        rotationRad = (rotation_ % 180)*Math.PI/180;
        l = (height_/2-(x_)/Math.sin(rotationRad)+width_/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.sin(rotationRad) < width_) {
            if (x_ < width_/2 && l > height_/Math.cos(rotationRad)) { // across parallel walls
                l = height_/Math.cos(rotationRad);
                l1 = rectCoord - (l/2 + x_*Math.tan(rotationRad));
                l2 = l1 + l;
            }
            else { //actually across adjacent walls
                l1 = rectCoord-((width_/Math.sin(rotationRad))/2-(((x_)/Math.sin(rotationRad))*Math.cos(rotationRad)));
                l2 = l1 + l;
            }
        }
        // across parallel walls
        else {
            l = width_/Math.sin(rotationRad);
            l1 = rectCoord-((l/2)-(((x_)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l;
        }
    }
    // at angles 90 or 270
    else if (rotation_ == 90 || rotation_ == 270) {
        if (x_ <= height_/2) {
            l = width_;
            l1 = rectCoord - l/2;
            l2 = l1 + l;
        }
        else {
            l = -1;
            l1 = 0;
            l2 = 0;
        }
    }
    // at angles 90 - 180 OR angles 270 - 360
    else if ((rotation_ > 90 && rotation_ < 180) || (rotation_ > 270 && rotation_ < 360)) {
        rotationRad = ((rotation_ % 180)-90)*Math.PI/180;
        l = (width_/2-(x_)/Math.sin(rotationRad)+height_/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.cos(rotationRad) < width_) {
            if (x_ < width_/2 && l > height_/Math.sin(rotationRad)) { // across parallel walls
                l = height_/Math.sin(rotationRad);
                l1 = rectCoord - (l/2 - x_/Math.tan(rotationRad));
                l2 = l1 + l;
            }
            else { //actually across adjacent walls
                l1 = rectCoord-((height_/Math.sin(rotationRad))/2-(((x_)/Math.sin(rotationRad))*Math.cos(rotationRad)));
                l2 = l1 + l;
            }
        }
        // across parallel walls
        else {
            rotationRad = (rotation_ % 180)*Math.PI/180;
            l = width_/Math.sin(rotationRad);
            l1 = rectCoord - ((l/2)-(((x_)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l;
        }
    }

    if (mirror) {
        l1 -= 2*(l1-rectCoord);
        l2 -= 2*(l2-rectCoord);
    }

    if (direction == "v") {
        // COLLISION DETECT
        if (l < 0) {
            return false;
        }
        else {
            return [l1, l2];
        }
    }
    else if (direction == "h") {
        // it works like tihs, cause math
        l1 -= 2*(l1-rectCoord);
        l2 -= 2*(l2-rectCoord);
        // COLLISION DETECT
        if (l < 0) {
            return false;
        }
        else {
            return [l1, l2];
        }
    }
}

function generateLabyrinth() {
    ctxLab.lineWidth = canvasLab.width/grid/16;
    ctxLab.lineCap = "round";
    ctxLab.clearRect(0,0,canvasLab.width, canvasLab.height); // resets hidden labyrinth canvas
    hWalls = {};
    vWalls = {};
    for (i=0; i<grid; i++) { // generates random walls and puts them in arrays
        hWalls[i] = [];
        vWalls[i] = [];
        for (j=0; j<grid; j++) {
            if (Math.random() < 0.3) {
                hWalls[i][j] = true;
            }
            else {
                hWalls[i][j] = false;
            }
            if (Math.random() < 0.3) {
                vWalls[i][j] = true;
            }
            else {
                vWalls[i][j] = false;
            }
        }
    }
    // fills in the 4 edges
    ctxLab.beginPath();
    ctxLab.moveTo(0, 0);
    ctxLab.lineTo(canvasLab.width, 0);
    ctxLab.lineTo(canvasLab.width, canvasLab.height);
    ctxLab.lineTo(0, canvasLab.height);
    ctxLab.lineTo(0, 0);
    ctxLab.stroke();
    // draws labyrinth on hidden canvas
    ctxLab.beginPath();
    for (i=0; i<grid; i++) {
        for (j=0; j<grid; j++) {
            if (hWalls[i][j]){
                ctxLab.moveTo(i*(canvasLab.width/grid), j*(canvasLab.height/grid));
                ctxLab.lineTo((i+1)*(canvasLab.width/grid), j*(canvasLab.height/grid));
            }
            if (vWalls[i][j]){
                ctxLab.moveTo(i*(canvasLab.width/grid), j*(canvasLab.height/grid));
                ctxLab.lineTo(i*(canvasLab.width/grid), (j+1)*(canvasLab.height/grid));
            }
        }
    }
    ctxLab.stroke();
}

// render first frame
generateLabyrinth();
renderFrame();

// renders the current frame on main canvas when called
function renderFrame() { 
    requestAnimationFrame(renderFrame);
    redTank.update();
    document.getElementById("w").innerHTML = keyBuffer["KeyW"];
    document.getElementById("s").innerHTML = keyBuffer["KeyS"];
    document.getElementById("a").innerHTML = keyBuffer["KeyA"];
    document.getElementById("d").innerHTML = keyBuffer["KeyD"];
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    ctx.drawImage(document.getElementById("labyrinthGen"),0,0); // draws labyrinth
    ctx.translate(redTank.x, redTank.y); // places 0,0 at tank
    ctx.rotate(redTank.rotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(redTankImg, -redTank.width/2, -redTank.height/2, redTank.width, redTank.height); // draws image
}
/* 
TODO
create Game Settings menu
-create mode where labyrinth changes every so often


*/