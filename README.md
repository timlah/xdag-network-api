# XDAG API

## Introduction

https://api.xdag.io

Made using:
- Docker: microservice controller
- Nginx: reverse proxy / load balancer for express web servers
- Node: express web servers, worker / cron runner for database updates
- Redis: cache for database queries
- Postgres: database
- Flyway: database migrations

### Routes

#### /pools

Featured XDAG mining pools. Displays the following values for each pool:

- id
- name
- website address
- mining address
- used XDAG version
- payment values
- server location and GPS coordinates

#### /stats

Stats for featured mining pools and the network from the last 20 minutes. 
Other available timeframes: 
- day: `/stats/day`
- month: `/stats/month`

Pool stats: 
- timestamp of when the stats were read/saved at
- hashrate in MH/S
- state
- orphan blocks
- wait sync blocks
- hosts

Network stats: 
- timestamp of when the stats were read/saved at
- hashrate in MH/S
- supply 
- blocks
- main blocks
- hosts
- chain difficulty

#### /stats/live

Utilizes Server Sent Events and sends data whenever new network or pool stats are written to the database.

Example output:
```
event: pool_stats_upd
data:["5ff7aaf1-4a55-4bc6-b835-d54c3ed2fdde", [1549555800, 13519.47, "ON", 6, 25771, 623]]
data:["df46d9ea-a914-4642-ba24-b88f5b5e40c3", [1549555800, null, "NO_RESPONSE", null, null, null]]

event: net_stats_upd
data:[1549555800, 27089564.38, 548028416, 226440683, 535184, 623, 182361640908262937646445259224006]
```

## Setup

### Prerequisites
- Docker: https://docs.docker.com/install/
- Docker Compose: https://docs.docker.com/compose/install/

### Environment variables

- create an .env file in the project root folder
- add the following variables

```
POSTGRES_USER=<your user>
POSTGRES_PASSWORD=<your password>
POSTGRES_HOST=database
POSTGRES_PORT=5432

REDIS_HOST=cache
REDIS_PORT=6379

WEB_PORT=8080
```

### Create an external volume for database data

```
docker volume create networkapi_database
```

### Initialize database by running migrations

```
docker-compose -f docker-compose.migrate.yml -d
```

## Run application
Remove the `-d` option if you wish to stay attatched to the containers output
Add the `--build` option if there's a need to force container image rebuild.

### Development

```
docker-compose -f docker-compose.common.yml -f docker-compose.dev.yml up -d
```

### Production

```
docker-compose -f docker-compose.common.yml -f docker-compose.prod.yml up -d
```

## Misc

### Updating database schema

This application uses flyway to manage database migrations. Read https://flywaydb.org/documentation/migrations for more information.

The basic steps are:
1. Create a new file in `database/migrations/` and follow the versioned naming system found on https://flywaydb.org/documentation/migrations#versioned-migrations
2. Add your sql queries to the new file
3. Run `docker-compose -f docker-compose.migrate.yml up -d`

### Remake database volume

```
docker volume rm networkapi_database && docker volume create networkapi_database
```
