# Dataface
Build and manage data in a Postgres database with a spreadsheet-like interface.
[Demo](http://dataface.surge.sh).

![screenshot of spreadsheet-like interface](http://i.imgur.com/3SX1UCo.png)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Development
The `docker-compose.yml` file provides a postgres container, and an
application container. To spin them up, [install docker](https://www.docker.com/community-edition)
and run:

```bash
docker-compose up
```
Then navigate to `localhost:9966` in the browser.

## Testing
To test the client, run:

```bash
yarn test:client
```

To test the server, you'll need a throwaway postgres database running
(the tests will wipe it clean afterwards). To run one using docker, use:

```bash
docker run -p 5434:5432 postgres
```

Once a postgres database is available, run the server tests while 
passing the `DB_URL` environment variable:

```bash
DB_URL="postgres://postgres:pwd@localhost:5434/postgres" yarn test:server
```

You can run both the client and server tests together with `yarn test`;
just don't forget the `DB_URL` environment variable:

```bash
DB_URL="postgres://postgres:pwd@localhost:5434/postgres" yarn test
```
