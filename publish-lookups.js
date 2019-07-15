/* eslint-disable import/no-unresolved */
import { Meteor } from 'meteor/meteor';

import PublishLookup from './lookup';

Meteor.Collection.prototype.lookup = function(selector, options, lookups) {
  const collection = this;

  return new PublishLookup(collection, selector, options, lookups);
};
