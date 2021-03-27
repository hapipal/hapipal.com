'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: {
            $param: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: 'NODE_ENV',
            $default: {
                log: ['error'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    githubToken: { $param: 'GITHUB_TOKEN' },
                    mailchimpApiKey: { $param: 'MAILCHIMP_API_KEY' },
                    mailchimpListId: { $param: 'MAILCHIMP_LIST_ID' },
                    gaTrackingId: { $param: 'GA_TRACKING_ID' },
                    developmentMode: {
                        $filter: 'NODE_ENV',
                        $default: true,
                        production: false
                    }
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
