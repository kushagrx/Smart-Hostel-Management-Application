"""FastAPI server for the AI chatbot service."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import psycopg2

from config import DATABASE_URL, AI_SERVICE_PORT
from chatbot.chain import create_agent, format_chat_history

app = FastAPI(title="SmartStay AI Service")


# ─── Request / Response Models ───

class ChatRequest(BaseModel):
    message: str
    student_id: Optional[int] = None
    user_role: str = "student"  # "student" or "admin"
    chat_history: list = []     # list of {"role": "user"|"assistant", "content": "..."}


class ChatResponse(BaseModel):
    reply: str
    sources_used: list = []


# ─── Helper: Fetch Hostel Context ───

def get_hostel_context() -> str:
    """Pull hostel info from the database for the system prompt."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT name, address, contact_email, contact_phone, warden_name FROM hostel_info LIMIT 1")
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return (
                f"Hostel Name: {row[0]}\n"
                f"Address: {row[1]}\n"
                f"Contact: {row[2]} / {row[3]}\n"
                f"Warden: {row[4]}"
            )
    except Exception as e:
        print(f"Error fetching hostel context: {e}")
        pass
    return "Smart Hostel"


def get_student_context(student_id: int) -> str:
    """Pull the requesting student's info for personalized responses."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("""
            SELECT u.full_name, s.roll_no, s.dues, r.room_number
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN room_allocations ra ON s.id = ra.student_id AND ra.is_active = true
            LEFT JOIN rooms r ON ra.room_id = r.id
            WHERE s.id = %s
        """, (student_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return f"Student ID: {student_id}, Name: {row[0]}, Roll: {row[1]}, Dues: ₹{row[2] or 0}, Room: {row[3] or 'N/A'}"
    except Exception as e:
         print(f"Error fetching student context: {e}")
         pass
    return ""


# ─── Main Chat Endpoint ───

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        hostel_ctx = get_hostel_context()
        student_ctx = get_student_context(req.student_id) if req.student_id else ""

        agent = create_agent(hostel_ctx, student_ctx)
        history = format_chat_history(req.chat_history)

        result = agent.invoke({
            "input": req.message,
            "chat_history": history,
        })

        output_val = result["output"]
        if isinstance(output_val, list):
            text_blocks = []
            for item in output_val:
                if isinstance(item, dict) and "text" in item:
                    text_blocks.append(item["text"])
                elif isinstance(item, str):
                    text_blocks.append(item)
            output_val = "".join(text_blocks)
        elif not isinstance(output_val, str):
            output_val = str(output_val)

        return ChatResponse(
            reply=output_val,
            sources_used=[]  # Can be populated from tool usage
        )

    except Exception as e:
        print(f"AI Chat Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-chatbot"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=AI_SERVICE_PORT)
