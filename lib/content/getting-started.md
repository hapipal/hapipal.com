# Getting Started

Welcome! Thanks for trying out hapi pal. Today, we're going to show you how to start a project with pal, explaining the component parts and a bit of the theory behind them along the way.

## Common-Mistakes

This is where we can add common mistakes.

## Who is this guide for?

We assume intermediate JavaScript experience, with at least a basic grasp of working with nodejs, and familiarity with server-side web development (e.g. routing, models, database management, etc.). We won't cover these concepts here, just how to implement them.

That assumed, this guide is likely, though not exclusively, most useful for:

 - Someone familiar with hapi, looking to improve their architecture or sharpen their tools
 - Someone with zero experience with hapi who'd like a gentle introduction to working with the framework, for example to vet it as their next project's web server framework

If you're here and you've read this far, you're probably at least a little bit interested in some of this, so we encourage you to read on—you might still find the below interesting, if not useful.  

## What is hapi pal?
> A friendly, proven starting place for your next hapi plugin or deployment

Pal isn't a framework, but a pre-designed architecture for a hapi project and suite of tools that help keep you focused on getting real work done with hapi, instead of worrying about bigger, hairier existential questions like project structure, scalability across teams and servers, and portability, to name a few. In short, our purpose is to ease you into working with hapi, showing how to become productive with the framework quickly while ensuring that your project rests on a solid, scalable foundation.

There are, of course, a million ways to skin this particular cat. Pal is opinionated. You might have differing opinions on how to setup your projects. That's all good! Our tools are designed to fit into existing projects or be adopted progressively over time. If you're at all interested in learning or further mastering hapi, we encourage you to keep reading. While this tutorial will explain hapi pal's philosophy and organization, it will also give you hands-on knowledge of the hapi framework by easing you into its basic features. You can then transfer this knowledge and theory to any hapi project, regardless of whether you keep using pal.

If nothing else, we hope to show you how to be productive with hapi. If you like using pal, well, of course we'd be pumped about that too!

## Our example application

We'll work through an example application, available in the hapipal/examples repository, [here](https://github.com/hapipal/examples/tree/master/paldo-riddles).

In our example we'll follow our dear Paldo, a playful heart who likes to share riddles with friends.

We'll help Paldo build out and grow a project—conveniently for us, a web server—to scratch this itch.  Paldo will begin by serving random, hard-coded riddles to their friends; perform some refactoring; move on to allow friends to look-up answers to riddles; then incorporate a SQL database to back all this juicy riddle data.

## Installation

First things first, we need to setup a base pal project. Run the following:

```sh
npx hpal new paldo-riddles
cd paldo-riddles
npm install
```

You'll be prompted with the [`npm init`](https://docs.npmjs.com/cli/init) dialog, where you can enter details about your project that will go into its `package.json` file.  Feel free to take the time to fill-out the details, or just "enter" all the way through—either is fine for the purposes of this tutorial.

You now have a base pal project directory ready to go!

`npx hpal new paldo-riddles` calls hapi pal's command line utility [hpal](https://www.npmjs.com/package/hpal) to bootstrap a new project in a directory titled `paldo-riddles` in our current working directory (the argument to `new` is just a path). `npx`, shipping with npm as of v5.2, allows us to:
 - run package commands straight from the npm registry as one-offs
 - execute package commands installed locally to your project without specifying the path to the package

