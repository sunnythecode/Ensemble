let mediaRecorder;
let audioChunks = [];

const recordButton = document.getElementById("recordButton");
const stopButton = document.getElementById("stopButton");
const audioPlayer = document.getElementById("audioPlayer");
const downloadLink = document.getElementById("downloadLink");
const recordingIndicator = document.getElementById("recordingIndicator");

recordButton.onclick = async () => {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();
    recordButton.disabled = true;
    stopButton.disabled = false;
    recordingIndicator.style.display = 'block'; // Show recording indicator

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        downloadLink.href = audioUrl;
        downloadLink.style.display = 'block';
        audioChunks = [];
        recordingIndicator.style.display = 'none'; // Hide recording indicator
    };
};

stopButton.onclick = () => {
    mediaRecorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
};