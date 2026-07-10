"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  span?: "full" | "half";
  className?: string;
}

interface ModuleSettingsLayoutProps {
  title: string;
  description?: string;
  sections: SettingsSection[];
  onSave?: () => void;
  saving?: boolean;
  className?: string;
}

export function ModuleSettingsLayout({
  title,
  description,
  sections,
  onSave,
  saving = false,
  className,
}: ModuleSettingsLayoutProps) {
  return (
    <div className={cn("space-y-6 pb-8", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {onSave && (
            <Button size="sm" onClick={onSave} loading={saving} className="gap-2">
              <Save size={14} /> Save Changes
            </Button>
          )}
        </div>
      </motion.div>

      {/* Settings grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section, i) => {
          const sectionContent = (
            <Card key={section.id} className={section.className}>
              <CardHeader
                title={section.title}
                description={section.description}
                action={section.action}
              />
              <CardContent>{section.content}</CardContent>
              {section.footer && (
                <CardFooter>{section.footer}</CardFooter>
              )}
            </Card>
          );

          const spanClass =
            section.span === "full" ? "xl:col-span-2" : "";

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.05 + i * 0.05,
              }}
              className={spanClass}
            >
              {sectionContent}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}