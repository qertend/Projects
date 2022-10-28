const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
let rotation = 0;
let width = 100;
let height = 200;
let rectX = 400;
let rectY = 400;
let x = 330;
let y = 330;
let l1y, l2y, l, l1x, l2x = Number;
let debugCircles = new Array;

canvas.addEventListener("click", debugCirlce);

renderFrame();

function debugCirlce(event) {
    console.log("x:", event.clientX, "y:", event.clientY );
    debugCircles.push([event.clientX, event.clientY]);
    console.log(debugCircles);
}

function compute() {
    width = document.getElementById('rectWidth').value;
    height = document.getElementById('rectHeight').value;
    rotation = document.getElementById('rotateSlider').value;
    x = document.getElementById('xSlider').value;
    y = document.getElementById('ySlider').value;
    rotation %= 360;

    //documentation
    document.getElementById('rotateOutput').innerHTML = rotation;
    document.getElementById('xOutput').innerHTML = x;
    document.getElementById('yOutput').innerHTML = y;
    
/* Implement no collision by detecting if 'l' is negative*/

    // VERTICAL (blue)
    if (rotation == 0 || rotation == 180) {
        if (rectX-x <= width/2) {
            l = Number(height); // JS just decided 'height' is a string here for no reason, so we need to counter that
            l1y = rectY - l/2;
            l2y = l1y + l;
        }
        else {
            l = -1;
            l1y = 0;
            l2y = 0;
        }
    }
    // at angles 0 - 90 OR angles 180 - 270
    else if (rotation < 90 || (rotation > 180 && rotation < 270)) {
        rotationRad = (rotation % 180)*Math.PI/180;
        l = (height/2-(rectX-x)/Math.sin(rotationRad)+width/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.sin(rotationRad) < width) {
            l1y = rectY-((width/Math.sin(rotationRad))/2-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2y = l1y + l ;
        }
        // across parallel walls
        else {
            l = width/Math.sin(rotationRad)
            l1y = rectY-((l/2)-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2y = l1y + l;
        }
    }
    // at angles 90 or 270
    else if (rotation == 90 || rotation == 270) {
        if (rectX-x <= height/2) {
            l = Number(width); // JS just decided 'width' is a string here for no reason, so we need to counter that
            l1y = rectY - l/2;
            l2y = l1y + l;
        }
        else {
            l = -1;
            l1y = 0;
            l2y = 0;
        }
    }
    // at angles 90 - 180 OR angles 270 - 360
    else if ((rotation > 90 && rotation < 180) || (rotation > 270 && rotation < 360)) {
        rotationRad = ((rotation % 180)-90)*Math.PI/180;
        l = (width/2-(rectX-x)/Math.sin(rotationRad)+height/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.cos(rotationRad) < width) {
            l1y = rectY - ((height/Math.sin(rotationRad))/2-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2y = l1y + l;
        }
        // across parallel walls
        else {
            rotationRad = rotation*Math.PI/180;
            l = width/Math.sin(rotationRad);
            l1y = rectY - ((l/2)-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2y = l1y + l;
        }
    }
    
    //VERTICAL COLLISION DETECT
    if (l < 0) {
        l1y = 0;
        l2y = 0;
        document.getElementById('noCollisionVertical').innerHTML = "No collision on vertical axis";
    }
    else {
        document.getElementById('noCollisionVertical').innerHTML = "";
    }

    document.getElementById('l1y').innerHTML = l1y;
    document.getElementById('l2y').innerHTML = l2y;
    document.getElementById('ly').innerHTML = l;

    // HORIZONTAL (red)
    rotationRad = rotation*Math.PI/180;
    l = height/Math.sin((rotation)*Math.PI/180);
    l1x = rectX+((l/2)-(((rectY-y)/Math.sin(rotationRad))*Math.cos(rotationRad)));
   if (rotation == 0 && rotation == 180){
        l1x = rectY-l/2;
    }
    l2x = l1x - l;

    document.getElementById('distanceX').innerHTML = rectX-x;
    document.getElementById('distanceY').innerHTML = rectY-y;
}

function renderFrame() { // renders the current frame on main canvas when called
    requestAnimationFrame(renderFrame);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    compute();
    ctx.strokeStyle = "blue";
    //draws horizontal axis of contact (blue)
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    //draws x1 axis of contact (blue)
    ctx.moveTo(0, l1y);
    ctx.lineTo(x, l1y);
    //draws x2 axis of contact (blue)
    ctx.moveTo(canvas.width, l2y);
    ctx.lineTo(x, l2y);
    ctx.stroke();
    //draws vertical axis of contact (red)
    ctx.strokeStyle = "red";
    ctx.beginPath(); 
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    //draws y1 axis of contact  (red)
    ctx.moveTo(l1x, 0);
    ctx.lineTo(l1x, y)
    //draws y2 axis of contact  (red)
    ctx.moveTo(l2x, canvas.height);
    ctx.lineTo(l2x, y)
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

/*
TODO
implement no collision detection
*/