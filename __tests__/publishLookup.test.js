import PublishLookup from '../lookup';
import Collection from './mocks/collection';

test('PublishLookup should return correct collection name', () => {
  const collection = new Collection('testCollection');
  const publishLookup = new PublishLookup(collection, {}, {}, []);

  expect(publishLookup._getCollectionName()).toBe(collection._name);
});
