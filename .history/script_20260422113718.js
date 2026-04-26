function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream)

}

window.addEventListener('load', startup, false)