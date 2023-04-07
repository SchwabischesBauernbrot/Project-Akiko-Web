import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox';
import 'tailwindcss/tailwind.css';

const Chat = () => {
const [configuredEndpoint, setconfiguredEndpoint] = useState('http://localhost:5100/');
const [configuredEndpointType, setconfiguredEndpointType] = useState('AkikoBackend');

useEffect(() => {
    const fetchData = async () => {
        if(localStorage.getItem('endpoint') === null) {
            localStorage.setItem('endpoint', 'http://localhost:5100/');
        }
        if(localStorage.getItem('endpointType') === null) {
            localStorage.setItem('endpointType', 'AkikoBackend');
        }
        setconfiguredEndpoint(localStorage.getItem('endpoint'));
        setconfiguredEndpointType(localStorage.getItem('endpointType'));
    }
    fetchData();
}, []);

return (
<div className="flex flex-col items-center justify-center">
  <div className="w-full flex justify-center mb-6">
        
        <Chatbox endpoint={configuredEndpoint} endpointType={configuredEndpointType}/>
        </div>
         </div>

);
};

export default Chat;
