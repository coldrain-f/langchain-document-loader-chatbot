call .\venv\Scripts\activate
cd server\app
uvicorn main:app --reload
cmd /k