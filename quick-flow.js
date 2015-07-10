var currentDataContext,
    renderedView;

var stringToFuncMap = {
    'string': String,
    'integer': Number,
    'number': Number,
    'boolean': Boolean,
    'date': Date,
    'object': Object,
    'String': String,
    'Integer': Number,
    'Number': Number,
    'Boolean': Boolean,
    'Date': Date,
    'Object': Object,
    '[string]': [String],
    '[integer]': [Number],
    '[number]': [Number],
    '[boolean]': [Boolean],
    '[String]': [String],
    '[Integer]': [Number],
    '[Number]': [Number],
    '[Boolean]': [Boolean]
};

var convertStringTypeToFuncType = function convertStringTypeToFuncType(stringVal) {
    return stringToFuncMap[stringVal] || stringVal;  // don't validate here, let SimpleSchema validate
};

var convertToStandardSimpleSchema = function convertToStandardSimpleSchema(simpleSchemish) {
    var simpleSchema = EJSON.clone(simpleSchemish);
    _.each(simpleSchemish, function(fieldDef, fieldName) {
        simpleSchema[fieldName].type = convertStringTypeToFuncType(fieldDef.type);
    });
    return simpleSchema;
};

var getCurrentFormSimpleSchema = function getCurrentFormSimpleSchema(currentFormDef) {
    if (currentFormDef.schemaFormat && currentFormDef.schemaFormat.toUpperCase() === 'JSONSCHEMA') {
        return new JSONSchema(currentFormDef.schema).toSimpleSchema();
    } else {
        return new SimpleSchema(convertToStandardSimpleSchema(currentFormDef.schema));
    }
};

var createQuickFormDataContext = function createQuickFormDataContext(currentFormDef) {
    var templateDataContext = {},
        resetOnSuccess = currentDataContext['reset-on-success'] || currentDataContext.resetOnSuccess,
        buttonContent = currentDataContext['button-content'] || currentDataContext.buttonContent,
        labelClass = currentDataContext['label-class'] || currentDataContext.labelClass,
        inputColClass = currentDataContext['input-col-class'] || currentDataContext.inputColClass,
        autoCloseContainerId = templateDataContext['auto-close-container-id'] = currentDataContext['auto-close-container-id'] || currentDataContext.autoCloseContainerId;

    templateDataContext.schema = getCurrentFormSimpleSchema(currentFormDef);
    templateDataContext.id = currentFormDef.formId;
    if (currentDataContext.type) templateDataContext.type = currentDataContext.type;
    templateDataContext.meteormethod = currentDataContext['meteor-method'] || currentDataContext.meteormethod || currentDataContext.meteorMethod || AutoFlow.DEFAULT_UPSERT_METHOD;
    templateDataContext.template = currentDataContext.template || AutoFlow.DEFAULT_AUTOFORM_TEMPLATE;
    if (typeof currentDataContext.validation !== undefined) templateDataContext['validation'] = currentDataContext.validation;
    if (typeof resetOnSuccess !== 'undefined') templateDataContext.resetOnSuccess = resetOnSuccess;
    if (buttonContent) templateDataContext.buttonContent = buttonContent;
    if (labelClass) templateDataContext['label-class'] = labelClass;
    if (inputColClass) templateDataContext['input-col-class'] = inputColClass;
    if (autoCloseContainerId) templateDataContext['auto-close-container-id'] = autoCloseContainerId;

    return templateDataContext;
};

var validateAutoFlowDef = function validateAutoFlowDef(autoFlowDef) {
    if (!autoFlowDef) throw new Meteor.Error('autoflow-def-not-found', 'No value provided for "auto-flow-def" or "autoFlowDef"');
};

var getAutoFlowDefFromTemplateContext = function getAutoFlowDefFromTemplateContext() {
    return currentDataContext['auto-flow-def'] || currentDataContext.autoFlowDef;
};

var validateCurrentFormDef = function validateCurrentFormDef(currentFormDef, currentFormId) {
    if (!currentFormDef) throw new Meteor.Error('form-def-not-found', 'Form definitions with formId of "' + currentFormId + '" was not found in auto-flow-def.');
    if (!currentFormDef.schema) throw new Meteor.Error('form-schema-not-found', 'Form schema for "' + currentFormId + '" was not found in auto-flow-def.');
};

var initializeCurrentFormId = function initializeCurrentFormName() {
    var formId = AutoFlow.currentFormId.get();

    if (!formId) {
        formId = AutoFlow.flowDef.get()[0].formId;
        AutoFlow.currentFormId.set(formId);
    }
};

var initializeAutoFlowDef = function initializeAutoFlowDef() {
    var autoFlowDef = AutoFlow.flowDef.get();
    if (!autoFlowDef) {
        autoFlowDef = getAutoFlowDefFromTemplateContext();
        validateAutoFlowDef(autoFlowDef);
        AutoFlow.flowDef.set(autoFlowDef);
    }
};

var initialize = function initialize() {
    initializeAutoFlowDef();
    initializeCurrentFormId();
};

Template.quickFlow.rendered = function renderQuickFormTemplateWithDataContext() {
    var autoFlowDef = null,
        currentFormId = null,
        currentFormDef = null,
        quickFormDataContext = null,
        parentNode = document.getElementById('quickFlow');

    currentDataContext = this.data; // this is template instance; could also use Template.currentData()

    initialize();

    this.autorun(function() {
        autoFlowDef = AutoFlow.flowDef.get();  // AutoFlow.flowDef.get also reactive, triggers autorun
        currentFormId = AutoFlow.currentFormId.get();  // reactive, triggers autorun
        currentFormDef = AutoFlow.getCurrentFormDef();
        validateCurrentFormDef(currentFormDef, currentFormId);
        quickFormDataContext = createQuickFormDataContext(currentFormDef);

        if (renderedView) Blaze.remove(renderedView);
        renderedView = Blaze.renderWithData(Template.quickForm, quickFormDataContext, parentNode);
    })
};

Template.quickFlow.destroyed = function removeFormView() {
    Blaze.remove(renderedView);
};