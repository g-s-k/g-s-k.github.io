// superficial parameters
var numPts = 25;
var numOrbs = 10;
var bcolor = 0.01;
var forceMax = 5e-5;
var forceColors = {gravity:0.6, normal:0.2, electric:[0.4, 0]};

// physical environment
var viscosity = 0.01;
var hardness = 0.25;
var gConst = 1.5;
var kConst = 50;
var massVar = 0.3;

// orbs
var orbMass = 25;
var orbRad = 25;

// particles
var ptMass = 1;
var ptRad = 8;
var vInit = 2;

// empty declarations
var pts = [];
var orbs = [];

/* setup */
function setup() {
  createCanvas(windowWidth, windowHeight);
  for (var i = 0; i < numPts; i++) {
    pts[i] = new DotMass(map(random(), 0, 1, ptMass * massVar, ptMass),
    map(random(), 0, 1, 0.1, 0.9) * width,
    map(random(), 0, 1, 0.1, 0.9) * height,
    random() * 2 * PI, random() * vInit);
    pts[i].diam = ptRad * 2;
  }
  for (var i = 0; i < numOrbs; i++) {
    orbs[i] = new DotMass(map(random(), 0, 1, orbMass * massVar, orbMass),
  map(random(), 0, 1, 0.2, 0.8) * width, map(random(), 0, 1, 0.2, 0.8) * height, 0, 0);
    orbs[i].diam = orbRad * 2;
  }
  frameRate(30);
  colorMode(HSB, 1);
}

