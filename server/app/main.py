from fastapi import FastAPI
from typing import List
import uvicorn 
import os

# 라이브러리 임포트
from langchain_core.documents.base import Document
from langchain_community.document_loaders import PyMuPDFLoader

app = FastAPI()

# PDF를 읽어서 Lidt[Document]로 변환
def read_pdf(file_path: str) -> List[Document]:    
    response = []
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    for document in documents:
        document.metadata['file_path'] = file_path
    
    response.extend(documents)
    return response

@app.get("/")
def root():
    documents = read_pdf("./files/2024.pdf")
    
    return {
            "message": "Hello, World!",
            "documents": [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in documents]
        }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)