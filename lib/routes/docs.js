'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'get',
        path: '/docs',
        config: {
            handler: {
                view: {
                    template: 'docs-list',
                    context: {
                        list: []
                    }
                }
            }
        }
    },
    {
        method: 'get',
        path: '/docs/{user}/{repo}',
        config: {
            validate: {
                query: {
                    v: Joi.string()
                }
            },
            pre: [[
                { method: 'npm.version(params.repo)', assign: 'latest' },
                { method: 'npm.versions(params.repo)', assign: 'versions' }
            ]],
            async handler(request, reply) {

                const { v } = request.query;
                const { user, repo } = request.params;
                const { latest, versions } = request.pre;
                const tag = v || latest;

                const html = await this.methods.github.markdown(user, repo, tag, 'API.md');

                return reply.view('docs-detail', { html, versions });
            }
        }
    }
];
