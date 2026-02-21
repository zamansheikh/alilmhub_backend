
.PHONY: dev prod stop-dev stop-prod clean logs-dev logs-prod

# Development
dev:
	docker-compose -f docker-compose.dev.yml up --build

dev-d:
	docker-compose -f docker-compose.dev.yml up --build -d

stop-dev:
	docker-compose -f docker-compose.dev.yml down 

logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

# Production
prod:
	(docker-compose -v && docker-compose -f docker-compose.prod.yml up --build) || (docker compose -f docker-compose.prod.yml up --build)

prod-d:
	(docker-compose -v && docker-compose -f docker-compose.prod.yml up --build -d) || (docker compose -f docker-compose.prod.yml up --build -d)

stop-prod:
	(docker-compose -v && docker-compose -f docker-compose.prod.yml down) || (docker compose -f docker-compose.prod.yml down)

logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

# Cleanup
clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f