#!/usr/bin/env node

const argv = require('yargs')
  .demandOption(['api', 'couch', 'database'])
  .help('h')
  .alias('h', 'help')
  .argv

const fetch = require('node-fetch')
const nano = require('nano')(argv.couch)
const database = nano.db.use(argv.database)

fetch(argv.api)
  .then(req => req.json())
  .then(data => {
    const timestamp = new Date(data.timestamp).getTime()
    const bulk = data.parkings.map(parking => ({
      _id: `${parking.id}::${timestamp}`,
      current: Number.parseInt(parking.current),
      state: parking.state,
      parking_name: parking.name,
      parking_id: parking.id,
      timestamp: data.timestamp
    }))

    database.bulk({docs: bulk}, (err, data) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
  })
