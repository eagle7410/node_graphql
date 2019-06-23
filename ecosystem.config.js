module.exports = {
	apps: [{
		name : 'nodeGraphql',
		script: "serve.js",
		watch : ["classes", 'serve.js'],
		// Delay between restart
		watch_delay: 800,
		ignore_watch : ["node_modules"],
		watch_options: {
			"followSymlinks": false,
			"usePolling": true,
		}
	}]
}
