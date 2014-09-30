var xtnd = require('xtnd');
var pzero = require('pzero');

var defaults = {
    host: 'localhost',
    port: 27017,
    name: 'test',
    collections: []
};

var api = module.exports = {

    db: null,

    id: function() {},

    ready: pzero(),

    close: function() {
        api.db.close();
    },

    connect: function(options) {
        var mongo = options.mongo || require('mongodb');
        var client = mongo.MongoClient;

        api.id = function(hex) {
            return new (mongo.ObjectID).createFromHexString(hex);
        }

        connect(xtnd({}, defaults, {client: client}, options));

        return api.ready;
    }
};

function connect(options) {
    var url = 'mongodb://' + options.host + ':' + options.port + '/' + options.name;

    options.client.connect(url, function(err, db) {

        if (err) { return api.ready.reject(err); }

        var collections = options.collections.map(function(name) {
            var collection = pzero();

            db.collection(name, collection.node());

            return collection;
        });

        api.db = db;

        pzero
            .when(collections)
            .then(function(collections) {
                collections.map(function(collection) {
                    api[ collection.collectionName ] = collection;
                });
            })
            .pipe(api.ready);
    });
}

