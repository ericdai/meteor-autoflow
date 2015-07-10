AutoFlow = {
    currentFormId: new ReactiveVar(null),
    flowDef: new ReactiveVar(null),
    DEFAULT_UPSERT_METHOD: 'autoFlowUpsert',
    DEFAULT_AUTOFORM_TEMPLATE: 'autoflow',
    getCurrentFormDef: function() {
        var self = this;
        var form = lodash.find(self.flowDef.get(), function(form) {
            return form.formId === self.currentFormId.get();
        });
        return form;
    }
};

SimpleSchema.extendOptions({
    autoflow: Match.Optional(Match.ObjectIncluding({
        readOnly: Match.Optional(Boolean),
        displayOnly: Match.Optional(Boolean),
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
    var buildUpdatedFields = function buildUpdatedFields(formSettings, updateMetaData) {
        var updatedFields = {};

        lodash.forEach(formSettings, function(formValue, fieldName) {
            var targetField = updateMetaData.fieldMappings && updateMetaData.fieldMappings[fieldName];
            if (targetField) {
                lodash.set(updatedFields, targetField, formValue);
            } else {
                updatedFields[fieldName] = formValue;
            }
        });

        return updatedFields
    };

    var validateMetaData = function validateMetaData(metaData) {
        if (!metaData.collectionName) throw new Meteor.Error('no-collection-name', 'Property "collectionName" was not specified in the form metadata.');
        if (!metaData.collectionId) throw new Meteor.Error('no-collection-id', 'Property "collectionId" was not specified in the form metadata.');
        if (!GLOBAL[metaData.collectionName]) throw new Meteor.Error('collection-not-found', 'Could not find collection named "' + collectionName + '".');
        try {
            GLOBAL[metaData.collectionName].findOne();
        } catch (e) {
            throw new Meteor.Error('cannot-access-collection', 'Could not access collection named "' + collectionName + '".', e.toString());
        }
    };

    Meteor.methods({
        autoFlowUpsert: function(settings, updateMetaData) {
            //console.log('Starting Meteor.method autoFlowUpsert, collectionInfo = ' + JSON.stringify(updateMetaData, null, 4));
            validateMetaData(updateMetaData);

            var collection = GLOBAL[updateMetaData.collectionName],
                originalDoc = collection.findOne({_id: updateMetaData.collectionId}) || {},
                updatedFields = buildUpdatedFields(settings.$set, updateMetaData),
                updatedDoc = lodash.merge(originalDoc, updatedFields);

            //console.log('autoFlowUpsert(), settings = ' + JSON.stringify(settings, null, 4));

            collection.upsert(updateMetaData.collectionId, updatedDoc, { multi: false }, function (error, result) {
                if (error) {
                    console.log("There was an error upserting collection " + updateMetaData.collectionName + ' with collection _id of ' + updateMetaData.collectionId);
                    console.log('Error: ' + error);
                } else {
                    successResult = result;
                    console.log('Successfully updated collection ' + updateMetaData.collectionName + ' with collection _id of ' + updateMetaData.collectionId + ' for this many records: ' + successResult);
                }
            });
        }
    });
}