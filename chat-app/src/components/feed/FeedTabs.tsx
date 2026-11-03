import React from 'react';
import { Button } from '../ui/button';
import { Sparkles, Clock, Flame } from 'lucide-react';

export type FeedTab = 'relevant' | 'latest' | 'top';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: FeedTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'relevant',
      label: 'Relevant',
      icon: <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />,
    },
    {
      id: 'latest',
      label: 'Latest',
      icon: <Clock className="h-4 w-4 mr-1.5 text-blue-500" />,
    },
    {
      id: 'top',
      label: 'Top',
      icon: <Flame className="h-4 w-4 mr-1.5 text-orange-500" />,
    },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 border-b border-border/40 pb-2 mb-4">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={`font-medium text-base h-9 px-3 rounded-md transition-colors ${
            activeTab === tab.id
              ? 'font-bold text-[#3b49df] bg-card shadow-2xs border border-border/60'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </div>
  );
};
