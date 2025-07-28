import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TranscriptInput = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  useEffect(() => {
    fetch('https://kr-ai-meeting-bot-backend.vercel.app/get-transcript')
      .then((res) => res.ok ? res.text() : '')
      .then((text) => {
        if (text.trim()) {
          setTranscript(text);
        }
      });
  }, []);

  const handleFileUpload = async () => {
    if (!file) return alert('Please select a file.');
    setLoading(true);
    setActiveAction('upload');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('https://kr-ai-meeting-bot-backend.vercel.app/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTranscript(res.data.transcript);
      setSummary(res.data.summary[0]?.summary || '');
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error(err);
      alert('Error uploading file.');
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setActiveAction('generate');
    try {
      const res = await axios.post('https://kr-ai-meeting-bot-backend.vercel.app/transcribe/from-file');
      setTranscript(res.data.transcript);
      setSummary(res.data.summary[0]?.summary || '');
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error(err);
      alert('Error generating summary.');
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Transcript Processor</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Upload a File</h2>
        <input
          type="file"
          accept=".mp3,.wav,.m4a,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-2"
        />
        <div className="mt-2">
          <button
            onClick={handleFileUpload}
            disabled={loading || activeAction === 'generate'}
            className="mr-2 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Upload & Transcribe
          </button>
          <button
            onClick={handleGenerateSummary}
            disabled={loading || activeAction === 'upload'}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            Generate Summary from Saved File
          </button>
        </div>
      </div>

      <button
        onClick={handleClear}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Clear
      </button>

      {transcript && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">Transcript</h3>
          <textarea className="w-full p-2 border rounded" rows="10" value={transcript} readOnly />
        </div>
      )}

      {summary && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">Summary</h3>
          <p className="bg-white p-3 rounded shadow">{summary}</p>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold">Action Items</h3>
          <ul className="list-disc ml-6">
            {actionItems.map((item, i) => (
              <li key={i}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;









