
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ApiInfo from '@/components/dashboard/ApiInfo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Chat
            </Button>
            <h2 className="text-xl font-bold">API Dashboard</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ApiInfo />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
