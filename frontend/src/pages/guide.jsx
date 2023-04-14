import React, { useState, useEffect, useRef } from "react";
import GuideForm from "../assets/components/guidecomponents/CreateGuideForm";

const GuidePage = () => {
    const [showGuideForm, setShowGuideForm] = useState(false);
    const [guideData, setGuideData] = useState([]);

    return (
        <>
        <div>
        <h1 className='settings-panel-header text-xl font-bold'>Guide Page</h1>
            <div className='settings-panel'>
                <p>Test of Guide Page Functionality</p>
                <button onClick={() => setShowGuideForm(true)}>Create Guide</button>
            </div>
        </div>
        {showGuideForm && <GuideForm onClose={setShowGuideForm}/>}
        </>
    );
}
export default GuidePage;