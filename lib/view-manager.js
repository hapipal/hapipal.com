'use strict';

const Handlebars = require('handlebars');

module.exports = (server, options) => ({
    path: 'templates',
    partialsPath: 'templates/partials',
    helpersPath: 'templates/helpers',
    isCached: !options.developmentMode,
    defaultExtension: 'hbs',
    engines: {
        hbs: Handlebars
    },
    context: (request) => ({
        options,
        baseURI: server.realm.modifiers.route.prefix || '',
        template: request && request.response.source.template
    })
});
