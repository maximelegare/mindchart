const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 150],
    'type-enum': [
      2, // level: 0 = off, 1 = warning, 2 = error
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'release'
      ],
    ],
  },
};

export default config;