<sup>[There's more to npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b), if you're curious.</sup>

We'll cover more on `hpal` in just a bit.

You should now be sitting in a directory that looks like this:

```sh
paldo-riddles/
├── lib/
│   ├── routes/
│   ├── .hc.js
│   └── index.js
├── node_modules/
├── server/
│   ├── .env-keep
│   ├── index.js
│   └── manifest.js
├── test/
│   └── index.js
├── .eslintrc.json
├── .gitignore
├── .npmignore
├── package-lock.json
├── package.json
└── README.md
```

Don't worry about understanding the anatomy of all this just yet—we'll talk about the directory structure as we go!

Now, give the following a spin:

```sh
npm start
```

You should see:

```sh
> paldo-riddles@1.0.0 start /your/local/path/paldo-riddles
> node server

Server started at http://0.0.0.0:3000
```

If you then visit that address in your browser or cURL it (`curl http://0.0.0.0:3000`), you should receive the following:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Not Found"
}
```

And that's exactly what we want for now! Everything's working and setup, congrats! Now, for something more interesting.

## But first, server configuration!

Behind this simple call to `npm start`, some important steps are taken to configure and start your server.  The most important things to know for now is that hapi is deeply configuration-oriented, and that the `server/` directory is where configuration related to your _deployment_ lives.  We distinguish your deployment from the guts of your application, which live in `lib/`, for all sorts of useful reasons that we lay-out in a separate article ["The joys of server / plugin separation"](/best-practices/server-plugin-separation).

We won't do anything too complex with configuring our server here, but pal comes with a couple of tools for configuring our server and its attendant plugins:

 - **The server manifest** (`server/manifest.js`)

   This is a document describing the options we apply to our hapi server, including the various hapi plugins we register on it. Technically it represents a [Glue](https://github.com/hapijs/glue) manifest, which will be used to compose our server based upon server, connection, and hapi plugin configurations.  It utilizes hapi's [Confidence](https://github.com/hapijs/confidence) package, essentially a dynamic, filterable configuration document format, in order to cleanly adjust the server's configuration based upon environment variables.

 - **The environment file** (`server/.env`)

   This is a file for storing environment variables (recommended by the [12-factor methodology for storing configuration](https://12factor.net/config)); we use the [dotenv](https://github.com/motdotla/dotenv) library to parse this file's contents into node's [`process.env`](https://nodejs.org/api/process.html#process_process_env), then utilize those variables in our server configuration as needed.

The basic process for configuring our server:

1. Make a copy of `.env-keep` named `.env`.
   - Do not commit this file! Keep it local, as it's the place where you'd keep sensitive information, like API keys or other credentials. By default it's listed in the `.gitignore` file, so it won't be tracked.
2. Specify dynamic (deployment-specific) configuration in that file.
   - Be sure to keep `.env-keep` up-to-date with placeholders for each environment variable your application uses.  That way, the next person who clones your project will know which credentials need to be filled-in.
3. Reference and work with those variables in our server manifest.

A simple example:

We can add the following to our `.env` file:

```env
NODE_ENV=development
```

Now, let's take a look at our manifest. Near the top, we see:

```js
    //...
    debug: {
        $filter: 'NODE_ENV',
        development: {
            log: ['error', 'implementation', 'internal'],
            request: ['error', 'implementation', 'internal']
        }
    }
    // ...
```

The `$filter` Confidence directive uses the specified environment variable, `process.env.NODE_ENV`, to filter the value set to the current property, `debug` (which, following the specification of a [Glue manifest](https://github.com/hapijs/glue/blob/master/API.md#await-composemanifest-options), represents the [server.options.debug](https://github.com/hapijs/hapi/blob/master/API.md#server.options.debug) hapi server option).

To translate: because we configured `NODE_ENV` as `development` in the `server/.env` file, our server is now configured to log errors to the console.

There's more to Confidence, but the gist is that the hapi pal configuration setup allows us to not just set configuration in the environment, but conditionalize our hapi server configuration based upon the environment with minimal overhead.  As with everything else we gloss over here, we encourage you to [read more](https://github.com/hapijs/confidence) if you're still curious.

## Creating your first routes

The only riddle to our current `404` message is "Why would Paldo care?" And the answer is, to say the least, uninteresting.

As we know, Paldo wants to share riddles with friends. They don't need anything fancy to start, just a way to get off the ground! And riveting suspense in [classic fantasy literature](https://en.wikipedia.org/wiki/The_Hobbit) aside, refusing to answer riddles is plain cruel. Of course, Paldo wants to offer their friends reprieve if they really, really tried but can't crack these riddles, so Paldo will also need a way to give answers.

The simplest way to do all this? A couple of quick and easy routes.

`hpal` helps us out here, too. It can generate a route template we can simply fill in.

Now, instead of running pal's CLI from the registry, we'll add it to our project and run it from there. This step isn't strictly necessary, but at least makes explicit our dependency on the tool for project scaffolding tasks, rather than counting on the project maintainer's familiarity with the pal-verse to know `hpal` is available.  `npx hpal` will first look wherever `npm bin` thinks your local npm executable directory is, which in our case should be `paldo-riddles/node_modules/.bin`, and if `hpal` isn't found there it will be installed then run from the npm registry.

> Alternatively you may install it globally, then run `hpal` directly without using `npx`.

```sh
npm install --save-dev hpal
npx hpal make route riddle-random
```

You should see `Wrote lib/routes/riddle-random.js`. That file now exists in our project. It should contain this basic route template:

```js
'use strict';

