import asyncio
from typing import Dict, Optional
import uuid

class QueueManager:
    def __init__(self):
        # In-memory queue for tasks
        self.queue = asyncio.Queue()
        # Store results/status by request_id (in a real app, use Redis/DB)
        self.results: Dict[str, dict] = {}
    
    async def enqueue_request(self, query: str, conversation_id: str) -> str:
        request_id = str(uuid.uuid4())
        task_data = {
            "request_id": request_id,
            "query": query,
            "conversation_id": conversation_id,
            "status": "queued"
        }
        await self.queue.put(task_data)
        self.results[request_id] = task_data
        return request_id

    async def get_next_task(self):
        return await self.queue.get()

    def task_done(self):
        self.queue.task_done()

# Global instance
queue_manager = QueueManager()
