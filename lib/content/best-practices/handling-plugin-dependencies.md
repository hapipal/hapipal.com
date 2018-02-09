# Handling plugin dependencies

> While it's ideal to minimize dependencies, let's face it– sometimes your plugin is going to depend on another plugin in order to work.  This cookbook takes an in-depth look at managing dependencies across plugins.  We will characterize different types of dependencies and determine the best way to handle each type.  Luckily there are only three!

## A common misconception
If you've dug into handling plugin dependencies at all, hapi's [`server.dependency(deps, [after])`](https://hapijs.com/api#serverdependencydependencies-after) method probably stood out to you.  What does this method do?  According to the docs,
> Used within a plugin to declare a required dependency on other plugins where... [`deps` is] a single string or array of plugin name strings which must be registered in order for this plugin to operate. Plugins listed must be registered before the server is initialized or started.

This method simply checks that the plugins listed are available when the server is being initialized or started.  What it does not do is ensure plugin registration order.  Let's demonstrate!

### Registration order anti-pattern
Suppose that your plugin needs to use [`server.views()`](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions) as provided by the [vision](https://github.com/hapijs/vision) module to integrate a templating engine into your application.  One might assume that it amounts to declaring vision as a plugin dependency using `server.dependency()`.

> Note, the code below is an **anti-pattern**, i.e. not something you want to repeat!

##### `server.js`
```js
const Vision = require('vision');
const MyAppPlugin = require('./plugin');

const server = new Hapi.Server();
server.connection();

server.register([
    MyAppPlugin,
    Vision
], (err) => {

    if (err) {
        throw err;
    }

    server.initialize((err) => {

        if (err) {
            throw err;
        }

        console.log('Ready to go!');
    });
});
```

##### `plugin.js`
```js
module.exports = (server, options, next) => {

    server.dependency('vision');

    server.views({
        engines: { html: require('handlebars') },
        path: __dirname + '/templates'
    });

    server.route({
        method: 'get',
        path: '/',
        handler: {
            view: { template: 'hello' }
        }
    });

    next();
};

module.exports.attributes = { name: 'my-app-plugin' };
```

Will the code above be `Ready to go!`?  It turns out that it will not be!  The error you'll receive is the following,
```
TypeError: server.views is not a function
```

This happens because vision has not be registered by the time my-app-plugin is registered, so the `server.views()` server decoration provided by vision is not available yet.  How can we tell that vision isn't registered in time?  Check out the call to `server.register()` again.
```js
server.register([
    MyAppPlugin,
    Vision
], (err) => {
// ...
```

The order the plugins are listed reflects the order in which they will be registered– despite my-app-plugin declaring a dependency on vision, my-app-plugin will still be registered first!  The same would be the case if my-app-plugin used its attributes to declare vision as a dependency; the `dependencies` plugin attribute and `server.dependency()` have identical meanings.
```js
// ...

// Same as calling server.dependency('vision')
module.exports.attributes = {
    name: 'my-app-plugin',
    dependencies: 'vision'
};
```

The problem remains that we want to avoid managing plugin registration order as much as possible.  Whenever we can, we'd like our application plugin to be able to do something to guarantee that its dependencies will be there when it needs them.  Simply having faith in registration order is not a good enough general-purpose solution for our application plugins.  Luckily hapi still has us covered– read on!

#### Takeaways
Again, the effect of declaring vision as a dependency is that hapi will ensure that vision has been registered at the time of server start/initialization– not that vision will be registered _prior to its dependents_.  This leads us to think about **registration-time dependencies** versus **run-time dependencies**.

Simply put, registration-time dependencies comprise the plugins necessary for our plugin to successfully register; run-time dependencies comprise the plugins necessary for our plugin to successfully operate once the server has started and is fielding requests.  **`server.dependency()` is perfect for handling _run-time_ dependencies.**

##### What about the `after` callback in `server.dependency(deps, after)`?
Now, this is one magical callback, and it really speaks to the power underlying hapi's plugin system.  First, the `after` callback is called at the time of server initialization/start; it's actually equivalent to adding an `onPreStart` [server extension](https://github.com/hapijs/hapi/blob/master/API.md#serverextevents).  But beyond that, it also respects the dependencies when it comes to ordering the invocation of all `after` callbacks and `onPreStart` server extensions.  So if plugin `A` depends on plugin `B`, and plugin `B` depends on plugin `C`, then hapi will ensure that the `after` callbacks are called in order: `A`'s then `B`'s then `C`'s, independent of the order in which those three plugins were registered.  This makes `server.dependency()` an even more powerful tool in handling run-time dependencies.

When might the `after` callback be used?  Imagine a plugin `my-db-plugin` that provides a database connection `server.app.db` at run-time, during server initialization.  In your application plugin you want to check for the existence of a particular table during server initialization/start, because it's required for your plugin to work.  You want your plugin to perform this task at run-time, but only once the database connection provided by `my-db-plugin` is already available.  `after` callback to the rescue!

```js
module.exports = (server, options, next) => {

    server.dependency('my-db-plugin', (srv, nextDep) => {
        // This callback is called during server start/initialization

        // The db connection was put here by my-db-plugin, and
        // server.dependency() is guaranteeing that it's available
        // by assuring that my-db-plugin's start/initialization
        // (onPreStart) duties have already occurred
        const db = srv.app.db;

        // Imagine this function uses the db connection to
        // check for the existence of the "posts" table
        checkTableExists(db, 'posts', nextDep);
    });

    // Other registration-time things, like defining routes
    server.route(/* ... */);

    next();
};

module.exports.attributes = { name: 'my-app-plugin' };
```

You can see that the `after` is brilliant for run-time dependencies, but doesn't alleviate registration-time dependencies.

> Curious how hapi resolves the ordering of dependencies?  See the [topo](https://github.com/hapijs/topo) module!

### How should this have been handled?
We found that the example above was wrong because vision was treated like a run-time dependency when really it is a registration-time dependency.  So, how should this registration-time dependency have been handled?

#### The `once` flag
Wouldn't it be ideal if our plugin could just ensure on its own that its dependencies are available at registration time?  In many cases our plugin actually can do just that.  In fact, just about any plugin _that does not receive options_ can be ensured directly by its dependents.  hapi provides an option– declarable by a plugin or when registering a plugin– that ensures the given plugin will only be registered one time even when it appears in multiple calls to [`server.register()`](https://github.com/hapijs/hapi/blob/master/API.md#serverregisterplugins-options-callback).  This basically allows our application plugin to `server.register(Vision)` without worrying about duplicate registrations of vision, which hapi would otherwise complain to us about.  The option is called `once`.  In other words, the first time a plugin is registered with `once` it is processed normally by hapi, but subsequent registrations are simply ignored; hapi's default behavior is to complain when a plugin is registered more than one time.  In the case of vision, it has the `once` flag specified [as a plugin attribute](https://github.com/hapijs/vision/blob/v4.1.1/lib/index.js#L62) ([docs](https://github.com/hapijs/hapi/blob/master/API.md#plugins)), so we don't need to take any special care.  Below is a corrected version of the [anti-pattern above](#registration-order-anti-pattern).

The technique here is to let `my-app-plugin` simply register its own dependency.  And crucially, if there were another application plugin on the server that depends on vision, it would be able to do the exact same thing!

##### `server.js`
```js
const MyAppPlugin = require('./plugin');

const server = new Hapi.Server();
server.connection();

server.register(MyAppPlugin, (err) => {

    if (err) {
        throw err;
    }

    server.initialize((err) => {

        if (err) {
            throw err;
        }

        console.log('Ready to go!');
    });
});
```

##### `plugin.js`
```js
const Vision = require('vision');

module.exports = (server, options, next) => {

    server.register(Vision, (err) => {

        if (err) {
            return next(err);
        }

        server.views({
            engines: { html: require('handlebars') },
            path: __dirname + '/templates'
        });

        server.route({
            method: 'get',
            path: '/',
            handler: {
                view: { template: 'hello' }
            }
        });

        next();
    });
};

module.exports.attributes = { name: 'my-app-plugin' };
```

##### What if vision didn't specify `once`?
If the plugin you want to ensure at registration time doesn't specify the `once` plugin attribute like vision does, you're not out of luck.  You can take control and set it yourself as an option at registration time using [`server.register()`](https://github.com/hapijs/hapi/blob/master/API.md#serverregisterplugins-options-callback)'s options.  Here's an example of an app plugin `my-app-plugin` safely depending on a hypothetical plugin named `slimey`,

```js
const Slimey = require('slimey');

module.exports = (server, options, next) => {

    server.register(Slimey, { once: true }, (err) => {

        if (err) {
            return next(err);
        }

        // Now we have access to slimey's server decoration, slimeMe()
        server.slimeMe({ color: 'green' });

        next();
    });
};

module.exports.attributes = { name: 'my-app-plugin' };
```

##### Why does this only work with plugins that don't receive options?
If a dependency takes options then the `once` technique is off-limits.  The reason for this is that its configuration would otherwise be unpredictable– every plugin that depends on it would be racing to register it using `server.register()`, and in turn racing to configure it first.  Nobody would know if the options they passed to the plugin were actually used!

### The final problem
Okay, we've covered two cases,
  1. When there's a run-time dependency, declare those dependencies in your plugin using `server.dependency(deps, [after])`.  Provide an `after` callback if there are run-time duties you'd like to perform during server initialization/start after `deps` have performed their own run-time duties.
  2. When there's a registration-time dependency on a plugin that doesn't take options, use `server.register()` in your plugin to register the dependency while utilizing the `once` attribute or option.

One case remains: what do we do when we have a registration-time dependency on a plugin that _does_ take options?  This is by far the yuckiest case of all!  Assuming that there's no way to re-envision the implementation of the dependencies, the only option is really to manage plugin registration order.  It's not ideal, but it's also not very common.  It's a responsibility of plugins to play nice with their dependents– look for a cookbook on this topic in the future, and in the interim feel free to ask questions on [hapijs/discuss](https://github.com/hapijs/discuss).

If you have a lot of dependencies like this to handle, [hodgepodge](https://github.com/devinivy/hodgepodge) can help with these plugin dependency woes by respecting your plugins' `dependencies` attributes while a group of sibling plugins are being registered.  However, it does not always work organically with plugin- and server- composers such as [haute-couture](https://github.com/devinivy/haute-couture) and [glue](https://github.com/hapijs/glue).  There's room for improvement here in userland– let us know if you have any good ideas!

## The flowchart you've been waiting for
This is the decision tree you should be keeping in your head while handling plugin dependencies.

```
                     ╔═══════════════╗
                     ║               ║
                     ║  I depend on  ║
                     ║  plugin X     ║
                     ║               ║
                     ╚═══════════════╝
                             │
                             │ Cool!
                             │
                   ╔════════════════════╗
        ┌──────────║ Which kind of dep? ║─────────┐
        │          ╚════════════════════╝         │
        │                                         │
    Run-time                              Registration-time
        ▾                                         ▾
★══════════════════╗                   ╔═══════════════════╗
║                  ║                   ║                   ║
║ Declare it using ║                   ║  Does it take     ║
║ srv.dependency()¹║         ┌─────────║  plugin options?  ║
║                  ║         │         ║                   ║
╚══════════════════╝        Yes        ╚═══════════════════╝
                             ▾                         │
                   ★════════════════════╗              │
                   ║                    ║              │
                   ║ Manage plugin      ║              No
                   ║ registration order ║              │
                   ║ (See hodgepodge)   ║              ▾
                   ║                    ║   ╔════════════════════╗
                   ╚════════════════════╝   ║                    ║
                                            ║  Does it have the  ║
                                            ║  "once" plugin     ║
                                  ┌─────────║  attribute?        ║
                                  │         ║                    ║
                                  No        ╚════════════════════╝
                                  ▾                          │
                       ★═════════════════════╗               │
                       ║                     ║              Yes
                       ║  Register it,       ║               │
                       ║  srv.register(X, {  ║               ▾
                       ║    once: true       ║   ★═════════════════════╗
                       ║  })                 ║   ║                     ║
                       ║                     ║   ║  Register it,       ║
                       ╚═════════════════════╝   ║  srv.register(X)    ║
                                                 ║                     ║
                                                 ╚═════════════════════╝

¹ Or equivalently use the plugin "dependencies" attribute
```
