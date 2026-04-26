function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream => {

    }).catch()

}

window.addEventListener('load', startup, false)