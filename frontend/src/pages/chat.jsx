import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox';
import { fetchSettings } from "../assets/components/api";
import "../assets/css/chat.css";

const Chat = () => {
const [settings, setSettings] = useState(null);
const [configuredEndpoint, setconfiguredEndpoint] = useState('http://localhost:5100/');
const [configuredEndpointType, setconfiguredEndpointType] = useState('AkikoBackend');

useEffect(() => {
    const fetchData = async () => {
        setconfiguredEndpoint(localStorage.getItem('endpoint'));
        setconfiguredEndpointType(localStorage.getItem('endpointType'));
        setSettings(fetchSettings())
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
