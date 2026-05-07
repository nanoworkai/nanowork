from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Load from env (production) or local `.env` in apps/api."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: Literal["development", "production"] = "development"

    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5-20251001"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None

    linq_stripe_secret_key: str | None = None
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None

    @property
    def effective_stripe_key(self) -> str | None:
        """Prefer STRIPE_SECRET_KEY; fall back to legacy LINQ_STRIPE_SECRET_KEY."""
        return (self.stripe_secret_key or self.linq_stripe_secret_key or "").strip() or None

    cors_origins: str = (
        "https://nanowork.app,"
        "https://www.nanowork.app,"
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


def cors_origin_list() -> list[str]:
    raw = get_settings().cors_origins.strip()
    if not raw:
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]
