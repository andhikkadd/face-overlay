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

let isFirstDetect = true;

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1 });

  img = loadImage("assets/glasses.png");
}

function mousePressed() {
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

// setup
function setup() {
    console.log("setup jalan");
    createCanvas(640, 480, WEBGL);
    video = createCapture(VIDEO);
    video.hide();

    faceMesh.detectStart(video, gotFaces);
}

function getPNG(eyeR, eyeL, nose, checkR, checkL, chin) {
    //roll
    let cx = (eyeR.x + eyeL.x) / 2;
    let cy = (eyeR.y + eyeL.y) / 2;

    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);

    let angle = atan2(eyeL.y - eyeR.y, eyeL.x - eyeR.x);

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
    image(video, 0, 0);

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
            d = lerp(d, raw_d, 0.9);
            
            let diff = atan2(sin(raw_angle - angle), cos(raw_angle - angle));
            angle = angle + diff * 0.5;

            yaw = lerp(yaw, raw_yaw, 0.1);

            pitch = lerp(pitch, raw_pitch, 0.2);
        }

        let offsetX = yaw * d * 0.2;
        let offsetY = yaw * d * 0.2;

        imageMode(CENTER);
        push();
        translate(cx + offsetX, cy)
        rotate(angle);
        scale(1, -1);
        imageMode(CENTER);  
        image(img, 0, 0, d * 1.9, d * 0.7);
        pop();

    // for (let i = 0; i < keypoints.length; i++) {
    //     let kp = keypoints[i];

    //     let kp_x = kp.x;
    //     let kp_y = kp.y;

    //     fill(255, 0, 0);
    //     noStroke();
    //     ellipse(kp_x, kp_y, 5, 5);
    // }
    
  }
}
