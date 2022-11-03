const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
let rotation = 0, //rectangle angle of rotation in degrees
width = 100, //rectangle width
height = 200, //rectangle height
rectX = 400, // rectangle center X coord
rectY = 400, // rectangle center Y coord
x = 330, // vertical collision line X coord
y = 330, // horizontal collision line Y coord
debugCircles = new Array; // array of user made debug circles

canvas.addEventListener("click", debugCirlce);
function debugCirlce(event) {
    console.log("x:", event.clientX, "y:", event.clientY );
    debugCircles.push([event.clientX, event.clientY]);
    console.log(debugCircles);
}

renderFrame();

function renderFrame() { // renders the current frame on main canvas when called
    requestAnimationFrame(renderFrame);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    // update variables
    width = Number(document.getElementById('rectWidth').value);
    height = Number(document.getElementById('rectHeight').value);
    rotation = Number(document.getElementById('rotateSlider').value);
    document.getElementById('rotateOutput').innerHTML = Number(document.getElementById('rotateSlider').value);
    x = Number(document.getElementById('xSlider').value);
    document.getElementById('xOutput').innerHTML = x;
    y = Number(document.getElementById('ySlider').value);
    document.getElementById('yOutput').innerHTML = y;
    coordsV = compute("v");
    coordsH = compute("h");
    //draws horizontal axis of contact (blue)
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    //draws x1 axis of contact (blue)
    ctx.moveTo(0, coordsV[0]);
    ctx.lineTo(x, coordsV[0]);
    //draws x2 axis of contact (blue)
    ctx.moveTo(canvas.width, coordsV[1]);
    ctx.lineTo(x, coordsV[1]);
    ctx.stroke();
    //draws vertical axis of contact (red)
    ctx.strokeStyle = "red";
    ctx.beginPath(); 
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    //draws y1 axis of contact  (red)
    ctx.moveTo(coordsH[0], 0);
    ctx.lineTo(coordsH[0], y)
    //draws y2 axis of contact  (red)
    ctx.moveTo(coordsH[1], canvas.height);
    ctx.lineTo(coordsH[1], y)
    ctx.stroke();
    //draws debug circles
    ctx.fillStyle = "yellow";
    for (i in debugCircles) {
        ctx.beginPath();
        ctx.ellipse(debugCircles[i][0]-8, debugCircles[i][1]-8, 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    //draws rectangle
    ctx.strokeStyle = "black";
    ctx.translate(rectX, rectY);
    ctx.rotate(rotation*Math.PI/180); // rotates to direction
    ctx.strokeRect(-width/2, -height/2, width, height);
    ctx.fillStyle = "black";
    //draws center point
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}