# Overview

![image](https://github.com/user-attachments/assets/5e3fa102-9e8e-4d00-9b8d-3ba8a93aedf7)

<<<<<<< HEAD
Chatbot 화면은 Next.js + TypeScript + Shadcn-ui를 사용하여 개발했습니다.
데이터 전처리 과정과 대화형 질의응답은 Python + FastAPI + LangChain을 사용하여 API를 제공하도록 구성했습니다.

시스템은 다음과 같은 두 단계로 동작합니다.

1. **데이터 전처리:**
   문서들은 PDF 파일 로드, 청크 단위 분할, 벡터 임베딩 변환으로 이어지는 파이프라인을 통해 처리됩니다. 생성된 임베딩은 효율적인 검색을 위해 FAISS 로컬 벡터 저장소에 저장됩니다.

2. **대화형 질의응답:**
   지식 베이스가 구축되면 사용자는 LLM과 자연어로 대화할 수 있습니다. 시스템은 처리된 문서에서 관련 컨텍스트를 검색하여 LLM이 정보에 기반한 맥락적으로 적절한 응답과 마크다운 형식의 요약 문서를 생성할 수 있도록 합니다.
=======
본 프로젝트는 LangChain 프레임워크와 OpenAI의 대규모 언어 모델(LLM)을 기반으로 한 검색 증강 생성(RAG) 시스템입니다. 사용자와의 자연스러운 대화를 통해 문서 기반 지식을 제공하는 대화형 인터페이스를 구현했습니다.

## 기술 스택

**프론트엔드**
- Next.js와 TypeScript를 기반으로 구축
- Shadcn-ui를 활용한 모던한 사용자 인터페이스
>>>>>>> 1cc60b116a98abf3e3c96a5c97b1b10e3e56b1df

**백엔드**
- Python과 FastAPI를 활용한 REST API
- LangChain을 통한 강력한 자연어 처리 파이프라인

## 시스템 아키텍처

시스템은 크게 두 가지 핵심 프로세스로 구성됩니다:

1. **데이터 전처리**
   - PDF 문서 로드
   - PDF 문서를 페이지 별 이미지 파일로 변환 후 저장
   - 효율적인 처리를 위한 문서 청크 분할
   - OpenAI 임베딩 모델을 통한 벡터 변환
   - FAISS 벡터 저장소를 활용한 검색 인덱스 구축

2. **대화형 질의응답 시스템**
   - 사용자 질의에 대한 컨텍스트 기반 검색
   - LLM을 활용한 자연스러운 응답 생성
   - 마크다운 형식의 구조화된 문서 요약 제공
   - 참고한 컨텍스트 기반 PDF 이미지 제공

이 프로젝트는 최신 RAG 아키텍처를 실제 애플리케이션에 적용한 사례로, 범용 언어 모델의 강점과 도메인별 문서 지식을 효과적으로 결합하는 방법을 보여줍니다.

## RAG 프로세스
<<<<<<< HEAD
=======
### 데이터 전처리(Data Preprocessing)
![image](https://github.com/user-attachments/assets/aa74ed2b-f5d8-450e-b636-99857dcc75e0)

>>>>>>> 1cc60b116a98abf3e3c96a5c97b1b10e3e56b1df

### 데이터 전처리(Data Preprocessing)

![image](https://github.com/user-attachments/assets/a26a5136-6e59-4980-b04e-a73640e858ad)
