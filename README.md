# publish-lookups

## Installation

```bash
meteor add kschingiz:publish-lookups
```

## Usage

```js
Meteor.publish("subscription", () => {
  return PrimaryCollection.lookup(selector, options, [
    {
      collection: SecondaryCollection, // required: collection to join
      localField: "_id", // required: field in PrimaryCollection
      foreignField: "postId", // required: field in SecondaryCollection
      selector: {}, // optional: apply additional selector to SecondaryCollection
      options: { fields: { text: 1 } } // optional: apply additional options to SecondaryCollection
    }
  ]);
});
```

## Usage example

You have collections:

```
Posts:
  _id
  authorId
  text

Comments:
  _id
  postId
  text
  status

Authors:
  _id
  name
```

And want to publish posts with comments and post author in join, you can do it like this:

```js
Meteor.publish("postsWithCommentsAndAuthors", () => {
  return Posts.lookup({}, {}, [
    {
      collection: Comments,
      localField: "_id",
      foreignField: "postId",
      selector: { status: "active" },
      options: { fields: { text: 1 } }
    },
    {
      collection: Authors,
      localField: "authorId",
      foreignField: "_id",
      selector: {},
      options: {}
    }
  ]);
});
```

## Comparison

We have several packages which allows us to publish collections in joins, let's compare how they work and what's differences:

### publish-composite

Package url: https://github.com/englue/meteor-publish-composite

Usage:

```js
{
  find() {
    // Primary query
    return Posts.find({});
  },
  children: [
    {
      find(topLevelDocument) {
        // applied for each of the posts document
        return Comments.find({ postId: topLevelDocument._id })
      },
    }
  ]
}
```

`publish-composite` does not scale well, because in the second level queries it will create `N` cursor observers, where N is the number of documents returned in Primary query. This behavour will overload your database.

Unlike `publish-composite`, `publish-lookups` package does not depend on the number of documents returned in Primary query, it will create M number of cursor observers, where M is the number of required lookups.

Let's assume we have 100 posts and 200 post comments and we are joining all of them with primary collection `Posts`:

1. `publish-composite`: will create 1 observer for primary query, then it will create 100 observers for comments, because posts returned 100 documents.
2. `publish-lookups`: will create 1 observer for primary query, then it will create 1 observer for the lookup query.

101 vs 2

`publish-lookups` wins.

### publish-aggregations

Package url: https://github.com/kschingiz/publish-aggregations

The package was developed by me one year ago, internally it's using mongodb `change streams` feature which does not scale well.
Creating +10 change streams (it's created on each subscription) can overlad your database and make it much slower. Proof: https://jira.mongodb.org/browse/SERVER-32946

`publish-lookups` uses regular mongodb db `find` queries.

`publish-lookups` wins.
