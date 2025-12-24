from fastapi import APIRouter, Request, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
import asyncio
import json
import random
from typing import AsyncGenerator
import os

router = APIRouter()

# Data Models
class ChatRequest(BaseModel):
    messages: list
    model: str = "gpt-4-turbo"

# Mock PDF path
DEMO_PDF_PATH = os.path.join(os.getcwd(), "..", "CalQuity Full Stack AI Developer Take-Home Assignment.pdf")

async def chat_generator(query: str) -> AsyncGenerator[str, None]:
    """
    Simulates an AI generation process with tool calls and citations.
    """
    # 1. Start Tool: Search
    yield f"data: {json.dumps({'type': 'tool_start', 'tool': 'search_documents', 'input': query})}\n\n"
    await asyncio.sleep(1.5) # Simulate latency
    yield f"data: {json.dumps({'type': 'tool_end', 'output': 'Found relevant assignments.'})}\n\n"

    # 2. Start Tool: Read PDF
    yield f"data: {json.dumps({'type': 'tool_start', 'tool': 'read_pdf', 'input': 'assignment.pdf'})}\n\n"
    await asyncio.sleep(1.0)
    yield f"data: {json.dumps({'type': 'tool_end', 'output': 'Extracted text from PDF.'})}\n\n"

    # 3. Stream Repsonse with Citations
    response_text = "Based on the assignment details, the task involves building a Full Stack AI application."
    words = response_text.split()
    
    # Send citation early
    citation = {
        "type": "citation", 
        "id": 1, 
        "source": "CalQuity Assignment.pdf", 
        "page_number": 1, 
        "quote": "Build a Perplexity-style chat interface"
    }
    yield f"data: {json.dumps(citation)}\n\n"

    for word in words:
        await asyncio.sleep(0.1)
        yield f"data: {json.dumps({'type': 'token', 'content': word + ' '})}\n\n"
        
        # Inject another citation mid-stream
        if "AI" in word:
             citation2 = {
                "type": "citation", 
                "id": 2, 
                "source": "CalQuity Assignment.pdf", 
                "page_number": 2, 
                "quote": "Server-Sent Events (SSE) for real-time streaming"
            }
             yield f"data: {json.dumps(citation2)}\n\n"

    yield f"data: {json.dumps({'type': 'done'})}\n\n"

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    last_message = request.messages[-1]['content'] if request.messages else ""
    return StreamingResponse(chat_generator(last_message), media_type="text/event-stream")

@router.get("/pdf/url")
def get_pdf_url():
    """Returns the URL/path to the demo PDF"""
    # In a real app, this might be a signed URL or static file path
    return {"url": "/api/pdf/content"}

@router.get("/pdf/content")
def get_pdf_content():
    """Serves the actual PDF file"""
    if os.path.exists(DEMO_PDF_PATH):
        return FileResponse(DEMO_PDF_PATH, media_type="application/pdf")
    return {"error": "PDF not found"}
