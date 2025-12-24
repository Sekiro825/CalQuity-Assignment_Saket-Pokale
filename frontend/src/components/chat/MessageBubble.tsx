'use client';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import ToolIndicator from './ToolIndicator';
import { useAppStore } from '@/store/useAppStore';

export default function MessageBubble({ message }: { message: Message }) {
    const { setActiveCitation } = useAppStore();
    const isUser = message.role === 'user';

    // Basic citation rendering logic (replacing [1] with buttons)
    // In a real app, use a markdown parser like react-markdown with a plugin
    // Here we do a simple split for demonstration
    const renderContent = (text: string) => {
        // Regex to find citations like [1]
        const parts = text.split(/(\[\d+\])/g);

        return parts.map((part, idx) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
                const id = parseInt(match[1]);
                const citation = message.citations?.find(c => c.id === id);
                return (
                    <button
                        key={idx}
                        onClick={() => citation && setActiveCitation(citation)}
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full mx-1 hover:bg-blue-200 transition-colors -translate-y-1"
                        title={citation?.source || "Source"}
                    >
                        {id}
                    </button>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    return (
        <div className={`flex gap-4 p-6 ${isUser ? 'bg-white' : 'bg-gray-50/50'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-200 text-gray-600' : 'bg-teal-600 text-white'}`}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className="flex-1 space-y-2">
                <p className="font-medium text-sm text-gray-900">
                    {isUser ? 'You' : 'Perplexity AI'}
                </p>

                {/* Tool Calls */}
                {message.toolCalls?.map((tc, i) => (
                    <ToolIndicator key={i} toolCall={tc} />
                ))}

                {/* Content */}
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                    {renderContent(message.content)}
                    {message.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse" />}
                </div>

                {/* Source Cards (Bottom) */}
                {!isUser && message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-3 gap-2">
                        {message.citations.map((cite, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveCitation(cite)}
                                className="p-3 bg-white border rounded-lg hover:shadow-md cursor-pointer transition-all text-xs"
                            >
                                <div className="font-semibold truncate text-gray-700">{cite.source}</div>
                                <div className="text-gray-500 mt-1 truncate">"{cite.quote}"</div>
                                <div className="mt-2 text-[10px] text-gray-400">Page {cite.page_number}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
