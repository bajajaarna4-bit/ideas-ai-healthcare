from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import generate_chat_response
from app.database import get_connection

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # Validate non-empty content
    clean_message = request.message.strip()
    if not clean_message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty or solely whitespace."
        )

    if len(clean_message) > 2000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message exceeds the maximum allowed length of 2000 characters."
        )

    try:
        response = await generate_chat_response(clean_message, request.language)

        # Log conversation in database
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_messages (role, content, language, category) VALUES (?, ?, ?, ?)",
            ("user", clean_message, request.language, request.category)
        )
        cursor.execute(
            "INSERT INTO chat_messages (role, content, language, category) VALUES (?, ?, ?, ?)",
            ("assistant", response.reply, request.language, request.category)
        )
        conn.commit()
        conn.close()

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the health response: {str(e)}"
        )

@router.get("/history")
def get_chat_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, role, content, language, category, created_at FROM chat_messages ORDER BY id ASC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@router.delete("/history")
def clear_chat_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_messages")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Chat history cleared successfully."}
