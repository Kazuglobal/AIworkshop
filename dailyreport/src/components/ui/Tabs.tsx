'use client';

import React, { useState } from 'react';

type TabItemProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

export function TabItem({ children }: TabItemProps) {
  return <div>{children}</div>;
}

type TabsProps = {
  children: React.ReactElement<TabItemProps>[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
};

export function Tabs({
  children,
  defaultTab,
  className = '',
  onChange,
}: TabsProps) {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabItemProps>[];
  const defaultTabId = defaultTab || (tabs[0]?.props.id || '');
  const [activeTab, setActiveTab] = useState(defaultTabId);
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => handleTabChange(tab.props.id)}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === tab.props.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {tabs.find((tab) => tab.props.id === activeTab)}
      </div>
    </div>
  );
} 