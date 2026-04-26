function startup() {
    
    navigator.mediaDevices.getUserMedia({
        audio
    })

}

window.addEventListener('load', startup, false)