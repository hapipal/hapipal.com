# hapipal.com
This is the home of [hapipal.com](https://hapipal.com)

Lead Maintainer - [Jared Donisvitch](https://github.com/jdonisvitch)

## About
This website is built on the [pal boilerplate](https://github.com/hapipal/boilerplate)!  More specifically, it based upon the [fancy templated site flavor](https://github.com/hapipal/boilerplate#fancy-templated-site) utilizing Handlebars, Browserify, Babel, Sass, Browsersync, and some others as part of an easy-to-use/no-config frontend toolchain.

This repo contains the content of all Best Practices articles in [`lib/content/best-practices/`](lib/content/best-practices), but API docs are rendered from the relevant repo's `API.md` file.

We utilize the [schmervice](https://github.com/hapipal/schmervice) plugin as a service layer (see [`lib/services/`](lib/services)) where we implement ([cacheable](lib/services/github.js#L50-L62)) integration points with npm, Github, and Mailchimp, and also provide a common interface for route handlers to get information about the Best Practices articles and packages featured in the API Docs section.  Static files are served using [inert](https://github.com/hapijs/inert), and Handlebars templates are served/cached through [vision](https://github.com/hapijs/vision).

### Running the site
```bash
npm install

# For production:
# browsersync is inactive, serves the existing JS and CSS prod builds, template caching is enabled
NODE_ENV=production npm start

# For development:
# browsersync is active, automatic JS and CSS dev builds, template caching is disabled
npm start
```

### Environment variables
```bash
cp server/.env-keep server/.env
# Now fill-in your environment variables in server/.env
```

 - `GITHUB_TOKEN` - Required for markdown rendering on API Docs and Best Practices pages.  You may follow [these instructions](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) to obtain a Github personal access token.  Only `public_repo` scope is necessary.
 - `MAILCHIMP_API_KEY` - Required only for newsletter signup.  The site can be run without this.
 - `MAILCHIMP_LIST_ID` - Required only for newsletter signup.  The site can be run without this.
 - `GA_TRACKING_ID` - Required for Google Analytics.  The site can be run without this.  Only utilized in production.

### Scripts
Build JS and CSS for production using `npm run build`.  JS may be built for development purposes (with sourcemaps, etc.) manually using `npm run prebuild:js`, which is also run automatically when a frontend JS file is updated and `NODE_ENV` is not `'production'`.  And the same story goes for CSS: a development build may be generated with `npm run prebuild:css`.  See package.json for details.

## Extras
 - Big thanks to [Big Room Studios](https://www.bigroomstudios.com/), who sponsored much of the site's initial design and development.
 - hapipal.com was designed by [Justin Varberakis](https://dribbble.com/Varberakis).
