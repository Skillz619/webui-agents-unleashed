
import React from 'react';
import { User, Activity, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AgentType = 'general' | 'clinical' | 'food';

interface AgentHeaderProps {
  currentAgent: AgentType;
  onChangeAgent: (agentType: AgentType) => void;
}

const AgentHeader: React.FC<AgentHeaderProps> = ({ currentAgent, onChangeAgent }) => {
  const getAgentIcon = (type: AgentType) => {
    switch(type) {
      case 'clinical':
        return <Activity className="mr-2" />;
      case 'food':
        return <Leaf className="mr-2" />;
      default:
        return <User className="mr-2" />;
    }
  };

  const getAgentTitle = (type: AgentType) => {
    switch(type) {
      case 'clinical':
        return 'Clinical RAG Agent';
      case 'food':
        return 'Food Security Agent';
      default:
        return 'Web UI Copilot';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-copilot-blue text-white">
      <div className="flex items-center">
        <div className="bg-white p-2 rounded mr-2">
          <img 
            src="public/lovable-uploads/6b14fc55-e525-4e18-b1de-8dbff211ba45.png" 
            alt="Agent Icon" 
            className="w-6 h-6" 
          />
        </div>
        <span className="font-medium text-lg">{getAgentTitle(currentAgent)}</span>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant={currentAgent === 'general' ? 'secondary' : 'ghost'} 
          className={`text-white ${currentAgent === 'general' ? 'bg-copilot-lightBlue' : 'hover:bg-copilot-lightBlue'}`}
          onClick={() => onChangeAgent('general')}
        >
          <User className="w-4 h-4 mr-1" />
          General
        </Button>
        
        <Button 
          variant={currentAgent === 'clinical' ? 'secondary' : 'ghost'} 
          className={`text-white ${currentAgent === 'clinical' ? 'bg-copilot-lightBlue' : 'hover:bg-copilot-lightBlue'}`}
          onClick={() => onChangeAgent('clinical')}
        >
          <Activity className="w-4 h-4 mr-1" />
          Clinical
        </Button>
        
        <Button 
          variant={currentAgent === 'food' ? 'secondary' : 'ghost'} 
          className={`text-white ${currentAgent === 'food' ? 'bg-copilot-lightBlue' : 'hover:bg-copilot-lightBlue'}`}
          onClick={() => onChangeAgent('food')}
        >
          <Leaf className="w-4 h-4 mr-1" />
          Food
        </Button>
      </div>
    </div>
  );
};

export default AgentHeader;
