let isTranscribing = false;
let accessToken = null;
let transcriptText = ""; // Stores the complete transcript

document.getElementById('authBtn').addEventListener('click', authWithZoom);
document.getElementById('startBtn').addEventListener('click', startTranscription);
document.getElementById('stopBtn').addEventListener('click', stopTranscription);
document.getElementById('summaryBtn').addEventListener('click', redirectToFrontend);

// Zoom OAuth Flow
async function authWithZoom() {
  try {
    const clientId = "oyZYL2_1TzG7JQ8Uc0RmBg";
    const redirectUri = chrome.identity.getRedirectURL("zoom_oauth");
    const authUrl = `https://zoom.us/oauth/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });

    const url = new URL(responseUrl);
    accessToken = url.hash.match(/access_token=([^&]*)/)[1];
    chrome.storage.local.set({ zoomToken: accessToken });

    updateStatus("Connected to Zoom");
    fetchMeetingInfo();
  } catch (error) {
    console.error("Auth failed:", error);
    updateStatus("Authentication failed");
  }
}

// Fetch current Zoom meetings
async function fetchMeetingInfo() {
  try {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings?type=live", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    document.getElementById('meetingInfo').innerHTML = `
      <h4>Your Meetings:</h4>
      <ul>
        ${data.meetings.map(m => `<li>${m.topic} (${m.status})</li>`).join('')}
      </ul>
    `;
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
  }
}

// Start transcription
function startTranscription() {
  if (isTranscribing) return;

  isTranscribing = true;
  transcriptText = ""; // Clear previous transcript
  document.getElementById('transcript').innerHTML = ""; // Clear UI transcript

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "start" });
    updateStatus("Transcribing...");
  });
}

// Stop transcription
function stopTranscription() {
  if (!isTranscribing) return;

  isTranscribing = false;
  updateStatus("Stopped - Saving transcript...");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "stop" });
  });

  if (!transcriptText.trim()) {
    updateStatus("No transcript to save");
    return;
  }

  sendTranscriptToBackend(transcriptText);
}

// Send transcript to FastAPI backend
async function sendTranscriptToBackend(transcript) {
  try {
    const response = await fetch("http://localhost:8000/save-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript })
    });

    const data = await response.json();
    console.log("Saved transcript:", data);
    updateStatus("Transcript saved. Click summary to view.");
  } catch (err) {
    console.error("Failed to save transcript:", err);
    updateStatus("Save failed");
  }
}

// Open frontend to generate summary from backend transcript
function redirectToFrontend() {
  if (!transcriptText.trim()) {
    updateStatus("No transcript to summarize");
    return;
  }

  updateStatus("Opening summary...");
  chrome.tabs.create({ url: "http://localhost:3000/?source=extension" });
}

// Listen for new transcript lines from content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.transcript) {
    transcriptText += request.transcript + "\n";
    const transcriptDiv = document.getElementById('transcript');
    const paragraph = document.createElement("p");
    paragraph.textContent = request.transcript;
    transcriptDiv.appendChild(paragraph);
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  }
});

// Update UI status message
function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

// Check if user already logged into Zoom
chrome.storage.local.get(['zoomToken'], (result) => {
  if (result.zoomToken) {
    accessToken = result.zoomToken;
    updateStatus("Connected to Zoom");
    fetchMeetingInfo();
  }
});
