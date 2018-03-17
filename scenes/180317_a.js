var blockPad = 5;
var ptsX = 10;
var ptsY = 10;
var margin = 0.1;
var maxDelta = 0.025;
var rotationPeriod = 30;

var ptsList = [];
var blocksMeta = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  colorMode(HSB, 1);

  for (var i = 0; i < ptsX; i++) {
    var tmpList = [];
    var xlock = false;
    if (i === 0 || i === ptsX - 1) {
      xlock = true;
    }
    for (var j = 0; j < ptsY; j++) {
      var ylock = false;
      if (j === 0 || j === ptsY - 1) {
        ylock = true;
      }
      tmpList.push(new Pt(
        map(i, 0, ptsX - 1, margin, 1 - margin),
        map(j, 0, ptsY - 1, margin, 1 - margin),
        xlock, ylock
      ));
    }
    ptsList.push(tmpList);
  }

  for (var i = 0; i < ptsX - 1; i++) {
    var tmpList = [];
    for (var j = 0; j < ptsY - 1; j++) {
      var randThing = Math.random();
      if (randThing > 0.95) {
        tmpList.push(new Block(0, 1, 1));
      } else if (randThing < 0.05) {
        tmpList.push(new Block(0.6, 1, 1));
      } else {
        tmpList.push(new Block(0, 0, 1));
      }
    }
    blocksMeta.push(tmpList);
  }
}

function draw() {
  background(0);
  strokeWeight(2);
  noFill();
  rectMode(CORNERS);
  for (var i = 0; i < ptsList.length - 1; i++) {
    for (var j = 0; j < ptsList[i].length - 1; j++) {
      var topLeft  = ptsList[i][j].p();
      var topRight = ptsList[i + 1][j].p();
      var botLeft  = ptsList[i][j + 1].p();
      var botRight = ptsList[i + 1][j + 1].p();
      stroke(blocksMeta[i][j].c);
      rect(max(topLeft.x,  botLeft.x) + blockPad / 2,
           max(topLeft.y,  topRight.y) + blockPad / 2,
           min(topRight.x, botRight.x) - blockPad / 2,
           min(botLeft.y,  botRight.y) - blockPad / 2);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function Pt(x, y, xlock, ylock) {
  this.p0 = new p5.Vector(x, y);
  this.xlock = xlock;
  this.ylock = ylock;
  this.phase = map(Math.random(), 0, 1, 0, PI);
  this.p = function() {
    var dvec = new p5.Vector(1, 0);
    dvec.mult(maxDelta * min(windowHeight, windowWidth))
    dvec.rotate(frameCount / rotationPeriod + this.phase);
    if (this.xlock) {
      dvec.x = 0;
    }
    if (this.ylock) {
      dvec.y = 0;
    }
    return new p5.Vector(this.p0.x * windowWidth,
                         this.p0.y * windowHeight).add(dvec);
  };
}

function Block(h, s, v) {
  this.c = color(h, s, v, 0.5);
}

