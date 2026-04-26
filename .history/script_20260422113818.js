const video = document.getElementById

function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream => {

    }).catch(console.error)

}

window.addEventListener('load', startup, false)