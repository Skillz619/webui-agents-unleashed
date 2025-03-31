
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LayoutGrid, Trash2 } from 'lucide-react';
import DataVisualizer from './DataVisualizer';

interface SavedWidget {
  id: string;
  title: string;
  data: any;
  chartType: 'line' | 'bar' | 'pie';
  timestamp: string;
}

const WidgetList = () => {
  const [widgets, setWidgets] = useState<SavedWidget[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);

  // Load widgets from localStorage when component mounts
  useEffect(() => {
    const savedWidgets = localStorage.getItem('savedWidgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, [isOpen]); // Re-fetch when drawer opens

  const handleDeleteWidget = (id: string) => {
    setWidgetToDelete(id);
  };

  const confirmDelete = () => {
    if (widgetToDelete) {
      const updatedWidgets = widgets.filter(widget => widget.id !== widgetToDelete);
      setWidgets(updatedWidgets);
      localStorage.setItem('savedWidgets', JSON.stringify(updatedWidgets));
      setWidgetToDelete(null);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="relative">
            <LayoutGrid className="h-5 w-5 mr-2" />
            My Widgets
            {widgets.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {widgets.length}
              </span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Saved Widgets</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="h-[70vh] px-4">
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground mb-2">No widgets saved yet</p>
                <p className="text-sm text-muted-foreground">
                  Use the "Add Widget" button when viewing charts to save them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                {widgets.map((widget) => (
                  <div key={widget.id} className="relative border rounded-lg shadow-sm overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                      onClick={() => handleDeleteWidget(widget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="p-2">
                      <h3 className="font-medium truncate" title={widget.title}>
                        {widget.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(widget.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="h-40 w-full">
                      <DataVisualizer 
                        title={widget.title}
                        dataSource={widget.data.description || "Saved widget"} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!widgetToDelete} onOpenChange={(isOpen) => !isOpen && setWidgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WidgetList;
