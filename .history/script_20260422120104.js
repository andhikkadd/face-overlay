const video = document.getElementById('video');

function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: 640,
            height: 480
        }
    }).then(stream => {
        video.srcObject = stream;
    }).catch(console.error)

}

window.addEventListener('load', startup, false)