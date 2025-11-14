from openai import OpenAI
from typing import Dict, Any, Optional
import logging
import json

from src.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)

INCONSISTENCY_TYPES = [
    "CONTRADICTION",
    "MISSING_REQUIREMENT",
    "CONFLICTING_DEFINITION",
    "INCONSISTENT_SCOPE",
    "DATA_MISMATCH"
]

SEVERITY_LEVELS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]


def analyze_paragraph_pair(
    paragraph_a_text: str,
    paragraph_b_text: str,
    doc_a_title: str = "",
    doc_b_title: str = ""
) -> Optional[Dict[str, Any]]:
    """
    Analyze two paragraphs for semantic inconsistencies using LLM.

    Returns None if paragraphs are consistent, or a dictionary with
    inconsistency details if an inconsistency is detected.

    Args:
        paragraph_a_text: Text from first paragraph
        paragraph_b_text: Text from second paragraph
        doc_a_title: Optional title of first document
        doc_b_title: Optional title of second document

    Returns:
        Dictionary with inconsistency details or None
    """
    prompt = _build_consistency_prompt(
        paragraph_a_text, paragraph_b_text, doc_a_title, doc_b_title
    )

    try:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert document analyst specializing in identifying semantic inconsistencies between text passages. You must respond ONLY with valid JSON."
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        result = json.loads(response.choices[0].message.content)

        if not result.get("is_inconsistent", False):
            return None

        # Validate and structure the result
        inconsistency = {
            "inconsistency_type": result.get("inconsistency_type", "CONTRADICTION"),
            "severity": result.get("severity", "MEDIUM"),
            "description": result.get("description", ""),
            "explanation": result.get("explanation", ""),
            "recommendation": result.get("recommendation", ""),
            "source_excerpt": result.get("source_excerpt", paragraph_a_text[:200]),
            "target_excerpt": result.get("target_excerpt", paragraph_b_text[:200]),
            "source_location": {
                "start_offset": result.get("source_start_offset", 0),
                "end_offset": result.get("source_end_offset", len(paragraph_a_text))
            },
            "target_location": {
                "start_offset": result.get("target_start_offset", 0),
                "end_offset": result.get("target_end_offset", len(paragraph_b_text))
            }
        }

        logger.info(f"Detected {inconsistency['severity']} {inconsistency['inconsistency_type']}")
        return inconsistency

    except Exception as e:
        logger.error(f"LLM analysis failed: {e}")
        return None


def _build_consistency_prompt(
    text_a: str, text_b: str, doc_a_title: str, doc_b_title: str
) -> str:
    """Build the LLM prompt for consistency analysis"""
    return f"""Analyze the following two text passages from different documents for semantic inconsistencies.

**Document A{f' ({doc_a_title})' if doc_a_title else ''}:**
{text_a}

**Document B{f' ({doc_b_title})' if doc_b_title else ''}:**
{text_b}

Your task is to determine if there is a **semantic inconsistency** between these passages. An inconsistency exists when:
- The passages contradict each other
- One passage is missing requirements or information present in the other
- Definitions or terminology conflict
- The scope of statements is inconsistent
- Data or facts mismatch

**Respond with valid JSON in the following format:**

```json
{{
  "is_inconsistent": true/false,
  "inconsistency_type": "one of: {', '.join(INCONSISTENCY_TYPES)}",
  "severity": "one of: {', '.join(SEVERITY_LEVELS)}",
  "description": "Brief one-sentence description of the inconsistency",
  "explanation": "Detailed explanation of why this is inconsistent and what the conflict is",
  "recommendation": "Actionable recommendation for resolving the inconsistency",
  "source_excerpt": "The specific portion of text A that is inconsistent",
  "target_excerpt": "The specific portion of text B that is inconsistent",
  "source_start_offset": 0,
  "source_end_offset": 100,
  "target_start_offset": 0,
  "target_end_offset": 100
}}
```

**Severity Guidelines:**
- CRITICAL: Fundamental contradictions that invalidate document validity
- HIGH: Significant conflicts that require immediate attention
- MEDIUM: Notable inconsistencies that should be addressed
- LOW: Minor discrepancies or stylistic differences

**Important:**
- If the passages are semantically consistent (even if worded differently), set `is_inconsistent` to `false`
- Only report actual semantic conflicts, not stylistic differences
- Be precise about the type of inconsistency
- Provide actionable recommendations

Respond ONLY with valid JSON, no additional text."""

    return prompt
