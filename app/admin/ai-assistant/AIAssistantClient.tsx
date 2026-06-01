"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Bot, User, Loader2, ClipboardList } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  action?: { type: string; data: Record<string, unknown> };
};

const EXAMPLE_PROMPTS = [
  "Create a work order for 20 tons of road base to Jensen Construction on June 3rd",
  "Who owes us money?",
  "Schedule a delivery to Riverside Farms next Monday",
  "What materials do we carry?",
  "Summarize recent deliveries this week",
];

export default function AIAssistantClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState<Record<string, unknown> | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setOrderCreated(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: messages }),
      });

      if (res.status === 503) {
        setAiConfigured(false);
        setMessages([
          ...history,
          { role: "assistant", content: "AI is not configured. Please add the ANTHROPIC_API_KEY to your environment." },
        ]);
        return;
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        action: data.action,
      };
      setMessages([...history, assistantMsg]);

      if (data.action?.type === "create_work_order") {
        setCreatingOrder(data.action.data);
      }
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!creatingOrder) return;
    setLoading(true);
    try {
      await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creatingOrder),
      });
      setOrderCreated(true);
      setCreatingOrder(null);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Work order created successfully! You can view it in the Work Orders section." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to create the work order. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const hasSpeech =
    typeof window !== "undefined" &&
    !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a2744] text-white px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-[#e8600a] rounded-full flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">AI Assistant</h1>
          <p className="text-xs text-gray-300">Powered by Claude — ask about deliveries, invoices, scheduling</p>
        </div>
        {!aiConfigured && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full">
            AI not configured
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1a2744] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
              <p className="text-gray-500 text-sm">Ask me about deliveries, clients, invoices, or create work orders with natural language.</p>
            </div>
            <div className="grid gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#e8600a] hover:text-[#e8600a] transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-[#e8600a]" : "bg-[#1a2744]"
              }`}
            >
              {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#e8600a] text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.action?.type === "create_work_order" && !orderCreated && (
                <button
                  onClick={handleCreateWorkOrder}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-sm rounded-lg hover:bg-[#253565] transition-colors cursor-pointer self-start"
                >
                  <ClipboardList size={14} />
                  Create Work Order
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          {hasSpeech && (
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                listening
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : "border-gray-300 text-gray-500 hover:border-[#e8600a] hover:text-[#e8600a]"
              }`}
              title="Voice input"
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask anything about your business..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#e8600a] transition-colors"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-[#e8600a] text-white rounded-full disabled:opacity-40 hover:bg-[#d4550a] transition-colors cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        {messages.length > 0 && (
          <div className="max-w-2xl mx-auto mt-2 text-center">
            <button
              onClick={() => { setMessages([]); setCreatingOrder(null); setOrderCreated(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
