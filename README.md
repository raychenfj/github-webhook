# github-webhook

I'm a very lazy person ,I hate to deploy my projects again and again manually. So I decide to write a webhook to do it automatically. Save my trouble :) .

It's simple but work for me. Basically, it just do some verification and then run my deployment script.

[Here](./config.js) is how to the config looks like now. Object key is a git project name, which ref and events should trigger deployment, ref can be any branch or tag, pretty self-explain I guess, 