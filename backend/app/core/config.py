import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")

    EXCHANGE_RATES: dict = {
        "TRY": 1.0,
        "USD": 32.5,
        "EUR": 35.0,
        "GBP": 41.0,
        "CHF": 36.0,
        "JPY": 0.22,
    }


settings = Settings()
