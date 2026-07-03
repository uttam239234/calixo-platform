'use client';

import React, { useState, useRef } from 'react';
import { Check, ChevronDown, Layout, Plus, Search } from 'lucide-react';
import { useWorkspace } from '@/workspaces/hooks/useWorkspace';
import type { WorkspaceSwitcherProps } from '@/workspaces/types';

export function WorkspaceSwitcher({
  align = 'start',
  side = 'bottom',
  showCreateButton = true,
  onSwitch,
}: WorkspaceSwitcherProps) {
  const { workspace, workspaces, switchWorkspace, createWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setSearch('');
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!workspace) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
        <Layout size={16} />
        <span>No workspace</span>
      </div>
    );
  }

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (wsId: string) => {
    await switchWorkspace(wsId);
    setIsOpen(false);
    setSearch('');
    onSwitch?.(wsId);
  };

  const handleCreate = async () => {
    if (!newWsName.trim()) return;
    try {
      await createWorkspace({ name: newWsName.trim(), organizationId: '' });
      setNewWsName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch {
      // Error handled by context
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <Layout size={14} />
        <span className="truncate max-w-[120px]">{workspace.name}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} 
            ${align === 'end' ? 'right-0' : 'left-0'}
            w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden`}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search workspaces..."
                className="bg-transparent text-xs outline-none flex-1 text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Workspaces list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-500">
                {search ? 'No workspaces found' : 'No workspaces yet'}
              </div>
            ) : (
              filtered.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => handleSelect(ws.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    ws.id === workspace.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: ws.branding.theme.primary || '#3B82F6' }}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{ws.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{ws.type}</div>
                  </div>
                  {ws.id === workspace.id && (
                    <Check size={14} className="text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Create button */}
          {showCreateButton && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newWsName}
                    onChange={e => setNewWsName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="Workspace name..."
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newWsName.trim()}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setIsCreating(false); setNewWsName(''); }}
                    className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Plus size={14} />
                  <span>Create workspace</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}