# ============================================
# Docker Makefile for Pola Admin
# ============================================

.PHONY: help dev prod prod-ssl build clean logs shell stop restart

# Default target
help:
	@echo "Pola Admin Docker Commands"
	@echo "=========================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development server with hot reload"
	@echo "  make dev-build    - Rebuild and start development server"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Build and start production server"
	@echo "  make prod-build   - Force rebuild production image"
	@echo "  make prod-ssl     - Start production with SSL support"
	@echo ""
	@echo "Utilities:"
	@echo "  make build        - Build all Docker images"
	@echo "  make stop         - Stop all containers"
	@echo "  make clean        - Stop containers and remove images"
	@echo "  make logs         - Show container logs"
	@echo "  make shell        - Open shell in dev container"
	@echo "  make restart      - Restart all containers"

# ============================================
# Development Commands
# ============================================

dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-detached:
	docker-compose -f docker-compose.dev.yml up -d

# ============================================
# Production Commands
# ============================================

prod:
	docker-compose -f docker-compose.prod.yml up -d

prod-build:
	docker-compose -f docker-compose.prod.yml up -d --build

prod-ssl:
	docker-compose --profile prod-ssl up -d

# ============================================
# Build Commands
# ============================================

build:
	docker build -t pola-admin:dev --target development .
	docker build -t pola-admin:prod --target production .

build-dev:
	docker build -t pola-admin:dev --target development .

build-prod:
	docker build -t pola-admin:prod --target production .

# ============================================
# Utility Commands
# ============================================

stop:
	docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

clean:
	docker-compose -f docker-compose.dev.yml down --rmi all --volumes 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down --rmi all --volumes 2>/dev/null || true

logs:
	docker-compose logs -f

logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

shell:
	docker-compose -f docker-compose.dev.yml exec app sh

restart:
	$(MAKE) stop
	$(MAKE) dev

restart-prod:
	docker-compose -f docker-compose.prod.yml restart

# ============================================
# Health Check
# ============================================

health:
	@curl -s http://localhost/health || echo "Service not running or unhealthy"

health-dev:
	@curl -s http://localhost:5173 || echo "Dev server not running"
