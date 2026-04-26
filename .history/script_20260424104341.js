// Face Mesh Texture Mapping
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh

let video;
let faceMesh;
let faces = [];
let triangles;
let uvCoords;
let img;

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

let cx = 0;
let cy = 0;
let d = 0;
let isFirstDetect = true;

function draw() {
    translate(-width / 2, -height / 2);
    background(0);
        
    imageMode(CORNER);
    image(video, 0, 0);

    if (faces.length > 0) {
        let face = faces[0];
        let keypoints = face.keypoints

        // triangles = faceMesh.getTriangles();
        let p1 = keypoints[33];
        let p2 = keypoints[263];
        // console.log(p1, p2);

        // middle & distance
        let raw_cx = (p1.x + p2.x) / 2;
        let raw_cy = (p1.y + p2.y) / 2;
        let raw_d = dist(p1.x, p1.y, p2.x, p2.y);

        if (isFirstDetect) {
            smoothCx = cx;
            smoothCy = cy;
            smoothD = d;
            isFirstDetect = false;
        } else {
            smoothCx = lerp(smoothCx, cx, 0.3);
            smoothCy = lerp(smoothCy, cy, 0.3);
            smoothD = lerp(smoothD, d, 0.3);
        }
        cx = lerp(cx, raw_cx, 0.3)
        cy = lerp(cy, raw_cy, 0.3)
        d = lerp(d, raw_d, 0.3)




        imageMode(CENTER);
        image(img, cx, cy, d * 1.9, d * 0.7);






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
