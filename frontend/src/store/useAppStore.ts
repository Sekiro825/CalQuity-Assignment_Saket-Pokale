import { create } from 'zustand';
import { Message, Citation, ToolCall } from '../types/chat';

interface AppState {
    messages: Message[];
    isPdfOpen: boolean;
    currentPdfUrl: string | null;
    activeCitation: Citation | null;

    // Actions
    addMessage: (msg: Message) => void;
    updateLastMessage: (content: string) => void;
    addToolCall: (call: ToolCall) => void;
    updateToolCall: (tool: string, output: string) => void;
    addCitation: (citation: Citation) => void;
    setPdfOpen: (isOpen: boolean) => void;
    setActiveCitation: (citation: Citation | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    messages: [],
    isPdfOpen: false,
    currentPdfUrl: null,
    activeCitation: null,

    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

    updateLastMessage: (content) => set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (!lastMsg || lastMsg.role !== 'assistant') return state;

        const updatedMsg = { ...lastMsg, content: lastMsg.content + content };
        return {
            messages: [...state.messages.slice(0, -1), updatedMsg]
        };
    }),

    addToolCall: (call) => set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (!lastMsg) return state;

        // Check if tool call already exists (by tool name for simplicity)
        const existingIdx = lastMsg.toolCalls?.findIndex(tc => tc.tool === call.tool) ?? -1;
        if (existingIdx !== -1) return state;

        const newCalls = [...(lastMsg.toolCalls || []), call];
        const updatedMsg = { ...lastMsg, toolCalls: newCalls };
        return { messages: [...state.messages.slice(0, -1), updatedMsg] };
    }),

    updateToolCall: (tool, output) => set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (!lastMsg || !lastMsg.toolCalls) return state;

        const newCalls = lastMsg.toolCalls.map(tc =>
            tc.tool === tool ? { ...tc, output, status: 'completed' as const } : tc
        );

        const updatedMsg = { ...lastMsg, toolCalls: newCalls };
        return { messages: [...state.messages.slice(0, -1), updatedMsg] };
    }),

    addCitation: (citation) => set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (!lastMsg) return state;

        // Avoid duplicates
        if (lastMsg.citations?.some(c => c.id === citation.id)) return state;

        const newCitations = [...(lastMsg.citations || []), citation];
        const updatedMsg = { ...lastMsg, citations: newCitations };
        return { messages: [...state.messages.slice(0, -1), updatedMsg] };
    }),

    setPdfOpen: (isOpen) => set({ isPdfOpen: isOpen }),
    setActiveCitation: (citation) => set({
        activeCitation: citation,
        isPdfOpen: !!citation,
        currentPdfUrl: citation ? 'http://127.0.0.1:8000/api/pdf/content' : null
    }),
}));
