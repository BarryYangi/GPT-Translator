import React, { useEffect, useState, useRef } from 'react';
import browser from "webextension-polyfill";
import {Languages} from "lucide-react";

function App() {
  const [selectedText, setSelectedText] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [translation, setTranslation] = useState('');

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString());
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setButtonPosition({
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 10
        });
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowCard(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleConnect = (port: { onMessage: { addListener: (arg0: (msg: any) => void) => void; }; disconnect: () => void; }) => {
      console.log("Connected to background script");
      port.onMessage.addListener((msg) => {
        if (msg.type === "chunk") {
          setTranslation((prev) => prev === "Translating..." ? msg.content : prev + msg.content);
        } else if (msg.type === "done") {
          port.disconnect();
        }
      });
    };

    browser.runtime.onConnect.addListener(handleConnect);

    return () => {
      browser.runtime.onConnect.removeListener(handleConnect);
    };
  }, []);

  const handleButtonClick = async () => {
    console.log("Button clicked. Selected text:", selectedText);
    setShowButton(false);
    setShowCard(true);
    setTranslation("Translating...");

    try {
      console.log("Sending message to background script...");
      const response = await browser.runtime.sendMessage({
        action: "translateText",
        text: selectedText
      });

      console.log("Response from background script:", response);

      if (response.error) {
        setTranslation(`Error: ${response.error}`);
      }
    } catch (error: unknown) {
      console.error("Translation error:", error);
      if (error instanceof Error) {
        setTranslation(`Error: ${error.message}`);
      } else {
        setTranslation("An unknown error occurred");
      }
    }
  };

  if (!showButton && !showCard) return null;

  return (
    <>
      {showButton && (
        <button
          style={{
            position: 'absolute',
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            zIndex: 9999,
            padding: '4px 8px',
            backgroundColor: '#f0f0f0',
            color: 'black',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          onClick={handleButtonClick}
        >
          <Languages />
        </button>
      )}
{showCard && (
  <div
    ref={cardRef}
    style={{
      position: 'absolute',
      left: `${buttonPosition.x}px`,
      top: `${buttonPosition.y}px`,
      zIndex: 9999,
      padding: '10px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      minWidth: '200px',
      maxWidth: '80%',
      overflowY: 'auto',
      maxHeight: '80vh'
    }}
  >
    {/* <p><strong>Original:</strong> {selectedText}</p> */}
    <p style={{ fontSize: '14px', lineHeight: '1.4' }}><strong>翻译:</strong> {translation || '翻译中...'}</p>
  </div>
)}
    </>
  );
}

export default App;