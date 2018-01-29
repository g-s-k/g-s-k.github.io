function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(40);
  colorMode(HSB, 255);
}

function draw() {
  background(0);
  var minbright = 25, maxbright = 200;
  var minsat = 0, maxsat = 200;
  var numdots = 200;
  var numrows, numcols;
  var dots = [];
  var sbright = minbright;
  numrows = floor(sqrt(numdots * windowHeight / windowWidth));
  numcols = floor(numdots / numrows);
  strokeWeight(4);
  stroke(255);
  for (var i = 0; i < numrows; i++) {
    dots[i] = [];
    for (var j = 0; j < numcols; j++) {
      sbright = (sin((j + millis() / 200000) * Math.PI * windowWidth / 30) * cos((i - millis() / 300000) * Math.PI * windowHeight / 30));
      stroke(frameCount % 255, sbright * (maxsat - minsat) + minsat, sbright**2 * (maxbright - minbright) + minbright);
      dots[i][j] = point((j + 0.5) / numcols * windowWidth, (i + 0.5) / numrows * windowHeight);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
