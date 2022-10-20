const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const canvas2 = document.getElementById('labyrinthTest');
const ctx2 = canvas2.getContext("2d");
let grid = 8; // number of rows and coloumns in labyrinth, will be modifiable by user
let speed = 0.01; // sets the movement and turn speed of the tanks, will be modifiable by user
const redTank = new Image(); // creates red tank sprite
redTank.src = "redTank.png";
redTank.width /= grid*1.5; // adjusts Tank X size to grid
redTank.height /= grid*1.5; // adjusts Tank Y size to grid
let redX = canvas.width/2-redTank.width/2; // places starting X coordinates in the canvas center
let redY = canvas.height/2-redTank.height/2; // places starting Y coordinates in the canvas center
let redRotation = 0;
let keyBuffer = {};
let hWalls = {}; // array of horizontal walls
let vWalls = {}; // array of vertical walls

//initialize event listeners
window.addEventListener("keydown", function() {keyBuffer[event.keyCode] = event.type == "keydown";});
window.addEventListener("keyup", function() {keyBuffer[event.keyCode] = event.type == "keydown";});
window.addEventListener("keydown", renderFrame);

// render first frame
generateLabyrinth();
console.log(hWalls);
console.log(vWalls);
renderFrame();

function generateLabyrinth() {
    ctx2.clearRect(0,0,canvas2.width, canvas2.height); //resets hidden labyrinth canvas
    for (i=0; i<grid**2; i++) { //generates random walls and puts them in arrays
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
    ctx2.fillRect(0, 0, canvas2.width, 3);
    ctx2.fillRect(0, 0, 3, canvas2.height);
    ctx2.fillRect(canvas2.width-3, 0, canvas2.width, canvas.height);
    ctx2.fillRect(0, canvas2.height-3, canvas2.width, canvas2.height);

    // draws labyrinth on hidden canvas
    for (i=0; i<grid; i++) {
        for (j=0; j<grid; j++) {
            if (hWalls[i+j*grid]){
                ctx2.fillRect(j*(canvas2.width/grid),i*(canvas2.width/grid)-3, (j+1)*canvas2.width/grid, 6);
            }
            if (vWalls[i+j*grid]){
                ctx2.fillRect(j*(canvas2.width/grid)-3,i*(canvas2.width/grid), 6, (i+1)*canvas2.width/grid );
            }
        }
    }
}

function redMovement(direction) { //converts the tanks movements to X and Y coordinates
    // checks if out of bounds on X axis
    if (redX + direction * Math.sin(-redRotation*Math.PI/180) < canvas.width && redX + direction * Math.sin(-redRotation*Math.PI/180) > 0) {
        redX += direction * Math.sin(-redRotation*Math.PI/180);
    }
    // checks if out of bounds on Y axis   
    if (redY + direction * Math.cos(-redRotation*Math.PI/180) < canvas.height && redY + direction * Math.cos(-redRotation*Math.PI/180) > 0) {
        redY += direction * Math.cos(-redRotation*Math.PI/180);
    }
    // insert wall collision detection here
}

function renderFrame() { // renders the current frame on main canvas when called
    requestAnimationFrame(renderFrame)
    if (keyBuffer[87]) { redMovement(-speed);} // W
    if (keyBuffer[65]) { redRotation-=speed;} // A
    if (keyBuffer[83]) { redMovement(speed);} // S
    if (keyBuffer[68]) { redRotation+=speed;} // D
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    ctx.drawImage(document.getElementById("labyrinthTest"),0,0); // draws labyrinth
    ctx.translate(redX, redY); // places 0,0 at tank
    ctx.rotate(redRotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(redTank, -redTank.width/2, -redTank.height/2, redTank.width, redTank.height); // draws image
    ctx.fillStyle = "yellow"; //lines 44 to 47: creates temporary debug circle
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}
