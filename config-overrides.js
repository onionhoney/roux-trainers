const WorkerPlugin = require('worker-plugin');

module.exports = {
    webpack: function (config, env) {
        // ...add your webpack config
        config.plugins.push(
            new WorkerPlugin()
        )
        return config;
    }
}