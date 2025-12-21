# <img src="https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/icons/icon.png" alt="Drawing" width="42" align="top"/> Container Redirect

**!!! NOTE !!!** It's a fork of a great extension [containerise](https://github.com/kintesh/containerise) (with some small fixes and additions). All the fame and glory goes to its author [kintesh](https://github.com/kintesh). The original extension is not maintained anymore hence this fork. New features and enhancements are not planned currently, bug fixes and some bits and bobs at best.

Firefox extension to automatically open websites in a container

|![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/1.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/2.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/3.png)  |  ![](https://raw.githubusercontent.com/max-dw-i/container-redirect/master/static/screenshots/4.png)|
| --- | --- | --- | --- |
|Select your container and add a domain to always open all visits in the chosen container. | Add many domains as you wish. | Special `No Container` option to break out of a container. | Simple CSV based mapping of a domain to a container by name for easy backup and bulk editing. |


# Installation
Install the latest release for Firefox from [AMO](https://addons.mozilla.org/en-US/firefox/addon/container-redirect/)



# Usage

## Glob pattern

Glob patterns cover most common cases (see the examples below). For more complicated scenarios, use regex patterns.

1. If a pattern contains only a domain, we try matching only the URL's domain (the whole domain). For example:

- if the pattern is `duckduckgo.com`, then URLs `https://duckduckgo.com`, `https://duckduckgo.com/?q=search+me+baby` will match the pattern but URLs `https://google.com`, `https://google.com/?q=duckduckgo.com` will not match the pattern.

- if the pattern is `*.duckduckgo.com`, then URLs `https://subdomain.duckduckgo.com`, `https://subdomain.duckduckgo.com/?q=search+me+baby` will match the pattern but URLs `https://duckduckgo.com`, `https://google.com/?q=subdomain.duckduckgo.com`, `https://evil.duckduckgo.com.evil.com` will not match the pattern.

2. If a pattern contains only not only a domain but a path, we try matching the whole URL. For example:

- if the pattern is `duckduckgo.com/\?q=search+me+baby`, then only URL `https://duckduckgo.com/?q=search+me+baby` will match the pattern. **Notice that `?` is escaped with `\`. Since `*` and `?` are glob meta-characters, you need to escape them if you want them to be interpreted literally.**

- if the pattern is `*.duckduckgo.com/\?q=search+me+baby`, then URL `https://subdomain.duckduckgo.com/?q=search+me+baby` will match the pattern.

The glob meta-characters `*`, `?` are converted into the regex characters `.*`, `.?` under the hood so there can be more than one such a character in a pattern.


## Regex pattern

Regular expressions should be used when using of glob patterns won't work. A few examples:

1. Search for a pattern anywhere in the URL. For example, pattern `@duckduckgo` and URL `https://duckduckgo.com/?q=search+me+baby`.

2. Search for a pattern in the URL's path but not in the domain. For example, pattern `@.*?/.*duckduckgo\\.com.*` and URL `https://google.com/?q=duckduckgo.com`.


## Matching with existing container name (settings option 'Match current container name'):

**The expression inside `<...>` must be a valid regular expression (`<>` is an exception to map to `No container`)**.

Examples:

- `<>amazon.co.uk, Shopping` will open all `amazon.co.uk` (not subdomains) links in the `Shopping` container but only if the current tab is not assigned to any container (`<>` at the begining means `No Container`)

- `<shopping>@(?!.+\.amazon\.co\.uk).*, No Container` will open all links from inside the `Shopping` container that are _not_ `.amazon.co.uk` subdomains in the `No Container`

- `<^(?!Profile \d$)>@.+\.facebook.com, Profile 1` will open all links to `facebook.com` in the `Profile 1` container unless the current tab is already assigned to `Profile 1`, `Profile 2`, `Profile 3`, etc.


# Integration with Mozilla Addons

## [Temporary Containers](https://addons.mozilla.org/en-US/firefox/addon/temporary-containers/), [Temporary Containers Plus](https://addons.mozilla.org/en-GB/firefox/addon/temporary-containers-plus/)

To prevent some [issues](https://github.com/GodKratos/temporary-containers/issues/38), `Temporary Containers` and `Temporary Containers Plus` are allowed to request containers' patterns.



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
