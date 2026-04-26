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

  video = createCapture({
    video: {
      width: 640,
      height: 480
    },
    audio: false
  });

  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
}

function changeGlasses(path, el) {
  img = loadImage(path);

  document.querySelectorAll(".glass-item").forEach(item => {
    item.classList.remove("active");
  });

  if (el) el.classList.add("active");
}

function capturePhoto() {
  saveCanvas("", "png");
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
        
    imageMode(CORNER);
    image(video, 0, 0, width, height);

    if (faces.length > 0) {
        let face = faces[0];
        let keypoints = face.keypoints

        let eyeR = keypoints[263];
        let eyeL = keypoints[33];
        let nose = keypoints[1];
        let checkR = keypoints[454];
        let checkL = keypoints[234];
        let chin = keypoints[152];

        // middle & distance
        let data = getPNG(eyeR, eyeL, nose, checkR, checkL, chin);

        let raw_cx = data.cx;
        let raw_cy = data.cy;
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

            let raw_yaw_2 = lerp(yaw, raw_yaw, 0.1);
            yaw = constrain(raw_yaw_2, -0.6, 0.6)

            pitch = lerp(pitch, raw_pitch, 0.9);
        }
        
        // geser posisi kacamata ikut arah kepala
        let offsetX = -yaw * d * 0.25;
        let offsetY = -pitch * d * 0.03;

        imageMode(CENTER);
        push();
        translate(cx + offsetX, cy + offsetY)
        rotate(angle);
        // scale(-1, 1);

        let w = d * 1.9;
        let h = d * 0.8;

        let tlX = -w/2;
        let tlY = -h/2;

        let trX = w/2;
        let trY = -h/2;
        
        let brX = w/2;
        let brY = h/2;
        
        let blX = -w/2;
        let blY = h/2;

        // seberapa jauh sisi ditarik ke dalam
        let rawYaw_warpX = abs(yaw) * w * 0.2;
        yawWarpX = lerp(yawWarpX, rawYaw_warpX, 0.45)

        // seberapa miring bentuknya (biar nggak flat)  
        let yawTiltY = yawWarpX * 0.25;

        let RawPitch_WarpY = abs(pitch) * h * 0.3;
        pitchWarpY = lerp(pitchWarpY, RawPitch_WarpY, 0.35)

        let pitchTiltX = pitchWarpY * 0.4;

        if (yaw > 0) { //kiri
            // kanan lebih besar
            trX += yawWarpX;
            brX += yawWarpX;

            trY -= yawTiltY;
            brY += yawTiltY;

            // kiri lebih kecil
            tlX += yawWarpX;
            blX += yawWarpX;

            tlY += yawTiltY;
            blY -= yawTiltY;

        } else { //kanan
            // kiri lebih besar
            tlX -= yawWarpX;
            blX -= yawWarpX;

            tlY -= yawTiltY;
            blY += yawTiltY;

            // kanan lebih kecil
            trX -= yawWarpX;
            brX -= yawWarpX;

            trY += yawTiltY;
            brY -= yawTiltY;
        };

        // pitch 

        if (pitch > 0) { // atas
            brY -= pitchWarpY;
            blY -= pitchWarpY;

            brX += pitchTiltX;
            blX -= pitchTiltX;

        } else { // bawah
            trY += pitchWarpY;
            tlY += pitchWarpY;

            trX += pitchTiltX;
            tlX -= pitchTiltX;

        };;

        texture(img);
        textureMode(NORMAL);
        noStroke();

        beginShape();
        vertex(tlX, tlY, 0, 0); // TL
        vertex(trX, trY, 1, 0); // TR
        vertex(brX, brY, 1, 1); // BR
        vertex(blX,  blY, 0, 1); // BL
        endShape(CLOSE);

        // fill(255, 0, 0);
        // noStroke();
        // ellipse(tlX, tlY, 6, 6);
        // ellipse(blX, blY, 6, 6);


        // fill(255, 255, 0);
        // noStroke();
        // ellipse(trX, trY, 6, 6);
        // ellipse(brX, brY, 6, 6);

        pop();
    
    }
}
