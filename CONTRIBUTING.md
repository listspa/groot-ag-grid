# Contributing to Groot

At the moment we have not formalized a contribution agreement; however feel free to open a pull request if you have any
enhancements or bug fixes and we'll sort something out. :-)

## First step

After the project checkout, as usual, run `npm install`.

## Working locally

To work locally simply run `npm run start`. This launches the test application.

## Public API

Note that, whenever you add a file, component, service, pipe etc that needs to be in the "public API" of the library you
need to add it to the `public-api.ts` file as well. Otherwise it will not be available to the library's clients.

# Doing a release

Currently, only developers at LIST can create releases.

Create an account on NPM.JS and contact Andrea Bergia <a.bergia@list-group.com> for being added to the listgroup
organization on NPM.

Next, you have to do an `npm login` using your account in the terminal.

Finally, simply run `npm run release`. If you are a member of LIST, you will need to _temporarily_
remove the row `@listgroup:registry=https://artifactory.list-group.com/artifactory/api/npm/npm/`
from your file `~/.npmrc` and restore it after publication.
