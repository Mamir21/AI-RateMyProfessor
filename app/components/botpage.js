'use client';

import { useState, useEffect } from 'react';
import '../bot.css';

export default function ChatBot() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialSystemMessage = {
      role: 'system',
      content: "Hello! I'm your academic assistant. Ask me about professors, courses, or colleges. You can ask about specific professors, compare professors, or get a list of top professors at a university."
    };
    setChatHistory([initialSystemMessage]);
  }, []);

  const handleUserInput = async () => {
    if (userInput.trim() === '') return;

    setIsLoading(true);
    let updatedChatHistory = [...chatHistory, { role: 'user', content: userInput }];
    setChatHistory(updatedChatHistory);

    try {
        const response = await fetch('/api/bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedChatHistory }),
        });

        const textData = await response.text();
        let data;

        try {
            data = JSON.parse(textData); // Attempt to parse the response as JSON
        } catch (error) {
            throw new Error(`Invalid JSON response: ${textData}`);
        }

        if (response.ok) {
            const content = data.choices[0].message.content;
            setChatHistory(prev => [
                ...prev,
                { role: 'assistant', content: content }
            ]);

            // If the bot asks for more information, create a UI for user to input details
            if (content.includes('I couldn\'t find information')) {
                // Prompt user to provide details here
                setUserInput('{"name": "Professor X", "school": "University Y", "department": "Department Z", "rating": 4.5, "difficulty": 3.5, "num_ratings": 50, "would_take_again": 80}');
            }
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        setChatHistory(prev => [
            ...prev,
            { role: 'assistant', content: `Error: ${error.message}` }
        ]);
    } finally {
        setUserInput('');
        setIsLoading(false);
    }
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  };

  return (
    <div className='bg'>
    <div className="chat-container">
      <div className="chat">
        <div className="response chat-history">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`chat-message chat-line ${message.role === 'user' ? 'user-chat' : 'ai-chat'}`}
            >
              <div className={`message-sender avatar ${message.role}`}>
              {message.role === 'user' ? (
                  <img alt="avatar" width={40} height={40} src="../images/goku1.gif" />
                ) : (
                  <img alt="avatar" width={40} height={40} src="../images/unnamed.webp" />
                )}
              </div>
              <div className={`message-content ${message.role}`} style={{ width: '100%', marginLeft: '16px' }}>
                {message.content}
              </div>
              {index < chatHistory.length - 1 && (
                <div className="horizontal-line" />
              )}
            </div>
          ))}
        </div>

        <div className="chat-form">
          <input
            type="text"
            placeholder="Message Sage"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field"
          />
          {isLoading ? (
            <div className="loading"></div>
          ) : (
            <button className="send-button" onClick={handleUserInput} disabled={isLoading}></button>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}