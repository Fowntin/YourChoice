// Flat ESLint config for Node.js backend
// See: https://eslint.org/docs/latest/use/configure/configuration-files-new
const globals = require('globals');

module.exports = [
	{
		files: ['**/*.js'],
		ignores: [
			'node_modules/**',
			'coverage/**',
			'eslint.config.js'
		],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				...globals.node
			}
		},
		linterOptions: {
			reportUnusedDisableDirectives: true
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-undef': 'error',
			'no-console': 'off',
			eqeqeq: ['error', 'always'],
			curly: ['error', 'multi-line'],
			semi: ['error', 'always'],
			quotes: ['error', 'single', { avoidEscape: true }]
		}
	}
];


