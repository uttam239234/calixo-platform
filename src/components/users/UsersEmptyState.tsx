"use client";

import { Users2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface UsersEmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function UsersEmptyState({ title = "Select a person to get started", description = "Choose someone from the directory, or search to find a person, team, or department.", action }: UsersEmptyStateProps) {
  return <EmptyState icon={<Users2 size={32} />} title={title} description={description} action={action} />;
}
