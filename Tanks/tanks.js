const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasLab = document.getElementById('labyrinthGen');
const ctxLab = canvasLab.getContext("2d");
let grid = 8; // number of rows and coloumns in labyrinth
let density = 0.3; //labyrinth density
let speed = 0.3; // sets the movement and turn speed of the tanks
bulletSpeedMultiplier = 1; //bullet speed relative to tank speed
let bulletLifetime = 10000; // bullet lifetime in milliseconds
let maxBulletCount = 3;//max number of bullets per player
let hardcoreMode = false;
let p1Forward = "KeyW";
let p1Backward = "KeyS";
let p1Left = "KeyA";
let p1Right = "KeyD";
let p1Shoot = "Space";
let p2Forward = "ArrowUp";
let p2Backward = "ArrowDown";
let p2Left = "ArrowLeft";
let p2Right = "ArrowRight";
let p2Shoot = "Numpad0";
let controlChange = "";
let menuOpen = false;
let keyBuffer = [];
let hWalls = []; // array of horizontal walls
let vWalls = []; // array of vertical walls

// initialize event listeners
window.addEventListener("keydown", function(event) {if (!menuOpen) {keyBuffer[event.code] = event.type == "keydown";}});
window.addEventListener("keyup", function(event) {if (!menuOpen) {keyBuffer[event.code] = event.type == "keydown";}});
for (x of document.getElementsByClassName("controls")) {
    x.addEventListener("click", function(event) {changeControlsToggle(event, this)});
}

class Bullet { // very much incomplete and incorrect
    constructor(rotation, x, y) {
        this.rotation = rotation;
        this.x = x;
        this.y = y;
        this.timeShot = Date.now();
        this.lastBounced = [];
    }
    update() {
        this.move()
    }
    verticalBounce() {
        this.rotation %= 360; this.rotation += 360; this.rotation %= 360;
        this.rotation += 90;
    }
    horizontalBounce() {
        this.rotation %= 360; this.rotation += 360; this.rotation %= 360;
        this.rotation -= 90;
    }
    move() {
        let rotationRad = this.rotation*Math.PI/180;

        //VERTICAL BOUNCE
        //changed coloumn to the right
        console.log(this.lastBounced)
        if (Math.floor(this.x/(canvas.width/grid)) < Math.floor((this.x + speed * Math.sin(rotationRad) * bulletSpeedMultiplier)/(canvas.width/grid))) {
            if (vWalls[Math.floor(this.x/(canvas.width/grid))+1][Math.floor(this.y/(canvas.height/grid))] && this.lastBounced[1] != [Math.floor(this.x/(canvas.width/grid))+1, Math.floor(this.y/(canvas.height/grid))]) {
                this.verticalBounce();
                this.lastBounced = ["v", [Math.floor(this.x/(canvas.width/grid))+1, Math.floor(this.y/(canvas.height/grid))]];
            }
        }
        //changed coloumn to the left
        console.log(this.lastBounced)
        else if (Math.floor(this.x/(canvas.width/grid)) > Math.floor((this.x + speed * Math.sin(rotationRad) * bulletSpeedMultiplier)/(canvas.width/grid))) {
            if (vWalls[Math.floor(this.x/(canvas.width/grid))][Math.floor(this.y/(canvas.height/grid))] && this.lastBounced[1] != [Math.floor(this.x/(canvas.width/grid)), Math.floor(this.y/(canvas.height/grid))]) {
                this.verticalBounce();
                this.lastBounced = ["v", [Math.floor(this.x/(canvas.width/grid)), Math.floor(this.y/(canvas.height/grid))]];
            }
        }
        //HORIZONTAL BOUNCE
        this.x += speed * Math.sin(rotationRad) * bulletSpeedMultiplier;
        this.y -= speed * Math.cos(rotationRad) * bulletSpeedMultiplier;
    }
}

