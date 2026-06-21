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

Supported glob characters are `*`, `**`, `?`.

Search is case-sensitive.

Since `*` and `?` are glob meta-characters, you need to escape them (with `\`) if you want them to be interpreted literally.

### General

1. If the pattern contains only a host, we try matching only the URL's host (the whole thing). For example,

        Pattern: duckduckgo.com
        URLs:
        👍 https://duckduckgo.com/
        👍 https://duckduckgo.com/?q=search+me+baby
        ❌ https://google.com/
        ❌ https://google.com/?q=duckduckgo.com

2. If the pattern contains only a URL's path (pattern that starts with `/`), we try matching only the URL's path (the whole thing). For example,

        Pattern: /\?q=search-me-baby (we escape `?` because it's a glob character, see next chapter)
        URLs:
        👍 https://google.com/?q=search-me-baby
        👍 https://duckduckgo.com/?q=search-me-baby
        ❌ https://duckduckgo.com/?q=do-not-search-me-baby
        ❌ https://duckduckgo.com/?q=search-me-baby&ia=web
        ❌ https://duckduckgo.com/?q=search-me-baby/ (notice the trailing `/` at the end)

3. If the pattern contains both host and URL's path parts, we try matching the whole URL excluding the scheme (`http://`, `https://`). For example,

        Pattern: duckduckgo.com/\?q=search-me-baby
        URLs:
        👍 http://duckduckgo.com/?q=search-me-baby
        👍 https://duckduckgo.com/?q=search-me-baby
        ❌ Any other URL

4. Patterns support port matching. For example,

        Pattern: duckduckgo.com
        URLs:
        👍 http://duckduckgo.com/
        👍 https://duckduckgo.com/
        ❌ http://duckduckgo.com:12345/
        ❌ https://duckduckgo.com:12345/

        Pattern: duckduckgo.com:12345
        URLs:
        👍 http://duckduckgo.com:12345/
        👍 https://duckduckgo.com:12345/
        ❌ http://duckduckgo.com/
        ❌ https://duckduckgo.com/
        ❌ http://duckduckgo.com:54321/
        ❌ https://duckduckgo.com:54321/


### Glob pattern `?`

Character `?` matches exactly one character (except separators).

1. If the pattern contains only a host, we try matching only the URL's host (the whole thing). `?` in the hostname part of the URL matches any character except `.` (because it's a path separator here). For example,

        Pattern: go?gle.com
        URLs:
        👍 https://google.com/
        👍 https://gobgle.com/
        👍 https://go9gle.com/
        ❌ https://go.gle.com/

2. If the pattern contains only a URL's path (pattern that starts with `/`), we try matching only the URL's path (the whole thing). `?` in the path part of the URL matches any character except `/` (because it's a path separator here). For example,

        Pattern: /p?th
        URLs:
        👍 https://google.com/path
        👍 https://boogle.com/poth
        👍 https://9oogle.com/p3th
        ❌ https://google.com/p/th

3. If the pattern contains both host and URL's path parts, we try matching the whole URL excluding the scheme (`http://`, `https://`). For example,

        Pattern: duckd?ckgo.com/\?q=search-me-bab?
        URLs:
        👍 http://duckduckgo.com/?q=search-me-baby
        👍 https://duckdockgo.com/?q=search-me-baba
        ❌ https://duckdckgo.com/?q=search-me-baby

4. Patterns support port matching. For example,

        Pattern: duckduckgo.com:?2???
        URLs:
        👍 https://duckduckgo.com:12345/
        ❌ https://duckduckgo.com:21345/
        ❌ https://duckduckgo.com:1234/

### Glob pattern `*`

Character `*` matches any number of characters, including zero characters (there are some exceptions, see the examples below), but does not cross (or includes) path separators.

1. If the pattern contains only a host, we try matching only the URL's host (the whole thing). `*` in the hostname part of the URL matches any character (or none) except `.` (because it's a path separator here). For example,

        Pattern: go*gle.com
        URLs:
        👍 https://gogle.com/
        👍 https://google.com/
        👍 https://gonoogle.com/
        ❌ https://go.gle.com/
        ❌ https://evil.google.com/

        Pattern: *.google.com
        URLs:
        👍 https://evil.google.com/
        👍 https://bad.google.com/
        ❌ https://google.com/ (`.google.com` is invalid and `*` cannot cross path separator)
        ❌ https://bad.evil.google.com/ (includes a path separator)

        Pattern: google.*
        URLs:
        👍 https://google.com/
        👍 https://google.org/
        ❌ https://google/ (`google.` is invalid and `*` cannot cross path separator)
        ❌ https://google.evil.com/ (includes a path separator)

        Pattern: *
        URLs:
        👍 https://localhost/
        👍 https://myhostnamefromhostsfile/
        ❌ https://google.com/ (includes a path separator)

        Pattern: jobs.*.com
        URLs:
        👍 https://jobs.companyone.com/
        👍 https://jobs.someothercompany.com/
        ❌ https://jobs.com/ (`*` would cross path separators)
        ❌ https://jobs.third.company.com/ (includes a path separator)

