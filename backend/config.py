from os import environ
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = environ.get('DB_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'infuct1234'
    JWT_SECRET_KEY = 'infuctsecret24'
    JWT_ACCESS_TOKEN_EXPIRES = 24 * 60 * 60
    
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ]