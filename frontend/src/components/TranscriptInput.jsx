import React, { useState } from 'react';
import axios from 'axios';

const TranscriptInput = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      let res;

      // ✅ If file is selected, upload that
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await axios.post('http://localhost:8000/transcribe', formData);
      } else {
        // ✅ If no file, just use backend's saved meeting.txt from Chrome Extension
        res = await axios.post('http://localhost:8000/transcribe/from-file');
      }

      setTranscript(res.data.transcript || '');
      setSummary(res.data.summary?.map((s) => s.summary).join('\n') || 'No summary available');
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Upload failed. Make sure "meeting.txt" exists in backend /transcripts/ folder or upload a file.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscript('');
    setSummary('');
    setActionItems([]);
  };

  const handleCopy = () => {
    const text = generateExportText();
    navigator.clipboard.writeText(text);
    alert('📋 Copied to clipboard!');
  };

  const handleDownload = () => {
    const text = generateExportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMailtoLink = () => {
    const text = generateExportText();
    return `mailto:?subject=Meeting Summary&body=${encodeURIComponent(text)}`;
  };

  const generateExportText = () => {
    let text = '📝 Meeting Summary:\n';
    text += summary + '\n\n';
    text += '✅ Action Items:\n';
    if (Array.isArray(actionItems)) {
      text += actionItems
        .map((item) => `- ${item.task} [Owner: ${item.owner}] [Deadline: ${item.deadline}]`)
        .join('\n');
    } else {
      text += 'No action items.';
    }
    return text;
  };

  const handleExportToNotion = () => {
    alert('📓 Export to Notion feature coming soon!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg border">
      <h2 className="text-lg font-semibold mb-1">📄 Upload File (optional)</h2>
      <h3 className="text-2xl font-bold mb-4">Transcript Processor</h3>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
        >
          🧠 Generate Summary
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <input type="file" onChange={handleFileChange} className="border p-1 rounded" />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-white border px-4 py-1.5 rounded hover:bg-gray-100"
        >
          {loading ? 'Processing...' : 'Upload & Summarize'}
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={handleClear}
          className="bg-red-100 text-red-700 px-4 py-2 rounded border hover:bg-red-200"
        >
          Clear
        </button>
      </div>

      {summary && (
        <div className="mb-4">
          <h4 className="font-bold mb-1">📝 Summary</h4>
          <p className="whitespace-pre-wrap text-gray-800">{summary}</p>
        </div>
      )}

      {Array.isArray(actionItems) && actionItems.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-1">✅ Action Items</h4>
          <ul className="list-disc list-inside text-gray-800">
            {actionItems.map((item, index) => (
              <li key={index}>
                <strong>Task:</strong> {item.task}<br />
                <strong>Owner:</strong> {item.owner}<br />
                <strong>Deadline:</strong> {item.deadline}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(summary || actionItems.length > 0) && (
        <div className="flex flex-col gap-2">
          <button onClick={handleCopy} className="bg-gray-700 text-white px-4 py-2 rounded">
            📋 Copy to Clipboard
          </button>
          <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded">
            💾 Download Summary
          </button>
          <a
            href={generateMailtoLink()}
            className="bg-purple-600 text-white px-4 py-2 rounded text-center"
          >
            📧 Send via Email
          </a>
          <button onClick={handleExportToNotion} className="bg-yellow-500 text-white px-4 py-2 rounded">
            📓 Export to Notion
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;
