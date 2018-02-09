# The joys of server / plugin separation
> hapi offers a rich API for splitting your application into plugins.  If the first piece of advice to someone getting started with hapi is, "implement your application in a plugin" then the second would have to be "keep your plugins and your server separate."  Why, you ask?  Read on to find out!

## What's so great about plugins?
While "plugin" can mean all sorts of different things in different frameworks, a hapi plugin represents a robust component or cross-cutting concern within an application.  And importantly, hapi will ensure that plugins snap together nicely without any conflicts– they're hapi's modular building-blocks.

A hapi plugin is a composable package of routes, server methods, cache provisions, request lifecycle extensions, authentication schemes/strategies, etc.; just about any piece of the hapi [`server` API](https://github.com/hapijs/hapi/blob/master/API.md#server) can be called within the confines of a plugin.  Multiple plugins may then be [registered](https://github.com/hapijs/hapi/blob/master/API.md#serverregisterplugins-options-callback) onto a server and deployed together.

As a result of this ability to "componentize" of an application, plugins also allow us to abstract away the _deployment_ of the services that comprise our applications. Each plugin should be decoupled as a self-contained unit that can actually be deployed on its own.  Plugins with this property are desirable, as they tend to live tidily within a greater application, are more reusable, and may be pulled into their own deployments if they need to scale separately.  Summarily, organizing an applications into plugins with well-defined boundaries is a relatively low-cost activity that provides us with lots of flexibility in deployment and development, and additionally reflects good organizational practices (i.e. separation of concerns).

### We mix things up
It is common to write an application in the form of plugins, but still couple those plugins implicitly to the server on which they will be deployed.  This tendency undermines the portability and reusability of the plugin, typically in two ways,
  1. The configuration of the server/deployment is mixed with the configuration of the plugins.
  2. The server/deployment is seen as a fixed hub for plugins, encouraging inter-plugin dependencies and reliance on plugin registration order.

As a result separations are crossed precisely where we hoped they wouldn't be– at plugin boundaries.  If our plugin isn't portable or reusable, then it might as well not have been a plugin at all.  Each plugin should live a modular life of its own!

## Writing plugins with boundaries
The solutions here are pretty straightforward.  Let's tackle our bad habits one at a time.

### Untangling configuration
The first step is to untangle our plugin's configuration.  The only input to our plugin from user-land are the plugin's `options`– the ones that are passed to the plugin's `register` function,
```js
// Pinger plugin

exports.register = (server, options, next) => {

    // Below a plugin option is used to specify if the pinger route
    // should support just GET requests, or both POST and GET requests

    server.route({
        method: options.supportPost ? ['get', 'post'] : 'get',
        path: '/pinger',
        handler: function (request, reply) {

            return reply({ ping: 'pong' });
        }
    });

    return next();
};

exports.register.attributes = { name: 'my-pinger' };


// And here's what it looks like to register the pinger
// plugin with options to an existing hapi server

server.register({
    register: MyPinger,
    options: { supportPost: true }
}, (err) => {/* ... */});
```

Get used to turning every piece of dynamic configuration for your plugin into a plugin option.  If there's a `config.js` file somewhere in your project that's used by your application plugins, or by a plugin and also your `server`'s deployment, then it's likely that your plugin is becoming tangled via configuration.  The solution is simply to redirect that configuration into your plugin through its registration options.

An example of making this adjustment can be seen below.  Observe that the plugin `email-plugin.js` ends-up entirely self-contained, no longer sharing dependencies or configuration with `server.js`.

```diff
 // ~~ config.js ~~

 module.exports = {
     port: process.env.PORT || 3000,
     email: {
         worldLeader: 'president@whitehouse.gov',
         from: 'no-reply@bigroomstudios.com',
         creds: {
             host: 'smtp.gmail.com',
             port: 465,
             secure: true,
             auth: {
                 user: 'devin@bigroomstudios.com',
                 pass: process.env.SMTP_PASSWORD
             }
         }
     }
 };


 // ~~ email-plugin.js ~~

 const Nodemailer = require('nodemailer');
-const Config = require('./config');

 exports.register = (server, options, next) => {

     // Configure nodemailer
-    const mailer = Nodemailer.createTransport(Config.email.creds);
+    const mailer = Nodemailer.createTransport(options.creds);

     // Add a route to send an email to a configurable world leader

     server.route({
         method: 'post',
         path: '/email/world-leader',
         handler: function (request, reply) {

             mailer.sendMail({
-                from: Config.email.from,
-                to: Config.email.worldLeader,
+                from: options.from,
+                to: options.worldLeader,
                 subject: 'We have some thoughts for you!',
                 text: request.payload.text
             }, (err) => {

                 if (err) {
                     return reply(err);
                 }

                 return reply({ message: 'sent' });
             });
         }
     });

     return next();
 };

 exports.register.attributes = { name: 'email-plugin' };


 // ~~ server.js ~~

 const Hapi = require('hapi');
 const EmailPlugin = require('./email-plugin');
 const Config = require('./config');

 const server = new Hapi.Server();
 server.connection({ port: Config.port });

 server.register({
-    register: EmailPlugin
+    register: EmailPlugin,
+    options: Config.email
 }, (err) => {

     if (err) {
         throw err;
     }

     server.start((err) => {

         if (err) {
             throw err;
         }

         console.log(`Server started on ${server.info.uri}`);
     });
 });
```

### Sharing resources
A related issue to sharing configuration across plugins is sharing resources, such as a database connection, DB-connected models (e.g. [Objection ORM](https://github.com/Vincit/objection.js), [Mongoose](https://github.com/Automattic/mongoose), etc.), or a library that has been configured with credentials (e.g. an SDK such as [aws-sdk](https://github.com/aws/aws-sdk-js)).  It is often desirable to share resources in this way in order to centralize credentials/configurations or maintain resource pools (e.g. a fixed number of database connections).

It's common to `require()` those shared resources directly in each of your plugins, which is a form of coupling between your server and plugin particularly if those resources require configuration/credentials.  It also may create implicit, hard-to-recognize coupling among your plugins.

There are a few ways to counter this anti-pattern.

 - **Pass resources around as plugin options**

    This is the simplest solution, and it should work for a broad variety of use-cases.  Configure your resources at the server/deployment level, and simply pass those resources into your plugins through their options.

 - **Place shared resources on `server.app`**

    hapi actually has a special place to put run-time server state that is available to all plugins within the application: [`server.app`](https://github.com/hapijs/hapi/blob/master/API.md#serverapp).  You can place your resources here once they're ready to be used.  A nice way to impose some order here is to create a plugin whose job it is to receive config/credentials as plugin options, create and configure the resource, then place the resource on `server.app` during server initialization ([`onPreStart`](https://github.com/hapijs/hapi/blob/master/API.md#serverextevents)).  Then other plugins have the guarantee that the resource is ready to use precisely after the server has started/initialized.

 - **Make shared resources available via server and request decorations**

    Similar to the previous pattern using `server.app`, a plugin can also create server or request decorations via [`server.decorate()`](https://github.com/hapijs/hapi/blob/master/API.md#serverdecoratetype-property-method-options) to expose a shared resource.  Request decorations are particularly convenient when accessing those resources in route handlers.  Advanced techniques using [realms](https://github.com/hapijs/hapi/blob/master/API.md#serverrealm), when combined with decorations, can allow resources to be either shared or sandboxed within a single plugin– see [schwifty](https://github.com/BigRoomStudios/schwifty) as a good example of this, configuring [knex](https://github.com/tgriesser/knex) instances and database-connected models at both the server and plugin levels.

> **Pro tip!**  However your plugin gets access to its shared resources, use [`server.bind()`](https://github.com/hapijs/hapi/blob/master/API.md#serverbindcontext) to allow those resources to show-up conveniently as the `this` context within server methods, route handlers, and server/request extensions defined by your plugin.

### Fighting inter-plugin dependencies
While mitigating inter-plugin dependencies is beyond the scope of this article, it's certainly related to the separation of server and plugin.  Luckily we have an entire separate article precisely on that topic!  Check it out– "**[Handling plugin dependencies](handling-plugin-dependencies.md)**".

## Getting a solid start
[hapi pal](https://github.com/devinivy/boilerplate-api/tree/pal) offers a boilerplate with a strong separation of server and plugin.  It's a great way to author a plugin that is deployable and testable on its own, but prepared to be integrated into a larger application when the time comes.  See the [`server/`](https://github.com/devinivy/boilerplate-api/tree/pal/server) directory for all things "deployment" and the [`lib/`](https://github.com/devinivy/boilerplate-api/tree/pal/lib) directory for all things "plugin."  It also provides [flavors](https://github.com/devinivy/boilerplate-api/tree/pal#flavors) that maintain this separation while sharing resources, such as a textbook integration with Objection ORM.

## Conclusion
Once you've started writing your applications in terms of hapi plugins, do yourself a favor and take advantage of the wonderful benefits of pluginization: flexibility of deployment, tidy separation of your application's concerns, reusable server functionality, and a clear path to service-oriented architecture and microservices.  The first step is to ensure you don't couple your server with its deployment.  And it's really not so hard– you primarily want to separate deployment configuration and plugin configuration by utilizing plugin options liberally.  We covered some examples of that, and several techniques to share resources among the plugins that comprise your application.  Have fun plugin-izing!
