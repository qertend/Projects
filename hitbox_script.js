const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
let rotation = 0;
let width = 100;
let height = 200;
let rectX = 400;
let rectY = 400;
let x = 330;
let y = 330;
let l1, l2, l = Number;
let debugCircles = new Array;

canvas.addEventListener("click", debugCirlce);

renderFrame();

function debugCirlce(event) {
    console.log("x:", event.clientX, "y:", event.clientY );
    debugCircles.push([event.clientX, event.clientY]);
    console.log(debugCircles);
}

function compute(direction) {
    /*Input str:"v" for vertical, str:"h" for horizontal collision points */
    switch (direction) {
        case "v":
            width = Number(document.getElementById('rectWidth').value);
            height = Number(document.getElementById('rectHeight').value);
            rotation = Number(document.getElementById('rotateSlider').value);
            x = Number(document.getElementById('xSlider').value);
            break;
        case "h":
            height = Number(document.getElementById('rectWidth').value);
            width = Number(document.getElementById('rectHeight').value);
            rotation = Number(document.getElementById('rotateSlider').value) + 270;
            x = Number(document.getElementById('xSlider').value);
    }


    // at angles 0 or 180
    if (rotation == 0 || rotation == 180) {
        if (rectX-x <= width/2) {
            l = height;
            l1 = rectY - l/2;
            l2 = l1 + l;
        }
        else {
            l = -1;
            l1 = 0;
            l2 = 0;
        }
    }
    // at angles 0 - 90 OR angles 180 - 270
    else if (rotation < 90 || (rotation > 180 && rotation < 270)) {
        rotationRad = (rotation % 180)*Math.PI/180;
        l = (height/2-(rectX-x)/Math.sin(rotationRad)+width/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.sin(rotationRad) < width) {
            l1 = rectY-((width/Math.sin(rotationRad))/2-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l ;
        }
        // across parallel walls
        else {
            l = width/Math.sin(rotationRad)
            l1 = rectY-((l/2)-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l;
        }
    }
    // at angles 90 or 270
    else if (rotation == 90 || rotation == 270) {
        if (rectX-x <= height/2) {
            l = width;
            l1 = rectY - l/2;
            l2 = l1 + l;
        }
        else {
            l = -1;
            l1 = 0;
            l2 = 0;
        }
    }
    // at angles 90 - 180 OR angles 270 - 360
    else if ((rotation > 90 && rotation < 180) || (rotation > 270 && rotation < 360)) {
        rotationRad = ((rotation % 180)-90)*Math.PI/180;
        l = (width/2-(rectX-x)/Math.sin(rotationRad)+height/2/Math.tan(rotationRad))/Math.cos(rotationRad);
        // across adjacent walls
        if (l*Math.cos(rotationRad) < width) {
            l1 = rectY - ((height/Math.sin(rotationRad))/2-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l;
        }
        // across parallel walls
        else {
            rotationRad = (rotation % 180)*Math.PI/180;
            l = width/Math.sin(rotationRad);
            l1 = rectY - ((l/2)-(((rectX-x)/Math.sin(rotationRad))*Math.cos(rotationRad)));
            l2 = l1 + l;
        }
    }
    
    // COLLISION DETECT
    if (l < 0) {
        l1 = 0;
        l2 = 0;
        document.getElementById('noCollisionVertical').innerHTML = "No collision on vertical axis";
    }
    else {
        document.getElementById('noCollisionVertical').innerHTML = "";
    }

    //data for debug menu
    document.getElementById('rotateOutput').innerHTML = Number(document.getElementById('rotateSlider').value);
    document.getElementById('xOutput').innerHTML = x;
    document.getElementById('yOutput').innerHTML = y;
    document.getElementById('l1').innerHTML = l1;
    document.getElementById('l2').innerHTML = l2;
    document.getElementById('l').innerHTML = l;
    
    return [l1, l2];
}

function renderFrame() { // renders the current frame on main canvas when called
    requestAnimationFrame(renderFrame);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    coordsV = compute("v");
    coordsH = compute("h");
    ctx.strokeStyle = "blue";
    //draws horizontal axis of contact (blue)
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

/*
TODO
implement no collision detection
*/