class Tank {
    constructor(image, width, height, x, y, rotation, keyForward, keyBackward, keyLeft, keyRight, keyShoot) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
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
        for (let bullet of this.bullets) {
            if (Date.now() - bullet.timeShot > bulletLifetime) {
                this.bullets.delete(bullet);
            }
            bullet.update();
        }
        if (keyBuffer[this.keyForward]) { this.move(-speed*(canvas.width/(grid*100)));} // Forwards
        if (keyBuffer[this.keyBackward]) { this.move(speed*(canvas.width/(grid*100)));} // Backwards
        if (keyBuffer[this.keyLeft]) { this.rotate(-speed*1.2);} // Left
        if (keyBuffer[this.keyRight]) { this.rotate(speed*1.2);} // Right
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
                            if (hardcoreMode) {
                                this.dead();
                            }
                            console.log(false, ls1)
                            return false;
                        }
                        else {
                            console.log(true)
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
                            if (hardcoreMode) {
                                this.dead();
                            }
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
                            if (hardcoreMode) {
                                this.dead();
                            }
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
                            if (hardcoreMode) {
                                this.dead();
                            }
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
        let rotationRad = this.rotation*Math.PI/180;
        if (this.bullets.size < maxBulletCount) {
            this.bullets.add(new Bullet(this.rotation, this.x + (this.height/1.94) * Math.sin(rotationRad), this.y - (this.height/1.94) * Math.cos(rotationRad)));
        }
    }
    move(speed) {
        let rotationRad = this.rotation*Math.PI/180;
        if (this.check("v", this.rotation, this.x + speed * Math.sin(-rotationRad)) && this.check("h", this.rotation, this.y + speed * Math.cos(-rotationRad))) {
            this.x += speed * Math.sin(-rotationRad);
            this.y += speed * Math.cos(-rotationRad);
        }
    }
    rotate(speed) {
        if (this.check("v", this.rotation + speed, this.x) && this.check("h", this.rotation + speed, this.y)) {
            this.rotation += speed;
        }
    }
    dead() {
        this.image.src = "assets/boom.png";
        console.log("magnificent death animation");
        restart();
    }
}

const redTankImg = new Image(); // creates red tank sprite
redTankImg.src = "assets/redTank.png";
redTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
redTankImg.height = canvas.height / (grid*1.2) *.63; // adjusts Tank image Y
const blueTankImg = new Image(); // creates red tank sprite
blueTankImg.src = "assets/blueTank.png";
blueTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
blueTankImg.height = canvas.width / (grid*1.2) *.63; // adjusts Tank image Y

const redTank = new Tank(redTankImg, redTankImg.width, redTankImg.height, 50, 50, 180, p1Forward, p1Backward, p1Left, p1Right, p1Shoot); // replace static values with variables e.g. p1Forward
const blueTank = new Tank(blueTankImg, blueTankImg.width, blueTankImg.height, 750, 750, 0, p2Forward, p2Backward, p2Left, p2Right, p2Shoot); // replace static values with variables e.g. p1Forward

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

function restart() {
    generateLabyrinth();

}

