'use strict';

const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: process.env.PORT || 3000,
        debug: {
            $filter: 'NODE_ENV',
            development: {
                log: ['error', 'implementation', 'internal'],
                request: ['error', 'implementation', 'internal']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                options: {
                    developmentMode: (process.env.NODE_ENV !== 'production'),
                    githubToken: process.env.GITHUB_TOKEN,
                    mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
                    mailchimpListId: process.env.MAILCHIMP_LIST_ID,
                    gaTrackingId: process.env.GA_TRACKING_ID,
                    isGlitchDeploy: !!(process.env.PROJECT_ID && process.env.PROJECT_INVITE_TOKEN)
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: 'hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
