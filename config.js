module.exports = {
  'psn-notification': {
    ref: 'refs/heads/deployment',
    events: ['push'],
    scripts: [
      'git clone https://github.com/raychenfj/psn-notification.git',
      'git checkout deployment',
      'docker rm -f psn-notification',
      'docker rmi psn-notification',
      'docker build -t psn-notification ./psn-notification',
      'docker run -d --name psn-notification -e pass=$QQ_MAIL_PASS -p 3000:3000 psn-notification',
      'rm -rf psn-notification'
    ]
  }
}
