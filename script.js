// Get the video object on the document
const video = document.getElementById("video");

// async load in parallel all faceapi's
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

// This function will stream the client video stream capture into the video object on the page
function startVideo() {
    // Gets the client camera
    navigator.getUserMedia(
        { video: {} },
        // set the client video capture stream to be the source for our video object
        stream => video.srcObject = stream,
        // Incase of an error - log it onto condole error
        err => console.error(err)
    )
}

// Add an event listener for the document video object when start play - i.e camera stream start to play
video.addEventListener('play', () => {
    // Create a canvvas object to draw on the face detection
    const canvas = faceapi.createCanvasFromMedia(video);
    // Add the canvas object onto the page
    document.body.append(canvas);
    // Set the canvas object size to math the video object
    const displaySize = { width: video.width, height: video.height };
    // Match the detection dimention onto canvas and display size
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        // Using faceapi to detect all faces in the camera stream including face landmarks (position on the face) and face expression
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        // For debug - writing the detections object to console log
        console.log(detections);
        const resizeDetections = faceapi.resizeResults(detections, displaySize);
        // Clear previous canvas draw before drawing new elements
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        // Draw the face detection box
        faceapi.draw.drawDetections(canvas, resizeDetections);
        // Draew the face elements - eyes, nose, eyebrowns etc...
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
        // Add expression lable
        faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
    }, 100)
})