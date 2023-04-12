import React, { useState, useEffect } from 'react';

const TextToSpeech = ({}) => {
    const [voiceName, setVoiceName] = useState('');
    const [lang, setLang] = useState('en-US');
    const [prosodyRate, setProsodyRate] = useState(15);
    const [prosodyPitch, setProsodyPitch] = useState(15);
    const [speechKey, setSpeechKey] = useState('');
    const [speechRegion, setSpeechRegion] = useState('');
  
    const availableVoices = [
      'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)',
      // Add more voices here
    ];

    useEffect(() => {
        localStorage.setItem('voiceName', voiceName);
        localStorage.setItem('lang', lang);
        localStorage.setItem('prosodyRate', prosodyRate);
        localStorage.setItem('prosodyPitch', prosodyPitch);
        localStorage.setItem('speechKey', speechKey);
        localStorage.setItem('speechRegion', speechRegion);
      }, [voiceName, lang, prosodyRate, prosodyPitch, speechKey, speechRegion]);

    return (
    <div>
      <label>
        Voice Name:
        <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
          {availableVoices.map((voice, i) => (
            <option key={i} value={voice}>
              {voice}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Language:
        <input type="text" value={lang} onChange={(e) => setLang(e.target.value)} />
      </label>
      <br />
      <label>
        Prosody Rate:
        <input
          type="range"
          min="0"
          max="100"
          value={prosodyRate}
          onChange={(e) => setProsodyRate(e.target.value)}
        />
        <input
          type="number"
          min="0"
          max="100"
          value={prosodyRate}
          onChange={(e) => setProsodyRate(e.target.value)}
        />%
      </label>
      <br />
      <label>
        Prosody Pitch:
        <input
          type="range"
          min="0"
          max="100"
          value={prosodyPitch}
          onChange={(e) => setProsodyPitch(e.target.value)}
        />
        <input
          type="number"
          min="0"
          max="100"
          value={prosodyPitch}
          onChange={(e) => setProsodyPitch(e.target.value)}
        />%
      </label>
      <br />
      <label>
        Speech Key:
        <input type="text" value={speechKey} onChange={(e) => setSpeechKey(e.target.value)} />
      </label>
      <br />
      <label>
        Speech Region:
        <input type="text" value={speechRegion} onChange={(e) => setSpeechRegion(e.target.value)} />
      </label>
    </div>
  );
}
export default TextToSpeech;