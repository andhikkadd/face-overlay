const video = document.getElementById('video');
// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

let faceMesh;
let faces = [];

function preload() {
    faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
    console.log(faces);
}

function gotFaces(results) {
    faces = results;
}

function setup() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    createCanvas(
        canvas.width, canvas.height
    );
    video = createCapture(VideoColorSpace, {flipped: true});
    video.hidePopover();
    faceMesh.detectStart(video, gotFaces)

}

function draw() {
    image(video, 0, 0);
    if (faces.length > 0) {
        for (let face of faces) {
            for (let i = 0; i < face.keypoints.length; i++) {
                let keypoints = face.keypoints[i];
                fill
            }
        }
    }
}

// navigator.mediaDevices.getUserMedia({ video: true })
//   .then(stream => {
//     video.srcObject = stream;
//   });

// const faceMesh = new FaceMesh({
//   locateFile: (file) => {
//     return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
//   }
// });

// faceMesh.setOptions({
//   maxNumFaces: 1,
//   refineLandmarks: true,
//   minDetectionConfidence: 0.5,
//   minTrackingConfidence: 0.5
// });

// loop
// function onResults(results) {
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

//   if (results.multiFaceLandmarks) {
//     for (const landmarks of results.multiFaceLandmarks) {
      
//       drawConnectors(ctx, landmarks, FACEMESH_TESSELATION,
//         { color: '#00FF00', lineWidth: 0, radius: 0 });

//       drawLandmarks(ctx, landmarks,
//         { color: '#FF0000', 
//             lineWidth: 0,
//             radius: 1,
//         });

//     }
//   }
// }

// faceMesh.onResults(onResults);


async function loop() {
  await faceMesh.send({ image: video });
  requestAnimationFrame(loop);
}

video.addEventListener('loadeddata', () => {
  loop();
});