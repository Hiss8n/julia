import os
import io
from dotenv import load_dotenv
import cohere
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from apscheduler.schedulers.background import BackgroundScheduler
import httpx
from api.auth.routes import router as auth_router
from api.database import Base, engine
from api import models  # noqa: F401
from api.organisation.routes import router as organisation_router
from api.posts.routes import router as posts_router
from pinecone import Pinecone, TextQuery

load_dotenv()

COHERE=os.getenv("COHERE") 
PINECONE_API_KEY=os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "julia-kakuma")
PINECONE_TEXT_FIELD = os.getenv("PINECONE_TEXT_FIELD", "chunk_text")
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE", "default")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)
co = cohere.ClientV2(api_key=COHERE)

app=FastAPI()
app.include_router(auth_router)
app.include_router(organisation_router)
app.include_router(posts_router)


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)


origins=[
    "http://localhost:5173",
    "https://julia-c2n3.vercel.app", 
    "http://localhost:8000", 
                     
    ]

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
        print(f"Health check pinged,**UP RUNNING**: {response.status_code}")
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

@app.post("/upload")
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


        pinecone_documents = [
            {
                "_id": document_id,
                PINECONE_TEXT_FIELD: document,
                **metadata,
            }
            for document_id, metadata, document in zip(ids, metadatas, documents)
        ]
        index.documents.upsert(
            namespace=PINECONE_NAMESPACE,
            documents=pinecone_documents,
        )

    
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
    result = index.documents.search(
        namespace=PINECONE_NAMESPACE,
        top_k=2,
        score_by=[
            TextQuery(
                field=PINECONE_TEXT_FIELD,
                query=req.message,
            )
        ],
        include_fields=[PINECONE_TEXT_FIELD],
    )

    retrieved_context = " ".join(
        getattr(match, PINECONE_TEXT_FIELD, "")
        for match in result.matches
        if getattr(match, PINECONE_TEXT_FIELD, None)
    )
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
                5.Do not respond to valgur or sexual language.Only use polite and respond with nice words and intentions.
                FORMATTING RULES
                - **No Asterisks:** Never use the asterisk symbol (`*`) anywhere in your responses, including for bolding, italics, or bullet points.
                - **Bolding:** When bolding text use Markdown to make the text bold.
                - **Lists & Bullets:** For bulleted lists, use dashes (`-`), en dashes (`–`), or unicode symbols (like `•`) at the start of lines,
                  ensuring no asterisks are involved. For numbered lists, use standard numbers with periods (e.g., `1.`, `2.`).
                - Make the text bold if emphasis is needed.
                """

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
    

 