module.exports = {
    method: '',
    path: '',
    options: {
        handler: async (request, h) => {}
    }
};
```

The file exports a hapi [route configuration object](https://github.com/hapijs/hapi/blob/master/API.md#server.route()) (or may export an array of them).  hapi pal's directory and file structure is governed by a tool called [haute-couture](https://github.com/hapipal/haute-couture), which you can see is used in your project at `lib/index.js`.  When you place a file in the `routes/` directory, as hpal did for us here, it will automatically be added to your application plugin because haute-couture will make the call to [`server.route()`](https://github.com/hapijs/hapi/blob/master/API.md#server.route()) for you!  The same can be said for other plugin functionality—you'll find that models go in `models/`, authentication strategies go in `auth/strategies/`, etc.

But for now we just need to outfit this file so it allows Paldo to broadcast a riddle, chosen at random from the complete archives, to any friends interested in a brain-teaser.

That might look like the following:

```js
'use strict';

module.exports = {
    method: 'GET',
    path: '/riddle-random',
    options: {
        // Our handler doesn't need to do anything asynchronous or use the
        // response toolkit, so the route handler's signature appears a little simpler than before
        handler: (request) => {

            // We define some riddles, just hardcoded for now

            const riddles = [
                {
                    slug: 'no-body',
                    question: 'I have a head & no body, but I do have a tail. What am I?',
                    answer: 'A coin'
                },
               // etc.
            ];

            // And we reply randomly

            const randomIndex = Math.floor(Math.random() * riddles.length);
            const randomRiddle = riddles[randomIndex];

            return `${randomRiddle.slug} — ${randomRiddle.question}`;
        }
    }
};
```

Be sure to restart your server in order to pick-up this new code.

If you cURL our new route (`curl http://0.0.0.0:3000/riddle-random`) or visit it in your browser, you'll see one of Paldo's riddles. We're up and running!

Now, let's setup letting people get answers if (well, when :)), they get stumped. We'll rely on Paldo's friends supplying the `slug` of the riddle they're stuck on (for now) to know which answer to supply.

First, we setup the route:

```sh
npx hpal make route riddle-answer
```

