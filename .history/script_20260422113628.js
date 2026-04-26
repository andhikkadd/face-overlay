function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            
        }
    })

}

window.addEventListener('load', startup, false)