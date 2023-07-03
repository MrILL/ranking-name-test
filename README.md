# Getting Started

Firstly start backend, then frontend.

## Backend

Go to the `backend` folder
```
cd ./backend
```

### Setup database

Setup docker container, that are used for database:
```
cp .env.example .env
docker-compose up -d
```

Install packages and run migration for creating pg tables:
```
npm i
npm run migration:run
```

### Run server

Now to run the backend http and ws server use:
```
npm run start:dev
```

Now backend http server is initialized at port `3000`, and socket.io at port `3001`

## Frontend

After initializing backend open new terminal and run:

```
cd ./frontend
npm i
npm run dev
```
Now frontend server is running at port `3002`, so go to [locahost:3002](localhost:3002) to use the application.


<!-- TODO run front -->
