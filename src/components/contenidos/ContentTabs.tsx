'use client';

import { useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ContentTabsProps {
  contentId: string;
  tabs: Tab[];
  currentTabId: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function ContentTabs({ 
  contentId, 
  tabs, 
  currentTabId, 
  onTabChange,
  className = ''
}: ContentTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Manejar cambio de pestaña
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      // Si no se proporciona un manejador externo, usar enrutamiento
      let basePath = pathname;
      
      // Eliminar subdirectorios de la URL si ya existen
      if (pathname.includes(`/contenidos/${contentId}/`)) {
        basePath = `/dashboard/contenidos/${contentId}`;
      }
      
      // Construir nueva URL
      let newPath = basePath;
      if (tabId !== 'contenido') {
        newPath = `${basePath}/${tabId}`;
      }
      
      router.push(newPath);
    }
  };
  
  return (
    <div className={`content-tabs ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => {
            const isActive = tab.id === currentTabId;
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}