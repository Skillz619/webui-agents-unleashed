
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sampleData = [
  { year: '1960', value: 2.5 },
  { year: '1965', value: 2.7 },
  { year: '1970', value: 3.0 },
  { year: '1975', value: 2.8 },
  { year: '1980', value: 3.5 },
  { year: '1985', value: 3.0 },
  { year: '1990', value: 3.3 },
  { year: '1995', value: 3.0 },
  { year: '2000', value: 3.2 },
  { year: '2005', value: 3.6 },
  { year: '2010', value: 2.9 },
  { year: '2015', value: 2.7 },
  { year: '2020', value: 4.1 },
];

interface DataVisualizerProps {
  title?: string;
  dataSource?: string;
  customData?: any[];
}

const DataVisualizer: React.FC<DataVisualizerProps> = ({ 
  title = "GDP Growth Rate", 
  dataSource = "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json",
  customData
}) => {
  // Use custom data if provided, otherwise use sample data
  const data = customData || sampleData;
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs text-gray-500 truncate">{dataSource}</p>
      </div>
      
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }} 
              tickFormatter={(value) => value.slice(-2)}
            />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4267B2" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="p-2 bg-gray-50 border-t flex justify-end space-x-2">
        <div className="flex items-center text-xs text-gray-500">
          <input type="checkbox" id="showLabel" className="mr-1" checked readOnly />
          <label htmlFor="showLabel">LABEL</label>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizer;
