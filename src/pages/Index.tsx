
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import ApiInfo from '@/components/dashboard/ApiInfo';

const Index = () => {
  const [showApiInfo, setShowApiInfo] = useState(false);
  
  const toggleApiInfo = () => {
    setShowApiInfo(!showApiInfo);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          {showApiInfo ? (
            <ApiInfo />
          ) : (
            <ChatInterface />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
