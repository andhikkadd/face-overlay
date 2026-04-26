function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        
    })

}

window.addEventListener('load', startup, false)