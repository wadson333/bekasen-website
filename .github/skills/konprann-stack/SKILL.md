---
name: fastapi-rag
description: Skill spécialisé pour implémenter le système RAG de Konprann avec FastAPI, LangChain et Qdrant. Utiliser pour tout endpoint lié au Tuteur IA, à l'ingestion de livres, ou à la recherche sémantique.
---

# FastAPI + RAG — Konprann Skill

## Pattern Standard d'un Endpoint RAG

```python
# app/api/v1/tutor.py
from langchain_community.vectorstores import Qdrant
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.rag import KonprannRAG

router = APIRouter(prefix="/tutor", tags=["Tuteur IA"])

@router.post("/ask", response_model=TutorResponse)
async def ask_tutor(
    request: TutorRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_student),
    rag: KonprannRAG = Depends(get_rag),
) -> TutorResponse:
    # 1. Récupère les livres prioritaires de l'école de l'élève
    priority_books = await school_service.get_priority_books(
        db, current_user.school_id
    )
    # 2. Recherche sémantique avec boost école
    chunks = await rag.search(
        query=request.question,
        priority_school_ids=[str(current_user.school_id)] if current_user.school_id else [],
        top_k=5,
    )
    # 3. Génération avec le mode choisi
    response = await rag.generate(
        question=request.question,
        chunks=chunks,
        mode=request.mode,  # academique|creole|analogie|schema
        level=current_user.level,
    )
    return response
```

## Classe KonprannRAG Principale

```python
# app/core/rag.py
class KonprannRAG:
    def __init__(self, qdrant_client, llm, embeddings):
        self.qdrant = qdrant_client
        self.llm = llm
        self.embeddings = embeddings

    async def search(
        self,
        query: str,
        priority_school_ids: List[str],
        top_k: int = 5,
    ) -> List[DocumentChunk]:
        query_embedding = self.embeddings.embed_query(query)
        results = self.qdrant.search(
            collection_name="konprann_docs",
            query_vector=query_embedding,
            limit=top_k * 2,  # Surcharger pour le re-ranking
        )
        # Boost des documents prioritaires de l'école
        for result in results:
            if result.payload.get("school_id") in priority_school_ids:
                result.score += 0.2
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    async def generate(
        self,
        question: str,
        chunks: List[DocumentChunk],
        mode: str,
        level: str,
    ) -> TutorResponse:
        prompt = self._build_prompt(question, chunks, mode, level)
        answer = await self.llm.agenerate(prompt)
        return TutorResponse(
            answer=answer,
            sources=[self._extract_source(c) for c in chunks],
            mode=mode,
        )

    def _build_prompt(self, question, chunks, mode, level) -> str:
        mode_instructions = {
            "academique": "Réponds en français académique formel.",
            "creole": "Réponds en créole haïtien simple et naturel.",
            "analogie": "Explique avec une analogie de la vie quotidienne haïtienne.",
            "schema": "Génère un schéma textuel clair (tableau ou diagramme ASCII).",
        }
        context = "\n\n".join([
            f"[Source: {c.document}, p.{c.page}]\n{c.text}"
            for c in chunks
        ])
        return f"""Tu es Konprann, un tuteur IA pour les élèves haïtiens de niveau {level}.
{mode_instructions[mode]}
IMPORTANT : Base ta réponse UNIQUEMENT sur le contexte fourni. Cite toujours la source.

Contexte :
{context}

Question : {question}

Réponse :"""
```

## Pipeline d'Ingestion Celery

```python
# app/tasks/ingestion.py
@celery_app.task(bind=True, max_retries=3)
def ingest_document(self, document_id: str):
    try:
        doc = get_document(document_id)
        # 1. Extraction
        text = extract_text(doc)  # PyMuPDF ou Tesseract
        # 2. Chunking
        chunks = text_splitter.split_text(text)  # 512 tokens, overlap 50
        # 3. Embeddings batch
        embeddings = embedder.embed_documents(chunks)
        # 4. Indexation avec métadonnées
        qdrant_client.upsert(
            collection_name="konprann_docs",
            points=[
                PointStruct(
                    id=str(uuid4()),
                    vector=emb,
                    payload={
                        "text": chunk,
                        "document_id": document_id,
                        "title": doc.title,
                        "subject": doc.subject,
                        "level": doc.level,
                        "page": page_num,
                        "school_id": doc.school_id,
                        "priority_school_ids": doc.priority_school_ids,
                    }
                )
                for chunk, emb, page_num in zip(chunks, embeddings, page_numbers)
            ]
        )
        update_document_status(document_id, "indexed")
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```
