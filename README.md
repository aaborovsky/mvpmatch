``~~# Vending machine app

## Backend

Nest.js based app with PostgresSQL storage.


## Client

Swagger automatic generates the web client to work with endpoints.

## Easy startup

- install docker (and docker-compose)
- enter './deploy'
- run `docker-compose up -d --build`
- open `http://localhost:3000/api` with your browser

## Run tests

### units

- `cd ./back`
- `npm i`
- `npm run test`

### e2e

- `cd ./back`
- `npm i`
- `npm run test:e2e`