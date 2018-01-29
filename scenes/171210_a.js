var numpts = 10;
var maxvel = 5;
var minmass = 50, maxmass = 300;
var noiseScale = 0.001;
var stickiness = 0.999;
var hardness = 20;
var gravConst = 10;
var kConst = 100;

var pts = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 1);
  for (var i = 0; i < numpts; i++) {
    pts[i] = new Point([random() * windowWidth, random() * windowHeight],
    [random() * maxvel * plusOrMinus(), random() * maxvel * plusOrMinus()],
    random() * (maxmass - minmass) + minmass, plusOrMinus() * random());
  }
  frameRate(120);
}

function draw() {
  // color settings
  background(0);
  noStroke();
  for (var i = 0; i < pts.length; i++) {
    // draw each ball
    fill(noise(pts[i].p.x * noiseScale, pts[i].p.y * noiseScale) * 0.7 + 0.3, 0.3, pts[i].m / maxmass, abs(pts[i].c) * 0.4 + 0.2);
    ellipse(pts[i].p.x, pts[i].p.y, pts[i].m, pts[i].m);
    // apply forces
    for (var k = 0; k < pts.length; k++) {
      if (k!==i){
        // get distance between
        var dvec = p5.Vector.sub(pts[k].p, pts[i].p);
        var distnc = dvec.mag();
        dvec.normalize();
        // gravitational and electrical forces
        var fg = gravConst * pts[k].m * pts[i].m / distnc**2;
        var fe = kConst * pts[k].c * pts[i].c / distnc**2
        pts[i].v.add(p5.Vector.mult(dvec, fe / pts[i].m));
        pts[i].v.add(p5.Vector.mult(dvec, fg / pts[i].m));
        // normal force
        var overlp = distnc - (pts[i].m + pts[k].m) / 2;
        if (overlp <= 0) {
          pts[i].v.add(p5.Vector.mult(dvec, hardness / pts[i].m * overlp));
        }
      }
    }
    // make it sticky
    pts[i].v.mult(stickiness);
    // wall conditions
    var xover = pts[i].p.x + pts[i].m / 2 - windowWidth;
    var xunder = pts[i].p.x - pts[i].m / 2;
    if (xover >= 0) {
      pts[i].v.sub(createVector(hardness / pts[i].m * xover, 0));
    } else if (xunder <= 0) {
      pts[i].v.sub(createVector(hardness / pts[i].m * xunder, 0));
    }
    var yover = pts[i].p.y + pts[i].m / 2 - windowHeight;
    var yunder = pts[i].p.y - pts[i].m / 2;
    if (yover >= 0) {
      pts[i].v.sub(createVector(0, hardness / pts[i].m * yover));
    } else if (yunder <= 0) {
      pts[i].v.sub(createVector(0, hardness / pts[i].m * yunder));
    }
    pts[i].move();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function Point(p, v, m, c) {
  this.p = createVector(p[0], p[1]);
  this.v = createVector(v[0], v[1]);
  this.m = m;
  this.c = c;
  this.move = function() {
    this.p.add(this.v);
  };
}

function plusOrMinus() {
  return (-1)**(Math.random()<0.5);
}
