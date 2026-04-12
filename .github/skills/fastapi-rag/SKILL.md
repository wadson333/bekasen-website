---
name: fastapi-rag
description: Skill complet pour le système RAG de Konprann avec FastAPI, LangChain, Qdrant et Celery. Couvre l'ingestion de documents, la recherche vectorielle avec boost école, et la génération de réponses sourcées.
---

# FastAPI RAG — Konprann Skill

## Structure des Services IA

```
backend/app/
├── core/
│   ├── rag.py              ← Classe KonprannRAG principale
│   ├── embeddings.py       ← Gestion des modèles d'embedding
│   └── llm.py              ← Initialisation et gestion du LLM
├── services/
│   ├── tutor_service.py    ← Logique métier du tuteur IA
│   ├── ingestion_service.py ← Pipeline d'ingestion documents
│   └── phoneme_service.py  ← Moteur phonémique volet Fondation
├── tasks/
│   ├── ingestion.py        ← Celery task: indexation documents
│   └── notifications.py    ← Celery task: notifications push
└── api/v1/
    ├── tutor.py            ← Endpoints tuteur IA Excellence
    └── fondation.py        ← Endpoints IA volet Fondation
```

## Initialisation du LLM et des Embeddings

```python
# app/core/llm.py
from langchain_community.llms import LlamaCpp
from langchain_community.embeddings import HuggingFaceEmbeddings

def get_llm():
    return LlamaCpp(
        model_path="/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        n_ctx=4096,
        n_threads=8,
        temperature=0.1,          # Faible pour rester factuel
        max_tokens=1024,
        verbose=False,
    )

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
```

## Classe KonprannRAG Complète

```python
# app/core/rag.py
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

class KonprannRAG:
    COLLECTION = "konprann_docs"

    def __init__(self, qdrant: QdrantClient, llm, embeddings):
        self.qdrant = qdrant
        self.llm = llm
        self.embeddings = embeddings

    async def search(
        self,
        query: str,
        top_k: int = 5,
        subject: Optional[str] = None,
        level: Optional[str] = None,
        priority_school_ids: List[str] = [],
    ) -> List[DocumentChunk]:
        query_vector = self.embeddings.embed_query(query)

        # Filtre optionnel par matière et niveau
        filters = []
        if subject:
            filters.append(FieldCondition(key="subject", match=MatchValue(value=subject)))
        if level:
            filters.append(FieldCondition(key="level", match=MatchValue(value=level)))

        results = self.qdrant.search(
            collection_name=self.COLLECTION,
            query_vector=query_vector,
            query_filter=Filter(must=filters) if filters else None,
            limit=top_k * 3,  # Sur-récupérer pour le re-ranking
            with_payload=True,
        )

        # Boost des documents prioritaires de l'école
        for r in results:
            school_ids = r.payload.get("priority_school_ids", [])
            if any(sid in priority_school_ids for sid in school_ids):
                r.score += 0.2

        results.sort(key=lambda x: x.score, reverse=True)
        return [self._to_chunk(r) for r in results[:top_k]]

    async def generate(
        self,
        question: str,
        chunks: List[DocumentChunk],
        mode: Literal["academique", "creole", "analogie", "schema"],
        level: str,
    ) -> TutorResponse:
        prompt = self._build_prompt(question, chunks, mode, level)
        # Cache Redis : clé = hash(question + mode + level)
        cache_key = f"rag:{hashlib.md5(f'{question}{mode}{level}'.encode()).hexdigest()}"
        cached = await redis.get(cache_key)
        if cached:
            return TutorResponse.model_validate_json(cached)

        raw_answer = self.llm.invoke(prompt)
        response = TutorResponse(
            answer=raw_answer,
            sources=[self._to_source(c) for c in chunks],
            mode=mode,
        )
        # Cache 24h
        await redis.setex(cache_key, 86400, response.model_dump_json())
        return response

    def _build_prompt(self, question, chunks, mode, level) -> str:
        MODES = {
            "academique": "Réponds en français académique rigoureux avec vocabulaire technique.",
            "creole": "Réponds en créole haïtien simple, naturel et accessible.",
            "analogie": "Explique via une analogie tirée de la vie quotidienne haïtienne concrète.",
            "schema": "Génère un schéma ou tableau ASCII structuré et clair.",
        }
        context = "\n\n---\n\n".join([
            f"[Source: {c.document}, Chapitre: {c.chapter}, Page {c.page}]\n{c.text}"
            for c in chunks
        ])
        return f"""Tu es Konprann, tuteur IA pour élèves haïtiens de niveau {level}.
{MODES[mode]}
Base ta réponse UNIQUEMENT sur le contexte fourni ci-dessous. Cite systématiquement tes sources.
Si le contexte ne contient pas la réponse, dis-le clairement.

=== CONTEXTE ===
{context}
=== FIN CONTEXTE ===

Question : {question}

Réponse :"""

    def _to_chunk(self, result) -> DocumentChunk:
        return DocumentChunk(
            text=result.payload["text"],
            document=result.payload["title"],
            subject=result.payload.get("subject", ""),
            level=result.payload.get("level", ""),
            chapter=result.payload.get("chapter", ""),
            page=result.payload.get("page", 0),
            score=result.score,
        )

    def _to_source(self, chunk: DocumentChunk) -> Source:
        return Source(
            document=chunk.document,
            chapter=chunk.chapter,
            page=chunk.page,
            excerpt=chunk.text[:200] + "..." if len(chunk.text) > 200 else chunk.text,
        )
```

