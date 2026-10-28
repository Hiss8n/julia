import os
import io
from dotenv import load_dotenv
import chromadb
import cohere
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from apscheduler.schedulers.background import BackgroundScheduler
import httpx
load_dotenv()



COHERE=os.getenv("COHERE") 

co = cohere.ClientV2(
        api_key=COHERE
        )

client = cohere.ClientV2(
api_key=COHERE
) 



CHROMA_TENANT=os.getenv("CHROMA_TENANT") 
CHROMA_HOST=os.getenv("CHROMA_HOST") 
CHROMA_API_KEY=os.getenv("CHROMA_API_KEY") 
CHROMA_DATABASE=os.getenv("CHROMA_DATABASE") 



CHROMA_SERVER_HOST = os.getenv("CHROMA_SERVER_HOST", "api.trychroma.com")
CHROMA_SERVER_PORT = int(os.getenv("CHROMA_SERVER_PORT", "443"))
CHROMA_TENANT = os.getenv("CHROMA_TENANT", "")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE", "")
CHROMA_AUTH_TOKEN = os.getenv("CHROMA_AUTH_TOKEN", "") 


#Connecting to a remote/cloud Chroma instance using HttpClient or Auth tokens
chroma_client = chromadb.CloudClient(  
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
    api_key=CHROMA_AUTH_TOKEN,
    
)
print(f"anyways: {chroma_client.heartbeat()}")
 
collection =chroma_client.get_or_create_collection(
    name="agents",
    metadata={"hnsw:space": "cosine"}
)

app=FastAPI()


origins=[
    "https://julia-c2n3.vercel.app", 
    "http://localhost:8000",                   
    "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class chatQuery(BaseModel):
    message:str


def ping_health_check():
    # Replace with your actual deployed URL or localhost URL
    url = "https://julia-pycq.onrender.com" 
    try:
        response = httpx.get(url)
        print(f"Health check pinged: {response.status_code}")
    except Exception as e:
        print(f"Ping failed: {e}")

# Initialize and start the scheduler
scheduler = BackgroundScheduler()
# Run every 14 minutes
scheduler.add_job(ping_health_check, 'interval', minutes=14)
scheduler.start()


@app.get("/")
async def health():

    return{
        "name":"Hi mama",
        "status":"good!"
    }

@app.post("/uplaod")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF.")
    print("runned")
    
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        
        # Extract text from the PDF
        reader = PdfReader(pdf_file)
        documents = []
        metadatas = []
        ids = []

        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text.strip():  # Skip empty pages
                documents.append(text)
                metadatas.append({"source": file.filename, "page": page_num + 1})
                ids.append(f"{file.filename}_page_{page_num + 1}")
        
        if not documents:
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF.")

        # 4. Store documents in the remote database
        # This automatically triggers embeddings locally via embedding_function 
        # and sends the payload to your remote Chroma instance over HTTP.

        client = cohere.ClientV2(
                api_key=COHERE
            )

        response = client.embed(
                texts=[text],
                model="embed-english-v3.0",
                input_type="search_document",
                embedding_types=["float"],
                output_dimension=1024
            )
 
        collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=response.embeddings.float_[0]
            )
        print("***")
        print("done!!!")

    
       # return response.embeddings.float_[0]

      
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_stored": len(documents)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/query")
def chat(req:chatQuery):
    vec = co.embed(
        texts=[req.message],
        model="embed-english-v3.0",
        input_type="search_query",
        embedding_types=["float"],
        output_dimension=1024
    )
    #print(f"EMD{response.embeddings.float_[0]}")
    
    result=collection.query(
    query_embeddings=[
        vec.embeddings.float_[0]
    ],
    n_results=2
    )

    retrieved_context = " ".join(result['documents'][0])
    #print(f"ret{retrieved_context}")
   
    user_prompt = f"Context:\n{retrieved_context}\n\nQuestion: {req.message}"
    response = co.chat(
        model="command-a-plus-05-2026",
        messages=[
            {
                "role":"system",
                "content":"""You are a precise, direct, assistant. 
                CRITICAL CONSTRAINTS:
                1. Lead with the direct answer in the very first sentence. 
                2. Be concise. Provide only the essential reasoning or evidence required to support the answer. Do not add filler text or introductory phrases like "Here is your answer."
                3. Do not hedge, generalize, or say "it depends" unless you explicitly define the exact variables it depends on.
                4. If you do not know the answer or lack sufficient context, state "I do not have information about that." plainly. Do not hallucinate or guess.

                FORMATTING:
                - Use bullet points for lists. 
                - Bold key terms or figures for readability.
                - Strictly adhere to a professional, academic tone."""

            },
            {
                "role": "user",
                "content":user_prompt
            }
        ],
        
    )
    answer_text = ""
    for content in response.message.content:
        # Check if the content block is a text type and contains a text attribute
        if getattr(content, "type", None) == "text" and hasattr(content, "text"):
            answer_text = content.text
            break

    # Fallback if no explicit text type was found
    if not answer_text and len(response.message.content) > 0:
        # If the item has a 'text' attribute directly, use it
        if hasattr(response.message.content[0], "text"):
            answer_text = response.message.content[0].text

    return {"answer": answer_text}
    

 



