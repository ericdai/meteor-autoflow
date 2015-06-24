AutoFlow = {
    // Reactive Dictionary pattern from https://www.eventedmind.com/feed/meteor-build-a-reactive-data-source
    Schemas: {
        keys: {},
        deps: {},
        get: function (key) {
            this.ensureDeps(key);
            this.deps[key].depend();
            return this.keys[key];
        },
        set: function (key, value) {
            this.ensureDeps(key);
            this.keys[key] = value;
            this.deps[key].changed();
        },
        ensureDeps: function (key) {
            if (!this.deps[key])
                this.deps[key] = new Tracker.Dependency;
        },
        clear: function () {
            _.each(this.keys, function (val, key) {
                delete key;
            });
        }
    },
    currentSchemaName: new ReactiveVar()
};

SimpleSchema.extendOptions({
    autoflow: Match.Optional(Match.ObjectIncluding({
        readOnly: Match.Optional(Boolean),
        units: Match.Optional(String),
        selectionDep: Match.Optional(String),
        selectionProp: Match.Optional(String),
        hidden: Match.Optional(Boolean),
        formulaDep: Match.Optional(String),
        closed: Match.Optional(Boolean),
        mapTo: Match.Optional(String)
    }))
});

if (Meteor.isServer) {
    var validateSettings = function validateSettings(settings) {
        if (!settings.$set) throw new Meteor.Error('no-form-values', 'No $set in form values.');
        if (!settings.$set.collectionName) throw new Meteor.Error('no-collection-name', 'Property "collectionName" was not specified in the form.');
        if (!settings.$set.collectionId) throw new Meteor.Error('no-collection-id', 'Property "collectionId" was not specified in the form.');
        if (!GLOBAL[settings.$set.collectionName]) throw new Meteor.Error('collection-not-found', 'Could not find collection named "' + collectionName + '".');
        try {
            GLOBAL[settings.$set.collectionName].findOne();
        } catch (e) {
            throw new Meteor.Error('cannot-access-collection', 'Could not access collection named "' + collectionName + '".', e.toString());
        }
    };

    Meteor.methods({
        autoflowUpsert: function(settings) {
            var collectionName,
                collectionId,
                collection,
                document,
                filteredCollection = {};

            if (!Meteor.user()) throw new Meteor.Error('not-logged-in', 'You must be logged in to call this method');

            console.log('autoFlowUpsert(), settings = ' + JSON.stringify(settings, null, 4));
            validateSettings(settings);

            collectionName = settings.$set.collectionName;
            collectionId = settings.$set.collectionId;
            collection = GLOBAL[collectionName];
            document = collection.findOne({_id: collectionId});

            document = document || {};
            //console.log('collection = ' + JSON.stringify(collection, null, 4));

            lodash.forEach(settings.$set, function(value, key) {
                if (!ld.includes(['collectionName', 'collectionId'], key) && key.indexOf(':') === -1) {
                    var mapping = settings.$set[key.replace('.', ':') + ':mapTo'];
                    if (mapping) {
                        ld.set(filteredCollection, mapping, value);
                    } else {
                        filteredCollection[key] = value;
                    }
                }
            });

            console.log('Stringified, filteredCollection = ' + JSON.stringify(filteredCollection, null, 4));

            var document = ld.merge(document, filteredCollection);

            //collection.upsert(collectionId, document, { multi: false }, function (error, result) {
            //    if (error) {
            //        console.log("There was an error upserting collection " + collectionName + ' with collectionId of ' + collectionId);
            //        console.log('error: ' + error);
            //    } else {
            //        successResult = result;
            //        console.log('Successfully updated collection ' + collectionName + ' with collectionId of ' + collectionId + ' for this many records: ' + successResult);
            //    }
            //});

        }
    });
}