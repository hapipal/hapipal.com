# Extending schwifty models across plugins

> **This example of creating a general-purpose "users" plugin demonstrates that, with the help of schwifty, it's possible to create highly reusable, data-oriented hapi plugins.**
>
> [Schwifty](https://github.com/hapipal/schwifty) is a hapi plugin to integrate [Objection ORM](https://github.com/Vincit/objection.js) into hapi.  One of its strengths is associating models and migrations with hapi plugins.  When writing reusable plugins that declare models, it becomes desirable to be able to extend those models in application-level plugins.

> **Note**
>
> We're actively working on a slicker way of creating highly customizable plugins, so be on the lookout!
>
> Also, this tutorial does not assume that your project is based upon the  [pal boilerplate](https://github.com/hapipal/boilerplate), but if you are using it, the same approach should work.  Just remember, calls to `server.register()` amount to placing files in the [`plugins/`](/docs/haute-couture#plugin-registrations) dir, calls to `server.schwifty()` amount to placing model files in the [`models/`](/docs/haute-couture#model-definitions-for-schwifty) dir, etc. thanks to the [haute-couture](https://github.com/hapipal/haute-couture) plugin composer.  You might also consider utilizing the pal boilerplate's [Objection ORM flavor](https://github.com/hapipal/boilerplate#objection-orm).

Okay, so here's the setup!  We have a hapi plugin `my-user-plugin` that provides a `User` model and user-related CRUD/auth routes.  We also have a plugin that implements the "meat" of our application, `my-app-plugin`, and we want this application to have users.

The natural step to take would be for `my-app-plugin` to simply register `my-user-plugin` in order to add all the user-related functionality to our application.  This actually works great, especially under schwifty's [plugin ownership of knex instances and models](/docs/schwifty#plugin-ownership-of-knex-instances-and-models)!  Complications arise as soon as we want to make `my-user-plugin` more general-purpose, adding user functionality to _any_ application.

##### Yeah, what about my clown school?
For example, one application might be for a marketplace where each user has a `shippingAddress`, and the other might be for a clown school where each user has a `noseColor`.  We can't expect `my-user-plugin` to account on its own for every such case.  But we can write `my-user-plugin` in such a way that `my-app-plugin` can provide details about the user model in a general-purpose way, whether it concerns shipping addresses or clown noses.

## The setup
Okay, time for some code.  Here's our app before the user plugin is properly generalized.  By the end of this article, `my-app-plugin` should be able to leverage `my-user-plugin` to provide user functionality, but also specify an application-specific field, `noseColor`, on users of our clown school app.

#### The server
##### `server.js`
```js
const Hapi = require('@hapi/hapi');
const Schwifty = require('schwifty');
const AppPlugin = require('./app-plugin');

(async () => {

    const server = Hapi.server();

    await server.register([
        AppPlugin,
        {
            register: Schwifty,
            options: {
                knex: {
                    client: 'sqlite3',
                    useNullAsDefault: true,
                    connection: {
                        filename: ':memory:'
                    }
                }
            }
        }
    ]);

    await server.start();

    console.log(`Ready to go! See ${server.info.uri}`);
})();
```

#### The app plugin
##### `app-plugin/index.js`
```js
const UserPlugin = require('../user-plugin');

exports.plugin = {
    name: 'my-app-plugin',
    async register(server, options) {

        await server.register({
            register: UserPlugin,
            options: {}
        });
    }
};
```

#### The user plugin
##### `user-plugin/index.js`
```js
const Schwifty = require('schwifty');
const UserModel = require('./user-model');

exports.plugin = {
    name: 'my-user-plugin',
    async register(server, options) {

        await server.register(Schwifty);

        // Register the user model
        server.schwifty(UserModel);

        // Get all users
        server.route({
            method: 'get',
            path: '/users',
            handler: async (request) => {

                const { Users } = request.models();

                return await Users.query();
            }
        });
    }
};
```

##### `user-plugin/model.js`
```js
const Joi = require('@hapi/joi');
const Schwifty = require('schwifty');

// A user model only with an id and name
module.exports = class User extends Schwifty.Model {
    static get tableName() {
        return 'Users';
    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().required(),
            name: Joi.string().required()
        });
    }
};
```

## The technique
The approach we're going to take is,
1. Expose `my-user-plugin`'s `User` model by exporting it.
2. Extend `my-user-plugin`'s `User` model inside `my-app-plugin`, adding a new field.
3. Pass the extended `User` model to `my-user-plugin` as a plugin option, `options.User`.
4. Within `my-user-plugin` utilize `options.User`.
   - If it's not passed, use own base user model.
   - If it is passed, ensure that `options.User` extends from the base user model and has the same class `name`, then use `server.schwifty(options.User)`.

This approach allows `my-user-plugin` to remain the "owner" of the user model while allowing `my-app-plugin` to have a simple hook to adjust it however necessary.  It also allows `my-user-plugin` to ensure that `my-app-plugin` has only made acceptable adjustments to the model if needed– in this case it ensures that the application plugin has extended the correct base user model.  Let's step through these code changes.

### 1. Expose `my-user-plugin`'s `User` model by exporting it.
Exposing the user plugin's model will allow the app plugin to extend it.

#### The user plugin
##### `user-plugin/index.js`
```diff
 const Schwifty = require('schwifty');
 const UserModel = require('./user-model');

+exports.Model = UserModel;
+
 exports.plugin = {
     name: 'my-user-plugin',
     async register(server, options) {
```

### 2. Extend `my-user-plugin`'s `User` model inside `my-app-plugin`, adding a new field.
Now the app plugin has access to the user plugin's model and may extend it however it sees fit.  We'll add a `noseColor` attribute to the model.  Notice that Joi's [`object.keys()`](https://github.com/hapijs/joi/blob/master/API.md#objectkeysschema) is used to amend the base user's Joi schema, maintaining its `id` and `name` attributes defined in the user plugin.  For consistency make sure to name the model class `User`, identical to the name assigned to the model by the user plugin.  Note that you may also create a migration to add this additional column within `my-app-plugin`'s migrations directory.

#### The app plugin
##### `app-plugin/user-model.js` (new file)
```js
const Joi = require('@hapi/joi');
const UserPlugin = require('../user-plugin');

module.exports = class User extends UserPlugin.Model {
    static get joiSchema() {
        return super.joiSchema.keys({
            noseColor: Joi.string().valid('red', 'blue', 'pink')
        });
    }
};
```

### 3. Pass the extended `User` model to `my-user-plugin` as a plugin option, `options.User`.
Now we'll pass the app's extended user model as a plugin option to the user plugin.  This will allow the user plugin to register it with schwifty if it passes muster.

#### The app plugin
##### `app-plugin/index.js`
```diff
const UserPlugin = require('../user-plugin');

 exports.plugin = {
     name: 'my-app-plugin',
     async register(server, options) {

         await server.register({
             register: UserPlugin,
-            options: {}
+            options: {
+                 User: require('./user-model')
+            }
         });
     }
 };
```

### 4. Within `my-user-plugin` utilize `options.User`.
Now all the user plugin has to do is ensure that `options.User` is compatible with its base user model, and if so then register it with schwifty instead of the base model.  [`Schwifty.assertCompatible(ModelA, ModelB)`](/docs/schwifty#schwiftyassertcompatiblemodela-modelb-message) is a utility provided by schwifty to ensure basic compatibility of two models: one model extends the other, they have the same `name`, and the same `tableName`.

#### The user plugin
##### `user-plugin/index.js`
```diff
 exports.plugin = {
     name: 'my-user-plugin',
     async register(server, options) {

         await server.register(Schwifty);

         // Register the user model
-        server.schwifty(UserModel);
+
+        if (options.User) {
+            Schwifty.assertCompatible(options.User, UserModel);
+        }
+
+        server.schwifty(options.User || UserModel);

         // Get all users
         server.route({
             method: 'get',
             path: '/users',
```

## You did it!
This simple technique allows you to create plugins that define [schwifty](https://github.com/hapipal/schwifty) models in an extensible way.  It's incredibly useful to create general-purpose plugins that can be used within many applications, and when it comes to using hapi plugins with [Objection](https://github.com/Vincit/objection.js), this is exactly how to do it.
