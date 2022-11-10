const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvasLab = document.getElementById('labyrinthGen');
const ctxLab = canvasLab.getContext("2d");
let grid = 8; // number of rows and coloumns in labyrinth
let density = 0.4; //labyrinth density
let speed = 0.4; // sets the movement and turn speed of the tanks
bulletSpeedMultiplier = 2; //bullet speed relative to tank speed
let bulletLifetime = 5000; // bullet lifetime in milliseconds
let maxBulletCount = 3; //max number of bullets per player
let bulletWidth = canvas.width/grid/16;
let hardcoreMode = false;
let hardcoreLives = 1;
let randomWallsMode = false;
let randomWallsModeTimer = 15000;
let randomWallsModeLastActive = Date.now();
let p1Forward = "KeyW"; //player 1 controls (red)
let p1Backward = "KeyS";
let p1Left = "KeyA";
let p1Right = "KeyD";
let p1Shoot = "Space";
let p2Forward = "ArrowUp"; //player 2 controls (blue)
let p2Backward = "ArrowDown";
let p2Left = "ArrowLeft";
let p2Right = "ArrowRight";
let p2Shoot = "NumpadEnter";
let controlChange = "";
let menuOpen = false;
let keyBuffer = [];
let availableTiles = [];
let tiles = new Set();
let hWalls = []; // array of horizontal walls
let vWalls = []; // array of vertical walls

// initialize event listeners
window.addEventListener("keydown", function(event) {if (!menuOpen) {keyBuffer[event.code] = event.type == "keydown";}});
window.addEventListener("keyup", function(event) {if (!menuOpen) {keyBuffer[event.code] = event.type == "keydown";}});
for (x of document.getElementsByClassName("controls")) {
    x.addEventListener("click", function(event) {changeControlsToggle(event, this)});
}

class Bullet {
    constructor(parent, rotation, x, y) {
        this.parent = parent;
        this.rotation = rotation;
        this.x = x;
        this.y = y;
        this.timeShot = Date.now();
        this.leftCannon = false;
    }
    update() {
        this.move(speed*(canvas.width/(grid*100)));
    }
    verticalBounce() {
        if (!hardcoreMode) {
            this.rotation = 360 - this.rotation;
        }
        else {
            this.parent.bullets.delete(this);
        }
    }
    horizontalBounce() {
        if (!hardcoreMode) {
            this.rotation = 180 - this.rotation;
        }
        else {
            this.parent.bullets.delete(this);
        }
    }
    move(speed_) {
        let rotationRad = this.rotation*Math.PI/180;

        //VERTICAL BOUNCE
        //changed coloumn to the right
        if (Math.floor(this.x/(canvas.width/grid)) < Math.floor((this.x + speed_ * Math.sin(rotationRad) * bulletSpeedMultiplier)/(canvas.width/grid))) {
            if (vWalls[Math.floor(this.x/(canvas.width/grid))+1][Math.floor(this.y/(canvas.height/grid))]) {
                this.verticalBounce();
                rotationRad = this.rotation*Math.PI/180;
            }
        }
        //changed coloumn to the left
        else if (Math.floor(this.x/(canvas.width/grid)) > Math.floor((this.x + speed_ * Math.sin(rotationRad) * bulletSpeedMultiplier)/(canvas.width/grid))) {
            if (vWalls[Math.floor(this.x/(canvas.width/grid))][Math.floor(this.y/(canvas.height/grid))]) {
                this.verticalBounce();
                rotationRad = this.rotation*Math.PI/180;
            }
        }
        //HORIZONTAL BOUNCE
        //changed row down
        if (Math.floor(this.y/(canvas.height/grid)) < Math.floor((this.y - speed_ * Math.cos(rotationRad) * bulletSpeedMultiplier)/(canvas.height/grid))) {
            if (hWalls[Math.floor(this.x/(canvas.width/grid))][Math.floor(this.y/(canvas.height/grid))+1]) {
                this.horizontalBounce();
                rotationRad = this.rotation*Math.PI/180;
            }
        }
        //changed row up
        else if (Math.floor(this.y/(canvas.width/grid)) > Math.floor((this.y - speed_ * Math.cos(rotationRad) * bulletSpeedMultiplier)/(canvas.height/grid))) {
            if (hWalls[Math.floor(this.x/(canvas.width/grid))][Math.floor(this.y/(canvas.height/grid))]) {
                this.horizontalBounce();
                rotationRad = this.rotation*Math.PI/180;
            }
        }
        this.x += speed_ * Math.sin(rotationRad) * bulletSpeedMultiplier;
        this.y -= speed_ * Math.cos(rotationRad) * bulletSpeedMultiplier;
    }
}

