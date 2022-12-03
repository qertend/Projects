document.getElementById("lobbyNameIn").placeholder = "Lobby#" + Math.floor(Math.random()*8999 +1000);

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
    document.getElementById('randomWallsTimerOut').innerHTML = randomWallsModeTimer/1000;
    //grid
    if (Number(document.getElementById('grid').value) != grid) {
        grid = Number(document.getElementById('grid').value);
    }
    //labyrinth density
    if (Number(document.getElementById('density').value) != density) {
        density = Number(document.getElementById('density').value);
        document.getElementById('densityOut').innerHTML = density;
    }
    //bullet props
    bulletLifetime = Number(document.getElementById('bulletLifetime').value)*1000;
    maxBulletCount = Number(document.getElementById('maxBulletCount').value);
}

for (i of document.getElementsByClassName("slider")) {
    console.log(i);
    i.addEventListener("change", refreshSettings);
}