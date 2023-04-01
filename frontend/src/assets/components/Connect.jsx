import React, {useState, useEffect} from 'react';
import {getModelStatus} from './chatcomponents/chatapi';

const Connect = () => {
    const [connectionStatus, setConnectionStatus] = useState(false);
    
    useEffect(() => {
        const fetchStatus = async () => {
            if (localStorage.getItem('endpointType') != null){
                const status = await getModelStatus();
                if(status !== null){
                    setConnectionStatus(status);
                }
                if(localStorage.getItem('endpointType') === 'Horde'){
                    setConnectionStatus(`${localStorage.getItem('hordeModel')} (Horde)`);
                }
            }
        }
        fetchStatus();
    }, []);

    return (
        <>
        {connectionStatus ? (
        <p className='connected'><b>Connected: {connectionStatus}</b></p>
        ) : (
        <p className='disconnected'><b>Disconnected</b></p>
        )}
    </>
    )
};

export default Connect;