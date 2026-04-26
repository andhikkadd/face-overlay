function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then

}

window.addEventListener('load', startup, false)