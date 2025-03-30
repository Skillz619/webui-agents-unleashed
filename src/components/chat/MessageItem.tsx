
import React from 'react';
import { User, Activity, Leaf } from 'lucide-react';

type AgentType = 'general' | 'clinical' | 'food';

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    agentType: AgentType;
    timestamp: Date;
  };
}

const MessageItem: React.FC<MessageProps> = ({ message }) => {
  const getAgentIcon = () => {
    switch(message.agentType) {
      case 'clinical':
        return (
          <div className="agent-icon agent-icon-clinical">
            <Activity className="w-5 h-5" />
          </div>
        );
      case 'food':
        return (
          <div className="agent-icon agent-icon-food">
            <Leaf className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="agent-icon agent-icon-general">
            <User className="w-5 h-5" />
          </div>
        );
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="message-container user-message">
          <div className="text-sm">{message.content}</div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-4">
      <div className="flex-shrink-0 mr-3 mt-1">
        {getAgentIcon()}
      </div>
      <div className={`message-container agent-message agent-message-${message.agentType}`}>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs text-gray-500 mt-1">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
