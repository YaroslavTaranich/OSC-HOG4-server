import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
    // --- ignores ---
    {
        ignores: [
            'dist',
            '.stylelintrc.cjs',
            'vite.config.*'
        ]
    },

    // --- base configs ---
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // --- disable ESLint rules that conflict with Prettier ---
    prettierConfig,

    // --- Prettier as ESLint rule ---
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            'prettier/prettier': 'warn' // можно поставить 'error'
        }
    },

    // --- React + TS ---
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

            // TypeScript
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    }
);
