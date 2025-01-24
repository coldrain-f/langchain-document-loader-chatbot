from fastapi import FastAPI
from typing import List
import uvicorn 
import os

# 라이브러리 임포트
from langchain_core.documents.base import Document
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.runnables import Runnable
from langchain.prompts import PromptTemplate
from langchain.schema.output_parser import StrOutputParser

# 환경변수 불러오기
from dotenv import load_dotenv, dotenv_values

# CORS 설정
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PDF 파일을 List[Document]로 변환
def read_pdf(file_path: str) -> List[Document]:    
    response = []
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    for document in documents:
        document.metadata['file_path'] = file_path
    
    response.extend(documents)
    return response

# List[Document]를 벡터 DB에 저장
def save_to_vector_store(documents: List[Document]) -> None:
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = FAISS.from_documents(documents, embedding=embeddings)
    vector_store.save_local('faiss_index')

def get_rag_chain() -> Runnable:
    template = """
    다음의 컨텍스트를 활용해서 질문에 답변해줘
    - 질문에 대한 응답을 해줘
    - 간결하게 5줄 이내로 해줘
    - 곧바로 응답결과를 말해줘

    컨텍스트 : {context}

    질문: {question}

    응답:"""

    custom_rag_prompt = PromptTemplate.from_template(template)
    model = ChatOpenAI(model="gpt-4o-mini")

    return custom_rag_prompt | model | StrOutputParser()

# 사용자 질문에 대한 RAG 처리
def process_question(user_question: str):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    ## 벡터 DB 호출
    new_db = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

    ## 관련 문서 3개를 호출하는 Retriever 생성
    retriever = new_db.as_retriever(search_kwargs={"k": 3})
    ## 사용자 질문을 기반으로 관련문서 3개 검색 
    retrieve_docs : List[Document] = retriever.invoke(user_question)

    ## RAG 체인 선언
    chain = get_rag_chain()
    ## 질문과 문맥을 넣어서 체인 결과 호출
    response = chain.invoke({"question": user_question, "context": retrieve_docs})

    return response, retrieve_docs

@app.get("/question/{question}")
def question(question: str):
    # 환경변수 불러오기
    load_dotenv()
    
    print(question)
    
    # 사용자 질문 처리
    response, context = process_question(question)
    
    return {
            "content": response,
            "documents": [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in context]
    }

@app.get("/")
def root():
    # 환경변수 불러오기
    load_dotenv()
    
    # PDF Load 후 벡터 DB에 저장
    # pdf_documents = read_pdf("./files/2024.pdf")
    # save_to_vector_store(pdf_documents)
    
    # 사용자 질문 처리
    # 2항 제 5호
    response, context = process_question("배우자도 세대주 변경 후 남은 기간을 승계하여 거주의무를 이행 할 수 있어?")
    
    return {
            "response": response,
            "documents": [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in context]
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)