import { useEffect } from "react";
import { getBackgroundImageUrl } from "./api";

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

    const storedBackground = localStorage.getItem("background");
    if (storedBackground) {
      const background = getBackgroundImageUrl(storedBackground);
      if (background) {
        root.style.setProperty("--selected-background", `url(${background})`);
      }
    }
  }, []);

  return null;
}

export default ColorLoader;
