import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox';
import 'tailwindcss/tailwind.css';
import SlideMenu from "../assets/components/SlideMenu";

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
    <>
    <SlideMenu/>
    <Chatbox endpoint={configuredEndpoint} endpointType={configuredEndpointType}/>
    
    </>);
};

export default Chat;
