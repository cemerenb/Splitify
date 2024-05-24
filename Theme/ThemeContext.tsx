import React, { createContext, useState, useEffect } from "react";
import { useColorScheme, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SeeAll from "../Pages/AllExpenses";

const themes = {
  light: {
    background: "#F1F1F1",
    reverse: "white",
    card: "#FFFFFF",
    text: "#000000",
    primary: "white",
    secondary: "#F1F1F1",
    third: "#FFFFFF",
    shadow: "#DADADA",
    gradientStart: "#9159D6",
    button: "#7544EC",
    buttonText: "white",
    gradientEnd: "#DD3234",
    selected: "#FF44B8",
    seeAll: "#FFFFFF",
    filter: "#C1C1C1",
    themeSelector: "#FF44B8",
  },
  dark: {
    background: "#181C25",
    reverse: "black",
    card: "#7544EC",
    text: "#FFFFFF",
    primary: "#333746",
    secondary: "#333746",
    third: "#8260F5",
    shadow: "#3F4457",
    button: "#7544EC",
    buttonText: "white",
    gradientStart: "#9440D8",
    gradientEnd: "#EBAC53",
    selected: "#7544EC",
    seeAll: "#3F4457",
    filter: "#979797",
    themeSelector: "#9C60D7",
  },
  automatic: (colorScheme) => ({
    background: colorScheme === "light" ? "#F1F1F1" : "#181C25",
    reverse: colorScheme === "light" ? "white" : "black",
    card: colorScheme === "light" ? "#FFFFFF" : "#7544EC",
    text: colorScheme === "light" ? "#000000" : "#FFFFFF",
    primary: colorScheme === "light" ? "white" : "#252833",
    secondary: colorScheme === "light" ? "#F1F1F1" : "#333746",
    third: colorScheme === "light" ? "#FFFFFF" : "#8260F5",
    shadow: colorScheme === "light" ? "#DADADA" : "#3F4457",
    button: colorScheme === "light" ? "#7544EC" : "#7544EC",
    buttonText: colorScheme === "light" ? "white" : "white",
    gradientStart: colorScheme === "light" ? "#9159D6" : "#9440D8",
    gradientEnd: colorScheme === "light" ? "#DD3234" : "#EBAC53",
    selected: colorScheme === "light" ? "#FF44B8" : "#7544EC",
    seeAll: colorScheme === "light" ? "#FFFFFF" : "#3F4457",
    filter: colorScheme === "light" ? "#C1C1C1" : "#979797",
    themeSelector: colorScheme === "light" ? "#FF44B8" : "#9C60D7",
  }),
};

const ThemeContext = createContext({
  theme: themes.light,
  mode: "light",
  setMode: (mode) => {},
});

const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [mode, setMode] = useState("automatic");
  const [theme, setTheme] = useState(themes.automatic(colorScheme));
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity is set to 0 (fully transparent)

  useEffect(() => {
    // Load theme mode from AsyncStorage on app launch
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("themeMode");
        if (savedMode !== null) {
          setMode(savedMode);
        }
      } catch (error) {
        console.error("Error loading theme mode:", error);
      }
    };

    loadThemeMode();
  }, []);

  useEffect(() => {
    if (mode === "automatic") {
      setTheme(themes.automatic(colorScheme));
    } else {
      setTheme(themes[mode]);
    }

    // Save theme mode to AsyncStorage when it changes
    const saveThemeMode = async () => {
      try {
        await AsyncStorage.setItem("themeMode", mode);
      } catch (error) {
        console.error("Error saving theme mode:", error);
      }
    };

    saveThemeMode();
  }, [mode, colorScheme]);

  const changeMode = (newMode) => {
    setMode(newMode);
    console.log(`Theme mode changed to ${newMode}`);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: changeMode }}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.background, theme.background],
          }),
        }}
      >
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
