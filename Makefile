dev-setup:
	docker-compose -f docker-compose.dev.yml up 
	-f docker-compose.dev.yml down
dev-clear:
	docker-compose -f docker-compose.dev.yml -f docker-compose.dev.yml down
build:
	rm -rf dist & npm --prefix ./server install ./server & npm --prefix ./client install ./client & (cd ./server && npm run build) & (cd ./client && npm run build)
