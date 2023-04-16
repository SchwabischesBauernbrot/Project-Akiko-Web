import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { customStyles } from '../Arrays';

export const ProsodySettings = ({ prosodyRate, setProsodyRate, prosodyPitch, setProsodyPitch }) => {
    return (
        <>
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
        </>
    );
};

export const VoiceSelect = ({ speechKey, speechRegion, voiceName, setVoiceName }) => {
    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
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

        if (speechKey && speechRegion) {
            fetchVoices(speechKey, speechRegion).then((voices) => {
                setAvailableVoices(voices);
            });
        }
    }, [speechKey, speechRegion]);

    const voiceOptions = availableVoices.map((voice) => ({
        value: voice.ShortName,
        label: voice.Name,
    }));

    return (
        <>
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
        </>
    );
};

export const RegionSelect = ({ speechRegion, setSpeechRegion, regions }) => {
    const regionOptions = regions.map((region) => ({
        value: region.identifier,
        label: `${region.geography} - ${region.region}`,
    }));

    return (
        <>
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
        </>
    );
};

export const SpeechKeyInput = ({ speechKey, setSpeechKey }) => {
    return (
        <>
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
        </>
    );
};