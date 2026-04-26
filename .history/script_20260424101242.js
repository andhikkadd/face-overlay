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
    createCanvas(windowWidth, windowHeight, WEBGL);
    video = createCapture(VIDEO);
    video.hide();

    faceMesh.detectStart(video, gotFaces);
}


function draw() {
  translate(-width / 2, -height / 2);
  background(0);

  // Display video
  image(video, 0, 0);

  if (faces.length > 0) {
    let face = faces[0];
    let keypoints = face.keypoints

    // triangles = faceMesh.getTriangles();
    let p1 = keypoints[33];
    let p2 = keypoints[263];
    console.log(p1, p2);

    // Loop 
    for (let i = 0; i < keypoints.length; i++) {
        let kp = keypoints[i];

        let kp_x = kp.x;
        let kp_y = kp.y;

        fill(255, 0, 0);
        noStroke();
        ellipse(kp_x, kp_y, 5, 5);
    }
  }
}
