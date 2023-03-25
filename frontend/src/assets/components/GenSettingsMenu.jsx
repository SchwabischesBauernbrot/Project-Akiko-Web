import React, {useEffect, useState} from "react";

const GenSettingsMenu = ({onClose}) => {

    return (
        <div className="modal-overlay">
            <div className="gen-settings-menu">
            <h1 className="gen-settings-header">Generation Settings</h1>
                <span className="close" onClick={onClose}>&times;</span>
            </div>
        </div>
    );
}
export default GenSettingsMenu;
