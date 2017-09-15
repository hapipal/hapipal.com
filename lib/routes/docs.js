'use strict';

const Joi = require('joi');

module.exports = (srv) => ([
    {
        method: 'get',
        path: '/docs',
        config: {
            handler(request, reply) {

                return reply.view('docs-list', {
                    list: this.methods.packages.list()
                });
            }
        }
    },
    {
        method: 'get',
        path: '/docs/{pkgName}',
        config: {
            validate: {
                params: {
                    pkgName: Joi.string().lowercase()
                },
                query: {
                    v: Joi.string()
                }
            },
            pre: [
                { method: 'packages.get(params.pkgName)', assign: 'pkg' },
                [
                    { method: 'npm.version(params.pkgName)', assign: 'latest' },
                    { method: 'npm.versions(params.pkgName)', assign: 'versions' }
                ]
            ],
            async handler(request, reply) {

                const { v } = request.query;
                const { pkg, latest, versions } = request.pre;
                const { owner, name, docsFile } = pkg;
                const tag = v || latest;

                const html = await this.methods.github.markdown(owner, name, docsFile, tag);

                return reply.view('docs-detail', { html, versions });
            }
        }
    }
]);
