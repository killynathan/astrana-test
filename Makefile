.PHONY: dev backend frontend install build migrate

dev:
	@make -j2 backend frontend

backend:
	cd backend && go run .

frontend:
	cd frontend && npm run dev

install:
	cd backend && go mod tidy
	cd frontend && npm install

migrate:
	cd backend && goose -dir migrations sqlite3 astrana.db up

build:
	cd frontend && npm run build
	cp -r frontend/dist backend/dist
	cd backend && GO_ENV=production go build -tags production -o ../astrana .
	@echo "built ./astrana"
