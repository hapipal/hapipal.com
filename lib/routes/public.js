'use strict';

module.exports = {
    method: 'get',
    path: '/public/{p*}',
    handler: {
        directory: {
            path: 'public'
        }
    },
    options: {
        cache: false // Avoid explicit "no-cache" for all assets, should be fine-tuned later
    }
};
