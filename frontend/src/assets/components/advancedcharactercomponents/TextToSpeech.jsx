import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { regions, customStyles } from '../Arrays';
import { capitalizeFirstLetter, separateWords } from '../miscfunctions';

const TextToSpeech = ({}) => {
    const [voiceName, setVoiceName] = useState('');
    const [lang, setLang] = useState('en-US');
    const [prosodyRate, setProsodyRate] = useState(15);
    const [prosodyPitch, setProsodyPitch] = useState(15);
    const [speechKey, setSpeechKey] = useState('');
    const [speechRegion, setSpeechRegion] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    async function fetchVoices(speechKey, region) {
        const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
        const headers = {
          'Ocp-Apim-Subscription-Key': speechKey,
        };
      
        try {
          const response = await axios.get(endpoint, { headers });
          return response.data;
        } catch (error) {
          console.error('Error fetching voices:', error);
          return [];
        }
    }

    useEffect(() => {
        const savedState = [
            { key: 'azureTTSName', setter: setVoiceName },
            { key: 'lang', setter: setLang },
            { key: 'prosodyRate', setter: setProsodyRate },
            { key: 'prosodyPitch', setter: setProsodyPitch },
            { key: 'speech_key', setter: setSpeechKey },
            { key: 'service_region', setter: setSpeechRegion },
        ];

        savedState.forEach(({ key, setter }) => {
            const savedValue = localStorage.getItem(key);
            if (savedValue) {
                setter(savedValue);
            }
        });
    }, []);


    useEffect(() => {
        if (speechKey && speechRegion) {
          fetchVoices(speechKey, speechRegion).then((voices) => {
            setAvailableVoices(voices);
          });
        }
    }, [speechKey, speechRegion]);

    useEffect(() => {
        localStorage.setItem('azureTTSName', voiceName);
        localStorage.setItem('lang', lang);
        localStorage.setItem('prosodyRate', prosodyRate);
        localStorage.setItem('prosodyPitch', prosodyPitch);
        localStorage.setItem('speech_key', speechKey);
        localStorage.setItem('service_region', speechRegion);
    }, [voiceName, lang, prosodyRate, prosodyPitch, speechKey, speechRegion]);

    const regionOptions = regions.map((region) => ({
        value: region.identifier,
        label: `${region.geography} - ${region.region}`,
    }));
    
    const voiceOptions = availableVoices.map((voice) => ({
        value: voice.Name,
        label: voice.Name,
    }));

    const getSelectedVoice = () => {
        return availableVoices.find((voice) => voice.Name === voiceName) || {};
    };
    
    const selectedVoice = getSelectedVoice();
    
    const toggleOpen = () => setIsOpen(!isOpen);

    const renderVoiceDetails = () => {
        if (!selectedVoice.Name) return null;
        return (
          <>
            {isOpen ? (
              <>
                <button onClick={toggleOpen} className="bg-selected p-2 rounded-lg">
                  Hide Voice Details
                </button>
                <div className="bg-selected p-4 mt-4 rounded-lg">
                  <h1 className="text-xl font-bold mb-2">Voice Details:</h1>
                  <div className="max-h-[400px] overflow-y-auto">
                    <ul className="space-y-2">
                      {Object.entries(selectedVoice).map(([key, value]) => (
                        <li key={key} className="bg-selected p-2 rounded-lg">
                          <strong className="font-semibold">{separateWords(key)}:</strong>{' '}
                          {Array.isArray(value) ? (
                            <ul className="mt-1 space-y-1">
                              {value.map((item, idx) => (
                                <li key={`${key}-${idx}`} className="bg-selected p-1 rounded-md justify-center">{capitalizeFirstLetter(item)}</li>
                              ))}
                            </ul>
                          ) : (
                            <>
                              <br />
                              <span>{value}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button onClick={toggleOpen} className="bg-selected p-2 rounded-lg justify-center"> Show Voice Details</button>
              </>
            )}
          </>
        );
      };          

    return (
        <div className='relative bg-selected p-4 mt-4 rounded-lg'>
        <h1 className='text-xl font-bold mb-2'>Text to Speech Settings</h1>
        <br />
        <label>
            Speech Region:
            <Select
            value={regionOptions.find((option) => option.value === speechRegion)}
            onChange={(selectedOption) => setSpeechRegion(selectedOption.value)}
            options={regionOptions}
            styles={customStyles}
            />
        </label>
        <br />
        <label>
            Speech Key:
            <input
            type="text"
            value={speechKey}
            onChange={(e) => setSpeechKey(e.target.value)}
            className="character-field"
            />
        </label>
        <br />
        <label>
            Voice Name:
            <Select
            value={voiceOptions.find((option) => option.value === voiceName)}
            onChange={(selectedOption) => setVoiceName(selectedOption.value)}
            options={voiceOptions}
            styles={customStyles}
            />
        </label>
        {renderVoiceDetails()}
        <br />
        <label>
            Language:
            <input type="text" value={lang} onChange={(e) => setLang(e.target.value)} className='character-field'/>
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
            className='character-field'
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
            className='character-field'
            type="number"
            min="0"
            max="100"
            value={prosodyPitch}
            onChange={(e) => setProsodyPitch(e.target.value)}
            />%
        </label>
    </div>
  );
}
export default TextToSpeech;