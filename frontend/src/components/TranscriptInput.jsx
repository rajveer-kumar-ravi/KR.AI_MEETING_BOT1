import React, { useState } from 'react';
import axios from 'axios';
const BASE_URL="https://kr-ai-meeting-bot1-25.onrender.com"
const TranscriptInput = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableType, setDisableType] = useState(null); // "upload" or "generate"

  const updateTranscriptData = (data) => {
    setTranscript(data.transcript || '');
    setSummary(data.summary || '');
    setActionItems(data.action_items || []);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDisableType(null); // reset state
  };

  const handleUploadAndSummarize = async () => {
    if (!file) {
      alert('⚠️ Please select a file first.');
      return;
    }

    setLoading(true);
    setDisableType("upload");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(
        'https://kr-ai-meeting-backend.onrender.com/transcribe',
        formData
      );

      updateTranscriptData(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Upload failed.');
      setDisableType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeFromFile = async () => {
    setLoading(true);
    setDisableType("generate");

    try {
      const res = await axios.post(
        'https://kr-ai-meeting-backend.onrender.com/transcribe/from-file'
      );

      updateTranscriptData(res.data);
    } catch (err) {
      console.error('Summary generation failed:', err);
      alert('❌ Summary generation failed.');
      setDisableType(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Transcript Processor</h1>

      {/* File Upload */}
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button
          onClick={handleUploadAndSummarize}
          disabled={loading || disableType === "generate"}
          className={`px-4 py-2 rounded text-white ${
            loading || disableType === "generate"
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading && disableType === "upload" ? 'Uploading...' : 'Upload & Summarize'}
        </button>
      </div>

      {/* Generate Summary from meeting.txt */}
      <div className="mb-4">
        <button
          onClick={handleSummarizeFromFile}
          disabled={loading || disableType === "upload"}
          className={`px-4 py-2 rounded text-white ${
            loading || disableType === "upload"
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading && disableType === "generate"
            ? 'Generating Summary...'
            : 'Generate Summary from meeting.txt'}
        </button>
      </div>

      {/* Display Transcript */}
      {transcript && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Transcript:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded">{transcript}</pre>
        </div>
      )}

      {/* Display Summary */}
      {summary && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Summary:</h2>
          <p className="bg-gray-100 p-3 rounded">{summary}</p>
        </div>
      )}

      {/* Display Action Items */}
      {actionItems.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Action Items:</h2>
          <ul className="list-disc pl-6 bg-gray-100 p-3 rounded">
            {actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;







