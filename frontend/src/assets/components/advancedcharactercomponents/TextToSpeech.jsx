import React, { useState, useEffect } from 'react';
import { RegionSelect, VoiceSelect, ProsodySettings, SpeechKeyInput } from './TextToSpeechSettings';
import { regions } from '../Arrays';
import { getCharacterSpeech, sendCharacterSpeech } from '../api';

const TextToSpeech = ({ character }) => {
    const [voiceName, setVoiceName] = useState('');
    const [prosodyRate, setProsodyRate] = useState(15);
    const [prosodyPitch, setProsodyPitch] = useState(15);
    const [speechKey, setSpeechKey] = useState('');
    const [speechRegion, setSpeechRegion] = useState('');
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (character) {
                const res = await getCharacterSpeech(character.char_id);
                if (res) {
                    setVoiceName(res.azureTTSName);
                    setProsodyRate(res.prosodyRate);
                    setProsodyPitch(res.prosodyPitch);
                }
            }

            const savedSpeechKey = localStorage.getItem('speech_key');
            const savedServiceRegion = localStorage.getItem('service_region');
            if (savedSpeechKey) setSpeechKey(savedSpeechKey);
            if (savedServiceRegion) setSpeechRegion(savedServiceRegion);
            
            setDataFetched(true);
        }
        fetchData();
    }, [character]);

    useEffect(() => {
        async function saveData() {
            await sendCharacterSpeech({ char_id: character.char_id, azureTTSName: voiceName, prosodyRate, prosodyPitch }, character.char_id);
            localStorage.setItem('speech_key', speechKey);
            localStorage.setItem('service_region', speechRegion);
            localStorage.setItem('ttsType', 'AzureTTS');
        }
        if (character && dataFetched) saveData();
    }, [voiceName, prosodyRate, prosodyPitch, speechKey, speechRegion, character, dataFetched]);

    return (
        <>
            {character && (
                <div className='relative bg-selected p-4 mt-4 rounded-lg'>
                    <h1 className='text-xl font-bold mb-2'>Text to Speech Settings</h1>
                    <br />
                    <br />
                    <RegionSelect
                        speechRegion={speechRegion}
                        setSpeechRegion={setSpeechRegion}
                        regions={regions}
                    />
                    <SpeechKeyInput
                        speechKey={speechKey}
                        setSpeechKey={setSpeechKey}
                    />
                    <VoiceSelect
                        speechKey={speechKey}
                        speechRegion={speechRegion}
                        voiceName={voiceName}
                        setVoiceName={setVoiceName}
                    />
                    <ProsodySettings
                        prosodyRate={prosodyRate}
                        setProsodyRate={setProsodyRate}
                        prosodyPitch={prosodyPitch}
                        setProsodyPitch={setProsodyPitch}
                    />
                </div>
            )}
        </>
    );
}
export default TextToSpeech;
