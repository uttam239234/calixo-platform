"use client";

import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface SettingsEmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function SettingsEmptyState({ title = "Select a group to get started", description = "Choose a settings group from the sidebar, or search for a specific setting.", action }: SettingsEmptyStateProps) {
  return <EmptyState icon={<SlidersHorizontal size={32} />} title={title} description={description} action={action} />;
}
