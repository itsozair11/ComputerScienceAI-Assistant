"use client";

import { useEffect, useState, useRef } from 'react';
import { Box, Button, Stack, TextField, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';
import Auth from './Auth';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { saveChat, deleteChat, clearChatHistory, getChats } from './ChatManager';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm a Computer Science Assistant. How can I assist you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null); // Track user authentication state
  const [chats, setChats] = useState([]); // Store user chats
  const [selectedChatId, setSelectedChatId] = useState(null); // Track selected chat
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const savedChats = await getChats(currentUser.uid);
        setChats(savedChats);
      }
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const text = await response.text();
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        return [...otherMessages, { ...lastMessage, content: text }];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSaveChat = async () => {
    const chatName = prompt('Enter a name for this chat:');
    if (chatName && user) {
      await saveChat(user.uid, chatName, messages);
      const updatedChats = await getChats(user.uid);
      setChats(updatedChats);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (user) {
      await deleteChat(user.uid, chatId);
      const updatedChats = await getChats(user.uid);
      setChats(updatedChats);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi, I'm the Headstarter AI Support Agent. How can I assist you today?",
      },
    ]);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleLoadChat = (chat) => {
    setSelectedChatId(chat.id);
    setMessages(chat.messages);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={2}
    >
      {!user ? (
        <Auth />
      ) : (
        <Box display="flex" width="90%" maxWidth="1200px" height="700px" border="1px solid black">
          {/* Sidebar for saved chats */}
          <Box
            width="250px"
            borderRight="1px solid gray"
            p={2}
            bgcolor="black"
            overflow="auto"
          >
            <Typography variant="h6" gutterBottom>
              Saved Chats
            </Typography>
            <List>
              {chats.map((chat) => (
                <ListItem 
                  button 
                  key={chat.id} 
                  onClick={() => handleLoadChat(chat)}
                  selected={chat.id === selectedChatId}
                >
                  <ListItemText primary={chat.name} />
                  <Button 
                    color="error" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the chat load
                      handleDeleteChat(chat.id);
                    }}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Main chat box */}
          <Stack
            direction="column"
            flexGrow={1}
            p={2}
            spacing={3}
            maxWidth="calc(100% - 250px)"
          >
            <Stack direction="row" justifyContent="space-between">
              <Button variant="contained" onClick={handleSaveChat}>Save Chat</Button>
              <Button variant="contained" onClick={handleClearChat} color="warning">Clear Chat</Button>
              <Button variant="contained" color="error" onClick={handleSignOut}>Sign Out</Button>
            </Stack>
            
            <Divider />

            <Stack direction="column" spacing={2} flexGrow={1} overflow="auto">
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                >
                  <Box
                    bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                    color="white"
                    borderRadius={16}
                    p={3}
                    maxWidth="70%"
                  >
                    {message.role === 'assistant' ? (
                      <Typography
                        dangerouslySetInnerHTML={{
                          __html: message.content.replace(/\n/g, '<br/>').replace(/\*/g, '•'),
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
