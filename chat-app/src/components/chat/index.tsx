import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/mockData';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import type { Chat as ChatType } from '../../types';

export const Chat: React.FC = () => {
  const {
    chats,
    currentUser,
    sendMessage,
    fetchMessagesWithUser,
    markAsRead,
    isLoading,
  } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam =
    searchParams.get('userId') ||
    searchParams.get('channelId') ||
    searchParams.get('id');

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showMobileChatView, setShowMobileChatView] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);

  const handleSetActiveChatId = (id: number) => {
    setActiveChatId(id);
    setSearchParams({ userId: id.toString() });
    setShowMobileChatView(true);
  };

  useEffect(() => {
    if (userIdParam) {
      const parsedId = parseInt(userIdParam, 10);
      if (!isNaN(parsedId) && parsedId !== activeChatId) {
        setActiveChatId(parsedId);
        setShowMobileChatView(true);
        return;
      }
    }

    if (activeChatId === null && chats.length > 0) {
      setActiveChatId(chats[0].id);
      // We don't call handleSetActiveChatId here to avoid triggering showMobileChatView on initial load
    }
  }, [userIdParam, chats.length]);

  useEffect(() => {
    if (activeChatId) {
      setMessagesLoading(true);
      fetchMessagesWithUser(activeChatId).finally(() => {
        setMessagesLoading(false);
      });
      markAsRead(activeChatId);
    }
  }, [activeChatId]);

  const activeChat: ChatType | undefined = chats.find(
    (c) => c.id === activeChatId
  );

  const handleSend = async () => {
    if (activeChatId && newMessage.trim()) {
      const msgText = newMessage.trim();
      setNewMessage('');
      await sendMessage(activeChatId, msgText);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-card rounded-xl shadow-sm ring-1 ring-border/20 overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={handleSetActiveChatId}
        isLoading={isLoading}
        className={`${showMobileChatView ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 bg-background border-r border-border/40 overflow-hidden flex-col h-full`}
      />
      <ChatArea
        activeChat={activeChat}
        currentUser={currentUser}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSend={handleSend}
        isLoading={isLoading || messagesLoading}
        hasChats={chats.length > 0}
        className={`${showMobileChatView ? 'flex' : 'hidden md:flex'} flex-1 bg-background overflow-hidden flex-col`}
        onBack={() => {
          setShowMobileChatView(false);
          setSearchParams({});
        }}
      />
    </div>
  );
};
