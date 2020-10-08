const path = require('path')

module.exports = {
	configureWebpack: {
		resolve: {
			modules: [path.resolve('./src'), path.resolve('./node_modules')]
		}
	},
	outputDir: '../server/public',
	pluginOptions: {
		i18n: {
			locale: 'en',
			fallbackLocale: 'en',
			localeDir: 'locales',
			enableInSFC: false
		}
	}
}