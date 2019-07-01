Package.describe({
  name: "kschingiz:publish-lookups",
  version: "1.0.0",
  summary: "Publish collection lookups (joins)",
  git: "",
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.6.1");
  api.use("ecmascript");
  api.mainModule("publish-lookups.js");
});

Package.onTest(function(api) {
  api.use("ecmascript");
  api.use("tinytest");
  api.use("kschingiz:publish-lookups");
  api.mainModule("publish-lookups-tests.js");
});
