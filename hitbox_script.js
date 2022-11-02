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

renderFrame();

canvas.addEventListener("click", debugCirlce);
function debugCirlce(event) {
    console.log("x:", event.clientX, "y:", event.clientY );
    debugCircles.push([event.clientX, event.clientY]);
    console.log(debugCircles);
}

function compute(direction) {
    //Input str:"v" for vertical, str:"h" for horizontal collision points 
    let width_, height_, rotation_, x_, l1, l2, l, rectCoord, canvasWidth;
    let mirror = false;
    width_ = width;
    height_ = height;
    switch (direction) {
        case "v":
            rotation_ = (rotation % 360 + 360) % 360;
            x_ = rectX - x;
            rectCoord = rectY;
            canvasWidth = canvas.height;
            break;
        case "h":
            rotation_ = (rotation % 360 + 630) % 360;
            x_ = rectY - y;
            rectCoord = rectX;
            canvasWidth = canvas.width;
            break;
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
        l1 = canvasWidth - l1;
        l2 = canvasWidth -l2;
    }

    if (direction == "v") {
        //data for debug menu
        document.getElementById('l1V').innerHTML = l1;
        document.getElementById('l2V').innerHTML = l2;
        document.getElementById('lV').innerHTML = l;
        document.getElementById('distanceV').innerHTML = x_;
        // COLLISION DETECT
        if (l < 0) {
            document.getElementById('noCollisionVertical').innerHTML = "No collision on vertical axis";
            return [0,0];
        }
        else {
            document.getElementById('noCollisionVertical').innerHTML = "";
            return [l1, l2];
        }
    }
    else if (direction == "h") {
        //data for debug menu
        document.getElementById('l1H').innerHTML = l1;
        document.getElementById('l2H').innerHTML = l2;
        document.getElementById('lH').innerHTML = l;
        document.getElementById('distanceH').innerHTML = x_;
        //it works like tihs, cause math
        l1 = canvasWidth - l1;
        l2 = canvasWidth - l2;
        // COLLISION DETECT
        if (l < 0) {
            document.getElementById('noCollisionHorizontal').innerHTML = "No collision on horizontal axis";
            return [0, 0];
        }
        else {
            document.getElementById('noCollisionHorizontal').innerHTML = "";
            return [l1, l2];
        }
    }
}

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
    coordsH = [0, 0]; 
    //coordsH = compute("h");
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