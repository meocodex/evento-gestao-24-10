import * as React from 'react';
import { BaseSheet } from './BaseSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface SheetTab {
  value: string;
  label: string;
  content: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface DetailsSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  tabs?: SheetTab[];
  children?: React.ReactNode;
  defaultTab?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function DetailsSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  tabs,
  children,
  defaultTab,
  side,
  size = 'xl',
  className,
}: DetailsSheetProps) {
  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      side={side}
      size={size}
      className={className}
    >
      {tabs ? (
        <Tabs defaultValue={defaultTab || tabs[0]?.value} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="relative"
              >
                {tab.label}
                {tab.badge && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="flex-1 overflow-hidden mt-4"
            >
              <ScrollArea className="h-full -mx-6 px-6">
                {tab.content}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ScrollArea className="flex-1 -mx-6 px-6">
          {children}
        </ScrollArea>
      )}
    </BaseSheet>
  );
}
