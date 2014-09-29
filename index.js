var xtnd = require('xtnd');
var pzero = require('pzero');

/**
 * Examples
 *
 *  require('mongo-qc')
 *      .connect({collections: ['users'])
 *      .then(function(db) {
 *          db.users.findOne({name: 'artur'});
 *      });
 *
 *  var db = require('mongo-qc');
 *
 *  db.users.findOne()
 *
 */

var defaults = {
    host: 'localhost',
    port: 27017,
    name: 'test',
    collections: []
};

var api = module.exports = {

    db: null,

    id: function(hex) {},

    close: function() {
        api.db.close();
    },

    connect: function(options) {
        var mongo = options.mongo || require('mongodb');
        var client = mongo.MongoClient;

        api.id = function() {
            return new (mongo.ObjectID).createFromHexString(hex);
        };

        return connect(xtnd({}, defaults, options, {client: client}));
    }
};

function connect(options) {

    var url = 'mongodb://' + options.host + ':' + options.port + '/' + options.name;
    var promise = pzero();

    options.client.connect(url, function(err, db) {

        if (err) { return promise.reject(err); }

        var collections = options.collections.map(function(name) {
            var collection = pzero();

            db.collection(name, collection.node());

            return collection;
        });

        pzero
            .when(collections)
            .then(function(collections) {

                collections.map(function(collection) {
                    api[ collection.collectionName ] = collection;
                });

                return api;
            })
            .pipe(promise);

        api.db = db;
    });

    return promise;
}

