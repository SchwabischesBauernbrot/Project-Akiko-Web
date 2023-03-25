import React, {useState, useEffect} from 'react';
import {getModelStatus} from './ChatApi';

const Connect = () => {
    const [connectionStatus, setConnectionStatus] = useState(false);
    
    useEffect(() => {
        if (localStorage.getItem('endpointType') != null){
            setConnectionStatus(true);
        };
    }, []);

    return (
        <div className='connect-panel'>
        </div>
    )
};