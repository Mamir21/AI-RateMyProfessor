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
      content: "Hello! I’m your friendly robot assistant, ready to help with questions. Whether you need info, advice, or just a chat," +
      " I’m here for you. Ask me anything, and let’s make your experience great!"
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

      if (data.choices && data.choices[0] && data.choices[0].message) {
        setChatHistory((prevChat) => [
          ...prevChat,
          { role: 'assistant', content: data.choices[0].message.content },
        ])
      } else {
        console.error('Unexpected API response structure:', data);
        setChatHistory((prevChat) => [
          ...prevChat,
          { role: 'assistant', content: 'Error: Unexpected response from the API' },
        ])
      }
    } catch (error) {
      console.error('Error querying LLaMA API:', error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { role: 'assistant', content: 'Error querying LLaMA API' },
      ])
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
                  <img alt="avatar" width={40} height={40} src="../images/gojo1.gif" />
                ) : (
                  <img alt="avatar" width={40} height={40} src="../images/ai.png" />
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
            placeholder="Message Chatterbot"
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