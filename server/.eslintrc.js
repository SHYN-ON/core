module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es6: true
	},
	extends: 'standard',
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
		'no-tabs': 0,
		indent: [2, 'tab'],
		'no-var': 2,
		'no-template-curly-in-string': 1,
		'no-alert': 2,
		'no-eval': 2,
		camelcase: 2,
		'max-len': ['warn', 140, 1]
	},
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2018
	}
}
