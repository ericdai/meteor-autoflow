// Return schema specified by currentSchemaName or the first form schema in autoFlow JSON definition
var getCurrentFormSchema = function getCurrentFormSchema(currentDataContext, currentSchemaName) {
    var autoflowDef = currentDataContext.autoFlowDef,
        currentSchema = null;

    if (!autoflowDef) throw new Meteor.Error('no-autoflow-def', 'No value provided for "autoFlowDef"');

    if (!currentSchemaName) {
        currentSchema = autoflowDef[0];
    } else {
        currentSchema = _.find(autoflowDef, function(singleDef) {
            return singleDef.name === currentSchemaName;
        });
        if (!currentSchema) throw new Meteor.Error('no-schema-found', 'Schema with name of "' + currentSchemaName + '" was not found in autoFlowDef.');
    }

    return currentSchema;
};

var mapCurrentContextToQuickFormContext = function mapCurrentContextToQuickFormContext(currentDataContext, currentFormSchema) {
    var templateDataContext = {
        schema: currentFormSchema.simpleSchema,
        id: currentFormSchema.name,
        type: currentDataContext.type,
        meteormethod: currentDataContext['meteor-method'] || currentDataContext.meteormethod,
        template: currentDataContext.template,
        resetOnSuccess: currentDataContext['reset-on-success'] || currentDataContext.resetOnSuccess,
        buttonContent: currentDataContext['button-content'] || currentDataContext.buttonContent
    };

    templateDataContext['label-class'] = currentDataContext['label-class'] || currentDataContext.labelClass;
    templateDataContext['input-col-class'] = currentDataContext['input-col-class'] || currentDataContext.inputColClass;
    templateDataContext['auto-close-container-id'] = currentDataContext['auto-close-container-id'] || currentDataContext.autoCloseContainerId;

    return templateDataContext;
};

Template.quickFlow.rendered = function() {
    var currentFormSchema = null,
        currentSchemaName = null,
        currentDataContext = null,
        quickFormDataContext = null,
        renderedView = null;

    this.autorun(function() {
        currentSchemaName = AutoFlow.currentSchemaName.get();  // reactive, triggers autorun
        currentDataContext = Template.currentData();

        var parentNode = document.getElementById('quickFlow');
        if (renderedView) Blaze.remove(renderedView);
        currentFormSchema = getCurrentFormSchema(currentDataContext, currentSchemaName);
        quickFormDataContext = mapCurrentContextToQuickFormContext(currentDataContext, currentFormSchema);

        renderedView = Blaze.renderWithData(Template.quickForm, quickFormDataContext, parentNode);
    })
};