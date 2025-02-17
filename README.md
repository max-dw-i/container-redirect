# <img src="https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/icons/icon.png" alt="Drawing" width="42" align="top"/> Container Redirect

**!!! NOTE !!!** It's a fork of a great extension [containerise](https://github.com/kintesh/containerise) (with some small fixes and additions). All the fame and glory goes to its author [kintesh](https://github.com/kintesh). The original extension is not maintained anymore hence this fork. New features and enhancements are not planned currently, bug fixes and some bits and bobs at best.

Firefox extension to automatically open websites in a container

|![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/1.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/2.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/3.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/4.png)|
| --- | --- | --- | --- |
|Select your container and add a domain to always open all visits in the chosen container. | Add many domains as you wish. | Special `No Container` option to break out of a container. | Simple CSV based mapping of a domain to a container by name for easy backup and bulk editing. |


# Installation
Install the latest release for Firefox from [AMO](https://addons.mozilla.org/en-US/firefox/addon/container-redirect/)



# Usage

## Basic mapping

`amazon.co.uk, Shopping` will open all amazon.co.uk (not subdomains) links in Shopping container.

## Glob
`!*.amazon.co.uk, Shopping`  will be treated as `*.amazon.co.uk` glob pattern. (suitable to subdomains)

## Regex

`@.+\.amazon\.co\.uk, Shopping` will be treated as `.+\.amazon\.co\.uk` regex. (suitable to subdomains and complex paths)

## Matching with existing container name (settings option 'Match current container name'):

- `<>amazon.co.uk, Shopping` will open all `amazon.co.uk` (not subdomains) links in the `Shopping` container but only if the current tab is not assigned to any container (`<>` at the begining means `No Container`)

- `@<shopping>(?!.+\.amazon\.co\.uk).*, No Container` will open all links from inside the `Shopping` container that are _not_ `.amazon.co.uk` subdomains in the `No Container`

- `@<(?!profile \d).*>.+\.facebook.com, Profile 1` will open all links to `facebook.com` in the `Profile 1` container unless the current tab is already assigned to `Profile 1`, `Profile 2`, `Profile 3`, etc.

# Development

## Available Scripts
In the project directory, you can run:

#### `npm ci`
Installs required dependencies.

#### `npm run webpack`
Starts webpack with `--watch` option and outputs to `./build` directory.

#### `npm run build`
Builds the extension for production use.<br>

#### `npm run test`
Runs test specs using jest.
Use `test:watch` to watch for edits and re-run the tests.

#### `npm run lint`
Lint using eslint.

#### `npm run web-ext`
Runs web-ext process to debug the extension on Firefox. See [web-ext docs](https://github.com/mozilla/web-ext) <br/>
To live reload the extension, start this process in a new tab after starting `npm run webpack` process.
