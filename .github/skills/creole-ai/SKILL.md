---
name: creole-ai
description: Skill spécialisé pour l'IA en créole haïtien. Couvre le fine-tuning Whisper, les prompts en créole, les 32 phonèmes, la classification dialectale et les règles de bienveillance de Manman Marie.
---

# IA Créole Haïtien — Konprann Skill

## Les 32 Phonèmes du Créole Haïtien
```python
CREOLE_PHONEMES = {
    # Voyelles orales
    "a": ["kay", "kabrit", "anana"],
    "e": ["bele", "ze", "elèv"],
    "è": ["mèt", "fèt", "lèt"],
    "i": ["ti", "fi", "kite"],
    "o": ["bò", "kò", "foto"],
    "ò": ["òtèl", "fòk", "bòt"],
    "ou": ["ou", "bouch", "joujou"],
    # Voyelles nasales
    "an": ["manman", "jan", "san"],
    "en": ["chen", "ren", "fen"],
    "on": ["bon", "son", "konprann"],
    "in": ["vin", "fin", "krin"],
    # Consonnes
    "ch": ["chèz", "chak", "mache"],
    "j": ["jou", "jaden", "janm"],
    "ng": ["mango", "zanng"],
    # ... autres consonnes standard
}

DIALECT_VARIATIONS = {
    "nord": {"ou": "u", "special_words": ["fè→fi", "mèt→mit"]},
    "sud": {"lengthening": ["an→aan"]},
    "ouest": {"standard": True},  # Créole standard
}
```

## Configuration Whisper pour le Créole
```python
# Fine-tuning sur dataset créole haïtien
WHISPER_CONFIG = {
    "model": "openai/whisper-medium",
    "language": "ht",  # Code ISO créole haïtien
    "task": "transcribe",
    "acceptance_threshold": 0.75,  # 75% similarité = acceptable
}

def transcribe_creole(audio_bytes: bytes, dialect: str = "ouest") -> str:
    # Préprocessing audio : débruitage si nécessaire
    # Transcription avec Whisper fine-tuné
    # Post-processing : normalisation orthographe créole
    pass
```

## Règles de Feedback Bienveillant
```python
def generate_feedback(score: float, target: str, attempt: str) -> str:
    """Génère un feedback TOUJOURS positif pour Manman Marie."""
    if score >= 0.85:
        return f"Trè byen! Ou di '{target}' pafètman. Kontinye konsa!"
    elif score >= 0.75:
        return f"Trè byen! '{target}' — ou prèske genyen li. Yon ti efò ankò!"
    else:
        syllables = " - ".join(syllabify(target))
        return f"Prèske! Eseye ankò — {syllables}... Ou ka fè sa, mwen kwè nan ou!"

# INTERDIT dans tout feedback :
FORBIDDEN_WORDS = ["Mal", "Faux", "Incorrect", "Non", "Erreur", "Wòng", "Mauvais"]
```

## Prompts Système en Créole
```python
MANMAN_MARIE_SYSTEM = """
Ou rele Manman Marie. Ou se yon pwofesè ki gen pasyans, ki renmen elèv li yo,
epi ki pale kreyòl ayisyen natirèl. Ou pa janm fè moun wont.
Ou toujou ankouraje, menm lè moun fè erè.
Ou pale dousman, kle, ak kè kontan.
Ou pa janm itilize mo "Mal" oswa "Faux".
Ou toujou di "Prèske!" oswa "Eseye ankò!" pito.
"""
```
