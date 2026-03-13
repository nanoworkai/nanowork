"""Core generation logic: prompt → business specification."""

from dataclasses import dataclass
from typing import Any


@dataclass
class BusinessSpec:
    """Structured output from prompt analysis."""

    name: str
    description: str
    features: list[str]
    data_models: list[dict[str, Any]]
    raw: dict[str, Any]


def parse_prompt(prompt: str) -> BusinessSpec:
    """
    Parse a user prompt into a structured business specification.

    TODO: Integrate LLM (OpenAI, Anthropic) for real generation.
    """
    return BusinessSpec(
        name="Generated Business",
        description=prompt[:200] + ("..." if len(prompt) > 200 else ""),
        features=[],
        data_models=[],
        raw={"prompt": prompt, "status": "placeholder"},
    )
