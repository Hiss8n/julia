# Julia Backend API

This directory contains the FastAPI backend for Julia. It accepts PDF uploads, stores extracted page text in Chroma Cloud, and answers questions using retrieved text and Cohere.

## Requirements

- Python 3.10 or newer
- A Cohere API key
- A Chroma Cloud tenant, database, and API key
- For deployment: a Vercel account and the Vercel CLI, or a Git repository connected to Vercel

## Configuration

Create a `.env` file in this directory for local development:

```env
COHERE=your_cohere_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
CHROMA_API_KEY=your_chroma_api_key
CHROMA_HOST=your_chroma_host
```

The application reads these values when it starts. `COHERE`, `CHROMA_TENANT`, `CHROMA_DATABASE`, and `CHROMA_API_KEY` are used by the current implementation. `CHROMA_HOST` is read but is not currently used to construct the Chroma Cloud client. Do not commit `.env` or put secret values in source control.

## Run Locally

From the `backend` directory, create and activate a virtual environment, then install the dependencies:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API with Uvicorn:

```powershell
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`; the health endpoint is `http://localhost:8000/`.

## API Endpoints

### `GET /`

Health check. Returns a small JSON status response:

```json
{
	"name": "Hi mama",
	"status": "good!"
}
```

### `POST /uplaod`

Uploads a PDF as `multipart/form-data` using the field name `file`. The path is spelled `/uplaod` in the current backend, so clients must use that exact path. The endpoint extracts text from PDF pages and attempts to store it in the Chroma collection named `agents`.

Example with curl:

```sh
curl -X POST http://localhost:8000/uplaod \
	-F "file=@document.pdf"
```

A successful response includes `status`, `filename`, and `chunks_stored`. Non-PDF files and PDFs with no extractable text are rejected. The current upload implementation embeds only one text value while upserting all extracted pages, so multi-page uploads may fail; this behavior should be corrected in the implementation before relying on multi-page ingestion.

### `POST /query`

Accepts a JSON object with a `message` string, embeds the question, retrieves up to two matching documents from Chroma, and returns a Cohere-generated answer.

Request:

```json
{
	"message": "What does the document say about ...?"
}
```

Example:

```sh
curl -X POST http://localhost:8000/query \
	-H "Content-Type: application/json" \
	-d "{\"message\":\"Summarize the uploaded document\"}"
```

Response:

```json
{
	"answer": "The generated answer."
}
```

## Deploy to Vercel

The included `vercel.json` configures `api/main.py` as a Python serverless function and routes incoming paths to the FastAPI application. Deploy this backend as its own Vercel project with the **Root Directory** set to `backend`.

### Vercel Dashboard

1. Import the repository into Vercel and select the `backend` directory as the project root.
2. In the project settings, add these environment variables for the deployments you plan to use: `COHERE`, `CHROMA_TENANT`, `CHROMA_DATABASE`, and `CHROMA_API_KEY`. Set `CHROMA_HOST` too if retaining the current configuration; it is read but currently unused.
3. Keep the framework preset as **Other**. The Vercel Python builder uses `vercel.json` and `requirements.txt`; no separate build command is needed.
4. Deploy the project. After deployment, check the deployment URL at `/` and open `/docs` to inspect the API.

### Vercel CLI

Install and authenticate the Vercel CLI, then run these commands from the `backend` directory:

```sh
npm install --global vercel
vercel login
vercel
```

On the first deployment, follow the prompts to link or create a project. Add the secrets to the linked Vercel project through **Project Settings > Environment Variables** (or `vercel env add`), and ensure they are enabled for the target environment. Deploy to production with:

```sh
vercel --prod
```

After changing environment variables in Vercel, redeploy so the new values are available to the function. Use the deployment URL in place of `http://localhost:8000` when calling the API.

## Notes

- CORS currently allows all origins. Restrict `allow_origins` in `api/main.py` to the frontend's deployed origin before using the API in production.
- Vercel functions are serverless. Treat Chroma Cloud as the persistent store; do not rely on files written to the function's local filesystem to persist between requests.
- The upload route currently has the spelling `/uplaod`; changing it requires updating any frontend client that calls it.
