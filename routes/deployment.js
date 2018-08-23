const express = require('express')
const router = express.Router()

const config = require('../config')
const util = require('../util')
const to = require('to-case')
const exec = require('sync-exec')

router.post('/', function (req, res, next) {
  if (req.body) {
    return res.status(500).send('empty request body')
  }
  const repository = req.body.repository
  const repoConfig = config[repository.name]
  if (!repoConfig) {
    return res.status(500).send(`repository ${repository.name} is not registered`)
  }

  if (repoConfig.ref && repoConfig.ref !== req.body.ref) {
    return res.send('ref is not matched, skip deployment')
  }

  const signature = res.get('X-Hub-Signature')
  const secret = process.env[`GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`]

  if (!secret) {
    return res.status.send(`can't find env variable GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`)
  }

  if (signature && !util.verifySignature(signature, JSON.stringify(res.body), secret)) {
    return res.status(400).send('invalid signature')
  }

  repoConfig.scripts.forEach(cmd => console.info(exec(cmd)))

  return res.send('deployment complete')
})

module.exports = router