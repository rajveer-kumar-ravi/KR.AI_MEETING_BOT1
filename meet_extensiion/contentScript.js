let recognition;
let meetingData = {};
let finalTranscript = "";

// Detect if Zoom page is open
if (window.location.hostname.includes('zoom.us')) {
  chrome.runtime.sendMessage({ type: "zoomPageDetected" });
}

// Listen for popup messages to start/stop
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    startSpeechRecognition();
  } else if (request.action === "stop") {
    stopSpeechRecognition();
  }
});

// Start browser speech recognition
function startSpeechRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript + " ";
        chrome.runtime.sendMessage({ transcript: result[0].transcript });
      } else {
        interim += result[0].transcript;
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    console.log("Speech recognition ended.");
  };

  recognition.start();
}

// Stop recognition
function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Extract Zoom meeting info (every 10s)
function extractMeetingInfo() {
  meetingData = {
    topic: document.querySelector('.meeting-info-content__topic')?.textContent || '',
    participants: Array.from(document.querySelectorAll('.participants-item__name')).map(el => el.textContent)
  };

  chrome.runtime.sendMessage({
    type: "meetingData",
    data: meetingData
  });
}

setInterval(extractMeetingInfo, 10000);
