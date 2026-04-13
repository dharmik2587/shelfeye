import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  title?: string;
  placeholder?: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  title = "ShelfEye AI Assistant",
  placeholder = "Ask about shelf management, stockouts, product placement...",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm ShelfEye, your retail AI assistant. I can help you with shelf monitoring, stockout prevention, product placement optimization, and inventory insights. Upload a shelf image or ask me anything about retail management!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Convert messages to API format (without timestamps)
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      apiMessages.push({
        role: "user",
        content: input,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "I encountered an issue responding.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-white" />
        <h2 className="text-white font-bold">{title}</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm">ShelfEye is thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
