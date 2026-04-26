function startup() {

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(stream => {

    }).catch(console.err)

}

window.addEventListener('load', startup, false)