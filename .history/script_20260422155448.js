const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 🔥 SETUP CAMERA
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

// 🔥 SETUP MEDIAPIPE
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

// 🔥 LOOP (INI PENTING BANGET)
function onResults(results) {
  // set canvas size sesuai video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // gambar video ke canvas
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // kalau ada wajah
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      
      // 🔥 gambar titik wajah
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION,
        { color: '#00FF00', lineWidth:  });

      drawLandmarks(ctx, landmarks,
        { color: '#FF0000', lineWidth: 1 });

    }
  }
}

faceMesh.onResults(onResults);

// 🔥 LOOP FRAME (PENGGANTI while True)
async function loop() {
  await faceMesh.send({ image: video });
  requestAnimationFrame(loop);
}

// start loop kalau video ready
video.addEventListener('loadeddata', () => {
  loop();
});