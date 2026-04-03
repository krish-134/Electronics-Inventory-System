# CPSC 304 Project
This project is running a React frontend and a PostgreSQL backend. It also utilizes Docker to connect the two locally.

## Requirements
- `bun` (or `npm` or an equivalent JavaScript package manager)
- `Docker`
## Setup
Navigate to `/backend` in your terminal and type `bun i`. This will install backend dependencies. Then, navigate to `/frontend` in your terminal and type `npm i`. This will install frontend dependencies.

## Development
To start up the application locally, follow these steps:
1. In one terminal in the root of the project, type `docker compose up`. This runs the docker compose.
2. In another terminal, navigate to `/backend`, install dependencies with `bun i`, and type `bun run dev` to start the backend server.
3. In another terminal, navigate to `/frontend`, install dependencies with `bun i`, and type `bun run dev` to start the frontend server. It will also give you a URL like http://localhost:5173/, which you can open to preview the website.
4. (OPTIONAL) to access adminer, which has some useful tools for the database, go to `http://localhost:8080/` (with `docker` running)
