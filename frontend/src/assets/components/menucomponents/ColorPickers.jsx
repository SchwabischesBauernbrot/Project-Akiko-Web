import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";

function getLocalStorageColor(key, defaultColor) {
  const storedColor = localStorage.getItem(key);
  return storedColor ? JSON.parse(storedColor) : defaultColor;
}

function ColorPicker() {
  const [selectedElement, setSelectedElement] = useState("backdrop");
  const [fontSize, setFontSize] = useState(16);

  const [backdropColor, setBackdropColor] = useState(() =>
    getLocalStorageColor("backdropColor", { r: 255, g: 255, b: 255, a: 1 })
  );
  const [buttonBoxColor, setButtonBoxColor] = useState(() =>
    getLocalStorageColor("buttonBoxColor", { r: 255, g: 255, b: 255, a: 1 })
  );
  const [textIconColor, setTextIconColor] = useState(() =>
    getLocalStorageColor("textIconColor", { r: 255, g: 255, b: 255, a: 1 })
  );
  const [textItalicColor, setTextItalicColor] = useState(() =>
    getLocalStorageColor("textItalicColor", { r: 255, g: 255, b: 255, a: 1 })
  );
  const [backgroundColor, setBackgroundColor] = useState(() =>
    getLocalStorageColor("backgroundColor", {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
      url: "",
    })
  );

  const colorSetters = {
    backdrop: setBackdropColor,
    buttonBox: setButtonBoxColor,
    textIcon: setTextIconColor,
    textItalic: setTextItalicColor,
    background: setBackgroundColor,
  };

  const colors = {
    backdrop: backdropColor,
    buttonBox: buttonBoxColor,
    textIcon: textIconColor,
    textItalic: textItalicColor,
    background: backgroundColor,
  };

  useEffect(() => {
    Object.entries(colors).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }, [colors]);

  function handleColorChange(newColor) {
    const setColor = colorSetters[selectedElement];
    if (setColor) {
      setColor((prevColor) => {
        const newColors = { ...prevColor, ...newColor.rgb };
        const root = document.documentElement;
        const colorString = `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`;

        switch (selectedElement) {
          case "backdrop":
            root.style.setProperty("--selected-color", colorString);
            break;
          case "buttonBox":
            root.style.setProperty("--selected-bb-color", colorString);
            break;
          case "textIcon":
            root.style.setProperty("--selected-text-color", colorString);
            break;
          case "textItalic":
            root.style.setProperty("--selected-italic-color", colorString);
            break;
          case "background":
            root.style.setProperty("--selected-background-color", colorString);
            root.style.setProperty(
              "--selected-background",
              `url(${prevColor.url})`
            );
            break;
          default:
            break;
        }
        return newColors;
      });
    }
  }

  function handleElementChange(event) {
    setSelectedElement(event.target.value);
  }

  function handleFontSizeChange(event) {
    const newFontSize = parseInt(event.target.value);
    setFontSize(newFontSize);
    document.documentElement.style.setProperty("--font-size", newFontSize + "px");
  }  

  function handleBackgroundUrlChange(event) {
    setBackgroundColor((prevColor) => {
      const newColors = { ...prevColor, url: event.target.value };
      const root = document.documentElement;
      root.style.setProperty("--selected-background", `url(${event.target.value})`);
      localStorage.setItem("backgroundColor", JSON.stringify(newColors));
      return newColors;
    });
  }

  function clearBackgroundColor() {
    setBackgroundColor({ r: 255, g: 255, b: 255, a: 1, url: "" });
    const root = document.documentElement;
    root.style.setProperty("--selected-background-color", `rgba(255, 255, 255, 1)`);
    root.style.setProperty("--selected-background", 'url("https://i.imgur.com/jf9w6NO.png")');
  }

  // ... return statement and other code remain unchanged
  return (
    <div className="settings-box" id="colors">
      <h2 className="settings-box">Custom UI Options</h2>
      <h3>Element to Change:</h3>
      <select value={selectedElement} onChange={handleElementChange}>
        <option value="backdrop">Central UI Backdrop</option>
        <option value="buttonBox">Buttons/Boxes</option>
        <option value="textIcon">Normal Text/Icons</option>
        <option value="textItalic">Italic Text</option>
        <option value="background">Background Color</option>
      </select>
      {selectedElement === "background" && (
        <div>
          <h3>Background Image URL:</h3>
          <input
            type="text"
            value={colors.background.url}
            onChange={handleBackgroundUrlChange}
          />
        </div>
      )}
      <h3>Selected Color:</h3>
      <ChromePicker
        color={colors[selectedElement]}
        onChange={handleColorChange}
      />
      <h3>Font Size:</h3>
      <input type="range" min="12" max="32" step="1" value={fontSize} onChange={handleFontSizeChange} />
      <label htmlFor="font-size-input">Font Size (px): </label>
      <input type="number" id="font-size-input" min="12" max="32" step="1" value={fontSize} onChange={handleFontSizeChange} />
      <button className="connect-button" onClick={clearBackgroundColor}>
        Clear Background Color
      </button>
    </div>
  );
  
}

export default ColorPicker;
