.PHONY: help install install-dev setup-env setup-nltk check-nltk run run-prod test lint format typecheck clean docker-build docker-run compose-up compose-down compose-logs compose-build

help:
	@echo "Available targets:"
	@echo "  install       - Install production dependencies"
	@echo "  install-dev   - Install all dependencies (including dev tools)"
	@echo "  setup-env     - Create .env from .env.example"
	@echo "  setup-nltk    - Download required NLTK data"
	@echo "  check-nltk    - Check if NLTK data exists, download if missing"
	@echo "  run           - Start development server (Flask, depends on check-nltk)"
	@echo "  run-prod      - Start production server (Gunicorn)"
	@echo "  test          - Run pytest test suite (depends on check-nltk)"
	@echo "  lint          - Run ruff linter"
	@echo "  format        - Run ruff formatter"
	@echo "  typecheck     - Run mypy type checker"
	@echo "  clean         - Remove build artifacts and caches"
	@echo "  docker-build  - Build backend Docker image"
	@echo "  docker-run    - Run backend Docker container"
	@echo "  compose-up    - Start all services via root docker-compose.yml"
	@echo "  compose-down  - Stop all services via docker-compose"
	@echo "  compose-logs  - View live logs for all services"
	@echo "  compose-build - Build all services via docker-compose"

install:
	uv sync --no-dev

install-dev:
	uv sync --all-extras

setup-env:
	cp .env.example .env
	@echo "Edit .env with your GOOGLE_API_KEY"

setup-nltk:
	uv run python setup_nltk.py

check-nltk:
	@uv run python -c "import nltk; nltk.data.find('tokenizers/punkt')" 2>/dev/null || { \
		echo "NLTK data missing, downloading required packages..."; \
		$(MAKE) setup-nltk; \
	}

run: check-nltk
	uv run python app.py

run-prod:
	uv run gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 4 app:app

test: check-nltk
	uv run pytest tests/ -v

lint:
	uv run ruff check .

format:
	uv run ruff format .

typecheck:
	uv run mypy .

clean:
	rm -rf .venv __pycache__ .pytest_cache .mypy_cache *.egg-info

docker-build:
	docker build -t summarizer-pdf-backend .

docker-run:
	docker run -p 5000:5000 --env-file .env summarizer-pdf-backend

compose-up:
	docker compose -f ../docker-compose.yml up --build

compose-down:
	docker compose -f ../docker-compose.yml down

compose-logs:
	docker compose -f ../docker-compose.yml logs -f

compose-build:
	docker compose -f ../docker-compose.yml build
