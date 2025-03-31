import React, { useState } from 'react';
import { X, BarChart, LineChart as LineChartIcon, PieChart, Download, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DynamicChartProps {
  data: any;
  onClose: () => void;
}

interface SavedWidget {
  id: string;
  title: string;
  data: any;
  chartType: 'line' | 'bar' | 'pie';
  timestamp: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DynamicChart: React.FC<DynamicChartProps> = ({ data, onClose }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState('');
  const { toast } = useToast();
  
  // Extract data for visualization
  const chartData = data.data || [];
  const title = data.title || 'Data Visualization';
  const description = data.description || '';
  
  // Determine available metrics from the first data point
  const firstDataPoint = chartData[0] || {};
  const metrics = Object.keys(firstDataPoint).filter(key => key !== 'year' && key !== 'name' && key !== 'id' && typeof firstDataPoint[key] === 'number');

  // For pie chart, sum up values across all years for each metric
  const pieChartData = metrics.map(metric => ({
    name: metric,
    value: chartData.reduce((sum: number, item: any) => sum + Number(item[metric]), 0)
  }));

  // Function to download data as JSON file
  const downloadData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Complete",
      description: "Your data file has been downloaded"
    });
  };

  // Function to share data
  const shareData = async (method: 'clipboard' | 'navigator') => {
    if (method === 'clipboard') {
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        toast({
          title: "Copied to Clipboard",
          description: "Data JSON has been copied to your clipboard"
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard",
          variant: "destructive"
        });
      }
    } else if (method === 'navigator' && navigator.share) {
      try {
        const file = new File([JSON.stringify(data, null, 2)], 
          `${title.toLowerCase().replace(/\s+/g, '-')}-data.json`, 
          { type: 'application/json' }
        );
        
        await navigator.share({
          title: title,
          text: description,
          files: [file]
        });
        
        toast({
          title: "Shared Successfully",
          description: "Your data has been shared"
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast({
            title: "Share Failed",
            description: "Could not share the data",
            variant: "destructive"
          });
        }
      }
    }
  };

  // Function to save widget
  const saveWidget = () => {
    if (!widgetTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your widget",
        variant: "destructive"
      });
      return;
    }

    const newWidget: SavedWidget = {
      id: Date.now().toString(),
      title: widgetTitle,
      data: data,
      chartType: chartType,
      timestamp: new Date().toISOString()
    };

    // Get existing widgets from localStorage or initialize as empty array
    const existingWidgets = JSON.parse(localStorage.getItem('savedWidgets') || '[]');
    
    // Add new widget to the array
    const updatedWidgets = [newWidget, ...existingWidgets];
    
    // Save back to localStorage
    localStorage.setItem('savedWidgets', JSON.stringify(updatedWidgets));
    
    // Close dialog and reset state
    setIsAddWidgetDialogOpen(false);
    setWidgetTitle('');
    
    toast({
      title: "Widget Saved",
      description: `"${widgetTitle}" has been added to your widgets`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Tabs defaultValue="line" className="w-full" onValueChange={(value) => setChartType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="line" className="flex items-center gap-2">
            <LineChartIcon className="w-4 h-4" />
            <span>Line</span>
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span>Bar</span>
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>Pie</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="line" className="mt-4">
          <div className="h-80 w-full">
            <ChartContainer 
              config={{
                primary: {
                  theme: {
                    light: "#0088FE",
                    dark: "#0088FE",
                  },
                },
                secondary: {
                  theme: {
                    light: "#00C49F",
                    dark: "#00C49F",
                  },
                },
                tertiary: {
                  theme: {
                    light: "#FFBB28",
                    dark: "#FFBB28",
                  },
                },
              }}
            >
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {metrics.slice(0, 3).map((metric, index) => (
                  <Line 
                    key={metric} 
                    type="monotone" 
                    dataKey={metric} 
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="bar" className="mt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metrics.slice(0, 3).map((metric, index) => (
                  <Bar 
                    key={metric} 
                    dataKey={metric} 
                    name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="pie" className="mt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={() => setIsAddWidgetDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Widget</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => shareData('clipboard')}>
              Copy to Clipboard
            </DropdownMenuItem>
            {navigator.share && (
              <DropdownMenuItem onClick={() => shareData('navigator')}>
                Share...
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" className="flex items-center gap-2" onClick={downloadData}>
          <Download className="w-4 h-4" />
          <span>Download</span>
        </Button>
        
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>

      <Dialog open={isAddWidgetDialogOpen} onOpenChange={setIsAddWidgetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Widget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="widget-title" className="text-right">
                Title
              </Label>
              <Input
                id="widget-title"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter widget title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWidgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveWidget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicChart;
