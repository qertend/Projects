const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
let rotation = 0;
let width = 100;
let height = 200;
let rectX = 400;
let rectY = 400;
let x = 330;
let l1y, l2y, l;


renderFrame();

function compute() {
    rotation = document.getElementById('rotateSlider').value;
    document.getElementById('rotateOutput').innerHTML = rotation;
    x = document.getElementById('xSlider').value;
    document.getElementById('xOutput').innerHTML = x;
    if (rotation <=180 || rotation > 180) { // 45 to 90 degrees, or 180 to 225 degrees
        l = width/Math.cos((90-rotation)*Math.PI/180);
        l1y = rectY-(l/2-Math.sin(rotation*Math.PI/180)*(Math.abs(rectX-x)*Math.tan(rotation*Math.PI/180)));
        if (rotation == 90){
            l1y = -l/2
        }
        l2y = l1y + l;
    }

    document.getElementById('l1y').innerHTML = l1y;
    document.getElementById('l2y').innerHTML = l2y;
    document.getElementById('l').innerHTML = l;
    document.getElementById('tan').innerHTML = Math.tan(rotation*Math.PI/180);
    document.getElementById('Lx-R').innerHTML = Math.abs(rectX-x);
}

function renderFrame() { // renders the current frame on main canvas when called
    requestAnimationFrame(renderFrame);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // resets rotation and translate
    ctx.clearRect(0,0, canvas.width, canvas.height); // resets image on canvas
    compute();
    ctx.beginPath(); //draws x axis of contact
    ctx.moveTo(x, 0);
    ctx.lineTo(x, l1y);
    ctx.stroke();
    ctx.beginPath(); //draws y axis of contact
    ctx.moveTo(0, l1y);
    ctx.lineTo(x, l1y);
    ctx.stroke();
    ctx.translate(rectX, rectY);
    ctx.rotate(rotation*Math.PI/180); // rotates to direction
    ctx.strokeRect(-width/2, -height/2, width, height);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
}