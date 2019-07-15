import { debounced } from './utils';

class PublishLookup {
  constructor(collection, selector, options, lookups) {
    this.collection = collection;
    this.selector = selector || {};
    this.options = options || {};
    this.lookups = lookups || [];
    this.primaryObserver = undefined;
    this.lookupObservers = [];

    this.calculateLookupFields();
    this.republishLookups = debounced(this.republishLookups.bind(this));
  }

  _getCollectionName() {
    return this.collection._name;
  }

  calculateLookupFields() {
    const lookupFields = this.lookups.reduce((acc, lookup) => {
      const { localField } = lookup;

      acc[localField] = 1;
      return acc;
    }, {});

    this.lookupFields = lookupFields;
  }

  republishLookups() {
    const { collection, sub, lookups, lookupFields } = this;

    const addedPrimaryDocIds = sub._documents.get(collection._name);

    this.lookupObservers.forEach(observer => observer.stop());

    if (addedPrimaryDocIds) {
      const primaryDocsIds = Array.from(addedPrimaryDocIds.keys());

      const primaryDocs = collection
        .find({ _id: { $in: primaryDocsIds } }, { fields: lookupFields })
        .fetch();

      const localFieldValues = Object.keys(lookupFields).reduce((acc, localField) => {
        acc[localField] = [];

        primaryDocs.forEach(doc => {
          if (doc[localField] !== null && doc[localField] !== undefined) {
            acc[localField].push(doc[localField]);
          }
        });

        return acc;
      }, {});

      this.lookupObservers = lookups.map(
        ({
          collection: childCollection,
          localField,
          foreignField,
          selector = {},
          options = {}
        }) => {
          const joinQuery = {
            ...selector,
            [foreignField]: { $in: localFieldValues[localField] }
          };

          const joinedDocsCursor = childCollection.find(joinQuery, options);

          const observer = joinedDocsCursor.observeChanges({
            added: (id, fields) => {
              sub.added(childCollection._name, id, fields);
            },
            changed: (id, fields) => {
              sub.changed(childCollection._name, id, fields);
            },
            removed: id => {
              sub.removed(childCollection._name, id);
            }
          });

          return observer;
        }
      );
    }
  }

  _publishCursor(sub) {
    this.sub = sub;

    this.publishLookups();

    return {
      stop: this.stop.bind(this)
    };
  }

  publishLookups() {
    const { collection, selector, options, sub } = this;

    const cursor = collection.find(selector, options);

    const observer = cursor.observeChanges({
      added: (id, fields) => {
        sub.added(collection._name, id, fields);

        this.republishLookups();
      },
      changed: (id, fields) => {
        sub.changed(collection._name, id, fields);

        const lookupFieldsKeys = Object.keys(this.lookupFields);
        const changedKeys = Object.keys(fields);

        const intersection = lookupFieldsKeys.filter(value => changedKeys.includes(value));

        const isLookupFieldChanged = intersection.length > 0;

        if (isLookupFieldChanged) {
          this.republishLookups();
        }
      },
      removed: id => {
        sub.removed(collection._name, id);

        this.republishLookups();
      }
    });

    this.primaryObserver = observer;
  }

  stop() {
    if (this.primaryObserver) {
      this.primaryObserver.stop();
    }
    this.lookupObservers.forEach(observer => {
      observer.stop();
    });
  }
}

export default PublishLookup;
