#=========IMPORTS=======================
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

import os
from groq import Groq
from dotenv import load_dotenv
# =====================================

load_dotenv()  # Load environment variables

# Set the API_KEY for invoking the LLM
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Initialize the client with your API key
client = Groq(api_key=GROQ_API_KEY)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLInput(BaseModel):
    """
    A Pydantic model for representing a URL input.
    
    Attributes:
        url (str): The URL provided as input.
    """
    url: str

def chunk_text(text, max_length):
    """
    Split a given text into smaller chunks, ensuring each chunk does not 
    exceed the specified maximum length.
    
    Args:
        text (str): The input text to be divided into smaller chunks.
        max_length (int): The maximum allowed length (in words) for each chunk.

    Returns:
        list: A list of text chunks, each with a length less than or equal 
              to the specified max_length.
    """
    words = text.split()
    return [' '.join(words[i:i + max_length]) for i in range(0, len(words), max_length)]

def Summarizer(message):
    """
    Sends a website text to the LLM model and returns the summarized response.

    Parameters:
        message (str): The input message (from the user) that will be sent to the model.
       
        str: The generated response from the LLM.
    """
    prompt = f"Summarize the following in detail:\n{message}"
    
    completion = client.chat.completions.create(
        model="llama3-70b-8192",  # The model being used
        messages=[{"role": "user", "content": prompt}],
        temperature=0  # Setting the temperature to 0 for deterministic output
    )

    return completion.choices[0].message.content

def read(message):
    """
    Sends a website text to the LLM model and returns the main content as response.

    Parameters:
        message (str): The input message (from the user) that will be sent to the model.
       

    Returns:
        str: The generated response from the LLM.
    """
    prompt =  """
            "role": "system",
            "content": '''
You are given a webscrapped content. ignore everything and just give the main body of the website. 

"""
    
    completion = client.chat.completions.create(
        model="llama3-70b-8192",  # The model being used
        messages=[{"role": "user", "content": prompt + "\n\n" + message}],
        temperature=0  # Setting the temperature to 0 for deterministic output
    )

    return completion.choices[0].message.content


def extract_and_process(url, action):
    """
    Extracts text content from a webpage and processes it for the specified action.

    Args:
        url (str): The URL of the webpage to extract and process.
        action (str): The action to perform, either "read" or "summarize".

    Returns:
        str: The processed content based on the specified action.

    Raises:
        HTTPException: If an error occurs during the extraction or processing.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad HTTP responses (4xx, 5xx)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Remove <script> and <style> tags
        for tag in soup(['script', 'style']):
            tag.decompose()

        # Extract visible text
        content = soup.get_text(separator="\n", strip=True)

        # Clean up extra whitespace
        content = '\n'.join(line.strip() for line in content.splitlines() if line.strip())

        # Break content into chunks for processing
        chunks = chunk_text(content, max_length=1024)
        if action == "read":
            processed_chunks = [read(content)] 
        else:
            processed_chunks = [Summarizer(chunk) for chunk in chunks]

        return ' '.join(processed_chunks)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process content: {str(e)}")

@app.post("/process_url")
async def process_url(url_input: URLInput, action: str = Query(..., regex="^(read|summarize)$")):
    """
    API endpoint to process a URL and return a summarized or read version of its content.

    Args:
        url_input (URLInput): A Pydantic model containing the URL to be processed.
        action (str): The action to perform, either "read" or "summarize".

    Returns:
        dict: A dictionary containing the processed content.

    Raises:
        HTTPException: If an error occurs during the processing.
    """
    try:
        result = extract_and_process(url_input.url, action=action)
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    """
    Entry point for the FastAPI application. Launches the server on host 0.0.0.0 and port 8000.
    """
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
