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
        $(paramsGroup.groupId).hide();
        hideParamsGroups(totalHeight - paramsGroup.height, containerHeight);
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

Template['quickForm_autoflow_bootstrap3_horizontal'].events({
    'submit form': function(event, template) {
        event.preventDefault();

        var formId = $(event.target).closest('form').attr('id');
        var formSchema = AutoForm.getFormSchema(formId);

        var $autoFlowSubmit = template.find('#autoflow-submit');
        var typeOfValidation = $autoFlowSubmit.getAttribute('validation');

        if (typeOfValidation !== 'none' && typeOfValidation !== false) {
            var isValid = AutoForm.validateForm(formId);
            if (!isValid) {
                console.log('Form with id="' + formId + '" failed AutoForm validation');
                return;
            }
        }

        var nextForm = formSchema._schema.nextForm && formSchema._schema.nextForm.defaultValue || formSchema._schema.nextForm.value;
        if (nextForm) AutoFlow.currentFormName.set(nextForm);

        var nextRoute = formSchema._schema.nextRoute && formSchema._schema.nextRoute.defaultValue || formSchema._schema.nextRoute.value;
        if (nextRoute) Router.go(nextRoute);
    }
});
