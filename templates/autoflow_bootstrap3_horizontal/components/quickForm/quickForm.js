var paramsGroups = [];

var formatName = function formatName(name) {
    return name.replace(' ', '-').toLowerCase();
};

var getTotalFormHeight = function getTotalFormHeight(schema) {
    var totalHeight = $('#autoflowSubmit').outerHeight(true);
    totalHeight += _.reduce(schema, function (height, element, key) {
        if (element.type.name === "Object") {
            var paramsGroupHeight = $('#' + formatName(key) + '-params-group').outerHeight(true);
            var paramsGroupId = '#' + formatName(key) + '-params-group';
            paramsGroups.push({
                groupId: paramsGroupId,
                height: paramsGroupHeight
            });
            var currentHeight = Number(height || 0) + Number($('#' + formatName(key) + '-section').outerHeight(true)) + 25; // not sure why we need to add 25
            return currentHeight;
        } else {
            return Number(height || 0);
        }
    });
    return totalHeight;
};

var hideParamsGroups = function hideParamsGroups(totalHeight, containerHeight) {
    if (totalHeight > containerHeight) {
        var paramsGroup = paramsGroups.pop();
        if (paramsGroup) {
            $(paramsGroup.groupId).hide();
            hideParamsGroups(totalHeight - paramsGroup.height, containerHeight);
        }
    } else {
        return;
    }
};

Template['quickForm_autoflow_bootstrap3_horizontal'].helpers({
    inputClass: function () {
        return this.atts["input-col-class"];
    },
    labelClass: function () {
        return this.atts["label-class"];
    },
    quickFieldsAtts: function () {
        // These are the quickForm attributes that we want to forward to
        // the afQuickFields component.
        return _.pick(this.atts, 'id-prefix', 'input-col-class', 'label-class');
    },
    submitButtonAtts: function () {
        var qfAtts = this.atts;
        var atts = {};
        if (typeof qfAtts.buttonClasses === "string") {
            atts['class'] = qfAtts.buttonClasses;
        } else {
            atts['class'] = 'btn btn-primary';
        }

        if (typeof qfAtts.validation === "string") {
            atts['validation'] = qfAtts.validation;
        }

        return atts;
    },
    qfAutoFormContext: function () {
        var ctx = _.clone(this.qfAutoFormContext || {});
        ctx = AutoForm.Utility.addClass(ctx, "form-horizontal");
        delete ctx["input-col-class"];
        delete ctx["label-class"];
        delete ctx["id-prefix"];
        return ctx;
    },
    autoCloseGroups: function () {
        var containerId = this.atts['auto-close-container-id'];
        if (!containerId) return;

        var self = this;
        var intervalId = Meteor.setInterval(function () {
            var totalHeight = getTotalFormHeight(self.atts.schema._schema);
            if (totalHeight > 0) {
                Meteor.clearInterval(intervalId);
                var containerHeight = $(containerId).innerHeight();
                hideParamsGroups(totalHeight,containerHeight);
            }
        }, 100);
    }
});

var isValid = function isValid(typeOfValidation, formId) {
    var isValid = true;
    if (typeOfValidation !== 'none' && typeOfValidation !== false) {
        isValid = AutoForm.validateForm(formId);
        if (!isValid) console.log('Form with name="' + formId + '" failed AutoForm validation');
    }
    return isValid;
};

Template['quickForm_autoflow_bootstrap3_horizontal'].events({
    'submit form': function(event, template) {
        var $autoFlowSubmit = template.find('#autoflow-submit'),
            typeOfValidation = $autoFlowSubmit.getAttribute('validation'),
            formId = $(event.target).closest('form').attr('id');

        event.preventDefault();

        if (!isValid(typeOfValidation, formId)) return;

        var autoFlowFormDef = AutoFlow.getCurrentFormDef();
        if (autoFlowFormDef.nextForm) AutoFlow.currentFormId.set(autoFlowFormDef.nextForm);
        if (autoFlowFormDef.nextPage) window.location.href = autoFlowFormDef.nextPage;
        if (typeof Router !== 'undefined' && autoFlowFormDef.nextRoute) Router.go(autoFlowFormDef.nextRoute);
    }
});
