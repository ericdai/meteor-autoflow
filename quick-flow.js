var currentDataContext,
    renderedView;

var expandSchemaMappings = function expandSchemaMappings(schema) {
    var expandedSchema = {};
    lodash.forEach(schema['properties'], function(value, key) {
        if (value.properties.autoflow && value.properties.autoflow.mapTo) {
            expandedSchema[key.replace('.',':') + ':mapTo'] = {
                "type": "object",
                "properties": {
                    type: String,
                    defaultValue: value.properties.autoflow.mapTo,
                    autoflow: {
                        hidden: true
                    }
                }
            };
            delete value.properties.autoflow.mapTo;
        }
        expandedSchema[key] = value;
    });

    return expandedSchema;
};

var getCurrentFormSimpleSchema = function getCurrentFormSimpleSchema(currentFormDef) {
    if (currentFormDef.schemaFormat && currentFormDef.schemaFormat.toUpperCase() === 'JSONSCHEMA') {
        return new JSONSchema(expandSchemaMappings(currentFormDef.schema)).toSimpleSchema();
    } else {
        return new SimpleSchema(currentFormDef.schema);
    }
};

var mapCurrentContextToQuickFormContext = function mapCurrentContextToQuickFormContext(currentFormDef) {
    var templateDataContext = {},
        resetOnSuccess = currentDataContext['reset-on-success'] || currentDataContext.resetOnSuccess,
        buttonContent = currentDataContext['button-content'] || currentDataContext.buttonContent,
        labelClass = currentDataContext['label-class'] || currentDataContext.labelClass,
        inputColClass = currentDataContext['input-col-class'] || currentDataContext.inputColClass,
        autoCloseContainerId = templateDataContext['auto-close-container-id'] = currentDataContext['auto-close-container-id'] || currentDataContext.autoCloseContainerId;

    templateDataContext.schema = getCurrentFormSimpleSchema(currentFormDef);
    templateDataContext.id = currentFormDef.name;
    if (currentDataContext.type) templateDataContext.type = currentDataContext.type;
    templateDataContext.meteormethod = currentDataContext['meteor-method'] || currentDataContext.meteormethod || currentDataContext.meteorMethod || AutoFlow.DEFAULT_UPSERT_METHOD;
    templateDataContext.template = currentDataContext.template || AutoFlow.DEFAULT_AUTOFORM_TEMPLATE;
    if (resetOnSuccess) templateDataContext.resetOnSuccess = resetOnSuccess;
    if (buttonContent) templateDataContext.buttonContent = buttonContent;
    if (labelClass) templateDataContext['label-class'] = labelClass;
    if (inputColClass) templateDataContext['input-col-class'] = inputColClass;
    if (autoCloseContainerId) templateDataContext['auto-close-container-id'] = autoCloseContainerId;

    return templateDataContext;
};

var validateAutoFlowDef = function validateAutoFlowDef(autoFlowDef) {
    if (!autoFlowDef) throw new Meteor.Error('autoflow-def-not-found', 'No value provided for "auto-flow-def" or "autoFlowDef"');
};

var getAutoFlowDef = function getAutoFlowDef() {
    var autoFlowDef = currentDataContext['auto-flow-def'] || currentDataContext.autoFlowDef;
    validateAutoFlowDef(autoFlowDef);
    return autoFlowDef;
};

var validateCurrentFormDef = function validateCurrentFormDef(currentFormDef, currentFormName) {
    if (!currentFormDef) throw new Meteor.Error('form-def-not-found', 'Form definitions with name of "' + currentFormName + '" was not found in auto-flow-def.');
    if (!currentFormDef.schema) throw new Meteor.Error('form-schema-not-found', 'Form schema for "' + currentFormName + '" was not found in auto-flow-def.');
};

// Return schema specified by currentFormName or the first form schema in autoFlow JSON definition
var getCurrentFormDef = function getCurrentFormDef(autoFlowDef, currentFormName) {
    var currentFormDef = null;

    if (!currentFormName) {
        currentFormDef = autoFlowDef[0];
    } else {
        currentFormDef = _.find(autoFlowDef, function(singleDef) {
            return singleDef.name === currentFormName;
        });
    }

    validateCurrentFormDef(currentFormDef, currentFormName);

    return currentFormDef;
};

Template.quickFlow.rendered = function renderQuickFormTemplateWithDataContext() {
    var autoFlowDef = null,
        currentFormName = null,
        currentFormDef = null,
        quickFormDataContext = null,
        parentNode = document.getElementById('quickFlow');

    currentDataContext = Template.currentData();

    this.autorun(function() {
        currentFormName = AutoFlow.currentFormName.get();  // reactive, triggers autorun
        autoFlowDef = getAutoFlowDef();
        currentFormDef = getCurrentFormDef(autoFlowDef, currentFormName);
        quickFormDataContext = mapCurrentContextToQuickFormContext(currentFormDef);

        if (renderedView) Blaze.remove(renderedView);
        renderedView = Blaze.renderWithData(Template.quickForm, quickFormDataContext, parentNode);
    })
};

Template.quickFlow.destroyed = function removeFormView() {
    Blaze.remove(renderedView);
};