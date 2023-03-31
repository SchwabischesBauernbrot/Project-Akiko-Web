import React, { useState } from "react";
import { ChromePicker } from "react-color";

function ColorPicker() {
  const [colorBackdrop, setColorBackdrop] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });
  const [colorBoxButton, setColorBoxButton] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });
  const [colorTextIcon, setColorTextIcon] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });
  const [colorTextItalic, setColorTextItalic] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });
  const [colorBackground, setColorBackground] = useState({
    r: 255,
    g: 255,
    b: 255,
    a: 1
  });

  function handleCentralColorChange(newColor) {
    setColorBackdrop(newColor.rgb);
    const root = document.documentElement;
    root.style.setProperty("--selected-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  }

  function handleBBColorChange(newColor) {
    setColorBoxButton(newColor.rgb);
    const root = document.documentElement;
    root.style.setProperty("--selected-bb-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  }

  function handleTextIconColorChange(newColor) {
    setColorTextIcon(newColor.rgb);
    const root = document.documentElement;
    root.style.setProperty("--selected-text-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  }

  function handleTextItalicColorChange(newColor) {
    setColorTextItalic(newColor.rgb);
    const root = document.documentElement;
    root.style.setProperty("--selected-italic-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  }

  function handleBackgroundColorChange(newColor) {
    setColorBackground(newColor.rgb);
    const root = document.documentElement;
    root.style.setProperty("--selected-background", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
    root.style.setProperty("--selected-background-color", `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`);
  }

  function clearBackgroundColor() {
    setColorBackground(    
      {r: 255,
      g: 255,
      b: 255,
      a: 1});
    const root = document.documentElement;
    root.style.setProperty("--selected-background-color", `rgba(255, 255, 255, 1)`);
    root.style.setProperty("--selected-background", 'url("https://i.imgur.com/jf9w6NO.png")');;
  }
  return (
    <div className="settings-box" id='colors'>
      <h2 className='settings-box'>Custom UI Options</h2>
      <h3>Central UI Backing Colors</h3>
      <ChromePicker color={colorBackdrop} onChange={handleCentralColorChange} />
      <h3>Buttons/Boxes</h3>
      <ChromePicker color={colorBoxButton} onChange={handleBBColorChange} />
      <h3>Normal Text/Icons</h3>
      <ChromePicker color={colorTextIcon} onChange={handleTextIconColorChange} />
      <h3>Italic Text</h3>
      <ChromePicker color={colorTextItalic} onChange={handleTextItalicColorChange} />
      <h3>Background Color</h3>
      <span>NOTE: This will override any background image.<br/></span>
      <ChromePicker color={colorBackground} onChange={handleBackgroundColorChange} />
      <button className="connect-button" onClick={() => clearBackgroundColor()}>Clear Background Color</button>
    </div>
  );
}
export default ColorPicker;