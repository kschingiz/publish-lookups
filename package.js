/* eslint-disable no-undef */

Package.describe({
  name: 'kschingiz:publish-lookups',
  version: '1.0.1',
  summary: 'Publish collection lookups (joins)',
  git: 'https://github.com/kschingiz/publish-lookups',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.6.1');
  api.use('ecmascript');
  api.mainModule('publish-lookups.js');
});
