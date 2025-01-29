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
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough

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
    retriever_docs = retriever.invoke(user_question)

    # 프롬포트
    prompt = PromptTemplate.from_template(
        """You are an assistant for question-answering tasks.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know.
    Answer in Korean.

    #Question : {question}

    #Context: {context}
    
    #Answer:"""
    )

    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | model
        | StrOutputParser()
    )

    ## 질문과 문맥을 넣어서 체인 결과 호출
    response = chain.invoke(user_question)

    ## 마크다운으로 변환
    if include_additional_info:
        markdown_prompt = PromptTemplate.from_template(
            """Use the following document to write a summary Markdown in Korean.
            Don't create a Markdown Table.
            Title: 참고 문서 정리
            #Document: {document}"""
        )
        markdown_model = ChatOpenAI(model="gpt-4o")
        markdown_chain = (
            {"document": RunnablePassthrough()}
            | markdown_prompt
            | markdown_model
            | StrOutputParser()
        )
        markdown_response = markdown_chain.invoke(retriever_docs)
        return response, markdown_response, retriever_docs

    return response, "", retriever_docs


# ┌───────────────── DTO ───────────────────────────
class ChatbotCompletionsRequest(BaseModel):
    question: str
    include_additional_info: bool


# ┌───────────────── API ───────────────────────────
@app.post("/api/v1/chatbot/completions")
def completions(request: ChatbotCompletionsRequest):
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


# RAG 전처리 함수
def build_knowledge_base():
    # 1. Load
    loader = PyMuPDFLoader("./files/indexed/주택청약_FAQ_202405.pdf")
    documents = loader.load()

    # 2. Split
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
    split_documents = text_splitter.split_documents(documents)

    # 3. Embed & Store
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = FAISS.from_documents(split_documents, embedding=embeddings)
    vector_store.save_local("faiss_index")


@app.get("/")
def root():
    # build_knowledge_base()
    return {"message": "지식 베이스 구축이 완료되었습니다."}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
