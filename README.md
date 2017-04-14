# Dataface
Build and manage data with a spreadsheet-like interface. **Work in progress**.

## Development
The `docker-compose.yml` file provides a postgres container, a
[PostgREST][PostgREST] container, and a node-yarn-app container. To spin them
all up, [install docker](https://www.docker.com/community-edition) and run
`docker-compose up`.

To run the client application by itself, pointing to a standalone PostgREST
server, install dependencies via `yarn install`, then specify the
`POSTGREST_ENVIRONMENT` variable and run `yarn start`, i.e.:

```bash
POSTGREST_HOST="http://localhost:3000" yarn start
```