## Pipeline Celery — Ingestion Complète

```python
# app/tasks/ingestion.py
import fitz  # PyMuPDF
import pytesseract
from langchain.text_splitter import RecursiveCharacterTextSplitter
from celery import shared_task

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " "],
)

@shared_task(bind=True, max_retries=3, queue="ingestion")
def ingest_document_task(self, document_id: str):
    try:
        doc = get_document_sync(document_id)
        update_status(document_id, "processing")

        # 1. Extraction du texte
        if doc.file_type == "pdf":
            text_by_page = extract_pdf(doc.file_path)
        elif doc.file_type in ["jpg", "png"]:
            text_by_page = extract_image_ocr(doc.file_path)
        else:
            raise ValueError(f"Type non supporté: {doc.file_type}")

        # 2. Chunking avec préservation des numéros de page
        all_points = []
        for page_num, page_text in text_by_page.items():
            chunks = text_splitter.split_text(page_text)
            if not chunks:
                continue

            # 3. Embeddings en batch
            embeddings = embedder.embed_documents(chunks)

            for chunk_text, embedding in zip(chunks, embeddings):
                all_points.append(PointStruct(
                    id=str(uuid4()),
                    vector=embedding,
                    payload={
                        "text": chunk_text,
                        "document_id": document_id,
                        "title": doc.title,
                        "subject": doc.subject,
                        "level": doc.level,
                        "chapter": extract_chapter(chunk_text),
                        "page": page_num,
                        "language": doc.language,
                        "school_id": str(doc.school_id) if doc.school_id else None,
                        "priority_school_ids": [str(s) for s in doc.priority_school_ids],
                    }
                ))

        # 4. Indexation en batch dans Qdrant
        qdrant_client.upsert(
            collection_name="konprann_docs",
            points=all_points,
            wait=True,
        )

        update_status(document_id, "indexed", chunks_count=len(all_points))

    except Exception as exc:
        update_status(document_id, "failed", error=str(exc))
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))

def extract_pdf(file_path: str) -> dict[int, str]:
    """Extrait le texte d'un PDF page par page."""
    doc = fitz.open(file_path)
    pages = {}
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        if len(text.strip()) < 50:
            # PDF scanné — fallback OCR
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img, lang="fra+hat")
        if text.strip():
            pages[page_num] = clean_text(text)
    return pages

def clean_text(text: str) -> str:
    """Nettoyage du texte extrait."""
    import re
    text = re.sub(r'\n{3,}', '\n\n', text)     # Max 2 sauts de ligne
    text = re.sub(r'[ \t]+', ' ', text)          # Espaces multiples
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)  # Numéros de page seuls
    return text.strip()
```
