let mediaRecorder;
let audioChunks = [];
let audioBlob; // Declare audioBlob to store the recorded audio
const recordButton = document.getElementById("recordButton");
const stopButton = document.getElementById("stopButton");
const audioPlayer = document.getElementById("audioPlayer");
const downloadLink = document.getElementById("downloadLink");
const recordingIndicator = document.getElementById("recordingIndicator");
const submitButton = document.getElementById("submitButton"); // Ensure this button is defined in your HTML

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
        // Create Blob from recorded audio chunks
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        downloadLink.href = audioUrl;
        downloadLink.style.display = 'block';
        
        // Reset audioChunks for future recordings
        audioChunks = [];
        recordingIndicator.style.display = 'none'; // Hide recording indicator
    };
};

stopButton.onclick = () => {
    mediaRecorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
};

submitButton.onclick = async () => {
    // Ensure that audioBlob is not null before submitting
    if (!audioBlob) {
        alert('No audio recorded to submit.');
        return;
    }

    // Call submitAudio function
    await submitAudio(audioBlob);
};

// Function to submit audio to the server
const submitAudio = async (audioBlob) => {
    // Create a FormData object to hold the audio Blob
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_memo.webm'); // Append the audio blob to FormData

    try {
        const response = await fetch('/upload-audio', { // Adjusted endpoint
            method: 'POST',
            body: formData,
        });

        const result = await response.text(); // Change this if you're sending JSON
        console.log(result); // Log the result from the server
        const pathSegments = window.location.pathname.split('/'); // Split the path by '/'
        const userID = pathSegments[pathSegments.length - 1]; // The last segment is the userID
        console.log(userID);
        window.location.href = `/results?userID=${userID}&transcript=${encodeURIComponent(result)}`;

    } catch (error) {
        console.error('Error submitting recording:', error);
        alert('There was an error submitting your recording.');
    }
};
