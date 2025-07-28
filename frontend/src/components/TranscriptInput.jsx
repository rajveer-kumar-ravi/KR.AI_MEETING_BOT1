import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TranscriptInput = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // "upload" or "generate"

  // Load default meeting.txt on mount
  useEffect(() => {
    fetch('/transcripts/meeting.txt')
      .then((res) => res.ok ? res.text() : '')
      .then((text) => {
        if (text.trim()) {
          setTranscript(text);
        }
      });
  }, []);

  // Upload transcript file to backend
  const handleFileUpload = async () => {
    if (!file) return alert('Please select a file first.');
    setLoading(true);
    setActiveAction('upload');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://kr-ai-meeting-bot-backend.vercel.app/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTranscript(response.data.transcript);
      setSummary(response.data.summary);
      setActionItems(response.data.action_items || []);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('❌ Upload failed.');
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // Generate summary from /transcribe/from-file
  const handleGenerateSummary = async () => {
    setLoading(true);
    setActiveAction('generate');

    try {
      const response = await axios.post('https://kr-ai-meeting-bot-backend.vercel.app/transcribe/from-file');
      setTranscript(response.data.transcript);
      setSummary(response.data.summary);
      setActionItems(response.data.action_items || []);
    } catch (error) {
      console.error('Summary generation failed:', error);
      alert('❌ Summary generation failed.');
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscript('');
    setSummary('');
    setActionItems([]);
    setActiveAction(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🧾 Transcript Processor</h1>

      {/* Auto Process Saved Transcript */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">🧠 Auto Process Saved Transcript</h2>
        <button
          onClick={handleGenerateSummary}
          disabled={loading || activeAction === 'upload'}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Generate Summary from meeting.txt
        </button>
      </div>

      {/* Upload Transcript */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">📄 Upload Transcript File</h2>
        <input
          type="file"
          accept=".mp3,.wav,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-2"
        />
        <div className="mt-2">
          <button
            onClick={handleFileUpload}
            disabled={loading || activeAction === 'generate'}
            className="mr-2 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            {loading && activeAction === 'upload' ? 'Processing...' : 'Upload & Transcribe'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Result */}
      {transcript && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg">📝 Transcript</h3>
          <textarea
            className="w-full border mt-2 p-2 rounded"
            rows="6"
            value={transcript}
            readOnly
          />
        </div>
      )}

      {summary && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg">📋 Summary</h3>
          <p className="bg-gray-100 p-3 rounded">{summary}</p>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg">✅ Action Items</h3>
          <ul className="list-disc ml-6">
            {actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;








