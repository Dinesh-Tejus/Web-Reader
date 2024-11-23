// WordHighlighter.js
import React, { useState, useEffect, useRef } from "react";

const WordHighlighter = ({ text, isSpeaking, speechSpeed }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const utteranceRef = useRef(null);
  const wordsRef = useRef(text.split(" "));

  useEffect(() => {
    if (!isSpeaking) {
      window.speechSynthesis.pause();
      return;
    }

    if (!utteranceRef.current) {
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.rate = speechSpeed;

      utteranceRef.current.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = Math.floor(event.charIndex / 5);
          setCurrentWordIndex(Math.min(wordIndex, wordsRef.current.length - 1));
        }
      };

      utteranceRef.current.onend = () => {
        setCurrentWordIndex(0);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utteranceRef.current);
    } else {
      window.speechSynthesis.resume();
    }

    return () => {
      if (!isSpeaking) {
        window.speechSynthesis.pause();
      }
    };
  }, [text, isSpeaking, speechSpeed]);

  return (
    <div className="word-highlighter">
      {wordsRef.current.map((word, index) => (
        <span
          key={index}
          style={{
            backgroundColor: index === currentWordIndex ? "yellow" : "transparent",
            padding: "0 2px",
            display: "inline-block"
          }}
        >
          {word}{" "}
        </span>
      ))}
    </div>
  );
};

export default WordHighlighter;