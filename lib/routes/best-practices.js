'use strict';

const Joi = require('joi');

module.exports = (srv) => ([
    {
        method: 'get',
        path: '/best-practices',
        options: {
            handler: {
                view: {
                    template: 'best-practices-list',
                    context: {
                        list: srv.services().bestPractices.list()
                    }
                }
            }
        }
    },
    {
        method: 'get',
        path: '/best-practices/{slug}',
        options: {
            validate: {
                params: {
                    slug: Joi.string().lowercase()
                }
            },
            pre: [
                {
                    assign: 'bp',
                    method: ({ params }) => srv.services().bestPractices.get(params.slug)
                }
            ],
            async handler(request, h) {

                const { bp: { slug, title } } = request.pre;

                const html = await request.services().bestPractices.render(slug);

                return h.view('best-practices-detail', { html, title });
            }
        }
    }
]);
