"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { CopilotMessageBubble } from "./CopilotMessageBubble";
import type { CopilotMessageView, MessageReaction } from "./types";

interface CopilotMessageListProps {
  messages: CopilotMessageView[];
  isThinking: boolean;
  regeneratingId: string | null;
  onRegenerate: (id: string) => void;
  onReact: (id: string, reaction: Exclude<MessageReaction, null>) => void;
  onEditPrompt: (content: string) => void;
}

export function CopilotMessageList({ messages, isThinking, regeneratingId, onRegenerate, onReact, onEditPrompt }: CopilotMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-ai/20">
          <Bot size={22} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Ask the Copilot anything</p>
          <p className="mt-1 text-xs text-muted-foreground">Orchestrate campaigns, generate content, and analyze performance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-4">
      {messages.map(m => (
        <CopilotMessageBubble
          key={m.id}
          message={m}
          promptContent={m.promptMessageId ? messages.find(pm => pm.id === m.promptMessageId)?.content : undefined}
          onRegenerate={onRegenerate}
          onReact={onReact}
          onEditPrompt={onEditPrompt}
          isRegenerating={regeneratingId === m.id}
        />
      ))}
      {isThinking && (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-ai text-white">
            <Bot size={15} />
          </div>
          <div className="card flex items-center px-4 py-3">
            <span className="ai-thinking">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
