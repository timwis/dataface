# Dataface
Build and manage data with a spreadsheet-like interface. **Work in progress**.

## Usage
1. [Install docker](https://www.docker.com/community-edition)
2. Navigate into the `server` directory and run `docker-compose up -d` to run
   the server
3. Navigate back to the root directory, then install dependencies via `yarn install` or `npm install`
4. Copy `.env.sample` to `.env` and fill in PostgREST host
5. Run the application via `yarn start` or `npm start`
6. View the application in the browser at `http://localhost:9966`
