// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by publish-lookups.js.
import { name as packageName } from "meteor/kschingiz:publish-lookups";

// Write your tests here!
// Here is an example.
Tinytest.add('publish-lookups - example', function (test) {
  test.equal(packageName, "publish-lookups");
});
