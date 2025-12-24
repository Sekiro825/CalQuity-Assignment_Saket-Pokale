'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import MessageBubble from './MessageBubble';
import { Send, Plus, ArrowUp } from 'lucide-react';

export default function ChatInterface() {
    const { messages, addMessage, updateLastMessage, addToolCall, updateToolCall, addCitation } = useAppStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add User Message
        const userMsgId = Date.now().toString();
        addMessage({ id: userMsgId, role: 'user', content: input });

        setIsLoading(true);
        setInput('');

        // Add Bot Placeholder
        const botMsgId = (Date.now() + 1).toString();
        addMessage({ id: botMsgId, role: 'assistant', content: '', isStreaming: true });

        try {
            const response = await fetch('http://127.0.0.1:8000/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value);

                // Parse SSE events
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'token') {
                                updateLastMessage(data.content);
                            } else if (data.type === 'tool_start') {
                                addToolCall({ tool: data.tool, input: data.input, status: 'running' });
                            } else if (data.type === 'tool_end') {
                                // We need to know WHICH tool ended. For now, we update by name/context
                                // Simplified for this demo
                                // In a real app we'd track tool_call_id
                                // Heuristic: update the last tool call
                                updateToolCall(data.tool || 'unknown', data.output);
                            } else if (data.type === 'citation') {
                                addCitation(data);
                            } else if (data.type === 'done') {
                                setIsLoading(false);
                                // Need to mark streaming false in store...
                            }
                        } catch (e) {
                            // console.error('Error parsing SSE', e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            updateLastMessage("\n\n*Error: Failed to connect to server.*");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto pb-32">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Plus size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Where knowledge begins</h2>
                        <p className="">Ask anything...</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 w-full max-w-4xl bg-white/80 backdrop-blur-md p-4 border-t z-10">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-teal-500/20 text-lg shadow-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 p-2 bg-teal-600 text-white rounded-full disabled:opacity-50 hover:bg-teal-700 transition-colors"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowUp size={20} />}
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-gray-400">
                    AI can make mistakes. Please review generated responses.
                </div>
            </div>
        </div>
    );
}
