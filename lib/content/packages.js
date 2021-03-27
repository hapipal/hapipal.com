'use strict';

module.exports = {
    boilerplate: {
        subtitle: 'A friendly, proven starting place for your next hapi plugin or deployment',
        ref: 'pal',     // Only show pal branch
        npm: false,
        apisBegin: null // Never!
    },
    schwifty: {
        subtitle: 'A model layer for hapi integrating Objection ORM',
        apisBegin: '1.0.0',
        scopedBegin: '6.0.0'
    },
    schmervice: {
        subtitle: 'A service layer for hapi',
        apisBegin: '1.0.0',
        scopedBegin: '2.0.0'
    },
    toys: {
        subtitle: 'The hapi utility toy chest',
        apisBegin: '0.0.1',
        scopedBegin: '3.0.0'
    },
    lalalambda: {
        subtitle: 'Serverless functions powered by hapijs',
        apisBegin: '1.0.0',
        scopedBegin: '2.0.0'
    },
    ahem: {
        subtitle: 'hapi plugins as libraries',
        apisBegin: '1.0.0',
        scopedBegin: '2.0.0'
    },
    avocat: {
        subtitle: 'Convert objection DB errors to boom HTTP errors',
        apisBegin: '3.0.0',
        scopedBegin: '3.0.0'
    },
    hecks: {
        subtitle: 'Mount your express app onto your hapi server, aw heck!',
        apisBegin: '1.0.0',
        scopedBegin: '3.0.0'
    },
    hpal: {
        subtitle: 'The hapi pal CLI',
        apisBegin: null, // Never!
        scopedBegin: '3.0.0'
    },
    'hpal-debug': {
        subtitle: 'hapijs debugging tools for the hpal CLI',
        apisBegin: null, // Never!
        scopedBegin: '2.0.0'
    },
    'haute-couture': {
        subtitle: 'File-based hapi plugin composer',
        apisBegin: '2.0.0',
        scopedBegin: '4.0.0'
    },
    tandy: {
        subtitle: 'Auto-generated, RESTful, CRUDdy route handlers for Objection models',
        ref: 'master', // Only show master; doesn't tag releases
        apisBegin: null
        // scopedBegin: '3.0.0' // Once published
    },
    confidence: {
        subtitle: 'Dynamic, declarative configurations',
        apisBegin: '6.0.0',
        scopedBegin: '6.0.0'
    },
    hodgepodge: {
        subtitle: 'Resolving hapi plugin dependencies since 2015',
        apisBegin: '2.0.0'
    },
    underdog: {
        subtitle: 'HTTP/2 server-push for hapi',
        apisBegin: '1.2.0'
    },
    defaults: {
        owner: 'hapipal',
        npm: true
    }
};
