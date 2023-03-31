import React, { useState } from "react";
import { ChromePicker } from "react-color";

function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });
  const [selectedElement, setSelectedElement] = useState("central-backdrop");

  function handleColorChange(newColor) {
    setSelectedColor(newColor.rgb);
    const root = document.documentElement;
    switch (selectedElement) {
      case "central-backdrop":
        root.style.setProperty("--selected-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        break;
      case "button-box":
        root.style.setProperty("--selected-bb-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        break;
      case "text-icon":
        root.style.setProperty("--selected-text-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        break;
      case "text-italic":
        root.style.setProperty("--selected-italic-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        break;
      case "background":
        root.style.setProperty("--selected-background", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        root.style.setProperty("--selected-background-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
        break;
      default:
        break;
    }
  }

  function handleElementChange(event) {
    setSelectedElement(event.target.value);
  }

  function clearBackgroundColor() {
    const root = document.documentElement;
    root.style.setProperty("--selected-background-color", `rgba(255, 255, 255, 1)`);
    root.style.setProperty("--selected-background", 'url("https://i.imgur.com/jf9w6NO.png")');;
  }

  return (
    <div className="settings-box" id='colors'>
      <h2 className='settings-box'>Custom UI Options</h2>
      <h3>Element to Change:</h3>
      <select value={selectedElement} onChange={handleElementChange}>
        <option value="central-backdrop">Central UI Backdrop</option>
        <option value="button-box">Buttons/Boxes</option>
        <option value="text-icon">Normal Text/Icons</option>
        <option value="text-italic">Italic Text</option>
        <option value="background">Background Color</option>
      </select>
      <h3>Selected Color:</h3>
      <ChromePicker color={selectedColor} onChange={handleColorChange} />
      <button className="connect-button" onClick={() => clearBackgroundColor()}>Clear Background Color</button>
    </div>
  );
}

export default ColorPicker;
