
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  return (
    <header className="w-full bg-copilot-blue text-white py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Web Copilots</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-white hover:bg-copilot-lightBlue">
          Help
        </Button>
        <Avatar>
          <AvatarFallback className="bg-yellow-400 text-black">CV</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
