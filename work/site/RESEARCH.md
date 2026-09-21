# Architectural references

Reviewed 2026-09-21 through the GitHub connector. Independently implemented; no third-party source was copied or vendored.

- NVIDIA-AI-Blueprints/retail-shopping-assistant @ 55503a42991c143a69710abfd2075e36317b81eb: README.md and chain_server/src/graph.py. Adopt responsibility separation and inspectable processing stages; do not install LangGraph, GPUs, vector search, cart or microservices.
- filip-michalsky/SalesGPT @ 7cd1d4f9fae2a5610fac76e1c0edc38a2fafd388: README.md, salesgpt/stages.py, salesgpt/chains.py. Adopt stage awareness, replacing sales closing with respectful completion and safety routing.
- Hoanganhvu123/ShoppingGPT @ bc059c5cec6f5fd09b322041bf93bf0b4bb399c2: README.md, shoppinggpt/tool/product_search.py, shoppinggpt/tool/policy_search.py. Separate product and policy tools. Use constrained catalog lookup instead of executing model-generated SQL; no FAISS dependency.

Product facts: user-provided fictional exam document `08题 澄初个人护理.pdf`, page 1. Rule identifiers are local indexes, not identifiers printed in the source.

Live-model validation is pending until ARK_API_KEY and ARK_MODEL are configured. Contract tests mock upstream responses and are explicitly labeled as such.
