import { useEffect } from "react";

const colorKeys = [
  "backdropColor",
  "buttonBoxColor",
  "textIconColor",
  "textItalicColor",
  "backgroundColor",
];

const cssVariableMap = {
  backdropColor: "--selected-color",
  buttonBoxColor: "--selected-bb-color",
  textIconColor: "--selected-text-color",
  textItalicColor: "--selected-italic-color",
  backgroundColor: "--selected-background-color",
};

function ColorLoader() {
  useEffect(() => {
    const root = document.documentElement;

    colorKeys.forEach((key) => {
      const storedColor = localStorage.getItem(key);
      if (storedColor) {
        const color = JSON.parse(storedColor);
        const cssVar = cssVariableMap[key];
        const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        root.style.setProperty(cssVar, colorString);
      }
    });

    const storedBackground = localStorage.getItem("backgroundColor");
    if (storedBackground) {
      const background = JSON.parse(storedBackground);
      if (background.url) {
        root.style.setProperty("--selected-background", `url(${background.url})`);
      }
    }
  }, []);

  return null;
}

export default ColorLoader;
