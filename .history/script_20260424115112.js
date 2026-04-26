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

let prev_rawCx = 0;
let prev_rawCy = 0;
let prev_rawAngle = 0;

let hasPrev = true
let isFirstDetect = true;
let isFirstAngle = true;

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

function getPNG(p1, p2) {
    let cx = (p1.x + p2.x) / 2;
    let cy = (p1.y + p2.y) / 2;

    let d = dist(p1.x, p1.y, p2.x, p2.y);

    let angle = atan2(p2.y - p1.y, p2.x - p1.x);

    return { cx, cy, d, angle };
}

function draw() {
    translate(-width / 2, -height / 2);
    background(0);
        
    imageMode(CORNER);
    image(video, 0, 0);

    if (faces.length > 0) {
        let face = faces[0];
        let keypoints = face.keypoints

        let p1 = keypoints[33];
        let p2 = keypoints[263];

        // middle & distance
        let data = getPNG(p1, p2);

        let raw_cx = data.cx;
        let raw_cy = data.cy;
        let raw_d = data.d;
        let raw_angle = data.angle;

        let pred_cx = raw_cx;
        let pred_cy = raw_cy;

        if (hasPrev) {
            // velocity
            let vx = raw_cx - prev
        }

        if (isFirstDetect) {
            cx = raw_cx;
            cy = raw_cy;
            d = raw_d;
            isFirstDetect = false;
        } else {
            cx = lerp(cx, raw_cx, 0.9);
            cy = lerp(cy, raw_cy, 0.9);
            d = lerp(d, raw_d, 0.9);
        }

        if (isFirstAngle) {
            angle = raw_angle;
            isFirstAngle = false;
        } else {
            angle = lerp(angle, raw_angle, 0.35 );
        }

        imageMode(CENTER);
        push();
        translate(cx, cy);
        rotate(angle);
        imageMode(CENTER);  
        image(img, 0, 0, d * 1.9, d * 0.7);
        pop();


    fill(0, 255, 0);
    ellipse(p1.x, p1.y, 5, 5);

    fill(0, 0, 255);
    ellipse(p2.x, p2.y, 5, 5);

    
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
