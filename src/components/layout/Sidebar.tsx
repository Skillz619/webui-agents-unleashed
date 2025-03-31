import React, { useEffect, useState } from 'react';
import { BarChart3, Globe, Beaker, Leaf, Search, PenSquare, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import WidgetList from '@/components/dashboard/WidgetList';

type ApiItem = {
  title: string;
  icon: React.ReactNode;
  active?: boolean;
};

type DataButtonProps = {
  title: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

type HistoryItem = {
  id: string;
  title: string;
  timestamp: Date;
  active: boolean;
};

const DataButton = ({ title, isActive, onClick, className }: DataButtonProps) => (
  <Button 
    variant="outline" 
    className={`${isActive ? 'bg-copilot-blue text-white hover:bg-copilot-lightBlue' : 'bg-white'} ${className || ''}`}
    onClick={onClick}
  >
    <span>{title}</span>
  </Button>
);

const Sidebar = () => {
  const [activeCategory, setActiveCategory] = React.useState('WorldBank');
  const [activeDataType, setActiveDataType] = React.useState('GDP');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  const apiCategories: ApiItem[] = [
    { title: 'WorldBank', icon: <BarChart3 className="w-8 h-8 text-blue-600" /> },
    { title: 'Geography', icon: <Globe className="w-8 h-8 text-gray-600" /> },
    { title: 'Industry', icon: <Beaker className="w-8 h-8 text-gray-600" /> },
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        setHistoryItems(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse chat history', e);
        setHistoryItems([]);
      }
    }
  }, []);

  const addHistoryItem = (title: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      timestamp: new Date(),
      active: true
    };
    
    const updatedItems = historyItems.map(item => ({
      ...item,
      active: false
    }));
    
    const newHistory = [newItem, ...updatedItems].slice(0, 5);
    setHistoryItems(newHistory);
    
    localStorage.setItem('chatHistory', JSON.stringify(newHistory));
  };

  const handleApiClick = (title: string) => {
    console.log(`Clicked on API: ${title}`);
    setActiveCategory(title);
  };
  
  const handleDataTypeClick = (type: string) => {
    console.log(`Selected data type: ${type}`);
    setActiveDataType(type);
  };

  const handleHistoryItemClick = (id: string) => {
    const updatedItems = historyItems.map(item => ({
      ...item,
      active: item.id === id
    }));
    
    setHistoryItems(updatedItems);
    localStorage.setItem('chatHistory', JSON.stringify(updatedItems));
  };

  useEffect(() => {
    (window as any).addChatToHistory = addHistoryItem;
    
    return () => {
      delete (window as any).addChatToHistory;
    };
  }, [historyItems]);

  return (
    <aside className="w-64 h-full border-r bg-gray-50 p-4 flex flex-col">
      <div className="relative">
        <h2 className="text-lg font-bold px-2 py-1 border bg-white shadow-sm rounded">API Widget</h2>
      </div>
      
      <div className="flex justify-between mt-4">
        {apiCategories.map((category) => (
          <button 
            key={category.title} 
            className="flex flex-col items-center"
            onClick={() => handleApiClick(category.title)}
          >
            {category.icon}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <DataButton 
          title="GDP"
          isActive={activeDataType === 'GDP'}
          onClick={() => handleDataTypeClick('GDP')}
        />
        <DataButton 
          title="CO2"
          isActive={activeDataType === 'CO2'}
          onClick={() => handleDataTypeClick('CO2')}
        />
      </div>
      
      <DataButton 
        title="Agri. Land"
        isActive={activeDataType === 'Agri. Land'}
        onClick={() => handleDataTypeClick('Agri. Land')}
        className="mt-2"
      />
      
      <div className="mt-4">
        <WidgetList />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center py-2">
          <h3 className="text-sm font-medium">Today</h3>
        </div>
        <div className="space-y-1">
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center px-2 py-1 rounded-sm text-sm ${item.active ? 'bg-gray-200' : 'hover:bg-gray-100'} cursor-pointer`}
                onClick={() => handleHistoryItemClick(item.id)}
              >
                <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </div>
            ))
          ) : (
            <div className="px-2 py-1 text-sm text-gray-500 italic">
              No recent chats
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start">
          <Search className="w-4 h-4 mr-2" />
          Explore GPTs
        </Button>
      </div>
      
      <Separator className="my-4" />
    </aside>
  );
};

export default Sidebar;
