# Helix-Front

A modern user interface to manage [Helix](http://helix.apache.org).

## Local Development

### Add Entries to Hosts File

To support setting an identity token cookie when developing locally, first modify your hosts file like this:

```bash
# open your hosts file for editing
sudo vim /etc/hosts
```

Then you should see an existing hosts file that looks something like this:

```bash
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
```

Type `i` to enter insert mode and then add following lines to the bottom of the file:

```bash
127.0.0.1 local.host
127.0.0.1 app.local.host
127.0.0.1 api.local.host
```

Now, press the `<Escape>` key then `:wq` to save and close your hosts file.

### Run dev Server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Production Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `yarn e2e` to execute the end-to-end tests via [Cypress](https://www.cypress.io/).
Before running the tests make sure you are serving the app via `yarn start`.
