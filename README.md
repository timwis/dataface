# Dataface
Build and manage data in a Postgres database with a spreadsheet-like interface.
[Demo](http://dataface.surge.sh).

![screenshot of spreadsheet-like interface](http://i.imgur.com/3SX1UCo.png)

## Development
The `docker-compose.yml` file provides a postgres container, a
server container, and a client container. To spin them
all up, [install docker](https://www.docker.com/community-edition) and run:

```bash
docker-compose up
```

## Testing
To test the client, navigate to the `client` directory and run:

```bash
yarn test
```

To test the server, you'll need a throwaway postgres database running
(the tests will wipe it clean afterwards). To run one using docker, use:

```bash
docker run -p 5434:5432 postgres
```

(For convenience, this is also available as `yarn run test:db`.

Once a postgres database is available, run the server tests from within
the `server` directory, passing the `DB_URI` environment variable:

```bash
DB_URI="postgres://postgres:pwd@localhost:5434/postgres" yarn test
```
