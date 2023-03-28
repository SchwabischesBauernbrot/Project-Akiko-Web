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
                    console.log('Connection status: ' + status);
                }
            }
        }
        fetchStatus();
    }, []);

    return (
        <>
        {connectionStatus ? (
        <p className='connected'>Connected: {connectionStatus}</p>
        ) : (
        <p className='disconnected'>Disconnected</p>
        )}
    </>
    )
};

export default Connect;