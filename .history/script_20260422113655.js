function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    })

}

window.addEventListener('load', startup, false)