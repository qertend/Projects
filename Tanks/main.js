const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
const redTank = new Image(); // creates red tank sprite
redTank.src = "redTank.png";
redTank.width /= 8;
redTank.height /= 8;
let redX = canvas.width/2-redTank.width/2; // places starting X coordinates in the canvas center
let redY = canvas.height/2-redTank.height/2; // places starting Y coordinates in the canvas center
let redRotation = 0;
let keyBuffer = {};

//initialize event listeners
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyDown);
window.addEventListener("keydown", renderFrame);

// render first frame
renderFrame();

function redConvToXY(direction) { //converts the tanks movements to X and Y coordinates
    if (redX + direction * Math.sin(-redRotation*Math.PI/180) < canvas.width && redX + direction * Math.sin(-redRotation*Math.PI/180) > 0) {
        redX += direction * Math.sin(-redRotation*Math.PI/180);
    }   
    if (redY + direction * Math.cos(-redRotation*Math.PI/180) < canvas.height && redY + direction * Math.cos(-redRotation*Math.PI/180) > 0) {
        redY += direction * Math.cos(-redRotation*Math.PI/180);
    }
}

function keyDown(event) {
    keyBuffer[event.keyCode] = event.type == "keydown"; // checks if the key in 'event' is down or up
}

function renderFrame() { // renders the current frame when called
    requestAnimationFrame(renderFrame)
    if (keyBuffer[87]) { redConvToXY(-0.01);} // W
    if (keyBuffer[65]) { redRotation-=0.01;} // A
    if (keyBuffer[83]) { redConvToXY(0.01);} // S
    if (keyBuffer[68]) { redRotation+=0.01;} // D
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    ctx.translate(redX, redY); // places 0,0 at tank
    ctx.rotate(redRotation*Math.PI/180); // rotates to tank direction
    ctx.drawImage(redTank, -redTank.width/2, -redTank.height/2, redTank.width, redTank.height); // draws image
    ctx.fillStyle = "yellow"; //[creates-
    ctx.beginPath();//yellow-
    ctx.ellipse(0, 0, 5, 5, 0, 0, Math.PI * 2);//debug-
    ctx.fill();//circle]
}

