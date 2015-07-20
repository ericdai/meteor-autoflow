var buildFieldMappings = function buildFieldMappings() {
    var fieldMappings = {},
        autoFlowFormDef = AutoFlow.getCurrentFormDef();

    lodash.forEach(autoFlowFormDef.schema, function(fieldProps, fieldName) {
        if (fieldProps.autoflow && fieldProps.autoflow.mapTo) fieldMappings[fieldName] = fieldProps.autoflow.mapTo;
    });
    return fieldMappings;
};

var buildUpdateMetaData = function buildUpdateMetaData() {
    var autoFlowFormDef = AutoFlow.getCurrentFormDef(),
        metaData =  {
            collectionName: autoFlowFormDef.collectionName,
            collectionId: autoFlowFormDef.collectionId,
            fieldMappings: buildFieldMappings()
        };
    return metaData;
};

var filterAndGetKeys = function filterAndGetKeys(obj, func) {
    var keys = [];
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (func(obj[key], key)) keys.push(key);
        }
    }
    return keys;
};

var getNoSubmitFieldNames = function getNoSubmitFieldNames() {
    var autoFlowFormDef = AutoFlow.getCurrentFormDef(),
        noSubmitFieldNames = noSubmitFieldNames = filterAndGetKeys(autoFlowFormDef.schema, function(fieldProps) {
            return (fieldProps.autoflow && fieldProps.autoflow.noSubmit) ? true : false;
        });

    return noSubmitFieldNames;
};

var removeNoSubmitFields = function removeNoSubmitFields(updateDoc) {
    var noSubmitFieldNames = getNoSubmitFieldNames(),
        newUpdateDoc = EJSON.clone(updateDoc);

    noSubmitFieldNames.forEach(function(fieldName) {
        delete newUpdateDoc['$set'][fieldName];
    });

    return newUpdateDoc;
};

AutoForm.addFormType('autoflow-method-update', {
    onSubmit: function () {
        var c = this,
            updateMetaData = null;

        // Prevent browser form submission
        this.event.preventDefault();

        if (!this.formAttributes.meteormethod) throw new Error('When form type is "autoflow-method-update", you must also provide a "meteormethod" attribute');

        // Run "before.method" hooks
        this.runBeforeHooks(this.updateDoc, function (updateDoc) {
            // Validate collection schema or schema, in that order of preference
            var valid = (c.formAttributes.validation === 'none') ||
                c.formTypeDefinition.validateForm.call({
                    form: c.formAttributes,
                    formDoc: updateDoc,
                    useCollectionSchema: c.ssIsOverride
                });

            if (valid === false) {
                c.failedValidation();
            } else {
                updateDoc = removeNoSubmitFields(updateDoc);
                updateMetaData = buildUpdateMetaData();
                Meteor.call(c.formAttributes.meteormethod, updateDoc, updateMetaData, c.result);
            }
        });
    },
    usesModifier: true,
    validateForm: function () {
        // Get SimpleSchema
        var ss = AutoForm.getFormSchema(this.form.id);

        var collection = AutoForm.getFormCollection(this.form.id);
        // If there is a `schema` attribute but you want to force validation against the
        // collection's schema instead, pass useCollectionSchema=true
        ss = (this.useCollectionSchema && collection) ? collection.simpleSchema() : ss;

        // We validate the modifier. We don't want to throw errors about missing required fields, etc.
        return AutoForm._validateFormDoc(this.formDoc, true, this.form.id, ss, this.form);
    },
    shouldPrevalidate: function () {
        // Prevalidate only if there is both a `schema` attribute and a `collection` attribute
        return !!this.formAttributes.collection && !!this.formAttributes.schema;
    }
});