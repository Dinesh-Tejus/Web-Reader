import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";


const API_URL = "http://localhost:8000/process_url";

/**
 * The main App component for the Web Reader application.
 * This application allows users to enter a URL, process its content, adjust font size
 * and speech speed, and listen to the summarized content with text-to-speech functionality.
 */
function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [currentUtterance, setCurrentUtterance] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);

  /**
   * Initializes the application by announcing its loading state and enabling keyboard
   * tab navigation for accessibility. Cleans up event listeners on unmount.
   */
  useEffect(() => {
    speak("Web Reader loaded. Use the sliders to adjust font size or speech speed.");

  
    const handleTabNavigation = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        
        // Define all focusable elements by their ID
        const focusableElements = [
          document.getElementById('url-input'),
          document.getElementById('read-button'),
          document.getElementById('summarize-button'),
          document.getElementById('font-slider'),
          document.getElementById('speed-slider'),
          document.getElementById('output-text'),
          document.getElementById('pause-button'),
      
        ].filter(element => element && !element.disabled); // Ensure that only enabled elements are included
  
        // Get the current focused element and find its index in the focusableElements array
        const currentFocusIndex = focusableElements.indexOf(document.activeElement);
        let nextIndex;
        
        // If the focus is outside the defined list, set nextIndex to 0
        if (currentFocusIndex === -1) {
          nextIndex = 0;
        } else {
          // Loop through the focusable elements
          nextIndex = (currentFocusIndex + 1) % focusableElements.length;
        }
  
        // Set the focus to the next element in the loop
        if (focusableElements[nextIndex]) {
          focusableElements[nextIndex].focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabNavigation);
    return () => document.removeEventListener('keydown', handleTabNavigation);
  }, []);

  /**
   * Converts a text string into speech using the Web Speech API.
   * @param {string} text - The text to be converted into speech.
   */
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  /**
   * Speaks the provided text continuously and sets event listeners for end of speech.
   * @param {string} text - The text to be read aloud continuously.
   */
  const speakContinuous = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.onend = () => {
        setCurrentUtterance(null);
        setIsPaused(false);
      };
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    }
  };

  /**
   * Pauses or resumes the ongoing speech synthesis based on the current state.
   */
  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      if (!isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      } else {
        window.speechSynthesis.resume(); 
        setIsPaused(false);
      }
    }
  };


  
  // Function to extract domain name for label
  const createLabel = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return "Unknown Site";
    }
  };

    /**
   * Processes the input URL by sending it to the backend API, extracts the content,
   * and reads the summarized content aloud.
   */

  const processUrl = async () => {
    try {
      speak("Processing the URL. Please wait.");
      const response = await axios.post(API_URL, { url });
      const newSummary = response.data.summary || "No content found.";
      setSummary(newSummary);
      speakContinuous(newSummary);
      
      // Add the current URL to recent links with label
      setRecentLinks(prevLinks => {
        const newLink = {
          label: createLabel(url),
          url: url
        };
        const updatedLinks = [newLink, ...prevLinks.filter(link => link.url !== url)];
        return updatedLinks.slice(0, 5);
      });
    } catch (error) {
      const errorMessage = `Error: ${error.message}`;
      setSummary(errorMessage);
      speak("Failed to process the URL. Please try again.");
    }
  };

  /**
   * Handles the focus event for the pause button and announces it using text-to-speech.
   */
  const handlePauseButtonFocus = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Cancel current speech
      
      const announcement = new SpeechSynthesisUtterance("Pause button");
      announcement.onend = () => {
        if (currentUtterance) {
          const newUtterance = new SpeechSynthesisUtterance(currentUtterance.text);
          newUtterance.rate = speechSpeed;
          newUtterance.onend = () => {
            setCurrentUtterance(null);
          };
          setCurrentUtterance(newUtterance);
          window.speechSynthesis.speak(newUtterance);
        }
      };
      window.speechSynthesis.speak(announcement);
    } else {
      speak("Pause button");
    }
  };

  /**
   * Adjusts the font size of the application and announces the new size.
   */
  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    setFontSize(size);
    speak(`Font size set to ${size}`);
  };

  /**
   * Adjusts the speech speed for text-to-speech and updates the current utterance if active.
   */
  const handleSpeedChange = (e) => {
    const speed = parseFloat(e.target.value);
    setSpeechSpeed(speed);
    
    if (currentUtterance && window.speechSynthesis.speaking) {
      currentUtterance.rate = speed;
      const wasPaused = isPaused;
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      if (wasPaused) {
        window.speechSynthesis.pause();
      }
    } else {
      speak(`Speech speed set to ${speed}`);
    }
  };

  /**
   * Handles focus events for the content area, triggering text-to-speech of the summary.
   */
  const handleContentFocus = () => {
    if (summary) {
      speakContinuous(summary);
    } else {
      speak("This is the output content area. It is read-only.");
    }
  };

  const handleRecentLinkClick = (linkUrl) => {
    // Set the clicked URL
    setUrl(linkUrl);
  
    // Call the handleUrlAction function with the 'summarize' action for the clicked link
    handleUrlAction("summarize", linkUrl);
  };
  
  const handleUrlAction = async (action) => {
    try {
      const actionText = action === "read" ? "Reading the URL. Please wait." : "Summarizing the URL. Please wait.";
      speak(actionText);
  
      // Send request to process the URL
      const response = await axios.post(`${API_URL}?action=${action}`, { url });
  
      const resultText = response.data.summary || "No content found.";
      setSummary(resultText);
  
      if (action === "read") {
        speakContinuous(resultText);
      }
  
      // Add the current URL to recent links with label
      setRecentLinks(prevLinks => {
        const newLink = {
          label: createLabel(url),
          url: url,
        };
  
        // Remove the existing URL if it already exists and add the new one
        const updatedLinks = [newLink, ...prevLinks.filter(link => link.url !== url)];
        
        // Ensure only the 5 most recent links are kept
        return updatedLinks.slice(0, 5);
      });
    } catch (error) {
      const errorMessage = `Error: ${error.message}`;
      setSummary(errorMessage);
      speak("Failed to process the URL. Please try again.");
    }
  };
  
  return (


    <div className="app" style={{ fontSize: `${fontSize}px` }}>
      <header>
        <h1>Web Reader</h1>
      </header>
      <main>
        <div className="form-group">
          <label htmlFor="url-input">Enter Website URL</label>
          <input
            id="url-input"
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => speak("Enter the URL in this input box")}
            tabIndex="0"
          />
  <div className="process-buttons">
    <button 
      id="read-button"
      onClick={() => handleUrlAction('read')}
      onFocus={() => speak("Read URL button")}
      tabIndex="0"
    >
      Read URL
    </button>
    <button 
      id="summarize-button"
      onClick={() => handleUrlAction('summarize')}
      onFocus={() => speak("Summarize URL button")}
      tabIndex="0"
    >
      Summarize URL
    </button>
  </div>

        </div>

        <div className="sliders" style={{ padding: '5px' }}>
          <div className="slider">
            <label htmlFor="font-slider">Font Size : <span>{fontSize} </span> </label>
            <input
              id="font-slider"
              type="range"
              min="12"
              max="32"
              step="1"
              value={fontSize}
              onChange={handleFontSizeChange}
              onFocus={() => speak("Adjust font size using the slider or left right arrow keys")}
              tabIndex="0"
            />

          </div>
          </div>
          <div className="speed-sliders" style={{ padding: '5px' }}>
                <div className="slider">
                  <label htmlFor="speed-slider">Speech Speed :  <span>{speechSpeed} </span></label>
                  <input
                    id="speed-slider"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechSpeed}
                    onChange={handleSpeedChange}
                    onFocus={() => speak("Adjust speech speed using the slider, or left right arrow keys")}
                    tabIndex="0"
                      
                  />
                </div>
               
          </div>

         
        
        <div className="output">
          <label htmlFor="output-text">Content</label>
          <textarea
            id="output-text"
            value={summary}
            readOnly
            onFocus={handleContentFocus}
            tabIndex="0"
          />
        </div>

        <button 
          id="pause-button"
          onClick={handlePause}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePause();
            }
          }}
          disabled={!window.speechSynthesis.speaking}
          tabIndex="0"
          onFocus={handlePauseButtonFocus}
        >
          {isPaused ? "Pause" : "Resume"}
        </button>
        
      </main>
      <div className="recent-links" id="recent-links-container" role="complementary" aria-label="Recent URLs">
        <h3>Recent Links</h3>
        <ul>
          {recentLinks.map((link, index) => (
            <li key={index}>
              <button 
                onClick={() => handleRecentLinkClick(link.url)}
                aria-label={`Read ${link.label} again`}
              >
                <span className="link-label">{link.label}:</span>
                <span className="link-url">{link.url}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