class Tank {
    constructor(image, width, height, x, y, rotation, keyForward, keyBackward, keyLeft, keyRight, keyShoot) {
        this.points = 0;
        this.lives = hardcoreLives;
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
        this.hittingWall = false;
        keyBuffer[this.keyForward] = false;
        keyBuffer[this.keyBackward] = false;
        keyBuffer[this.keyLeft] = false;
        keyBuffer[this.keyRight] = false;
        keyBuffer[this.keyShoot] = false;
    }
    update() {
        let ls;
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
            ls = mcd("v", this.enemy.width, this.enemy.height, this.enemy.rotation, this.enemy.y, bullet.x - this.enemy.x);
            if (ls[0] > ls[1]) {ls.reverse();}
            if (ls[0] < bullet.y && ls[1] > bullet.y) {
                this.enemy.dead();
            }
            ls = mcd("v", this.width, this.height, this.rotation, this.y, bullet.x - this.x);
            if (ls[0] > ls[1]) {ls.reverse();}
            if (ls[0] < bullet.y && ls[1] > bullet.y) {
                if (bullet.leftCannon || Date.now() - bullet.timeShot > 100) {
                    this.dead();
                }
            }
            else {
                bullet.leftCannon = true;
            }
            
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
                    this.hittingWall = false;
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
                            if (hardcoreMode && !this.hittingWall) {
                                this.lives--;
                                if (this.lives == 0) {
                                    this.dead();
                                }
                            }
                            this.hittingWall = true;
                            return false;
                        }
                        else {
                            this.hittingWall = false;
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
                            if (hardcoreMode && !this.hittingWall) {
                                this.lives--;
                                if (this.lives == 0) {
                                    this.dead();
                                }
                            }
                            this.hittingWall = true;
                            return false;
                        }
                        else {
                            this.hittingWall = false;
                            return true;
                        }
                    }
                }
            //collisions with horizontal lines
            case "h":
                ls1 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid))); // wall above
                ls2 = mcd("h", this.width, this.height, rotation_, this.x, (x_ % (canvas.height/grid)-(canvas.height/grid))); // wall below
                if (!ls1 && !ls2) {
                    this.hittingWall = false;
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
                            if (hardcoreMode && !this.hittingWall) {
                                this.lives--;
                                if (this.lives == 0) {
                                    this.dead();
                                }
                            }
                            this.hittingWall = true;
                            return false;
                        }
                        else {
                            this.hittingWall = false;
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
                            if (hardcoreMode && !this.hittingWall) {
                                this.lives--;
                                if (this.lives == 0) {
                                    this.dead();
                                }
                            }
                            this.hittingWall = true;
                            return false;
                        }
                        else {
                            this.hittingWall = false;
                            return true;
                        }
                    }
                }
        }
    }
    shoot() {
        let rotationRad = this.rotation*Math.PI/180;
        if (this.bullets.size < maxBulletCount) {
            this.bullets.add(new Bullet(this, this.rotation, this.x + (this.height/2) * Math.sin(rotationRad), this.y - (this.height/2) * Math.cos(rotationRad)));
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
        this.enemy.points++;
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
redTank.enemy = blueTank;
blueTank.enemy = redTank;


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

//returns a random integer between min and max, min and max included
function randInt(min, max) {
    return Math.round(Math.random()*(max+1-min)+min);
}

//restarts game
function restart() {
    bulletWidth = canvas.width/grid/16;
    //update points
    document.getElementById("redScore").innerHTML = redTank.points;
    document.getElementById("blueScore").innerHTML = blueTank.points;
    //reset red tank
    redTankImg.src = "./assets/redTank.png"
    redTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
    redTankImg.height = canvas.height / (grid*1.2) *.63; // adjusts Tank image Y
    redTank.width = redTankImg.width;
    redTank.height = redTankImg.height;
    redTank.bullets = new Set();
    redTank.lives = hardcoreLives;
    //reset blue tank
    blueTankImg.src = "./assets/blueTank.png"
    blueTankImg.width = canvas.width / (grid*1.2) *.48; // adjusts Tank image X
    blueTankImg.height = canvas.height / (grid*1.2) *.63; // adjusts Tank image Y
    blueTank.width = redTankImg.width;
    blueTank.height = redTankImg.height;
    blueTank.bullets = new Set();
    blueTank.lives = hardcoreLives;
    //generate new map
    generateLabyrinth();
    //check for connecting tiles
    availableTiles = [];
    tiles = new Set();
    checkTiles(randInt(0, grid-1)* grid + randInt(0, grid-1), new Set());
    while (tiles.size < 3) {
        tiles = new Set();
        availableTiles = [];
        checkTiles(randInt(0, grid-1)* grid + randInt(0, grid-1), new Set());
    }

    //choose tiles for tanks
    let redCoords = availableTiles[randInt(0, availableTiles.length-1)];
    redTank.x = redCoords[0]*(canvas.width/grid) + (canvas.width/grid)/2;
    redTank.y = redCoords[1]*(canvas.height/grid) + (canvas.height/grid)/2;
    let blueCoords = availableTiles[randInt(0, availableTiles.length-1)];
    redTank.rotation = randInt(0, 360);
    let counter = 0;
    while (blueCoords[0] == redCoords[0] && blueCoords[1] == redCoords[1] && counter <= grid*2) {
        counter++;
        blueCoords = availableTiles[randInt(0, availableTiles.length-1)];
    }
    blueTank.x = blueCoords[0]*(canvas.width/grid) + (canvas.width/grid)/2;
    blueTank.y = blueCoords[1]*(canvas.height/grid) + (canvas.height/grid)/2;
    blueTank.rotation = randInt(0, 360);
    if (counter == grid*2) {
        restart();
    }
}

//checks if a tile has connecting tiles and saves them in tiles as numbers
function checkTiles(lastTile) {
    availableTiles.push([Math.floor(lastTile/grid), lastTile%grid]);
    tiles.add(lastTile);
    //if tile to the left
    if (!vWalls[Math.floor(lastTile/grid)][lastTile % grid] && !tiles.has(lastTile - grid)) {
        checkTiles(lastTile-grid);
    }
    //if tile to the right
    if (!vWalls[Math.floor(lastTile/grid) + 1][lastTile % grid] && !tiles.has(lastTile + grid)) {
        checkTiles(lastTile + grid);
    }
    //if tile above
    if (!hWalls[Math.floor(lastTile/grid)][lastTile % grid] && !tiles.has(lastTile-1)) {
        checkTiles(lastTile-1);
    }
    //if tile below
    if (!hWalls[Math.floor(lastTile/grid)][(lastTile % grid) + 1] && !tiles.has(lastTile+1)) {
        checkTiles(lastTile+1);
    }
}

function generateLabyrinth() {
    ctxLab.lineCap = "round";
    ctxLab.lineWidth = bulletWidth;
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
    //speed
    speed = Number(document.getElementById('speed').value);
    document.getElementById('speedOut').innerHTML = speed;
    //bullet speed multiplier
    bulletSpeedMultiplier = Number(document.getElementById('bulletSpeedMultiplier').value);
    document.getElementById('bulletSpeedMultiplierOut').innerHTML = bulletSpeedMultiplier;
    //hardcore lives
    hardcoreLives = Number(document.getElementById('hardcoreLives').value);
    document.getElementById('hardcoreLivesOut').innerHTML = hardcoreLives;
    //random walls timer
    randomWallsModeTimer = Number(document.getElementById('randomWallsTimer').value)*1000;
    document.getElementById('randomWallsTimerOut').innerHTML = randomWallsModeTimer;
    //grid
    if (Number(document.getElementById('grid').value) != grid) {
        grid = Number(document.getElementById('grid').value);
        restart();
    }
    //labyrinth density
    if (Number(document.getElementById('density').value) != density) {
        density = Number(document.getElementById('density').value);
        document.getElementById('densityOut').innerHTML = density;
        restart();
    }
    //bullet props
    bulletLifetime = Number(document.getElementById('bulletLifetime').value)*1000;
    maxBulletCount = Number(document.getElementById('maxBulletCount').value);
    //CONTROLS
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
            redTank.keyForward = p1Forward;
            break;
        case "p1Backward":
            p1Backward = event.code;
            redTank.keyBackward = p1Backward;
            break;
        case "p1Left":
            p1Left = event.code;
            redTank.keyLeft = p1Left;
            break;
        case "p1Right":
            p1Right = event.code;
            redTank.keyRight = p1Right;
            break;
        case "p1Shoot":
            p1Shoot = event.code;
            redTank.keyShoot = p1Shoot;
            break;
        case "p2Forward":
            p2Forward = event.code;
            blueTank.keyForward = p2Forward;
            break;
        case "p2Backward":
            p2Backward = event.code;
            blueTank.keyBackward = p2Backward;
            break;
        case "p2Left":
            p2Left = event.code;
            blueTank.keyLeft = p2Left;
            break;
        case "p2Right":
            p2Right = event.code;
            blueTank.keyRight = p2Right;
            break;
        case "p2Shoot":
            p2Shoot = event.code;
            blueTank.keyShoot = p2Shoot;
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

//toggles random walls mode
function randomWallsModeToggle() {
    if (randomWallsMode) {
        randomWallsMode = false;
        document.getElementById('randomWallsMode').style.backgroundColor = "lightgray";
    }
    else {
        randomWallsMode = true;
        randomWallsModeLastActive = Date.now();
        document.getElementById('randomWallsMode').style.backgroundColor = "green";
    }
}

// render first frame
    restart();
    renderFrame();
    //click buttons once... for reasons
    document.getElementById("gameSettingsButton").click();
    document.getElementById("infoMenuButton").click();

// renders the current frame on main canvas when called
function renderFrame() { 
    if (menuOpen){
        refreshSettings();
    }
    if (randomWallsMode) {
        document.getElementById("randomWallsCountdown").innerHTML = Math.floor(randomWallsModeTimer/1000 - (Date.now() - randomWallsModeLastActive)/1000);
        if (Date.now() - randomWallsModeLastActive > randomWallsModeTimer) {
            randomWallsModeLastActive = Date.now();
            generateLabyrinth();
        }
    }
    redTank.update();
    blueTank.update();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    ctx.drawImage(document.getElementById("labyrinthGen"),0,0); // draws labyrinth
    ctx.fillStyle = "purple";
    for (i of redTank.bullets) { //draws red bullets
        ctx.beginPath();
        ctx.ellipse(i.x, i.y, bulletWidth, bulletWidth, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    for (i of blueTank.bullets) { //draws red bullets
        ctx.beginPath();
        ctx.ellipse(i.x, i.y, bulletWidth, bulletWidth, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.translate(redTank.x, redTank.y); // places 0,0 at tank
    ctx.rotate(redTank.rotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(redTankImg, -redTank.width/2, -redTank.height/2, redTank.width, redTank.height); // draws image
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.translate(blueTank.x, blueTank.y); // places 0,0 at tank
    ctx.rotate(blueTank.rotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(blueTankImg, -blueTank.width/2, -blueTank.height/2, blueTank.width, blueTank.height); // draws image
    requestAnimationFrame(renderFrame);
}
/* 
TODO

-create mode where labyrinth changes every so often
->add timer selector

-create discovery mode: players can only see tiles they visited 

*/
