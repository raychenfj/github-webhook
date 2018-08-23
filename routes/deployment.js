const express = require('express')
const router = express.Router()

const config = require('../config')
const util = require('../util')
const to = require('to-case')
const exec = require('sync-exec')

router.post('/', function (req, res, next) {
  const repository = req.body.repository
  const repoConfig = config[repository.name]
  if (!repoConfig) {
    res.status(500).send(`repository ${repository.name} is not registered`)
  }

  if (repoConfig.ref && repoConfig.ref !== req.body.ref) {
    res.send('ref is not matched, skip deployment')
  }

  const signature = res.get('X-Hub-Signature')
  const secret = process.env[`GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`]

  if (!secret) {
    res.status.send(`can't find env variable GITHUB_WEBHOOK_${to.snake(repository.name).toUpperCase()}_SECRET`)
  }

  if (signature && !util.verifySignature(signature, JSON.stringify(res.body), secret)) {
    res.status(400).send('invalid signature')
  }

  repoConfig.scripts.forEach(cmd => console.info(exec(cmd)))
})

module.exports = router
