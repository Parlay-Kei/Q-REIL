import React, { useEffect, useState, useRef } from 'react';
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md';
  className?: string;
}
export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = ''
}: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    if (activeTabElement && tabsRef.current) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width
      });
    }
  }, [activeTab]);
  const sizeStyles = {
    sm: 'text-sm h-8 px-3',
    md: 'text-base h-10 px-4'
  };
  const variantStyles = {
    default: {
      container:
      'bg-surface-primary/60 backdrop-blur-xl rounded-lg p-1 border border-stroke-hairline',
      tab: 'rounded-md',
      activeTab: 'text-text-primary',
      inactiveTab: 'text-text-tertiary hover:text-text-secondary',
      indicator: 'bg-surface-elevated rounded-md shadow-sm'
    },
    pills: {
      container: 'gap-2',
      tab: 'rounded-lg border border-transparent',
      activeTab: 'bg-accent-cyan-dim text-accent-cyan border-accent-cyan/20',
      inactiveTab:
      'text-text-tertiary hover:text-text-secondary hover:bg-surface-primary',
      indicator: ''
    },
    underline: {
      container: 'border-b border-stroke-hairline gap-1',
      tab: 'rounded-t-md -mb-px',
      activeTab: 'text-accent-cyan',
      inactiveTab: 'text-text-tertiary hover:text-text-secondary',
      indicator: 'h-0.5 bg-accent-cyan rounded-full -bottom-px'
    }
  };
  const styles = variantStyles[variant];
  return (
    <div
      ref={tabsRef}
      className={`relative flex items-center ${styles.container} ${className}`}
      role="tablist">

      {/* Animated indicator for default variant */}
      {variant === 'default' &&
      <div
        className={`absolute top-1 bottom-1 transition-all duration-base ease-out ${styles.indicator}`}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width
        }} />

      }

      {/* Underline indicator */}
      {variant === 'underline' &&
      <div
        className={`absolute transition-all duration-base ease-out ${styles.indicator}`}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width
        }} />

      }

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onChange(tab.id)}
            className={`
              relative z-10 flex items-center gap-2 font-medium
              transition-colors duration-base ease-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep
              ${sizeStyles[size]}
              ${styles.tab}
              ${isActive ? styles.activeTab : styles.inactiveTab}
              ${variant === 'pills' && isActive ? styles.activeTab : ''}
            `}
            role="tab"
            aria-selected={isActive}>

            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined &&
            <span
              className={`
                  text-xs px-1.5 py-0.5 rounded-md
                  ${isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-surface-elevated text-text-tertiary'}
                `}>

                {tab.count}
              </span>
            }
          </button>);

      })}
    </div>);

}