import React from 'react';

function FeatureCards() {
  const features = [
    {
      emoji: '🎧',
      title: 'Supports Audio & Text',
      desc: 'Upload MP3, WAV, or TXT files for processing'
    },
    {
      emoji: '⚡',
      title: 'Fast Transcription',
      desc: 'Get transcribed content in seconds using AI'
    },
    {
      emoji: '📚',
      title: 'Summary Generation',
      desc: 'Automatically generates key takeaways from the transcript'
    }
  ];

  const exportOptions = [
    {
      emoji: '📝',
      title: 'Export to Notion',
      desc: 'Save notes directly to your Notion workspace',
    },
    {
      emoji: '📧',
      title: 'Share via Email',
      desc: 'Email summary and action items (coming soon)',
    },
    {
      emoji: '📋',
      title: 'Copy Summary',
      desc: 'Quickly copy the generated summary to clipboard',
    },
  ];

  return (
    <section style={{ width: '90%', maxWidth: '1200px', marginTop: '30px' }}>
      <h2 style={{ marginBottom: '20px' }}>✨ Features</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {[...features, ...exportOptions].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '10px',
              flex: '1 1 250px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <h3>{item.emoji} {item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureCards;