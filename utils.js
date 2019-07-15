/* eslint-disable no-undef */
/* eslint-disable import/prefer-default-export */

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
