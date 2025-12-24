import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';


export default tseslint.config(
    {
        ignores: [
            'dist',
            '.stylelintrc.cjs',
            'vite.config.*'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        plugins: { 'prettier': require('eslint-plugin-prettier') },
        rules: {
            'prettier/prettier': 'warn' // или 'error'
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // Hooks
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // Vite / HMR
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true }
            ],

            // TS
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    }
);
