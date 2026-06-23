import os
from groq import Groq

def ask_groq_fast(user_prompt):
    client = Groq(api_key="ENTER_YOUR_GROQ_API_HERE")

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a friendly assistant you generally use 'bro' as interaction with user and currently in Assistant named named Sh1v developed by Shivam. Answer in short only."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.4,
            max_tokens=100, 
        )
        return completion.choices[0].message.content
    except Exception as e:
        terminal = f"Error: {e}"
        chat = f"I've encountered a error while going through your request make sure your API key is correct and working also your internet is on.\nThank you."
        return terminal, chat
        
if __name__ == "__main__":
    input = input("type command : ")
    ask_groq_fast(input)