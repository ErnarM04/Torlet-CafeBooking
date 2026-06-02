"""Staff assistant entry point (LLM-backed)."""

from __future__ import annotations

from typing import Any

from .staff_assistant_llm import (
    AssistantAPIError,
    AssistantConfigurationError,
    generate_llm_reply,
    is_llm_configured,
)

__all__ = [
    "AssistantAPIError",
    "AssistantConfigurationError",
    "generate_assistant_reply",
    "is_llm_configured",
]


def generate_assistant_reply(
    message: str,
    metrics: dict,
    *,
    history: list[dict[str, Any]] | None = None,
) -> str:
    return generate_llm_reply(message, metrics, history=history)
