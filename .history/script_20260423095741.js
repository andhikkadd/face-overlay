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

//   triangles = faceMesh.getTriangles();
  uvCoords = faceMesh.getUVCoords();
}

function draw() {
  // Center the 3D space to align with the canvas
  translate(-width / 2, -height / 2);
  background(0);

  // Display the video feed
  image(video, 0, 0);

  if (faces.length > 0) {
    let face = faces[0];

    // Apply texture mapping to the detected face mesh
    texture(img);
    textureMode(NORMAL);
    noStroke();
    beginShape(TRIANGLES);

    // Loop through each triangle in the face mesh
    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];

      // Get the indices of the three points that form a triangle
      let [a, b, c] = tri;

      // Retrieve the corresponding 2D face keypoints
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      // Retrieve the corresponding UV coordinates for texture mapping
      let uvA = uvCoords[a];
      let uvB = uvCoords[b];
      let uvC = uvCoords[c];

      // Define the triangle with both position (x, y) and UV texture coordinates
      vertex(pointA.x, pointA.y, uvA[0], uvA[1]);
      vertex(pointB.x, pointB.y, uvB[0], uvB[1]);
      vertex(pointC.x, pointC.y, uvC[0], uvC[1]);
    }

    endShape();
  }
}
