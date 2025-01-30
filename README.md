# Overview

본 프로젝트는 LangChain 프레임워크를 활용하여 OpenAI의 대규모 언어 모델(LLM)과 임베딩 모델을 활용한 검색 증강 생성(RAG) 시스템을 구현합니다.

시스템은 다음과 같은 두 단계로 동작합니다.

1. **데이터 전처리:**
문서들은 PDF 파일 로드, 청크 단위 분할, 벡터 임베딩 변환으로 이어지는 파이프라인을 통해 처리됩니다. 생성된 임베딩은 효율적인 검색을 위해 FAISS 로컬 벡터 저장소에 저장됩니다.

2. **대화형 질의응답:**
지식 베이스가 구축되면 사용자는 LLM과 자연어로 대화할 수 있습니다. 시스템은 처리된 문서에서 관련 컨텍스트를 검색하여 LLM이 정보에 기반한 맥락적으로 적절한 응답을 생성할 수 있도록 합니다.

이 구현은 RAG 아키텍처를 통해 현대 언어 모델이 도메인별 지식으로 어떻게 강화될 수 있는지를 보여주는 실용적인 예시로, 사전 학습된 모델의 성능과 커스텀 문서 저장소의 장점을 결합합니다.

## RAG 프로세스
### 데이터 전처리(Data Preprocessing)
![image](https://github.com/user-attachments/assets/a26a5136-6e59-4980-b04e-a73640e858ad)


