function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: t
    })

}

window.addEventListener('load', startup, false)