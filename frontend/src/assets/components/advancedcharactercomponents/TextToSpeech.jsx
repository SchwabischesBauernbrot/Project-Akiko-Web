import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { regions, customStyles } from '../Arrays';
import { capitalizeFirstLetter, separateWords } from '../miscfunctions';
import { getCharacterSpeech, sendCharacterSpeech } from '../api';

const TextToSpeech = ({ character }) => {
    const [voiceName, setVoiceName] = useState('');
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

    async function addCharacterSpeech(voiceName, prosodyRate, prosodyPitch) {
        const characterSpeech = {
            char_id: character.char_id,
            azureTTSName: voiceName,
            prosodyRate: prosodyRate,
            prosodyPitch: prosodyPitch
        };
        sendCharacterSpeech(characterSpeech, character.char_id).then((res) => {
            console.log(res);
        });
    }
    
    useEffect(() => {
        if(character) {
            getCharacterSpeech(character.char_id).then((res) => {
                if(res) {
                    setVoiceName(res.azureTTSName);
                    setProsodyRate(res.prosodyRate);
                    setProsodyPitch(res.prosodyPitch);
                }
            });
        }else {
            console.log('No character selected');
        }

        const savedState = [
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
        const saveState = async () => {
          await addCharacterSpeech(voiceName, prosodyRate, prosodyPitch);
        };
        saveState();
    }, [voiceName, prosodyRate, prosodyPitch]);
      
    useEffect(() => {
        localStorage.setItem('speech_key', speechKey);
        localStorage.setItem('service_region', speechRegion);
    }, [speechKey, speechRegion]);      

    const regionOptions = regions.map((region) => ({
        value: region.identifier,
        label: `${region.geography} - ${region.region}`,
    }));
    
    const voiceOptions = availableVoices.map((voice) => ({
        value: voice.ShortName,
        label: voice.Name,
    }));

    const getSelectedVoice = () => {
        return availableVoices.find((voice) => voice.ShortName === voiceName) || {};
    };
    
    const selectedVoice = getSelectedVoice();
    
    const toggleOpen = () => setIsOpen(!isOpen);

    const renderVoiceDetails = () => {
        if (!selectedVoice.ShortName) return null;
        return (
          <>
            {isOpen ? (
              <>
                <button onClick={toggleOpen} className="bg-selected p-2 rounded-lg">
                  Hide Voice Details
                </button>
                <div className="relative bg-selected p-4 mt-4 rounded-lg">
                <h1 className="text-xl font-bold mb-2">Voice Details:</h1>
                <br />
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
    <>
        {character && (
            <div className='relative bg-selected p-4 mt-4 rounded-lg'>
            <h1 className='text-xl font-bold mb-2'>Text to Speech Settings</h1>
            <br />
            <br />
            <label>
                <strong>Speech Region:</strong>
                <br />
                <Select
                value={regionOptions.find((option) => option.value === speechRegion)}
                onChange={(selectedOption) => setSpeechRegion(selectedOption.value)}
                options={regionOptions}
                styles={customStyles}
                />
            </label>
            <br />
            <label>
                <strong>Speech Key:</strong>
                <br />
                <input
                type="text"
                value={speechKey}
                onChange={(e) => setSpeechKey(e.target.value)}
                className="character-field"
                />
            </label>
            <br />
            <label>
                <strong>Voice Name:</strong>
                <br />
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
                <strong>Prosody Rate:</strong>
                <br />
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
                <strong>Prosody Pitch:</strong>
                <br />
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
        )}
    </>
  );
}
export default TextToSpeech;