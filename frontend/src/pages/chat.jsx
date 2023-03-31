import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox';
import "../assets/css/chat.css";

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
	<div className="container">
        <Chatbox endpoint={configuredEndpoint} endpointType={configuredEndpointType}/>
    </div>
);
};

export default Chat;
