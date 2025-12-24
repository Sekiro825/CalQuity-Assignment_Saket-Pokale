export interface Citation {
  id: number;
  source: string;
  page_number: number;
  quote: string;
}

export interface ToolCall {
  tool: string;
  input: string;
  output?: string;
  status: 'running' | 'completed';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}
