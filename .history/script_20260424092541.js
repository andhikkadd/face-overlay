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
  // bikin ketengah
  translate(-width / 2, -height / 2);
  background(0);

  // Display video
  image(video, 0, 0);

  if (faces.length > 0) {
    let face = faces[0];

    let keypoints = face.keypoints

    triangles = faceMesh.getTriangles();

    // Loop 
    for (let i = 0; i < keypoints.length; i++) {
        let kp = keypoints[i];

        let kp_x = kp.x;
        let kp_y = kp.y;

        fill(255, 0, 0);
        noStroke();
        ellipse(kp_x, kp_y, 5, 5);

        // triangles(kp_x, kp_y, 5, 5);
        
    }

    // gambar garis mesh
stroke(0, 255, 0);
strokeWeight(1);
noFill();

for (let i = 0; i < triangles.length; i++) {
  let tri = triangles[i];

  let a = keypoints[tri[0]];
  let b = keypoints[tri[1]];
  let c = keypoints[tri[2]];

  line(a.x, a.y, b.x, b.y);
  line(b.x, b.y, c.x, c.y);
  line(c.x, c.y, a.x, a.y);
}

  }
}
