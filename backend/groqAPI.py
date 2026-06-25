import os
from groq import Groq

chat_history = []

def ask_groq_fast(user_prompt):
    global chat_history
    client = Groq(api_key="ENTER_YOUR_GROQ_API_HERE")

    chat_history.append({"role": "user", "content": user_prompt})
    
    if len(chat_history) > 12:
        chat_history = chat_history[-12:]

    messages = [
        {
            "role": "system",
            "content": "You are a friendly assistant you generally use 'bro' as interaction with user and currently in Assistant named Sh1v developed by Shivam. Answer in short only."
        }
    ] + chat_history

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.4,
            max_tokens=100, 
        )
        
        assistant_response = completion.choices[0].message.content
        chat_history.append({"role": "assistant", "content": assistant_response})
        return assistant_response
        
    except Exception as e:
        chat_history.pop()
        terminal = f"Error: {e}"
        chat = "I've encountered an error while going through your request. Make sure your API key is correct and working, and your internet is on.\nThank you."
        return terminal, chat

if __name__ == "__main__":
    while True:
        user_input = input("type command : ")
        if user_input.lower() in ["exit", "quit"]:
            break
        print(ask_groq_fast(user_input))
