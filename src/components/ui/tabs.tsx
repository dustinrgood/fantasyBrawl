"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [tabValue, setTabValue] = useState(defaultValue)
  
  const currentValue = value !== undefined ? value : tabValue
  const handleValueChange = onValueChange !== undefined ? onValueChange : setTabValue
  
  useEffect(() => {
    console.debug('Tabs component - current value:', currentValue);
  }, [currentValue]);
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div 
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value
  
  const handleClick = () => {
    console.debug(`TabsTrigger clicked: ${value}, current selected: ${selectedValue}`);
    onValueChange(value);
  };
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected ? 'bg-white text-gray-900 shadow-sm' : 'hover:bg-gray-50',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()
  const isSelected = selectedValue === value
  
  console.debug(`TabsContent for "${value}" - isSelected: ${isSelected}, selectedValue: "${selectedValue}"`);
  
  return (
    <div
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'mt-2', 
        isSelected ? 'block' : 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs as default } 