function generateLabyrinth() {
    redTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
    redTankImg.height = canvas.height / (grid*1.2) *.63; // adjusts Tank image Y
    redTank.width = redTankImg.width;
    redTank.height = redTankImg.height;
    blueTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
    blueTankImg.height = canvas.height / (grid*1.2) *.63; // adjusts Tank image Y
    blueTank.width = redTankImg.width;
    blueTank.height = redTankImg.height;
    ctxLab.lineWidth = canvasLab.width/grid/16;
    ctxLab.lineCap = "round";
    ctxLab.clearRect(0,0,canvasLab.width, canvasLab.height); // resets hidden labyrinth canvas
    hWalls = {};
    hWalls[0] = [];
    hWalls[grid] = [];

    vWalls = {};
    vWalls[0] = [];
    vWalls[grid] = [];
    //fills in outer walls
    for (i=0; i<grid; i++) {
        hWalls[i] = [];
        hWalls[i][0] = true;
        vWalls[0][i] = true;
        hWalls[i][grid] = true;
        vWalls[grid][i] = true;
    }

    for (i=1; i<grid; i++) { // generates random walls and puts them in arrays
        vWalls[i] = [];
        for (j=0; j<grid; j++) {
            if (Math.random() < density) {
                hWalls[j][i] = true;
            }
            else {
                hWalls[j][i] = false;
            }
            if (Math.random() < density) {
                vWalls[i][j] = true;
            }
            else {
                vWalls[i][j] = false;
            }
        }
    }

    // draws labyrinth on hidden canvas
    ctxLab.beginPath();
    for (i=0; i<=grid; i++) {
        for (j=0; j<=grid; j++) {
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

//updates values on Game settings window
function refreshSettings() {
    speed = Number(document.getElementById('speed').value);
    document.getElementById('speedOut').innerHTML = speed;
    bulletSpeedMultiplier = Number(document.getElementById('bulletSpeedMultiplier').value);
    document.getElementById('bulletSpeedMultiplierOut').innerHTML = bulletSpeedMultiplier;
    if (Number(document.getElementById('grid').value) != grid) {
        grid = Number(document.getElementById('grid').value);
        generateLabyrinth();
    }
    if (Number(document.getElementById('density').value) != density) {
        density = Number(document.getElementById('density').value);
        document.getElementById('densityOut').innerHTML = density;
        generateLabyrinth();
    }
    bulletLifetime = Number(document.getElementById('bulletLifetime').value)*1000;
    maxBulletCount = Number(document.getElementById('maxBulletCount').value);
    //controls
    //player 1
    document.getElementById('p1Forward').innerHTML = p1Forward;
    document.getElementById('p1Backward').innerHTML = p1Backward;
    document.getElementById('p1Left').innerHTML = p1Left;
    document.getElementById('p1Right').innerHTML = p1Right;
    document.getElementById('p1Shoot').innerHTML = p1Shoot;
    //player 2
    document.getElementById('p2Forward').innerHTML = p2Forward;
    document.getElementById('p2Backward').innerHTML = p2Backward;
    document.getElementById('p2Left').innerHTML = p2Left;
    document.getElementById('p2Right').innerHTML = p2Right;
    document.getElementById('p2Shoot').innerHTML = p2Shoot;

}

//open and close Game settings
function gameSettings() {
    if (document.getElementById('gameSettings').style.display == 'none') {
        if (menuOpen) {
            closeAllMenus();
        }
        menuOpen = true;
        document.getElementById('gameSettings').style.display = 'block';
    }
    else {
        menuOpen = false;
        refreshSettings();
        document.getElementById('gameSettings').style.display = 'none';
    }
}

//open and close Info menu
function infoMenu() {
    if (document.getElementById('infoMenu').style.display == 'none') {
        if (menuOpen) {
            closeAllMenus();
        }
        menuOpen = true;
        document.getElementById('infoMenu').style.display = 'block';
    }
    else {
        menuOpen = false;
        document.getElementById('infoMenu').style.display = 'none';
    }
}

//close all menus
function closeAllMenus() {
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('infoMenu').style.display = 'none';
    menuOpen = false;
}

//toggles control change on specific action and puts it in 'cotrolChange'
function changeControlsToggle(event) {
    controlChange = event.target.id;
    event.target.style.backgroundColor = "yellow";
    window.addEventListener("keydown", changeControls, {once: true});
}

//changes input of action specified in 'controlChange' variable
function changeControls(event) {
    switch (controlChange) {
        case "p1Forward":
            p1Forward = event.code;
            break;
        case "p1Backward":
            p1Backward = event.code;
            break;
        case "p1Left":
            p1Left = event.code;
            break;
        case "p1Right":
            p1Right = event.code;
            break;
        case "p1Shoot":
            p1Shoot = event.code;
            break;
        case "p2Forward":
            p2Forward = event.code;
            break;
        case "p2Backward":
            p2Backward = event.code;
            break;
        case "p2Left":
            p2Left = event.code;
            break;
        case "p2Right":
            p2Right = event.code;
            break;
        case "p2Shoot":
            p2Shoot = event.code;
            break;
    }
    refreshSettings();
    document.getElementById(controlChange).style.backgroundColor = 'rgb(245, 245, 245)';
    controlChange = "";
}
//toggles hardcore mode
function hardcoreModeToggle() {
    if (hardcoreMode) {
        hardcoreMode = false;
        document.getElementById('hardcoreMode').style.backgroundColor = "lightgray";
    }
    else {
        hardcoreMode = true;
        document.getElementById('hardcoreMode').style.backgroundColor = "red";
    }
}

// render first frame
    generateLabyrinth();
    renderFrame();
    document.getElementById('gameSettingsButton').dispatchEvent(new MouseEvent("click"));
    document.getElementById('infoMenuButton').click();

// renders the current frame on main canvas when called
function renderFrame() { 
    requestAnimationFrame(renderFrame);
    if (menuOpen){
        refreshSettings();
    }
    redTank.update();
    blueTank.update();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    ctx.drawImage(document.getElementById("labyrinthGen"),0,0); // draws labyrinth
    ctx.fillStyle = "purple";
    for (i of redTank.bullets) { //draws red bullets
        ctx.beginPath();
        ctx.ellipse(i.x, i.y, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    for (i of blueTank.bullets) { //draws red bullets
        ctx.beginPath();
        ctx.ellipse(i.x, i.y, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.translate(redTank.x, redTank.y); // places 0,0 at tank
    ctx.rotate(redTank.rotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(redTankImg, -redTank.width/2, -redTank.height/2, redTank.width, redTank.height); // draws image
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.translate(blueTank.x, blueTank.y); // places 0,0 at tank
    ctx.rotate(blueTank.rotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(blueTankImg, -blueTank.width/2, -blueTank.height/2, blueTank.width, blueTank.height); // draws image
}
/* 
TODO
-create bullets

-create mode where labyrinth changes every so often
->add timer selector
->redesign button icon

-create hardcore mode: tanks and bullets die when hitting a wall
->add lives slider

-create discovery mode: players can only see tiles they visited 

*/