Alternatively, you can convert our first route's export to an array of route objects since hapi's [server.route()](https://github.com/hapijs/hapi/blob/master/API.md#server.route()) accepts both a single route object or an array. In this tutorial, we'll store one route per file, but we encourage you to experiment with what organization works for you. We do find that 1. it's convenient to have the handler inline with the rest of the route config and 2. it becomes cumbersome to maintain multiple handlers in the same file, which leads us to typically have a single route config and handler per file.

Moving on!

Immediately, we see that our strategy of hardcoding our riddles within our first route's handler is, although expedient, unworkable. Our other routes will need to know about that data (let alone any other pieces of our riddle-sharing application we build later). So, let's centralize it.

There's a whole slew of ways you handle this. A simple one: we just create a file called `data` under `lib` and set it up to export our riddles.

```js
// lib/data.js
'use strict';

exports.getRiddle = (slug) => {

    const bySlug = (riddle) => riddle.slug === slug;

    return exports.riddles.find(bySlug);
};

exports.riddles = [
    {
        slug: 'no-body',
        question: 'I have a head & no body, but I do have a tail. What am I?',
        answer: 'A coin'
    }
    // etc.
];
```

Now, we just require this file in any route that needs to know about our riddles. Our first route now becomes much simpler.

```js
// lib/routes/riddle-random.js
'use strict';

const Data = require('../data');

module.exports = {
    method: 'GET',
    path: '/riddle-random',
    options: {
        handler: (request) => {

            const randomIndex = Math.floor(Math.random() * Data.riddles.length);
            const randomRiddle = Data.riddles[randomIndex];

            return `${randomRiddle.slug} — ${randomRiddle.question}`;
        }
    }
};
```

And now, our new route:

```js
// lib/routes/riddle-answer.js
'use strict';

// Boom builds Error objects for hapi that represent HTTP errors
const Boom = require('@hapi/boom');
const Data = require('../data');

module.exports = {
    method: 'GET',
    path: '/riddle-answer/{slug}',
    options: {
        handler: (request) => {

            const { slug } = request.params;
            const riddle = Data.getRiddle(slug);

            // array.find() returns undefined when unsuccessful
            // In that case, we give the client an HTTP 404 error

            if (!riddle) {
                throw Boom.notFound('Sorry, that riddle doesn\'t exist (yet)');
            }

            return riddle.answer;
        }
    }
};
```

Now, passing any riddle's `slug`s here returns its answer.
```sh
# Use a slug from your project
curl http://localhost:3000/riddle-answer/no-body
```

## Aside: Linting

We're going to dive into more complex, glamorous stuff in a sec. But, since we've written some chunks of code and are about to write a whole lot more, let's quickly cover how to lint our work.

Pal uses [eslint](https://eslint.org/) and comes outfitted with a [hapi-specific eslint configuration](https://github.com/continuationlabs/eslint-config-hapi) that you're [welcome to extend or customize](https://github.com/hapipal/boilerplate/blob/pal/.eslintrc.json).

We can take advantage of this in a couple of ways.

### Manually

Just run `npm run lint`—this executes eslint with our config on all files not ignored by npm (see the project's standard `.npmignore`)—and then fix whatever warnings and errors it spits out.

Batching lint errors in this way provides you a quick and clear punchlist of lines to clean-up before committing and pushing your code.

### On-the-fly

Many modern IDEs have eslint plugins that will detect any eslint configuration files in your project and shout out as you break whatever rules you've setup as you code.

If you don't mind the near-constant noise, this can be a helpful way to stay on top of linting errors.

Take a peek at this [list of editors with eslint integrations](https://eslint.org/docs/user-guide/integrations#editors).

So, with that in hand, lint away, tidy up, then keep moving.

## Setting up a database

In each of our routes, we did some work to set and move around our hard-coded riddles data. For all but the simplest applications, this strategy for storing data isn't workable. We'll want to setup an actual database, store our riddles there, then give Paldo some tools for managing their riddle data themselves, instead of having to ask us to do the silly manual hard-coded updates.

### Flavors

Pal has assembled a few packets of additional tooling and functionality that we refer to as flavors: these are things that you can apply to the baseline pal boilerplate to help build out specific types of projects.

Flavors are really just tagged commits that you can `git cherry-pick`. They're intentionally small, a couple of short configuration files / file modifications and a few new dependencies, tops. Just like the basic pal setup, we give you just the scaffolding—tooling and directory structure—to get started, guiding you to writing your own code quickly.

hapi pal's tool of choice for database management and querying is [Objection ORM](https://github.com/Vincit/objection.js), which we've integrated with hapi via the [schwifty](https://github.com/hapipal/schwifty) plugin.

Objection ORM is an impressive SQL query-builder with a fantastic community, built on top of [knex](http://knexjs.org).  We find that it keeps us in control of our data access, and allows us to drop down to low-level database features as needed.  Schwifty integrates Objection into hapi by ensuring the database is available when the server starts, closing database connections when the server stops, pluginizing knex migrations, and making models available where it is most convenient.

So, let's pull in our [Objection flavor](https://github.com/hapipal/boilerplate/commit/objection).

If you used the hpal CLI to start your project as described above, just run:

```sh
git cherry-pick objection
npm install
```

If you just cloned the pal repo (rather than using `npx hpal new ...`), you'll need to fetch the tagged commits first:

```sh
git fetch pal --tags
git cherry-pick objection
```

Expect to resolve small merge conflicts when pulling flavors in, typically just in `package.json` having to do with overlapping dependencies in HEAD and the flavor.

Most of what just got pulled in is relatively simple, but worth a quick review:

 - The `objection`, `schwifty`, `knex`, and `sqlite3` packages.
   - `objection` is the SQL-oriented ORM described above.
   - `sqlite3` is a light-weight SQL database engine that we'll use to test our work here.
   - `knex` handles database connections and provides the core query-building functionality to Objection.
   - `schwifty` is the hapi plugin described above, allowing knex, Objection, and hapi to all play nice together.
 - [`knexfile.js`](http://knexjs.org/#knexfile) is a configuration file that the [knex CLI](http://knexjs.org/#Migrations-CLI) will use to know how to connect to our database.  We use the knex CLI to create new migrations and manually run migrations.
 - `lib/migrations/` and `lib/models/` are where we keep our database migration files and models, respectively; we'll write some in just a minute! As with most things in pal, just put those resources in the folders created for them and haute-couture takes care of the rest.

We left off the slightly more nuanced point: `lib/plugins/schwifty.js` vs. the `schwifty` plugin added to `server/manifest.js`.

The difference, to keep things simple here, is a matter of scope.  Our application is implemented as a hapi plugin in `lib/`.  That plugin depends on schwifty in order to define some models, so it registers schwifty by placing the file `lib/plugins/schwifty.js`.  Our hapi server is located in `server/`, which is where all the nitty-gritty configuration concerning our deployment should live.  In particular, our database configuration can be specified there by registering schwifty in `server/manifest.js`.

In this way, our plugin (`lib/`) can travel around to different servers if it needs to, and never worry about all the hairy deployment details, such as database credentials: schwifty will ensure our plugin finds the relevant database connection provided by knex, and bind it to our models.  On the flip side, we can also set plugin-specific configuration like `migrationsDir`—used by knex to determine which directory to check for the plugin's migration files—out of our deployment's configuration.  Nice!

For a deeper look at this independence of plugin and deployment, take a peek at ["The joys of server / plugin separation"](/best-practices/server-plugin-separation) (also linked earlier regarding [server configuration](#but-first-server-configuration)).

Did we mention that you can deploy multiple plugins together, each with their own independent migrations?!  If, for example, we add another plugin to our server that just so happens to use schwifty, we wouldn't have to care at all about the two colliding.  Our plugin in `lib/` would keep using its configured migrations directory and the new plugin could also use its own, whether they share the same database or use separate databases.

One final point on `server/manifest.js`—let's quickly peruse how we've configured our base database connection:

```js
    // ...
    $base: {
        // This is a schwifty option that sets our server to automatically run our migrations on server start, bringing our database up to date
        migrateOnStart: true,
        knex: {
            client: 'sqlite3',
            useNullAsDefault: true,         // Suggested for sqlite3
            connection: {
                filename: ':memory:'        // You may specify a file here if you want persistence
            }
        }
    }
    // ...
```

The main takeaway from here is that, out of the box, we get an in-memory database. This is just fine for our purposes as our data doesn't matter too much here (sorry, Paldo!), so it's okay for it to disappear every time our server shuts down.  Just be aware to not expect any of the data we setup in the rest of the tutorial to hang around. In our examples, we'll act as if our data is reliable and persistent.  If you'd like to use a persistent data store, you may set an actual `filename` for SQLite3 to store data rather than `':memory:'`, or configure knex to use a PostgreSQL connection, for example.

Phew! That was a pile of words and theory! Sorry about that. Let's first just check everything's still working:

```sh
# bring in our new dependencies
npm install
npm start
```

Good! Now we can get back to building.

### Models and Migrations

This section is a bit abstract, as we won't be able to test anything just yet. We're doing the legwork to get our data-scaffolding in place so that we're set up to start doing interesting work with it.

Our job now is to,
1. model the real-life objects (riddles) our client (Paldo) cares about in our system
2. set up our database so we can use it to store and retrieve instances of these models

The pal CLI again helps us out here:

```sh
npx hpal make model Riddles
```

Should result in `Wrote lib/models/Riddles.js`.
Let's break that file down:

```js
// lib/models/Riddles.js
'use strict';

const Schwifty = require('schwifty');
const Joi = require('@hapi/joi'); // hapi's package for data validation

// Schwifty models are based on Objection's, but outfitted to use Joi

// Make sure to update "ModelName" to your model's name—
// this is how you will reference it throughout your application.
module.exports = class ModelName extends Schwifty.Model {

    static get tableName() {

        return '';
    }

    // Here we'll define a joi schema to describe a valid Riddle.
    // Schwifty will then use this to ensure that the data we try to use
    // to create/update our riddles complies with our definition of a Riddle.

    static get joiSchema() {

        return Joi.object({});
    }
};
```

First thing's first: make sure to change your model class's name from `ModelName` to `Riddles`, which is how we'll reference the model throughout the application (e.g. in route handlers).  Similarly, set the `tableName` to whichever table you'd like to store riddles in your database, most likely just `'Riddles'`.

To continue to fill this out properly, it requires some understanding of [Joi](https://github.com/hapijs/joi), hapi's library for validation.  Joi is extremely expressive, as you can probably tell from its extensive [API documentation](https://github.com/hapijs/joi/blob/master/API.md).  hapi route payload, query, and path parameters [are also typically validated using Joi](https://github.com/hapijs/hapi/blob/master/API.md#route.options.validate), which is why we integrated it into Schwifty's `Model` class.  After looking at some Joi examples, let's fill that in, then:

```js
// lib/models/Riddles.js
'use strict';

const Schwifty = require('schwifty');
const Joi = require('@hapi/joi');

module.exports = class Riddles extends Schwifty.Model {

    static get tableName() {

        return 'Riddles';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer(),
            slug: Joi.string(),
            question: Joi.string(),
            answer: Joi.string()
        });
    }
};
```

With the above changes, we've just declared:
 - We care about Riddles objects and will store them in a table of the same name.
 - Riddles have a slug, question, and an answer, all of which must be strings.
 - Riddles have a numeric id.

Now let's get that model into our database. To do that, we use knex migrations. You can read more [here](http://knexjs.org/#Migrations), but, basically, the task is using [knex's schema builder](http://knexjs.org/#Schema) to describe the modifications to our database needed to store the model we just described. (Or modified! If you ever change a model, chances are good you'll need to make a corresponding change to your database via a migration.)

First, we create a migration file. We can auto-generate one with the knex command:

```sh
npx knex migrate:make add-riddles
```

Things to know:
 - the `knex` CLI is installed with the main knex package.
 - `migrate:make` is described in the knex docs [here](http://knexjs.org/#Migrations-CLI).
 - `add-riddles` is just the base name of the migration file; try to describe what this migration does to make reviewing migration history mildly easier.

If everything's going okay, you should see something like:

```sh
Created Migration: /your/local/path/paldo-riddles/lib/migrations/20180226173134_add-riddles.js
```

knex uses the timestamps of your migration files to reliably order migrating and rolling back.

That creates just the scaffold of a migration file. Here's our filled-in version:

```js
'use strict';

exports.up = (knex, Promise) => {

    return knex.schema.createTable('Riddles', (table) => {

        table.increments('id').primary();
        table.string('slug').notNullable();
        table.string('question').notNullable();
        table.string('answer').notNullable();
    });
};

exports.down = (knex, Promise) => {

    return knex.schema.dropTable('Riddles');
};
```

Essentially, we've copied the work we already did in our model, but we should note a couple of migration-specific concepts here:

 - `up` and `down` - these are the actions we can take with our migrations; `up` performs the migration while down is used to rollback the migration. `down` should always be the inverse of `up`, bringing our database back to the state it was in prior to running the migration.
 - `notNullable()` - this means that these fields are required. Note that Joi's default is object properties are optional.
 - `increments('id').primary()` - we define an auto-incrementing `id` as the primary key for each Riddle.

Moment of truth! Go ahead and run it!

```sh
npx knex migrate:latest
```

If all's gone well, you should see:

```sh
Batch 1 run: 1 migrations
/your/local/path/paldo-riddles/lib/migrations/20180226173134_add-riddles.js
```

At long last, we're ready to start working with our data.

### Querying our Database

Let's get rid of those hardcoded riddles. To recreate them, we'll give Paldo the tools to create riddles on their own.

We'll setup a route, write our first Objection query in our handler, then check our work.

Once again, do the `hpal` dance:

```sh
npx hpal make route riddle-create
```

Then fill in the route template as follows:

```js
// lib/routes/riddle-create.js
'use strict';

const Joi = require('@hapi/joi');

module.exports = {
    method: 'POST',
    path: '/riddle',
    options: {
        validate: {
            // Check that the POST'd data complies with our model's schema
            payload: {
                slug: Joi.string().required(),
                question: Joi.string().required(),
                answer: Joi.string().required()
            }
        },
        // Our db query is asynchronous, so we keep async around this time
        handler: async (request) => {

            // We nab our Riddles model, from which we execute queries on our Riddles table
            const { Riddles } = request.models();

            // We store our payload (the prospective new Riddle object)
            const riddle = request.payload;

            // We try to add the POST'd riddle using Objection's insertAndFetch method (http://vincit.github.io/objection.js/#insertandfetch)
            // If that throws for any reason, hapi will reply with a 500 error for us, which we could customize better in the future.

            return await Riddles.query().insertAndFetch(riddle);
        }
    }
};
```

A bunch of familiar route setup, but we've also got a few new things going on here. Let's step through them:

 - [`options.validate`](https://github.com/hapijs/hapi/blob/master/API.md#-routeoptionsvalidate) — where you place input validation rules; hapi allows various properties here for the different types of input you might allow. In our case, with a `POST`, we're looking at [`payload` validation](https://github.com/hapijs/hapi/blob/master/API.md#-routeoptionsvalidatepayload), which, just like our model, uses Joi to validate its input. hapi expects some sort of Joi schema: a plain object with properties containing Joi validations as seen above, or a full Joi schema object, like in our model (if we use a plain object, hapi will compile that object into a Joi schema for us).
   - Note that we have to call `.required()` on each key in this version of our schema. All Joi rules are [optional by default](https://github.com/hapijs/joi/blob/master/API.md#anyoptional). If we didn't require these values, they'd pass into our query, which would then fail due to a constraint violation, specifically that all of our riddle's schema's values are not allowed to be null in the database (per the `notNullable()` calls we made in our migration file).

 - `const { Riddles } = request.models()`

 The [`request.models()`](https://github.com/hapipal/schwifty/blob/master/API.md#requestmodelsall) method is a request decoration added by schwifty. It allows you to access the models registered by your plugin so that we can make queries against them.  Just ensure that the name used here matches your model class's name: `class Riddles extends Schwifty.Model {}`.

 - `await Riddles.query().insertAndFetch(riddle)`

 All Objection models, and therefore schwifty models (which extend Objection models) come with the static `query()` method, which translates to a SQL query for the table associated with the calling model (see [Objection's explanation](http://vincit.github.io/objection.js/#query-examples))

   - This declares the `Riddles` table as the target of the query we're building.
   - Objection's API is Promise-based so we can `await` here.
   - `insertAndFetch(riddle)` - inserts the Riddle into the database then fetches it, including its auto-incremented `id` column.

Now, if we start our server and hit our new route...

```sh
$ curl -H "Content-Type: application/json" -X POST -d '{"slug": "see-saw", "question": "We see it once in a year, twice in a week, but never in a day. What is it?", "answer": "The letter E"}' http://0.0.0.0:3000/riddle
```

...we hopefully see our new model, sent right back to us with the `id` property set on it by our database, per the primary key in our migrations file:

```json
{"slug":"see-saw","question":"We see it once in a year, twice in a week, but never in a day. What is it?","answer":"The letter E","id":1}
```

Excellent! We now have a fully wired-up database capable of storing our Riddles.

## Another Aside: Simplified Testing with Swagger

We have a lot of love for cURL. Still, manually prodding our endpoints puts the onus of properly formatting our requests on us, an error-prone endeavor liable to drive you a bit nuts as you build, especially if you end-up working with more complex models.

Thankfully, we can address this issue post-haste with another flavor.

```sh
git cherry-pick swagger
```

This sets up a [Swagger interface](https://swagger.io/) for our application, courtesy of a fantastic hapi plugin named [hapi-swagger](https://github.com/glennjones/hapi-swagger). Now, if we mark our routes appropriately, they will appear at `/documentation`, where we'll see a set of forms for each route where we can hit our routes and enter data directly without manually formatting it.

To mark our routes, add the following `tags` entry to each route config:

```js
module.exports = {
    method: 'POST',
    path: '/riddle',
    options: {
        // Swagger looks for the 'api' tag
        // (see https://github.com/hapijs/hapi/blob/master/API.md#route.options.tags)
        tags: ['api'],
        validate: { ... }
    }
    // etc.
};
```

Now, if we start up our server and go to [http://0.0.0.0:3000/documentation](http://0.0.0.0:3000/documentation), we can see all our routes and can test them from there, as an alternative to cURLing. This is totally a nice-to-have, just simplifies our testing live a bit.

> **Note**
>
> The Swagger UI will come up if you visit [http://localhost:3000/documentation](http://localhost:3000/documentation). However, any requests sent through it will fail near-silently, saying something like "no response from server". This is due to a CORS issue: our server, as specified in our manifest, lives on host `0.0.0.0`, which is what our Swagger manifest claims.  We're on `localhost`, which is a different host than `0.0.0.0`, so the browser blocks the request.
>
> **We suggest that you ensure you visit /documentation on the host `0.0.0.0` rather than `localhost` to avoid this CORS issue.**

If you feel like dipping your toes in CORS with hapi, feel free to add the following to `server/manifest.js`.

```diff
 server: {
     host: '0.0.0.0',
     port: process.env.PORT || 3000,
     debug: {
         $filter: 'NODE_ENV',
         development: {
             log: ['error', 'implementation', 'internal'],
             request: ['error', 'implementation', 'internal']
         }
     },
+    routes: {
+        cors: {
+            $filter: 'NODE_ENV',
+            development: true
+        }
+    }
```

This block sets all routes registered on our server to permissively allow cross-origin requests by default. For more information on configuring CORS in hapi: [`route.options.cors`](https://github.com/hapijs/hapi/blob/master/API.md#route.options.cors).

We set this configuration only in development because, for security reasons, we may want to control who we accept requests from in production. Not so important here, but to simply illustrate a best practice.

Moving on!

## Post-DB Integration Cleanup and Refactoring

Having made Paldo's Riddles a bit more flexible and dynamic, let's clear out our hardcoded work we put into place earlier. We can delete the `lib/data.js` file altogether, since we'll be storing new riddles in the database by making calls to `POST /riddles`.

In fact, let's delete our `riddle-answer` route too, replacing it with a route for getting all details about a specific Riddle. We do that to move this to a simpler interface, which allows interaction with entire resources, not just pieces of them.

Feel free to `git commit` before removing these files, so that you can look back at all the work you've done later!

```sh
rm lib/data.js lib/routes/riddle-answer.js
npx hpal make route riddle-by-id
```

We end up with this:

```js
// lib/routes/riddle-by-id.js
'use strict';

const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

module.exports = {
    method: 'GET',
    path: '/riddle/{id}',
    options: {
        tags: ['api'],
        validate: {
            params: {
                id: Joi.number().integer()
            }
        },
        handler: async (request) => {

            const { Riddles } = request.models();
            const { id } = request.params;

            const riddle = await Riddles.query().findById(id);

            if (!riddle) {
                throw Boom.notFound('Sorry, that riddle doesn\'t exist (yet)');
            }

            return riddle;
        }
    }
};
```

The only new thing is really that we're now validating [path parameters](https://github.com/hapijs/hapi/blob/master/API.md#path-parameters) instead of a payload, but the core ideas are essentially the same.

Finally, we'll need to refactor our `riddle-random` route, so it doesn't depend on our defunct `lib/data.js`. This ends up being a bit more complex than originally, given that we no longer trivially know how many riddles comprise the range of our random selection.

```js
// lib/routes/riddle-random.js
'use strict';

const Boom = require('@hapi/boom');

module.exports = {
    method: 'GET',
    path: '/riddle-random',
    options: {
        tags: ['api'],
        handler: async (request) => {

            const { Riddles } = request.models();

            // Count all Riddles
            const count = await Riddles.query().resultSize();

            // The only case that we can't find a riddle is if there aren't any in the DB
            if (count === 0) {
                throw Boom.notFound('Looks like we don\'t have any riddles. Sorry!');
            }

            // Use the total riddle count to determine a random offset
            const randomOffset = Math.floor(Math.random() * count);

            // Grab the Riddle at that random offset
            const randomRiddle = await Riddles.query().offset(randomOffset).first();

            return randomRiddle;
        }
    }
};
```

Ok, let's boot-up and test! Assuming we used `POST /riddle` to create some riddles, `/riddle/1` will return the first riddle we created and `/riddle-random` will behave as it did previously.

## Paldo says thanks!

Hey, this is a pretty good start for Paldo—good work!  As you can see, there's a lot out there to explore in both the hapi-verse and pal-verse.  We hope this is a good starting point to dive deeper into the features and documentation of the various tools that pal has incorporated together.  Here we leave you with a list of resources, not to be overwhelming—we know you can be productive while mastering the toolset—but to be encouraging: the community has created some incredible tools for you to use!

### Resources

- [hapi](https://hapijs.com/api) - the hapi API docs are an amazing resource worth keeping nearby.
- [the pal boilerplate](https://hapipal.com/docs/boilerplate) - this is the baseline setup for pal projects, including a nice setup deployment, testing, linting, and pluginization of your application.  It also offers a handful of "flavors", which helped us more easily integrate Swagger documentation and a SQL-backed model layer.
- [hpal](https://hapipal.com/docs/hpal) - this is the command line tool we used to start a new project, create routes in `routes/`, and models in `models/`.  It does much more too—you can also search documentation with it from the command line, for example: `hpal docs:schwifty request.models`.
- [haute-couture](https://hapipal.com/docs/haute-couture) - this is used by the pal boilerplate to enforce the directory structure for your hapi plugin (everything in `lib/`).
- [joi](https://github.com/hapijs/joi/blob/master/API.md) - this is the validation library of choice for hapi projects, since it integrates nicely into hapi itself.
- [schwifty](https://hapipal.com/docs/schwifty) - this is the hapi plugin that helps you easily use a SQL database in your project.
  - [Objection ORM](http://vincit.github.io/objection.js/) - this is the ORM supported by schwifty.  We love it because it's a powerful SQL query builder that enables us to express queries in a natural way, and has a wonderful community.
  - [knex](http://knexjs.org/) - this provides database connections to Objection models, governs database migrations, and has a useful CLI utility.
