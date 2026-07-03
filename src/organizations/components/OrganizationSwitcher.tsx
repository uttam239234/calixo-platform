'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, Check, ChevronDown, Plus, Search } from 'lucide-react';
import { useOrganization } from '@/organizations/hooks/useOrganization';
import { useAuth } from '@/identity/hooks/useAuth';
import type { OrganizationSwitcherProps } from '@/organizations/types';

export function OrganizationSwitcher({
  align = 'start',
  side = 'bottom',
  showCreateButton = true,
  onSwitch,
}: OrganizationSwitcherProps) {
  const { organization, organizations, switchOrganization, createOrganization, refreshOrganizations } = useOrganization();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      refreshOrganizations();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!organization) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
        <Building2 size={16} />
        <span>No organization</span>
      </div>
    );
  }

  const filtered = organizations.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (orgId: string) => {
    await switchOrganization(orgId);
    setIsOpen(false);
    setSearch('');
    onSwitch?.(orgId);
  };

  const handleCreate = async () => {
    if (!newOrgName.trim() || !user) return;
    try {
      await createOrganization({ name: newOrgName.trim() });
      setNewOrgName('');
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
        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: organization.branding.colors.primary }}
        >
          {organization.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="truncate">{organization.name}</div>
          <div className="text-xs text-gray-500">{organization.plan.toUpperCase()}</div>
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} 
            ${align === 'end' ? 'right-0' : 'left-0'}
            w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden`}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="bg-transparent text-sm outline-none flex-1 text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Organizations list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {search ? 'No organizations found' : 'No organizations yet'}
              </div>
            ) : (
              filtered.map(org => (
                <button
                  key={org.id}
                  onClick={() => handleSelect(org.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    org.id === organization.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: org.branding.colors.primary }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.plan.toUpperCase()}</div>
                  </div>
                  {org.id === organization.id && (
                    <Check size={16} className="text-blue-600 flex-shrink-0" />
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
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="Organization name..."
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newOrgName.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setIsCreating(false); setNewOrgName(''); }}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Plus size={16} />
                  <span>Create organization</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}