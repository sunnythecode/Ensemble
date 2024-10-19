import os, json
import sys
import sounddevice as sd
import soundfile as sf
from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource
)
import asyncio
from datetime import datetime
import mimetypes

# Constants
AUDIO_DIR = "recordings"  # Directory to save recordings
SAMPLE_RATE = 44100        # Sample rate in Hz
CHANNELS = 1               # Mono recording

def create_recordings_directory():
    """
    Creates the recordings directory if it doesn't exist.
    """
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)
        print(f"Created directory '{AUDIO_DIR}' for saving recordings.")

def get_audio_file_path():
    """
    Generates a unique file path for the recording based on the current timestamp.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"recording_{timestamp}.wav"
    return os.path.join(AUDIO_DIR, filename)

def record_audio(duration):
    """
    Records audio from the microphone for a specified duration.

    Args:
        duration (int or float): Duration of the recording in seconds.

    Returns:
        str: Path to the saved audio file.
    """
    print(f"\nRecording started. Speak into the microphone for {duration} seconds...")
    recording = sd.rec(int(duration * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=CHANNELS, dtype='int16')
    sd.wait()  # Wait until recording is finished
    print("Recording finished.")

    # Save the recording to a WAV file
    file_path = get_audio_file_path()
    sf.write(file_path, recording, SAMPLE_RATE)
    print(f"Audio saved to '{file_path}'.")
    return file_path

async def transcribe_audio(deepgram_client, audio_file_path):
    """
    Sends the audio file to Deepgram for transcription.

    Args:
        deepgram_client (Deepgram): Initialized Deepgram client.
        audio_file_path (str): Path to the audio file to transcribe.

    Returns:
        dict: Transcription response from Deepgram.
    """
    try:
        with open(audio_file_path, 'rb') as audio:
            buffer_data=audio.read()
            source = FileSource(buffer=buffer_data, mimetype= 'audio/wav')

            options = PrerecordedOptions(
                model= 'nova-2',
                smart_format=True,
            )
            print("\nSending audio to Deepgram for transcription...")
            response = deepgram_client.listen.prerecorded.v("1").transcribe_file(source, options)
            return response
    except Exception as e:
        print(f"Error during transcription: {e}")
        sys.exit(1)

def extract_transcript(response):
    """
    Extracts the transcript text from Deepgram's response.

    Args:
        response (dict): Deepgram transcription response.

    Returns:
        str: Transcribed text.
    """
    try:
        transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        return transcript
    except (KeyError, IndexError):
        print("No transcription results found.")
        return ""

def main():
    # Initialize
    create_recordings_directory()

    # Retrieve Deepgram API key from environment variable
    deepgram_api_key = "66d32a0950d3e2255dad552579573b58199d5f9a"
    if not deepgram_api_key:
        print("Error: DEEPGRAM_API_KEY environment variable not set.")
        print("Please set it using the following command (replace <your_api_key>):")
        print("  On Windows (Command Prompt): set DEEPGRAM_API_KEY=<your_api_key>")
        print("  On Windows (PowerShell): $env:DEEPGRAM_API_KEY='<your_api_key>'")
        print("  On macOS/Linux: export DEEPGRAM_API_KEY=<your_api_key>")
        sys.exit(1)

    # Initialize Deepgram client
    deepgram = DeepgramClient(deepgram_api_key)

    # Prompt user for recording duration
    while True:
        try:
            duration = float(input("\nEnter recording duration in seconds (e.g., 5): "))
            if duration <= 0:
                print("Please enter a positive number for duration.")
                continue
            break
        except ValueError:
            print("Invalid input. Please enter a numerical value.")

    # Record audio
    audio_file_path = record_audio(duration)

    # Transcribe audio
    try:
        dg_api_key = os.getenv("DEEPGRAM_KEY")
        deepgram = DeepgramClient()

        with open(audio_file_path, "rb") as file:
            buffer_data = file.read()
            
            # Determine MIME type based on file extension
            mime_type, _ = mimetypes.guess_type(audio_file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'  # Fallback MIME type

            # Define the source as a dictionary
            payload = {
                'buffer': buffer_data,
                'mimetype': 'audio/wav'
            }

            # Define transcription options as a dictionary
            options = {
                'punctuate': True,
                'language': 'en-US',
                'model': 'general',
                'tier': 'enhanced'
                # 'diarize': True  # Uncomment if speaker diarization is desired
            }

        print("completed")

        with open(audio_file_path, "rb") as file:
            buffer_data = file.read()

            payload: FileSource = {
	            "buffer": buffer_data,
            }

            options = PrerecordedOptions(
                smart_format=True,
                summarize="v2",
            )
            file_response = deepgram.listen.rest.v("1").transcribe_file(payload, options)

            json = file_response.to_json(indent=4)
            print(f"{json}")
        

    except Exception as e:
        print(f"Exception: {e}")

    "print(finish.to_json(indent=4))"
    """try:
        response = asyncio.run(transcribe_audio(deepgram, audio_file_path))
    except Exception as e:
        print(f"An unexpected error occurred during transcription: {e}")
        sys.exit(1)"""

    # Extract and display transcript
    """transcript = extract_transcript(response)
    if transcript:
        print("\n--- Transcription ---")
        print(transcript)
    else:
        print("Transcription failed or no text was found.")"""

if __name__ == "__main__":
    main()
