## 가상환경이란?

Python 가상환경은 프로젝트별로 독립된 Python 실행 환경을 제공하는 도구입니다.
다음과 같은 이점이 있습니다:

- 프로젝트별로 독립된 패키지 환경 구성 가능 (의존성 충돌 방지)
- 시스템에 설치된 기본 Python에 영향을 주지 않고 프로젝트마다 필요한 패키지만 설치 가능
- Python 버전을 프로젝트별로 다르게 설정 가능

> [!warning] Windows 사용자 주의사항
> Windows 환경에서는 PowerShell 대신 CMD(Command Prompt)를 사용하는 것을 권장합니다. PowerShell에서는 권한 문제로 가상환경 생성이 실패할 수 있습니다.

## 1. 가상환경 생성

### Python 버전 확인

```bash
py --list
# 또는
py --list-paths
```

### 가상환경 생성

가상환경 생성 명령어:

```bash
py -3.12 -m venv venv
```

대안:

- 기본 Python 버전 사용: `python -m venv venv` 또는 `py -m venv venv`
- 다른 버전 사용: `py -3.11 -m venv venv` (Python 3.11이 설치된 경우)
- 새 버전 설치: Python 공식 웹사이트에서 다운로드

### 생성 확인

```bash
dir venv
```

정상적으로 생성된 경우 다음과 같은 디렉토리 구조가 보입니다:

```
venv/
├── Include/
├── Lib/
├── Scripts/
└── pyvenv.cfg
```

## 2. 가상환경 활성화 및 관리

### 활성화

```bash
.\venv\Scripts\activate
```

### 활성화 상태 확인

```bash
echo %VIRTUAL_ENV%
```

활성화된 경우 가상환경 경로가 출력됩니다.
예시: `C:\Users\user\Desktop\langchain-chatbot\server\venv`

### pip 업그레이드

```bash
python -m pip install --upgrade pip
```

## 3. 패키지 관리

### 개별 패키지 설치

```bash
pip install [패키지이름]
```

### 패키지 일괄 설치

의존성 패키지 목록을 텍스트 파일로 관리할 수 있습니다.
파일명은 프로젝트의 필요에 따라 자유롭게 지정할 수 있습니다:

- packages.txt (기본)
- packages_dev.txt (개발 환경용)
- packages_prod.txt (운영 환경용)
- packages_test.txt (테스트 환경용)

packages.txt 예시:

```txt
streamlit
langchain
faiss-cpu
openai
pymupdf
langchain-openai
langchain-community
fastapi
uvicorn[standard]
```

패키지 일괄 설치:

```bash
pip install -r packages.txt
```

### 현재 환경 저장하기

지금 가상환경에 설치된 모든 패키지 목록을 저장할 수 있습니다:

```bash
pip freeze > packages.txt
```

pip freeze 결과:

```txt
streamlit==1.32.0
langchain==0.1.12
openai==1.13.0
pymupdf==1.24.0
```

특정 버전을 지정하지 않고 최신 버전을 설치하고 싶다면, ==버전넘버를 제거합니다:

```txt
streamlit
langchain
openai
pymupdf
```

## 4. 가상환경 비활성화

가상환경 비활성화는 현재 사용 중인 가상환경에서 벗어나 시스템의 기본 Python 환경으로 돌아가는 것을 의미합니다.

```bash
deactivate
```

비활성화 확인 방법:

1. 터미널 프롬프트에서 `(venv)` 표시가 사라집니다.
2. `echo %VIRTUAL_ENV%` 명령어 실행 시 아무것도 출력되지 않습니다.
3. `where python` 명령어로 현재 사용 중인 Python 경로가 시스템 Python으로 변경된 것을 확인할 수 있습니다.
