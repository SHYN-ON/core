dev-setup:
	docker-compose -f docker-compose.dev.yml up 
	-f docker-compose.dev.yml down
dev-clear:
	docker-compose -f docker-compose.dev.yml -f docker-compose.dev.yml down
