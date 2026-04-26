const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  }
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// loop
function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION,
        { color: '#00FF00', lineWidth: 1 });

      drawLandmarks(ctx, landmarks,
        { color: '#FF0000', 
            lineWidth: 0.05 });

    }
  }
}

faceMesh.onResults(onResults);


async function loop() {
  await faceMesh.send({ image: video });
  requestAnimationFrame(loop);
}

video.addEventListener('loadeddata', () => {
  loop();
});