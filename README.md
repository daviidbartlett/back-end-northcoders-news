# NorthCoders News API

## Description

This is a project which serves as an API for a future front end project. The API is hosted [here](https://david-nc-knews.herokuapp.com/api/), where it describes the endpoints you can interact with.

## Getting Started

Feel free to clone this respository. Ensure the you run **npm install** and you have postgres available. Running **knex init** creates your knexfile.js where you are able to make a connection with pg database. Within here you want to create an exports object which contains objects for testing and development. The testing object has been given as an example.

```
test: {
    client: 'pg',
    connection: {
      database: '<test_database_name>',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    }

```

You can host the api locally using **npm run dev** (this command will use nodemon). Now it should be available in your localhost:9090.

## Running the Tests

Within the spec directory there are tests available to run using the Mocha test suite along with the Chai expect library in conjunction with Super Test.

## Deployment

To deploy the API, make sure you have deployed first a database and a new production object to the knexfile listing your connection as **DATABASE_URL?ssl=true**. Also ensure that you extract DATABASE_URL from process.env to ensure the connection is working

## Built with

- Express
- Knex
- Body-Parser
- Postgres

### Author

David Bartlett
