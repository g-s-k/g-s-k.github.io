function setup() {
  createCanvas(windowWidth, windowHeight);
  var numshapes = 50;
  var minSize = 20, maxSize = 200;
  var minSpeed = 1, maxSpeed = 5;
  var minRot = Math.PI / 200, maxRot = Math.PI / 50;
  shapes = [];
  for (var i = 0; i < numshapes; i++) {
    shapes[i] = {p:[random() * windowWidth, random() * windowHeight,
                    random() * Math.PI / 3,
                    random() * (maxSize - minSize) + minSize],
                 v:[(random() * (maxSpeed - minSpeed) + minSpeed) * plusOrMinus(),
                    (random() * (maxSpeed - minSpeed) + minSpeed) * plusOrMinus(),
                    (random() * (maxRot - minRot) + minRot) * plusOrMinus()],
                 h:random() * 255, s: random() * 100 + 155, b:255,
                 move:function() {
                  for (var i = 0; i < 3; i++) {
                    this.p[i] += this.v[i];
                  }
                  this.v[2] *= 0.999;
                  this.v[1] += 0.01;
                 },
                 points:function() {
                  var xs = [-this.p[3], this.p[3] / 2, this.p[3] / 2];
                  var ys = [0, this.p[3] * Math.sqrt(3) / 2, -this.p[3] * Math.sqrt(3) / 2];
                  var pts = [[], []];
                  for (var i = 0; i < 3; i++) {
                    pts[0][i] = xs[i] * Math.cos(this.p[2]) - ys[i] * Math.sin(this.p[2]) + this.p[0];
                    pts[1][i] = ys[i] * Math.cos(this.p[2]) + xs[i] * Math.sin(this.p[2]) + this.p[1];
                  }
                  return pts;
                 },
                 disp:function(h) {
                  var pts = this.points();
                  strokeWeight(3);
                  stroke(h, 0.5, 0.5);
                  triangle(pts[0][0], pts[1][0], pts[0][1], pts[1][1], pts[0][2], pts[1][2]);
                }};
  }
  colorMode(HSB, 1);
  frameRate(30);
}

function draw() {
  var noiseFactor = 0.001;
  background(0);
  strokeWeight(5);
  fill(0, 0.4);
  var pts = [];
  var maxx = [windowWidth, windowHeight];
  for (var i = 0; i < shapes.length; i++) {
    shapes[i].disp(noise(shapes[i].p[0] * noiseFactor, shapes[i].p[1] * noiseFactor, i * noiseFactor) * 0.7 + 0.3);
    pts = shapes[i].points();
    for (var j = 0; j < 2; j++) {
      if (max(pts[j]) >= maxx[j]) {
        shapes[i].v[j] = -Math.abs(shapes[i].v[j]);
        shapes[i].v[2] *= (-1)**(shapes[i].v[(j+1)%2] > 0)
      } else if (min(pts[j]) <= 0) {
        shapes[i].v[j] = Math.abs(shapes[i].v[j]);
        shapes[i].v[2] *= (-1)**(shapes[i].v[(j+1)%2] > 0)
      }
    }
    shapes[i].move();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function plusOrMinus() {
  return (-1)**(Math.random() >= 0.5);
}
