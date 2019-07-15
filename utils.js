/* eslint-disable import/no-unresolved */
/* eslint-disable import/prefer-default-export */

import { Meteor } from 'meteor/meteor';

const timeoutMs = 100;
export const debounced = fn => {
  let timeoutId;

  return () => {
    if (timeoutId) {
      Meteor.clearTimeout(timeoutId);
    }

    timeoutId = Meteor.setTimeout(() => {
      fn();
    }, timeoutMs);
  };
};
