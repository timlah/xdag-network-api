# API for XDAG network data

Contains:

- nginx container: reverse proxy / load balancer for express web servers
- 2x node container: express web servers
- node container: worker / cron runner for database updates
- redis container: cache for database queries
- postgres container: database

## Setup

### Environment variables

- create an .env file in the project root folder
- add the following variables

```
REDIS_HOST=cache
REDIS_PORT=6379
POSTGRES_USER=<your user>
POSTGRES_PASSWORD=<your password>
POSTGRES_HOST=database
POSTGRES_PORT=5432
```

### Create an external volume for database data

```
docker volume create networkapi_database
```

### Development

#### Build and start containers

```
docker-compose -f docker-compose.common.yml -f docker-compose.dev.yml up -d --build
```

### Production

#### Build and start containers

```
docker-compose -f docker-compose.common.yml -f docker-compose.prod.yml up -d --build
```

### Misc

#### Remake database volume

```
docker volume rm networkapi_database &&
docker volume create networkapi_database
```
