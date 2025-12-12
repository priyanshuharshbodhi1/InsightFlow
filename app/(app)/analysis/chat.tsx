"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTeam } from "@/lib/store";
import { CornerDownLeft, PackageOpen, Loader2 } from "lucide-react";
import { Session } from "next-auth";
import { marked } from "marked";
import { useState, FormEvent } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Chat({ session }: { session: Session | null }) {
  const team = useTeam((state) => state.team);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("🔍 Chat Submit - Input:", input, "Loading:", isLoading);
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    console.log("➕ Adding user message:", userMessage);
    
    // Add user message to chat
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      console.log("📝 Messages after user add:", newMessages.length);
      return newMessages;
    });
    setInput("");
    setIsLoading(true);
    console.log("⏳ Loading state set to true");

    try {
      // Call the API
      console.log("🌐 Calling API...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          team: team,
          session: session,
        }),
      });

      const data = await response.json();
      console.log("📥 API Response:", response.status, data);

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
        };
        console.log("✅ Adding assistant message:", assistantMessage);
        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          console.log("📝 Messages after assistant add:", newMessages.length);
          return newMessages;
        });
      } else {
        // Error handling - show the message directly if it's user-friendly
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "Failed to get response from the AI.",
        };
        console.log("❌ Adding error message:", errorMessage);
        setMessages((prev) => {
          const newMessages = [...prev, errorMessage];
          console.log("📝 Messages after error add:", newMessages.length);
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Network error. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log("✅ Loading state set to false");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="w-full">
        {messages.length > 0 ? (
          <div className="pb-28">
            {messages.map((m) => (
              <div className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`} key={m.id}>
                <div
                  className={`inline-block max-w-[80%] rounded-t-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm prose ${
                    m.role === "user" ? "rounded-bl-2xl" : "rounded-br-2xl"
                  }`}
                  style={{
                    background: `${m.role === "user" && "black"}`,
                    color: `${m.role === "user" ? "white" : "black"}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: marked(m.content) }}
                ></div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-2 flex justify-start">
                <div className="inline-block rounded-t-2xl rounded-br-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full mt-12 text-center p-12">
            <div className="size-40 grid place-content-center bg-gradient-to-t from-dark/10 rounded-full mx-auto mb-6">
              <PackageOpen className="size-20" />
            </div>
            <h2 className="font-medium text-xl mb-6">Ask me about your feedback</h2>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4 lg:right-8 lg:left-72">
        <div className="max-w-2xl mx-auto shadow-xl">
          <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring bg-white">
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              id="message"
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
              disabled={isLoading}
            />
            <div className="flex items-center p-3 pt-0">
              <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
