function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            min
        }
    })

}

window.addEventListener('load', startup, false)