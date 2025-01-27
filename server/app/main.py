# 환경변수 불러오기
from dotenv import load_dotenv

load_dotenv()

# 기타 라이브러리 Import
from fastapi import FastAPI, Response
from pydantic import BaseModel
from typing import List

import uvicorn
import base64
import fitz  # PyMuPDF
import os
import re

# 라이브러리 Import
from langchain_core.documents.base import Document
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.runnables import Runnable
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser

# CORS 미들웨어 Import
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ┌───────────────── Middleware ───────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ┌───────────────── Function ───────────────────────────
# PDF 파일을 List[Document]로 변환
def read_pdf(file_path: str) -> List[Document]:
    response = []
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    for document in documents:
        document.metadata["file_path"] = file_path

    response.extend(documents)
    return response


# List[Document]를 벡터 DB에 저장
def save_to_vector_store(documents: List[Document]) -> None:
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = FAISS.from_documents(documents, embedding=embeddings)
    vector_store.save_local("faiss_index")


def convert_pdf_to_images(pdf_path: str, dpi: int = 250) -> List[str]:
    doc = fitz.open(pdf_path)  # 문서 열기
    image_paths = []

    # 이미지 저장용 폴더 생성
    output_folder = "files/indexed/images/주택청약_FAQ_202405/"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for page_num in range(len(doc)):  #  각 페이지를 순회
        page = doc.load_page(page_num)  # 페이지 로드

        zoom = dpi / 72  # 72이 디폴트 DPI
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)  # type: ignore

        image_path = os.path.join(
            output_folder, f"page_{page_num + 1}.png"
        )  # 페이지 이미지 저장 page_1.png, page_2.png, etc.
        pix.save(image_path)  # PNG 형태로 저장
        image_paths.append(image_path)  # 경로를 저장

    return image_paths


def natural_sort_key(s):
    return [int(text) if text.isdigit() else text for text in re.split(r"(\d+)", s)]


# 마크다운 문서로 참고 문서 요약 정리
def convertMarkdown() -> Runnable:
    template = """
    다음의 문서를 가지고 마크다운(Markdown)으로 간단하게 요약 정리해서 작성해줘
    - 마크다운 Table은 만들지 말아줘
    - 곧바로 응답결과를 말해줘
    - 제목: 참고 문서 정리
        문서: {document}
    """

    custom_rag_prompt = PromptTemplate.from_template(template)
    model = ChatOpenAI(model="gpt-4o-mini")

    return custom_rag_prompt | model | StrOutputParser()


# RAG Chain
def get_rag_chain() -> Runnable:
    template = """
    다음의 컨텍스트를 활용해서 질문에 답변해줘
    - 질문에 대한 응답을 해줘
    - 간결하게 5줄 이내로 해줘
    - 곧바로 응답결과를 말해줘
    - 너의 이름은 주택청약 FAQ 도우미야

    컨텍스트 : {context}

    질문: {question}

    응답:"""

    custom_rag_prompt = PromptTemplate.from_template(template)
    model = ChatOpenAI(model="gpt-4o-mini")

    return custom_rag_prompt | model | StrOutputParser()


# 사용자 질문에 대한 RAG 처리
def process_question(user_question: str, include_additional_info: bool):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    ## 벡터 DB 호출
    new_db = FAISS.load_local(
        "faiss_index", embeddings, allow_dangerous_deserialization=True
    )

    ## 관련 문서 3개를 호출하는 Retriever 생성
    retriever = new_db.as_retriever(search_kwargs={"k": 3})

    ## 사용자 질문을 기반으로 관련문서 3개 검색
    retrieve_docs: List[Document] = retriever.invoke(user_question)

    ## RAG 체인 선언
    chain = get_rag_chain()

    ## 질문과 문맥을 넣어서 체인 결과 호출
    response = chain.invoke({"question": user_question, "context": retrieve_docs})

    ## 마크다운으로 변환
    if include_additional_info:
        chain = convertMarkdown()
        markdownResponse = chain.invoke({"document": retrieve_docs})
        return response, markdownResponse, retrieve_docs

    return response, "", retrieve_docs


# ┌───────────────── DTO ───────────────────────────
class ChatbotCompletionsRequest(BaseModel):
    question: str
    include_additional_info: bool


# ┌───────────────── API ───────────────────────────
@app.post("/api/v1/chatbot/completions")
def completions(request: ChatbotCompletionsRequest):
    print(request.question)
    # 사용자 질문 처리
    response, markdownResponse, context = process_question(
        request.question, request.include_additional_info
    )

    # 메타데이터 설정
    documents = []
    for document in context:
        documents.append(
            {"page_content": document.page_content, "metadata": document.metadata}
        )

    # PDF 이미지 설정
    image_folder = "./files/indexed/images/주택청약_FAQ_202405/"
    images = sorted(os.listdir(image_folder), key=natural_sort_key)
    image_paths = [os.path.join(image_folder, image) for image in images]

    pdf_images_base64 = []
    for document in context:
        page_num = document.metadata.get("page")
        image_bytes = open(image_paths[page_num - 1], "rb").read()

        # bytes를 base64 문자열로 변환
        base64_encoded = base64.b64encode(image_bytes).decode("utf-8")
        pdf_images_base64.append(base64_encoded)

    answer = response
    markdown_summary = markdownResponse

    return {
        "markdown_summary": markdown_summary,
        "pdf_images_base64": pdf_images_base64,
        "answer": answer,
        "documents": documents,
    }


@app.get("/")
def root():
    return {"message": "Hello World!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
