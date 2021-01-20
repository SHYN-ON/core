const path = require('path')
const WebpackObfuscator = require('webpack-obfuscator')

module.exports = {
	target: 'node',
	mode: 'production',
	entry: {
		app: ['./src/index.js']
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: 'api.js'
	},
	plugins: [
		new WebpackObfuscator({
			rotateStringArray: true
		})
	]
}
