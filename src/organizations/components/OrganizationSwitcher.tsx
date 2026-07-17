'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Building2, Check, ChevronDown, Plus, Search } from 'lucide-react';
import { useOrganization } from '@/organizations/hooks/useOrganization';
import { useCalixoIdentity } from '@/identity/bridge/useCalixoIdentity';
import { ORGANIZATION_ROLE_LABELS, type OrganizationSwitcherProps } from '@/organizations/types';

export function OrganizationSwitcher({
  align = 'start',
  side = 'bottom',
  showCreateButton = true,
  onSwitch,
}: OrganizationSwitcherProps) {
  const { organization, organizations, switchOrganization, createOrganization, refreshOrganizations, isSwitching, error } = useOrganization();
  const { identity } = useCalixoIdentity();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (identity) {
      refreshOrganizations();
    }
  }, [identity]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 size={16} />
        <span>No organization</span>
      </div>
    );
  }

  const filtered = organizations.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      setIsOpen(false);
      setSearch('');
      onSwitch?.(orgId);
    } catch {
      // error surfaced via `error` from context, rendered below
    }
  };

  const handleCreate = async () => {
    if (!newOrgName.trim() || !identity) return;
    setCreateError(null);
    try {
      await createOrganization({ name: newOrgName.trim() });
      setNewOrgName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (err) {
      // createOrganization doesn't route through context's `error` state (only switchOrganization/refreshOrganizations do), so track it locally to actually surface the failure
      setCreateError(err instanceof Error ? err.message : 'Failed to create organization');
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: organization.branding.colors.primary }}
        >
          {organization.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="truncate">{organization.name}</div>
          <div className="text-xs text-muted-foreground">{organization.myRole ? ORGANIZATION_ROLE_LABELS[organization.myRole] : organization.plan.toUpperCase()}</div>
        </div>
        <ChevronDown size={14} className={`transition-transform text-muted-foreground ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
            ${align === 'end' ? 'right-0' : 'left-0'}
            w-72 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden`}
        >
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-md">
              <Search size={14} className="text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Organizations list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {search ? 'No organizations found' : 'No organizations yet'}
              </div>
            ) : (
              filtered.map(org => (
                <button
                  key={org.id}
                  disabled={isSwitching}
                  onClick={() => handleSelect(org.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50 ${
                    org.id === organization.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: org.branding.colors.primary }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-foreground truncate">{org.name}</div>
                    <div className="text-xs text-muted-foreground">{org.myRole ? ORGANIZATION_ROLE_LABELS[org.myRole] : org.plan.toUpperCase()}</div>
                  </div>
                  {org.id === organization.id && (
                    <Check size={16} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
          {error && <p className="px-4 py-2 text-xs text-red-500 border-t border-border">{error}</p>}

          {/* Create button */}
          {showCreateButton && (
            <div className="border-t border-border p-2">
              {isCreating ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={e => setNewOrgName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      placeholder="Organization name..."
                      className="flex-1 px-2 py-1.5 text-sm border border-border rounded-md bg-transparent text-foreground outline-none focus:border-primary"
                      autoFocus
                    />
                    <button
                      onClick={handleCreate}
                      disabled={!newOrgName.trim()}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setIsCreating(false); setNewOrgName(''); setCreateError(null); }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  {createError && <p className="mt-1.5 px-1 text-xs text-red-500">{createError}</p>}
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
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