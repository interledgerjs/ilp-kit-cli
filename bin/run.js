#!/usr/bin/env node
'use strict'

const childProcess = require('child_process')
const path = require('path')

if (process.argv.length < 4) {
  console.log('usage: run.js <config 1.json> <config 2.json> [more configs.json...]')
  process.exit(1)
}

const defaultSet = (field, value) => {
  process.env[field] = process.env[field] || value
}

const getAllPairs = (ledgers) => {
  let pairs = []
  for (let sender of ledgers) {
    for (let receiver of ledgers) {
      if (sender !== receiver) {
        pairs.push([sender, receiver])
      }
    }
  }
  return pairs
}

defaultSet('CONNECTOR_PORT', 4000)
defaultSet('CONNECTOR_BACKEND', 'one-to-one')

let ledgers = []
let configs = {}

for (let ledgerFile of process.argv.slice(2)) {
  let ledger = require(process.cwd() + '/' + ledgerFile)

  ledgers.push(ledger.asset + '@' + ledger.id)
  configs[ledger.id] = ledger

  if (ledger.type === 'virtual' && ledger.token) {
    console.log('Token for ' + ledger.id + ' is: ' + ledger.token)
  }
}

defaultSet('CONNECTOR_LEDGERS', JSON.stringify(ledgers))
defaultSet('CONNECTOR_CREDENTIALS', JSON.stringify(configs))
defaultSet('CONNECTOR_PAIRS', JSON.stringify(getAllPairs(ledgers)))

childProcess.execFileSync(path.join(__dirname, '../src/run.sh'), {
  stdio: [ process.stdout, process.stderr, process.stdin ]
})
