const express = require('express')
const router = express.Router()

const config = require('../config')
const util = require('../util')
const to = require('to-case')
const exec = require('sync-exec')

function extractPayload (res) {
  switch (res.get('content-type')) {
    case 'application/json':
      return res.body
    case 'application/x-www-form-urlencoded':
      return JSON.parse(res.body.payload)
  }
}

router.post('/', function (req, res, next) {
  if (!req.body) {
    return res.status(500).send('empty request body')
  }

  const payload = extractPayload(res)

  const repository = payload.repository
  const repoConfig = config[repository.name]
  if (!repoConfig) {
    return res.status(500).send(`repository ${repository.name} is not registered`)
  }

  if (repoConfig.ref && repoConfig.ref !== payload.ref) {
    return res.send('ref is not matched, skip deployment')
  }

  if (config.events) {
    const containValidEvents = payload.events.reduce((prev, cur) => {
      return prev || config.events.indexOf(cur) !== -1
    }, false)

    if (!containValidEvents) {
      return res.send('events are not matched, skip deployment')
    }
  }

  const signature = res.get('X-Hub-Signature')
  const secret = process.env[`GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`]

  if (!secret) {
    return res.status.send(`can't find env variable GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`)
  }

  if (signature && !util.verifySignature(signature, JSON.stringify(payload), secret)) {
    return res.status(400).send('invalid signature')
  }

  repoConfig.scripts.forEach(cmd => console.info(exec(cmd)))

  return res.send('deployment complete')
})

module.exports = router
