// Face Mesh Texture Mapping
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh

let video;
let faceMesh;
let faces = [];
let triangles;
let uvCoords;
let img;

let cx = 0;
let cy = 0;
let d = 0;
let angle = 0

let yaw = 0;
let pitch = 0;

let yawWarpX = 0;
let pitchWarpY = 0;

let isFirstDetect = true;

function preload() {
faceMesh = ml5.faceMesh({ maxFaces: 1});

img = loadImage("assets/glasses.png");
}

function mousePressed() {
console.log(faces);
}

function gotFaces(results) {
faces = results;
}

function setup() {
  let canvas = createCanvas(640, 480, WEBGL);
  canvas.parent("viewer");

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
}

function changeGlasses(path, el) {
  img = loadImage(path);

  document.querySelectorAll(".item").forEach(i => {
    i.classList.remove("active");
  });

  el.classList.add("active");
}

function capturePhoto() {
  saveCanvas("my-glasses", "png");
}

function capturePhoto() {
  saveCanvas("virtual-glasses", "png");
}

function getPNG(eyeR, eyeL, nose, checkR, checkL, chin) {
    //roll
    let cx = (eyeR.x + eyeL.x) / 2;
    let cy = (eyeR.y + eyeL.y) / 2;

    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);

    let angle = atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

    // yaw 
    let dL = nose.x - checkL.x;
    let dR = checkR.x - nose.x;

    let yaw = (dR - dL) / (dR + dL);

    // pitch
    let eye_cy = (eyeR.y + eyeL.y) / 2;

    let d_up = nose.y - eye_cy;
    let d_down = chin.y - nose.y

    let pitch = (d_down - d_up) / (d_down + d_up);

    return { cx, cy, d, angle, yaw, pitch };

}

function draw() {
  translate(-width / 2, -height / 2);
  background(0);

  // 🔥 ambil rasio asli video
  let videoRatio = video.elt.videoWidth / video.elt.videoHeight;
  let canvasRatio = width / height;

  let drawWidth, drawHeight;

  if (videoRatio > canvasRatio) {
    // video lebih lebar
    drawHeight = height;
    drawWidth = height * videoRatio;
  } else {
    // video lebih tinggi
    drawWidth = width;
    drawHeight = width / videoRatio;
  }

  let x = (width - drawWidth) / 2;
  let y = (height - drawHeight) / 2;

  // 🔥 gambar video TANPA GEpeng
  image(video, x, y, drawWidth, drawHeight);

  // =============================
  // LANJUT BAGIAN FACEMESH LU
  // =============================
  
  if (faces.length > 0) {
    let face = faces[0];
    let keypoints = face.keypoints;

    let eyeR = keypoints[263];
    let eyeL = keypoints[33];
    let nose = keypoints[1];
    let checkR = keypoints[454];
    let checkL = keypoints[234];
    let chin = keypoints[152];

    let data = getPNG(eyeR, eyeL, nose, checkR, checkL, chin);

    // ⛔ PENTING: offset posisi karena video di-center
    let offsetXVideo = x;
    let offsetYVideo = y;

    let raw_cx = data.cx + offsetXVideo;
    let raw_cy = data.cy + offsetYVideo;

    let raw_d = data.d;
    let raw_angle = data.angle;
    let raw_yaw = data.yaw;
    let raw_pitch = data.pitch;

    if (isFirstDetect) {
      cx = raw_cx;
      cy = raw_cy;
      d = raw_d;
      angle = raw_angle;
      yaw = raw_yaw;
      pitch = raw_pitch;
      isFirstDetect = false;
    } else {
      cx = lerp(cx, raw_cx, 0.9);
      cy = lerp(cy, raw_cy, 0.9);
      d = lerp(d, raw_d, 0.85);

      let diff = atan2(sin(raw_angle - angle), cos(raw_angle - angle));
      angle = angle + diff * 0.5;

      yaw = constrain(lerp(yaw, raw_yaw, 0.1), -0.6, 0.6);
      pitch = lerp(pitch, raw_pitch, 0.9);
    }

    let offsetX = -yaw * d * 0.25;
    let offsetY = -pitch * d * 0.03;

    imageMode(CENTER);
    push();
    translate(cx + offsetX, cy + offsetY);
    rotate(angle);

    let w = d * 1.9;
    let h = d * 0.8;

    texture(img);
    noStroke();

    beginShape();
    vertex(-w/2, -h/2, 0, 0);
    vertex(w/2, -h/2, 1, 0);
    vertex(w/2, h/2, 1, 1);
    vertex(-w/2, h/2, 0, 1);
    endShape(CLOSE);

    pop();
  }
}
