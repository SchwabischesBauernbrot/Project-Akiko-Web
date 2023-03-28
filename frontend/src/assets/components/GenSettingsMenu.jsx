import React, {useEffect, useState} from "react";

const GenSettingsMenu = ({onClose}) => {
    const [invalidEndpoint, setInvalidEndpoint] = useState(false);
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
    const onCloseInvalid = () => {
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
            </div>
            )}
        </div>
    );
}
export default GenSettingsMenu;
