const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasLab = document.getElementById('labyrinthGen');
const ctxLab = canvasLab.getContext("2d");
let grid = 8; // number of rows and coloumns in labyrinth, will be modifiable by user
let speed = 0.3; // sets the movement and turn speed of the tanks, will be modifiable by user
let bulletLifetime = 3500; // bullet lifetime in milliseconds
let maxBulletCount = 3;
let keyBuffer = {};
let hWalls = {}; // array of horizontal walls
let vWalls = {}; // array of vertical walls

// initialize event listeners
window.addEventListener("keydown", function(event) {keyBuffer[event.code] = event.type == "keydown";});
window.addEventListener("keyup", function(event) {keyBuffer[event.code] = event.type == "keydown";});

class Bullet { // very much incomplete and incorrect
    constructor(direction) {
        this.direction = direction;
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
        this.bullets = new Set();
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
        this.keyShootPressed = false;
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
        let ls1, ls2;
        switch (direction) {
            //collisions with vertical lines
            case "v":
                ls1 = mcd("v", this.width, this.height, rotation_, this.y, (x_ % (canvas.width/grid)));
                ls2 = mcd("v", this.width, this.height, rotation_, this.x, (x_ % (canvas.width/grid)-(canvas.width/grid)));
                if (!ls1 && !ls2) {
                    return true;
                }
                else {
                    return false;
                }
            //collisions with horizontal lines
            case "h":
                ls1 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid)));
                ls2 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid)-(canvas.height/grid)));
                if (!ls1 && !ls2) {
                    return true;
                }
                else {
                    return false;
                }
        }
    }
    shoot() {
        if (this.bullets.size < maxBulletCount) {
            this.bullets.add(new Bullet(this.rotation));
        }
    }
    move(speed) {
        // checks if out of bounds on X axis
        let rotationRad = redTank.rotation*Math.PI/180;
        if (this.x + speed * Math.sin(-rotationRad) < canvas.width && this.x + speed * Math.sin(-rotationRad) > 0 && this.check("v", this.rotation, this.x + speed * Math.sin(-rotationRad))) {
            this.x += speed * Math.sin(-rotationRad);
        }
        // checks if out of bounds on Y axis
        if (this.y + speed * Math.cos(-rotationRad) < canvas.height && this.y + speed * Math.cos(-rotationRad ) > 0 && this.check("h", this.rotation, this.y + speed * Math.cos(-rotationRad))) {
            this.y += speed * Math.cos(-rotationRad);
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

//DO NOT ASK HOW IT WORKS, IT JUST DOES. I SPENT WAY TOO MUCH TIME ON IT TO KNOW ANYMORE
function mcd(direction, width_, height_, rotation, rectCoord, x_) { //mcd stands for Magic Collision Detector
    //Input str:"v" for vertical, str:"h" for horizontal collision points 
    //x_ : offset between collision line and rectangle center point
    let rotation_, // rectangle angle of rotation in degrees
    l1, //collision point one (return 0 if no collision is detected)
    l2, //collision point two (same here)
    l; //distance betwwen l1 and l2 (isn't returned)
    let mirror = false; //true if x_ is negative
    switch (direction) {
        case "v":
            //rectCoord is Y
            rotation_ = (rotation % 360 + 360) % 360;
            break;
        case "h":
            //rectCoord is X
            rotation_ = (rotation % 360 + 450) % 360;
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
            if (x_ < width_/2 && l > Math.cos(rotationRad)*height_) { // across parallel walls
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
            if (x_ < width_/2 && l > Math.sin(rotationRad)*height_) { // across parallel walls
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
        //it works like tihs, cause math
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
    ctxLab.clearRect(0,0,canvasLab.width, canvasLab.height); // resets hidden labyrinth canvas
    for (i=0; i<grid**2; i++) { // generates random walls and puts them in arrays
        if (Math.random() < 0.1) {
            hWalls[i] = true;
        }
        else {
            hWalls[i] = false;
        }
        if (Math.random() < 0.1) {
            vWalls[i] = true;
        }
        else {
            vWalls[i] = false;
        }
    }
    // fills in the 4 edges
    ctxLab.fillRect(0, 0, canvasLab.width, 3);
    ctxLab.fillRect(0, 0, 3, canvasLab.height);
    ctxLab.fillRect(canvasLab.width-3, 0, canvasLab.width, canvas.height);
    ctxLab.fillRect(0, canvasLab.height-3, canvasLab.width, canvasLab.height);
    ctxLab.fillRect(300, 300, 100, 100);

    // draws labyrinth on hidden canvas
    for (i=0; i<grid; i++) {
        for (j=0; j<grid; j++) {
            if (hWalls[i+j*grid]){
                ctxLab.fillRect(j*(canvasLab.width/grid),i*(canvasLab.width/grid)-3, (j+1)*canvasLab.width/grid, 6);
            }
            if (vWalls[i+j*grid]){
                ctxLab.fillRect(j*(canvasLab.width/grid)-3,i*(canvasLab.width/grid), 6, (i+1)*canvasLab.width/grid );
            }
        }
    }
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