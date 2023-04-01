import React, {useEffect, useState} from "react";

const GenSettingsMenu = ({onClose}) => {
    const [invalidEndpoint, setInvalidEndpoint] = useState(false);
    const [maxContextLength, setMaxContextLength] = useState(2048);
    const [maxLength, setMaxLength] = useState(512);
    const [repPen, setRepPen] = useState(1.1);
    const [repPenRange, setRepPenRange] = useState(0);
    const [repPenSlope, setRepPenSlope] = useState(0);
    const [samplerFullDeterminism, setSamplerFullDeterminism] = useState(false);
    const [singleline, setSingleline] = useState(false);
    const [temperature, setTemperature] = useState(0);
    const [tfs, setTfs] = useState(1);
    const [topA, setTopA] = useState(0);
    const [topK, setTopK] = useState(40);
    const [topP, setTopP] = useState(0.9);
    const [typical, setTypical] = useState(1);

    useEffect(() => {
        var endpointType = localStorage.getItem('endpointType');
        if(endpointType === 'AkikoBackend'){
            setInvalidEndpoint(false);
        } else if(endpointType === 'Kobold'){
            
            setInvalidEndpoint(false);
        } else if(endpointType === 'Ooba'){
            
            setInvalidEndpoint(false);
        }else {
            console.log('Endpoint type not recognized. Please check your settings.')
            setInvalidEndpoint(true);
        }
    }, []);

    useEffect(() => {
        const endpointType = localStorage.getItem('endpointType');
        const settings = localStorage.getItem('generationSettings');
        if (endpointType === 'Kobold') {
            setInvalidEndpoint(false);
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                setMaxContextLength(parsedSettings.max_context_length);
                setMaxLength(parsedSettings.max_length);
                setRepPen(parsedSettings.rep_pen);
                setRepPenRange(parsedSettings.rep_pen_range);
                setRepPenSlope(parsedSettings.rep_pen_slope);
                setSamplerFullDeterminism(parsedSettings.sampler_full_determinism);
                setSingleline(parsedSettings.singleline);
                setTemperature(parsedSettings.temperature);
                setTfs(parsedSettings.tfs);
                setTopA(parsedSettings.top_a);
                setTopK(parsedSettings.top_k);
                setTopP(parsedSettings.top_p);
                setTypical(parsedSettings.typical);
            }
        } else {
        console.log('Endpoint type not recognized. Please check your settings.');
        setInvalidEndpoint(true);
        }
    }, []);

    const saveSettings = () => {
        const settings = {
            max_context_length: parseInt(maxContextLength),
            max_length: parseInt(maxLength),
            rep_pen: parseFloat(repPen),
            rep_pen_range: parseInt(repPenRange),
            rep_pen_slope: parseFloat(repPenSlope),
            sampler_full_determinism: samplerFullDeterminism,
            singleline: singleline,
            temperature: parseFloat(temperature),
            tfs: parseFloat(tfs),
            top_a: parseFloat(topA),
            top_k: parseInt(topK),
            top_p: parseFloat(topP),
            typical: parseFloat(typical)
        };
        localStorage.setItem('generationSettings', JSON.stringify(settings));
    };

    const onCloseInvalid = () => {
        saveSettings();
        setInvalidEndpoint(false);
        onClose();
    }

    return (
        <div className="modal-overlay">
            {invalidEndpoint ? (
                <div className="gen-settings-menu">
                    <span className="close" onClick={onClose}>&times;</span>
                    <h1 className="gen-settings-header">Invalid Endpoint</h1>
                    <p className="centered">Please check your TextGen Endpoint and try again.</p>
                    <button className="submit-button" onClick={() => onCloseInvalid()}>Close</button>
                </div>
            ) : (
                <div className="gen-settings-menu">
                <span className="close" onClick={onClose}>&times;</span>
                <h1 className="gen-settings-header">Generation Settings</h1>
                <label>
                    <b>Max Context Length</b>
                    <input type="range" min='512' max='2048' value={maxContextLength} onChange={(e) => {setMaxContextLength(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min='512' max='2048' value={maxContextLength} onChange={(e) => {setMaxContextLength(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Max Generation Length</b>
                    <input type="range" min='1' max='512' value={maxLength} onChange={(e) => {setMaxLength(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min='1' max='512' value={maxLength} onChange={(e) => {setMaxLength(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Repitition Penalty</b>
                    <input type="range" min='1' value={repPen} onChange={(e) => {setRepPen(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" value={repPen} onChange={(e) => setRepPen(e.target.value)} />
                </label>
                <label>
                    <b>Repitition Penalty Range</b>
                    <input type="range" min='0' step='.01' max='4096' value={repPenRange} onChange={(e) => {setRepPenRange(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min='0' max='4096' value={repPenRange} onChange={(e) => {setRepPenRange(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Repitition Penalty Slope</b>
                    <input type="range" min='0' step='.01' max='10' value={repPenSlope} onChange={(e) => {setRepPenSlope(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min='0' max='10' value={repPenSlope} onChange={(e) => {setRepPenSlope(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Sampler Full Determinism</b>
                    <input type="checkbox" checked={samplerFullDeterminism} onChange={(e) => {setSamplerFullDeterminism(e.target.checked); saveSettings();}} />
                </label>
                <label>
                    <b>Singleline Output</b>
                    <input type="checkbox" checked={singleline} onChange={(e) => {setSingleline(e.target.checked); saveSettings();}} />
                </label>
                <label>
                    <b>Temperature</b>
                    <input type="range" min="0" step="0.01" max='2' value={temperature} onChange={(e) => {setTemperature(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" step="0.01" max='2' value={temperature} onChange={(e) => {setTemperature(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Tail Free Sampling</b>
                    <input type="range" min="0" max="1" step="0.01" value={tfs} onChange={(e) => {setTfs(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" max="1" step="0.01" value={tfs} onChange={(e) => {setTfs(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Top A</b>
                    <input type="range" min="0" step="1" max='1' value={topA} onChange={(e) => {setTopA(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" step="1" max='1' value={topA} onChange={(e) => {setTopA(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Top K</b>
                    <input type="range" min="0" step="1" max='100' value={topK} onChange={(e) => {setTopK(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" step="1" max='100' value={topK} onChange={(e) => {setTopK(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Top P</b>
                    <input type="range" min="0" max="1" step="0.01" value={topP} onChange={(e) => {setTopP(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" max="1" step="0.01" value={topP} onChange={(e) => {setTopP(e.target.value); saveSettings();}} />
                </label>
                <label>
                    <b>Typical</b>
                    <input type="range" min="0" max="1" step=".01" value={typical} onChange={(e) => {setTypical(e.target.value); saveSettings();}} />
                    <input id='input-container' type="number" min="0" max="1" step=".01" value={typical} onChange={(e) => {setTypical(e.target.value); saveSettings();}} />
                </label>
            </div>
        )}
    </div>
);

}
export default GenSettingsMenu;
