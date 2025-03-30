
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataVisualizer from './DataVisualizer';

const ApiInfo = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 underline">GDP APIs</h2>
      
      <p className="text-gray-700 mb-4">
        https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json
      </p>
      
      <DataVisualizer />
    </div>
  );
};

export default ApiInfo;
