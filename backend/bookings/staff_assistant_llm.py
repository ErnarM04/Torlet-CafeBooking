"""OpenAI-powered staff assistant grounded in dashboard / analytics metrics."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from django.conf import settings
from openai import APIConnectionError, APIStatusError, OpenAI, RateLimitError

logger = logging.getLogger(__name__)

MAX_HISTORY_TURNS = 10
MAX_OUTPUT_TOKENS = 900


class AssistantConfigurationError(Exception):
    """Raised when OPENAI_API_KEY is not configured."""


class AssistantAPIError(Exception):
    """Raised when the LLM provider returns an error."""


def is_llm_configured() -> bool:
    return bool(getattr(settings, "OPENAI_API_KEY", "").strip())


def _detect_lang(text: str) -> str:
    if re.search(r"[\u0400-\u04FF]", text):
        if re.search(r"[әғқңөұүіһ]", text, re.I):
            return "kk"
        return "ru"
    return "en"


def _lang_instruction(lang: str) -> str:
    return {
        "en": "Reply in English.",
        "ru": "Отвечай на русском языке.",
        "kk": "Қазақ тілінде жауап бер.",
    }.get(lang, "Reply in the same language as the user's latest message.")


def build_system_prompt(metrics: dict, lang: str) -> str:
    metrics_json = json.dumps(metrics, ensure_ascii=False, indent=2)
    finance = metrics.get("has_finance_data", False)
    finance_note = (
        "The database includes budget/income/expense fields — you may reference them when present."
        if finance
        else (
            "There is NO budget, income, revenue, or expense data in this system (reservations only). "
            "If asked about finances, say so clearly, then interpret booking volume, completion, "
            "cancellations, no-shows, peak hours, and repeat customers as operational demand signals."
        )
    )
    return f"""You are an expert cafe operations assistant for restaurant staff using the Torlet admin panel.

You MUST ground every answer in the METRICS_SNAPSHOT JSON below — the same numbers shown on the Dashboard and Analytics pages. Do not invent figures.

Rules:
- Be concise, practical, and friendly (2–5 short paragraphs or a short bullet list).
- Give actionable advice when asked (staffing, confirmations, tables, loyalty).
- {_lang_instruction(lang)}
- {finance_note}

METRICS_SNAPSHOT:
{metrics_json}
"""


def _sanitize_history(history: list[dict[str, Any]] | None) -> list[dict[str, str]]:
    if not history:
        return []
    cleaned: list[dict[str, str]] = []
    for item in history[-MAX_HISTORY_TURNS * 2 :]:
        role = item.get("role")
        content = (item.get("content") or item.get("text") or "").strip()
        if role in ("user", "assistant") and content:
            cleaned.append({"role": role, "content": content[:4000]})
    return cleaned


def _openai_client() -> OpenAI:
    kwargs: dict[str, Any] = {"api_key": settings.OPENAI_API_KEY}
    base_url = getattr(settings, "OPENAI_BASE_URL", "").strip()
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)


def generate_llm_reply(
    message: str,
    metrics: dict,
    *,
    history: list[dict[str, Any]] | None = None,
) -> str:
    text = (message or "").strip()
    if not text:
        raise ValueError("message is required")

    if not is_llm_configured():
        raise AssistantConfigurationError(
            "AI assistant is not configured. Add GROQ_API_KEY to backend/.env "
            "(free key at https://console.groq.com/keys) and restart the server."
        )

    lang = _detect_lang(text)
    messages: list[dict[str, str]] = [
        {"role": "system", "content": build_system_prompt(metrics, lang)},
        *_sanitize_history(history),
        {"role": "user", "content": text},
    ]

    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    try:
        client = _openai_client()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.35,
            max_tokens=MAX_OUTPUT_TOKENS,
        )
    except RateLimitError as exc:
        logger.warning("OpenAI rate limit: %s", exc)
        raise AssistantAPIError(
            "AI rate limit reached. Wait a moment and try again."
        ) from exc
    except APIConnectionError as exc:
        logger.warning("OpenAI connection error: %s", exc)
        raise AssistantAPIError(
            "Could not reach the AI service. Check your network or OPENAI_BASE_URL."
        ) from exc
    except APIStatusError as exc:
        logger.warning("OpenAI API error: %s", exc)
        msg = getattr(exc, "message", None) or str(exc)
        raise AssistantAPIError(f"AI service error: {msg}") from exc
    except Exception as exc:
        logger.exception("Unexpected AI assistant error")
        raise AssistantAPIError("AI assistant failed unexpectedly.") from exc

    choice = response.choices[0] if response.choices else None
    reply = (choice.message.content if choice and choice.message else "") or ""
    reply = reply.strip()
    if not reply:
        raise AssistantAPIError("AI returned an empty response. Please try again.")
    return reply
