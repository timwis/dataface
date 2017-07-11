# Dataface
Build and manage data in a Postgres database with a spreadsheet-like interface.
[Demo](https://dataface-demo.herokuapp.com).

![screenshot of spreadsheet-like interface](http://i.imgur.com/3SX1UCo.png)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Motivation
Ideally all data would be managed in a purpose-built application backed by a database, designed by a database expert, but IT departments have to prioritize what applications they build or buy. As a result, a lot of data ends up being managed in a spreadsheet or a Microsoft Access database. These tools are flexible and easy for non-IT staff to build, but IT departments often see them as sources of technical debt: they only support one user at a time, they’re single points of failure since they’re usually not backed up, and they’re difficult to integrate into other systems.

Dataface aims to be an alternative tool that IT departments can offer non-IT staff to empower them to easily manage their data in a system the IT department would support. For the non-IT staff, dataface is a spreadsheet-like interface for data that lets you create columns and rows, even linking columns between sheets. For the IT department, dataface is a vanilla PostgreSQL database with a REST API and web app on top. This way, the non-IT staff can get started building a database on their own while keeping it standard and portable under the hood, for when the time comes for it to graduate to a full-fledged application.

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