/* draw */
function draw() {
  background(bcolor);
  for (var i = 0; i < pts.length; i++) {
    // forces
    for (var k = i+1; k < pts.length; k++) {
      var ptDir = p5.Vector.sub(pts[i].p, pts[k].p);
      var ptDist = ptDir.mag();
      ptDir.normalize();
      // bubble force
      var radSum = (pts[i].diam + pts[k].diam) / 2;
      var normPt = p5.Vector.mult(ptDir, hardness * Math.min(ptDist - radSum, 0) / pts[i].mass);
      pts[i].a.sub(p5.Vector.div(normPt, pts[i].mass));
      pts[k].a.add(p5.Vector.div(normPt, pts[k].mass));
      forceLine(normPt, forceColors.normal, pts[i].p, pts[k].p);
      // gravity toward each other
      var fgpt = p5.Vector.mult(ptDir, gConst * pts[k].mass * pts[i].mass / ptDist**2);
      pts[i].a.sub(p5.Vector.div(fgpt, pts[i].mass));
      pts[k].a.add(p5.Vector.div(fgpt, pts[k].mass));
      forceLine(fgpt, forceColors.gravity, pts[i].p, pts[k].p);
      // electrostatic force toward each other
      var fept = p5.Vector.mult(ptDir, kConst * pts[i].charge * pts[k].charge / ptDist**2);
      pts[i].a.add(p5.Vector.div(fept, pts[i].mass));
      pts[k].a.sub(p5.Vector.div(fept, pts[k].mass));
      forceLine(fept, forceColors.electric[abs(pts[i].charge + pts[k].charge) / 2], pts[i].p, pts[k].p);
    }
    // calculate orb forces
    for (var j = 0; j < orbs.length; j++) {
      var orbDir = p5.Vector.sub(pts[i].p, orbs[j].p);
      var orbDist = orbDir.mag();
      orbDir.normalize();
      // keep out of the orbs
      var minDist = (pts[i].diam + orbs[j].diam) / 2;
      var fNormOrb = p5.Vector.mult(orbDir, hardness * Math.min(orbDist - minDist, 0));
      forceLine(fNormOrb, forceColors.normal, pts[i].p, orbs[j].p);
      pts[i].a.sub(p5.Vector.div(fNormOrb, pts[i].mass));
      orbs[j].a.add(p5.Vector.div(fNormOrb, orbs[j].mass));
      // orb gravity
      var fGravOrb = p5.Vector.mult(orbDir, gConst * orbs[j].mass * pts[i].mass / orbDist**2);
      forceLine(fGravOrb, forceColors.gravity, pts[i].p, orbs[j].p);
      pts[i].a.sub(p5.Vector.div(fGravOrb, pts[i].mass));
      orbs[j].a.add(p5.Vector.div(fGravOrb, orbs[j].mass));
    }
    // keep particles from flying to infinity
    var cenDir = p5.Vector.sub(pts[i].p, createVector(width/2, height/2));
    var cenDist = cenDir.mag();
    cenDir.normalize();
    pts[i].a.sub(p5.Vector.mult(cenDir, 1e-39 * cenDist**12));
    // slow everything down
    pts[i].a.sub(p5.Vector.mult(pts[i].v, viscosity));
  }
  for (var i = 0; i < orbs.length; i++) {
    for (var k = i+1; k < orbs.length; k++) {
      var orbDir2 = p5.Vector.sub(orbs[i].p, orbs[k].p);
      var orbDist2 = orbDir2.mag();
      orbDir2.normalize();
      // no touchy touchy
      var minOrbDist = (orbs[i].diam + orbs[k].diam) / 2;
      var fNormOrb2 = p5.Vector.mult(orbDir2, hardness * Math.min(orbDist2 - minOrbDist, 0));
      forceLine(fNormOrb2, forceColors.normal, orbs[i].p, orbs[k].p);
      orbs[i].a.sub(p5.Vector.div(fNormOrb2, orbs[i].mass));
      orbs[k].a.add(p5.Vector.div(fNormOrb2, orbs[k].mass));
      // gravity between orbs
      var fGravOrb2 = p5.Vector.mult(orbDir2, gConst * orbs[i].mass * orbs[k].mass / orbDist2**2);
      forceLine(fGravOrb2, forceColors.gravity, orbs[i].p, orbs[k].p);
      orbs[i].a.sub(p5.Vector.div(fGravOrb2, orbs[i].mass));
      orbs[k].a.add(p5.Vector.div(fGravOrb2, orbs[k].mass));
    }
    // orbs cannot leave the window
    var orbXover = Math.max(orbs[i].p.x + orbs[i].diam / 2 - width, 0);
    var orbXunder = Math.min(orbs[i].p.x - orbs[i].diam / 2, 0);
    var orbYover = Math.max(orbs[i].p.y + orbs[i].diam / 2 - height, 0);
    var orbYunder = Math.min(orbs[i].p.y - orbs[i].diam / 2, 0);
    orbs[i].a.sub(createVector(orbXover, orbYover).add(createVector(orbXunder, orbYunder)).mult(hardness));
    // fluid-ness
    orbs[i].a.sub(p5.Vector.mult(orbs[i].v, viscosity));
  }
  for (var i = 0; i < pts.length; i++) {
    noStroke();
    fill(map(pts[i].charge, -1, 1, forceColors.electric[0], forceColors.electric[1]), map(pts[i].v.mag(), 10, 0, 0, 1), map(pts[i].mass, ptMass * massVar, ptMass, 0.4, 1), 0.7, 0.6);
    ellipse(pts[i].p.x, pts[i].p.y, pts[i].diam * 0.7, pts[i].diam * 0.7);
    textSize(12);
    textAlign(RIGHT, CENTER);
    fill(0.75, 0.5);
    text(pts[i].a.mag().toFixed(3) + " ", pts[i].p.x, pts[i].p.y);
    pts[i].move();
  }
  for (var i = 0; i < orbs.length; i++) {
    noStroke();
    fill(map(orbs[i].mass, orbMass * massVar, orbMass, 0.2, 0.7), 0.2);
    ellipse(orbs[i].p.x, orbs[i].p.y, orbs[i].diam, orbs[i].diam);
    textSize(12);
    textAlign(CENTER, CENTER);
    fill(1, 0.5);
    text(orbs[i].a.mag().toFixed(3), orbs[i].p.x, orbs[i].p.y);
    orbs[i].move();
  }
  // add some excitement
  if (Math.random() > 0.9999) {
    orbs[orbs.length] = new DotMass(orbMass * 2, map(random(), 0, 1, 0.2, 0.8) * width,
    map(random(), 0, 1, 0.2, 0.8) * height, 0, 0);
    orbs[orbs.length - 1].diam = orbRad * 2;
  }
  if (Math.random() > 0.9999) {
    var oldlen = pts.length;
    var oldorb = orbs.splice(randomOrb(), 1);
    for (var i = 0; i < 10; i++) {
      pts[oldlen + i] = new DotMass(map(random(), 0, 1, ptMass * massVar, ptMass),
      oldorb[0].p.x + pom() * orbRad, oldorb[0].p.y + pom() * orbRad, random() * 2 * PI, random() * vInit);
      pts[oldlen + i].diam = ptRad * 2;
    }
  }
  if (Math.random() > 0.9999) {
    orbs[randomOrb()].v.setMag(10);
  }
  if (Math.random() > 0.9999) {
    var orblen = orbs.length;
    orbs[orblen] = orbs[randomOrb()];
    orbs[orblen].p.add(p5.Vector.random2D().mult(orbRad * 1.75));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function DotMass(m, x, y, vh, vm) {
  this.mass = m;
  this.diam = 10;
  this.charge = pom();
  this.p = new p5.Vector(x, y);
  this.v = p5.Vector.fromAngle(vh).mult(vm);
  this.a = new p5.Vector(0, 0);
  this.move = function() {
    this.v.add(this.a);
    this.p.add(this.v);
    this.a.mult(0);
  };
}

function pom () {
  return (-1)**(Math.random() < 0.5);
}

function forceLine(f, c, p1, p2) {
  strokeWeight(1);
  var cval = map(f.mag(), 0, forceMax, bcolor, 1);
  stroke(c, cval, cval, 0.2);
  line(p1.x, p1.y, p2.x, p2.y);
}

function randomOrb() {
  return floor(Math.random() * (orbs.length - 1));
}
