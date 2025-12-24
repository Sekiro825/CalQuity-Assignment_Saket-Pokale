import { ToolCall } from '@/types/chat';
import { Loader2, Search, FileText, CheckCircle2 } from 'lucide-react';

export default function ToolIndicator({ toolCall }: { toolCall: ToolCall }) {
    const isComplete = toolCall.status === 'completed';

    let Icon = Loader2;
    let text = 'Processing...';

    if (toolCall.tool === 'search_documents') {
        Icon = Search;
        text = isComplete ? 'Found documents' : 'Searching documents...';
    } else if (toolCall.tool === 'read_pdf') {
        Icon = FileText;
        text = isComplete ? 'Read PDF content' : 'Reading PDF...';
    }

    return (
        <div className="flex items-center gap-3 text-sm text-gray-500 my-2 bg-gray-50 p-2 rounded-md transition-all">
            {isComplete ? (
                <CheckCircle2 size={16} className="text-green-500" />
            ) : (
                <Icon size={16} className="animate-spin text-blue-500" />
            )}
            <span className={isComplete ? 'text-gray-600' : 'text-blue-600'}>
                {text}
            </span>
            {isComplete && toolCall.output && (
                <span className="text-xs text-gray-400 ml-auto border-l pl-2">
                    {toolCall.output}
                </span>
            )}
        </div>
    );
}
