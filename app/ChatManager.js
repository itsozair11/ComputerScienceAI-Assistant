import { db } from './config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

export const saveChat = async (userId, chatName, messages) => {
  try {
    const chatRef = await addDoc(collection(db, 'users', userId, 'chats'), {
      name: chatName,
      messages: messages,
      createdAt: new Date(),
    });
    return chatRef.id; // Return the ID of the new chat
  } catch (error) {
    console.error("Error saving chat:", error);
  }
};

export const deleteChat = async (userId, chatId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
};

export const clearChatHistory = async (userId, chatId) => {
  try {
    const chatRef = doc(db, 'users', userId, 'chats', chatId);
    await updateDoc(chatRef, { messages: [] });
  } catch (error) {
    console.error("Error clearing chat history:", error);
  }
};

export const getChats = async (userId) => {
  const chatSnapshot = await getDocs(collection(db, 'users', userId, 'chats'));
  const chats = chatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return chats;
};
