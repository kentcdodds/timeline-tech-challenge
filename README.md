# Articulate JS Tech Challenge

## Installing

The npm dependencies need to be installed before anything else can be done:

```bash
npm install
```

## Testing

The test suite can be run using npm:

```bash
npm test
```

## Running

First you'll need to spin up the web server:

```bash
npm start
```

Then you can launch the solution in the browser:

[http://127.0.0.1:3000](http://127.0.0.1:3000)

## Developing

While developing you may find it convenient to have your files watched so that testing and building happen automatically as files change.

This command will run the tests on file change:

```bash
grunt watch:test
```

You may also run the build on file change:

```bash
grunt watch:build
```

Of course you can run both tasks concurrently like so:

```bash
grunt watch
```