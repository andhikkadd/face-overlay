const video = document.getElementById('video');

function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream => {
        video
    }).catch(console.error)

}

window.addEventListener('load', startup, false)