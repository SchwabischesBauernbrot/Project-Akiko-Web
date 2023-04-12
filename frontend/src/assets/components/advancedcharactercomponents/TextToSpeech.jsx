import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TextToSpeech = ({}) => {
    const [voiceName, setVoiceName] = useState('');
    const [lang, setLang] = useState('en-US');
    const [prosodyRate, setProsodyRate] = useState(15);
    const [prosodyPitch, setProsodyPitch] = useState(15);
    const [speechKey, setSpeechKey] = useState('');
    const [speechRegion, setSpeechRegion] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);

    const regions = [
        { geography: 'Africa', region: 'South Africa North', identifier: 'southafricanorth' },
        { geography: 'Asia Pacific', region: 'East Asia', identifier: 'eastasia' },
        { geography: 'Asia Pacific', region: 'Southeast Asia', identifier: 'southeastasia' },
        { geography: 'Asia Pacific', region: 'Australia East', identifier: 'australiaeast' },
        { geography: 'Asia Pacific', region: 'Central India', identifier: 'centralindia' },
        { geography: 'Asia Pacific', region: 'Japan East', identifier: 'japaneast' },
        { geography: 'Asia Pacific', region: 'Japan West', identifier: 'japanwest' },
        { geography: 'Asia Pacific', region: 'Korea Central', identifier: 'koreacentral' },
        { geography: 'Canada', region: 'Canada Central', identifier: 'canadacentral' },
        { geography: 'Europe', region: 'North Europe', identifier: 'northeurope' },
        { geography: 'Europe', region: 'West Europe', identifier: 'westeurope' },
        { geography: 'Europe', region: 'France Central', identifier: 'francecentral' },
        { geography: 'Europe', region: 'Germany West Central', identifier: 'germanywestcentral' },
        { geography: 'Europe', region: 'Norway East', identifier: 'norwayeast' },
        { geography: 'Europe', region: 'Switzerland North', identifier: 'switzerlandnorth' },
        { geography: 'Europe', region: 'Switzerland West', identifier: 'switzerlandwest' },
        { geography: 'Europe', region: 'UK South', identifier: 'uksouth' },
        { geography: 'Middle East', region: 'UAE North', identifier: 'uaenorth' },
        { geography: 'South America', region: 'Brazil South', identifier: 'brazilsouth' },
        { geography: 'US', region: 'Central US', identifier: 'centralus' },
        { geography: 'US', region: 'East US', identifier: 'eastus' },
        { geography: 'US', region: 'East US 2', identifier: 'eastus2' },
        { geography: 'US', region: 'North Central US', identifier: 'northcentralus' },
        { geography: 'US', region: 'South Central US', identifier: 'southcentralus' },
        { geography: 'US', region: 'West Central US', identifier: 'westcentralus' },
        { geography: 'US', region: 'West US', identifier: 'westus' },
        { geography: 'US', region: 'West US 2', identifier: 'westus2' },
        { geography: 'US', region: 'West US 3', identifier: 'westus3' },
    ];
      
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

    return (
    <div>
        <label>
            Speech Region:
        <select
            className='character-field'
            value={speechRegion}
            onChange={(e) => setSpeechRegion(e.target.value)}
        >
            <option value="">Select a region</option>
            {regions.map((region, i) => (
            <option key={i} value={region.identifier}>
                {region.geography} - {region.region}
            </option>
            ))}
        </select>
        </label>
        <br />
        <label>
            Speech Key:
            <input type="text" value={speechKey} onChange={(e) => setSpeechKey(e.target.value)} className='character-field'/>
        </label>
        <br />
        <label>
            Voice Name:
            <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className='character-field'>
            {availableVoices.map((voice, i) => (
                <option key={i} value={voice.Name}>
                {voice.Name}
                </option>
            ))}
            </select>
        </label>
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