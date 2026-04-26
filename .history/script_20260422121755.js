const video = document.getElementById('video');
let canvas = document.getElementById('canvas');

var window_height = 

canvas.style.background = "#ff8";


function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: 640,
            height: 484
        }
    }).then(stream => {
        video.srcObject = stream;
    }).catch(console.error)

}

window.addEventListener('load', startup, false)