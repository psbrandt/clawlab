# Welcome to Clawlab

Clawlab is a website to collaborate on musical projects.
It allows you to share your projects and ideas via an online multitrack
sequencer, with the ability of cherry picking your collaborators updates through
a dedicated versionning system (strongly inspired by [git](http://git-scm.com) 
and [darcs](http://darcs.net) among others).

A prototype version is online here : http://clawlab.org

and the source code is here : https://github.com/gabriel-cardoso/claw-proto

# Running a local server

You need :

- Server-side framework : [Rails 3.1+](http://rubyonrails.org/)
- Database : [MongoDB](http://www.mongodb.org/)
- Pub/sub system (optional) : [Faye](http://faye.jcoglan.com/) you will need 
  [Node.js](http://nodejs.org/) for that and run `npm install faye`

Be sure to have a running MongoDB server on port `:27017`

```
mongod [--dbpath=path/to/data]
```

Run your rails server

```
rails server
```

Run Faye server

```
node faye.js
```

# Development

Currently under development

Learn more about design on the [Wiki](https://github.com/gabriel-cardoso/clawlab/wiki)