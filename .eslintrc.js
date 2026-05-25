module.exports = {
  extends: require.resolve('@umijs/max/eslint'),
  rules: {
    '@typescript-eslint/no-shadow': 'error',
    'nonblock-statement-body-position': 'error',
    'no-confusing-arrow': 'error',
    'no-prototype-builtins': 'error',
    'no-undef-init': 'error',
  },
};
