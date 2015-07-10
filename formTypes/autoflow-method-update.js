var buildFieldMappings = function buildFieldMappings() {
    var fieldMappings = {},
        autoFlowFormDef = AutoFlow.getCurrentFormDef();

    lodash.forEach(autoFlowFormDef.schema, function(fieldProps, fieldName) {
        if (fieldProps.autoflow && fieldProps.autoflow.mapTo) fieldMappings[fieldName] = fieldProps.autoflow.mapTo;
    });

    return fieldMappings;
};

var buildUpdateMetaData = function buildUpdateMetaData() {
    var autoFlowFormDef = AutoFlow.getCurrentFormDef();

    var metaData = {
        collectionName: autoFlowFormDef.collectionName,
        collectionId: autoFlowFormDef.collectionId
    };

    metaData.fieldMappings = buildFieldMappings();

    return metaData;
};

AutoForm.addFormType('autoflow-method-update', {
    onSubmit: function () {
        var c = this,
            updateMetaData = null;

        // Prevent browser form submission
        this.event.preventDefault();

        if (!this.formAttributes.meteormethod) {
            throw new Error('When form type is "autoflow-method-update", you must also provide a "meteormethod" attribute');
        }

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