2. If the pattern contains only a URL's path (pattern that starts with `/`), we try matching only the URL's path (the whole thing). `*` in the path part of the URL matches any character (or none) except `/` (because it's a path separator here). For example,

        Pattern: /j*bs/
        URLs:
        👍 https://google.com/jbs/
        👍 https://google.com/jobs/
        👍 https://duckduckgo.com/jnobs/
        ❌ https://duckduckgo.com/j/bs/
        ❌ https://duckduckgo.com/jobs/programmer

        Pattern: /some/path/*
        URLs:
        👍 https://google.com/some/path/
        👍 https://duckduckgo.com/some/path/even
        ❌ https://google.com/some/path (`*` would cross path separator after `path`)
        ❌ https://google.com/some/path/even/ (`*` would unclude path separator after `even`)
        ❌ https://google.com/some/path/even/further (`*` would include path separator between `even` and `further`)

        Pattern: /some/*/path
        URLs:
        👍 https://google.com/some/more/path
        ❌ https://google.com/some/path (`*` would cross path separators after `some`, or before `path`)
        ❌ https://google.com/some/even/more/path (`*` would include path separator between `even` and `more`)

3. If the pattern contains both host and URL's path parts, we try matching the whole URL excluding the scheme (`http://`, `https://`). For example,

        Pattern: *.go*gle.com/*earch
        URLs:
        👍 http://evil.google.com/search
        👍 https://good.gogle.com/gearch
        ❌ https://google.com/searching

4. Patterns support port matching. For example,

        Pattern: duckduckgo.com:*
        URLs:
        👍 https://duckduckgo.com:12345/
        👍 https://duckduckgo.com/
        ❌ https://duckduckgo.com:21345/
        ❌ https://duckduckgo.com:1234/

        Pattern: duckduckgo.com:*2*
        URLs:
        👍 https://duckduckgo.com:12345/
        👍 https://duckduckgo.com:12/
        👍 https://duckduckgo.com:2345/
        👍 https://duckduckgo.com:2/
        ❌ https://duckduckgo.com/
        ❌ https://duckduckgo.com:34567/

### Glob pattern `**`

Character `**` matches any number of domain levels and path segments, including zero.

If `**` is in a hostname or path segment, there cannot be any other characters in the same segment. For example, these are valid patterns: `**.google.com`, `jobs.**.com`, `id.**`, `/**/path`, `/more/**/path`, `/path/**`, and these are invalid patterns: `a**.google.com`, `jobs.b**c.com`, `id.**d`, `/a**/path`, `/more/b**c/path`, `/path/**d`.

1. If the pattern contains only a host, we try matching only the URL's host (the whole thing). `**` in the hostname part of the URL matches any number of domain levels (including zero). For example,

        Pattern: **.google.com
        URLs:
        👍 https://google.com/
        👍 https://evil.google.com/
        👍 https://super.evil.google.com/

        Pattern: jobs.**
        URLs:
        👍 https://jobs/
        👍 https://jobs.com/
        👍 https://jobs.company.com/

        Pattern: jobs.**.com
        URLs:
        👍 https://jobs.com/
        👍 https://jobs.companyone.com/
        👍 https://jobs.other.company.com/

2. If the pattern contains only a URL's path (pattern that starts with `/`), we try matching only the URL's path (the whole thing). `**` in the path part of the URL matches any any number of path segments (including zero). For example,

        Pattern: /evil/**
        URLs:
        👍 https://google.com/evil/
        👍 https://google.com/evil/villain
        👍 https://duckduckgo.com/evil/not/good/

        Pattern: /evil/**/company
        URLs:
        👍 https://google.com/evil/company
        👍 https://google.com/evil/very/company
        👍 https://google.com/evil/very/very/company

3. If the pattern contains both host and URL's path parts, we try matching the whole URL excluding the scheme (`http://`, `https://`). For example,

        Pattern: **.google.com/majestic/**
        URLs:
        👍 http://google.com/majestic/
        👍 https://good.google.com/majestic/company

## Regex pattern

Regular expressions is the most versatile way to make a 'URL match' rule. No URL processing happens before pattern matching when this pattern type is chosen so you work with 'raw' URLs.

For case-insensitive search, use flag `i` (see example 3).

A few examples:

1. Search for a pattern anywhere in the URL. For example, pattern `@duckduckgo` and URL `https://duckduckgo.com/?q=search+me+baby`.

2. Search for a pattern in the URL's path but not in the host. For example, pattern `@^https?://\S+/.*duckduckgo\.com` and URL `https://google.com/?q=duckduckgo.com`.

3. Search for a pattern in the URL's path (any casing) but not in the host. For example, pattern `i@^https?://\S+/.*duckduckgo\.com` will match URLs `https://google.com/?q=duckduckgo.com` and `https://google.com/?q=DUCKDUCKGO.com`.

4. Search for a pattern in the hostname only. For example, pattern `@^https?://[^/]*duckduckgo` and URL `https://duckduckgo.com/?q=search+me+baby`.

5. Search for a specific host taking into account the scheme. For example, pattern `@^http://duckduckgo\.com/` and URL `http://duckduckgo.com/?q=search+me+baby`.


## Matching with existing container name (settings option 'Match current container name'):

**The expression inside `<...>` must be a valid regular expression (`<>` is an exception to map to `No container`)**.

Examples:

- `<>amazon.co.uk, Shopping` will open all `amazon.co.uk` (not subdomains) links in the `Shopping` container but only if the current tab is not assigned to any container (`<>` at the begining means `No Container`)

- `<shopping>@(?!.+\.amazon\.co\.uk).*, No Container` will open all links from inside the `Shopping` container that are _not_ `.amazon.co.uk` subdomains in the `No Container`

- `<^(?!Profile \d$)>@.+\.facebook.com, Profile 1` will open all links to `facebook.com` in the `Profile 1` container unless the current tab is already assigned to `Profile 1`, `Profile 2`, `Profile 3`, etc.


## Rule order

Unlike the original extension, this one supports rule order. The higher a rule is in the CSV list (see below), the higher its priority. If more than one rule matches the URL, the rule with the highest priority is going to be used. For example, the current URL is `https://www.reddit.com/r/firefox/`. You'd like to open the `firefox` subreddit in the container **Reddit-Firefox** and the rest of `reddit` URLs should be opened in the container **Reddit**. If your rule list is

```
www.reddit.com , Reddit , blue , circle
www.reddit.com/r/firefox/ , Reddit-Firefox , orange , circle
```

then all the `reddit` URLs are going to be opened in the **Reddit** container (including `https://www.reddit.com/r/firefox/`) because it's the top rule in the list (hence it has a higher priority than the 2nd rule). Now, if you change the rule order to

```
www.reddit.com/r/firefox/ , Reddit-Firefox , orange , circle
www.reddit.com , Reddit , blue , circle
```

now everything works as it's intended. Only the URL `https://www.reddit.com/r/firefox/` is opened in the **Reddit-Firefox** container. The rest of `reddit` URLs are opened in the **Reddit** container.


## CSV Editor

You can use a CSV editor to set up the container rules (*pencil* icon). The rules have the format of `host/URL pattern`, `container name`, `container color` (optional), `container icon` (optional). For example,

```csv
www.reddit.com , reddit , orange , fruit
google.com , Google , blue , fingerprint
```

If the container defined in the rule already exists, the values of the color and icon will be ignored (the values of the already existing container will be fetched and used when the changes are saved).

If the container defined in the rule does not exist, it will be created. If the optional values (color and icon) are not set, random values will be chosen.

**IMPORTANT: the rule order matters! You might have more than one pattern that match your URL. In this case the first one is going to be used (the one that is closest to the top of the list).**

# Integration with Mozilla Addons

## [Temporary Containers](https://addons.mozilla.org/en-US/firefox/addon/temporary-containers/), [Temporary Containers Plus](https://addons.mozilla.org/en-GB/firefox/addon/temporary-containers-plus/)

To prevent some [issues](https://github.com/GodKratos/temporary-containers/issues/38), `Temporary Containers` and `Temporary Containers Plus` are allowed to request containers' patterns.


# Migrating to `4.x.x`

1. **Case-sensitive host/URL patterns and container names**

- In the previous versions of the extension, patterns did not take into account the casing of URLs and container names. For example, if you had pattern `@www.reddit.com/r/Cars`, it would match all of the following URLs: `https://www.reddit.com/r/CARS`,  `https://www.reddit.com/r/cars`,  `https://www.reddit.com/r/Cars`,  `https://www.reddit.com/r/CaRs`, `https://www.reddit.com/r/cArS`, and so on. While this was not a problem in most cases, technically, these are all different URLs (see RFC 3986). From now on, the pattern will only match the URL with `Cars` in the path, not any other casing combination.

*Action required*. Verify your host/URL patterns. If you need to match URLs with capital letters, please update your patterns to reflect the correct casing. You can migrate your regex patterns quickly by adding the `i` flag (replace `@` with `i@`).

- The same applies to container names. In Firefox, the container names like `REDDIT`, `reddit`, `Reddit`, `ReDdIt` are all distinct but our container matching logic was not case-sensitive. Therefore, for example, a CSV rule `www.reddit.com, reddit` would match any of the previously mentioned container. From now on, if you have a container named `REDDIT` (and not `reddit`), the rule will not trigger.

*Action required*. Verify your CSV rules. Ensure container names in your rules match the exact casing of your Firefox containers.

2. **Regex pattern**

- In the previous versions of the extension, we automatically trimmed the URL scheme (`https://` and `http://`). Consequently, a pattern like `@^www.reddit.com` would match both URLs `http://www.reddit.com` and `https://www.reddit.com`. However, users may want to define different rules for different schemes. Therefore, we do not do any URL processing prior to pattern matching.

*Action required*. If your regex patterns are anchored to the beginning of the line (starts with `@^`), you must now include the scheme. To migrate quickly, replace `@^` with `@^https?://` in your existing regex patterns.

3. **Glob pattern**

- Behavior of the glob meta-chatacter `?` was changed. From now on, it matches any single character except the *path separator* characters (which is `.` in the hostname part of URLs and `/` in the path part of URLs). Before, under the hood, `?` was converted into the regular expression `.?`.

- Behavior of the glob meta-chatacter `*` was changed. From now on, it matches zero characters or any number of arbitrary characters except the *path separator* characters (see above). Before, under the hood, `*` was converted into the regular expression `.*`.

- New glob meta-character `**` is introduced.

- Port matching is now supported.

*Action required*. Please, see the new [documentation](https://github.com/max-dw-i/container-redirect/blob/master/README.md#glob-pattern) and update your patterns.


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
