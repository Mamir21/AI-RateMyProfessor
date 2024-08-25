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
      content: "Hello! I'm your academic assistant. You can ask me about professors from different colleges, including their ratings, departments, and difficulty levels. For example, you can ask me 'Who is the best science professor at Harvard?' or 'Tell me about Professor John Doe from MIT'. I'll do my best to provide accurate and up-to-date information about college professors and courses!"
    }

    setChatHistory([initialSystemMessage]);
  }, [])

  const handleUserInput = async () => {
    if (userInput.trim() === '') return;
  
    setIsLoading(true);
  
    let updatedChatHistory = [...chatHistory, { role: 'user', content: userInput }];
    
    setChatHistory(updatedChatHistory);
  
    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedChatHistory }),  
      })
  
      const data = await response.json();

      if (response.ok) {
        if (data.choices && data.choices[0] && data.choices[0].message) {
          setChatHistory((prevChat) => [
            ...prevChat,
            { role: 'assistant', content: data.choices[0].message.content },
          ])
        } else {
          console.error('Unexpected API response structure:', data, 'Response:', response);
          setChatHistory((prevChat) => [
            ...prevChat,
            { role: 'assistant', content: 'Error: Unexpected response from the API' },
          ])
        }
      } else {
        console.error('API error:', data.error, 'Response:', response);
        setChatHistory((prevChat) => [
          ...prevChat,
          { role: 'assistant', content: `Error: ${data.error}` },
        ]);
      }
    } catch (error) {
      console.error('Error querying LLaMA API:', error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { role: 'assistant', content: 'Error querying LLaMA API' },
      ]);
    } finally {
      setUserInput('');
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserInput();
    }
  }

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