module.exports = {
    extends: [
        'stylelint-config-standard',
        'stylelint-config-clean-order',
        'stylelint-config-css-modules'
    ],
    rules: {
        'selector-class-pattern': null,
        'no-descending-specificity': null,
        'keyframes-name-pattern': null
    }
};
