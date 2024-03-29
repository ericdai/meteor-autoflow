/** Begin section added by DA **/
// From https://www.eventedmind.com/feed/meteor-build-a-reactive-data-source
var reactiveFieldDict = {
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
};

// TODO: this won't work for all possible ways options can be defined with AutoForm
// TODO: generalize this for any kind of input, and not just selects/drop downs
var getSourceFieldVal = function getSourceFieldVal(sourceField, fieldSchema) {
    var formVal = reactiveFieldDict.get('autoflow.' + sourceField),
        selectionDepProperty = fieldSchema.autoflow.selectionDepProperty || 'value',
        sourceSchema = null,
        sourceFieldVal = null;

    if (selectionDepProperty) {
        sourceSchema = AutoForm.getSchemaForField(sourceField);
        sourceFieldVal = formVal || sourceSchema.autoform.defaultValue;
        if (sourceFieldVal) {
            var selectedOption = _.find(sourceSchema.autoform.options, function (option) {
                return option.value === sourceFieldVal;
            });
            sourceFieldVal = selectedOption && selectedOption[selectionDepProperty];
        }
    }
    return sourceFieldVal;
};

var getFormulaVal = function getFormulaVal(formula, formSchema) {
    var val = null;

    _.each(formSchema, function (fieldSettings, fieldName) {
        var formVal = reactiveFieldDict.get('autoflow.' + fieldName);
        var sourceFieldVal = formVal || fieldSettings.defaultValue;
        formula = formula.replace('[' + fieldName + ']', sourceFieldVal);
    });

    try {
        val = eval(formula);
    } catch (e) {
        console.log('Error:  Could not evaluate formula: ' + formula);
    }

    return val;
};
/** End section added by DA **/

Template["afFormGroup_autoflow_bootstrap3_horizontal"].helpers({
    afFieldInputAtts: function () {
        var atts = _.clone(this.afFieldInputAtts || {});

        if ('input-col-class' in atts) {
            delete atts['input-col-class'];
        }
        // We have a special template for check boxes, but otherwise we
        // want to use the same as those defined for bootstrap3 template.
        if (AutoForm.getInputType(this.afFieldInputAtts) === "boolean-checkbox") {
            atts.template = "autoflow_bootstrap3_horizontal";
        } else {
            atts.template = "bootstrap3";
        }

        /** Begin autoflow section added by DA **/
        // For fields displaying properties of selections, set the value.
        // All template helpers are reactive, and this one will be triggered by "reactiveFieldDict.get()")
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        var autoflow = fieldSchema.autoflow;

        if (!autoflow) return atts; // only proceed if there are autoflow elements

        if (autoflow.readOnly) {
            atts.readonly = true;
            atts.disabled = true;
        }

        // Set values that are dependent on other field values
        if (autoflow.selectionDep) atts.value = getSourceFieldVal(autoflow.selectionDep, fieldSchema);
        if (autoflow.formula) atts.value = getFormulaVal(autoflow.formula, AutoForm.getFormSchema()._schema);
        /** End autoflow section added by DA **/

        return atts;
    },
    afFieldLabelAtts: function () {
        var atts = _.clone(this.afFieldLabelAtts || {});
        // Add bootstrap class
        atts = AutoForm.Utility.addClass(atts, "control-label");
        return atts;
    },
    rightColumnClass: function () {
        var atts = this.afFieldInputAtts || {};
        return atts['input-col-class'] || "";
    },
    skipLabel: function () {
        var self = this;

        var type = AutoForm.getInputType(self.afFieldInputAtts);
        return (self.skipLabel || (type === "boolean-checkbox" && !self.afFieldInputAtts.leftLabel));
    },
    // Added by DA
    autoFlowFieldAtts: function () {
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        return fieldSchema.autoflow;
    }
});

// DA: Clear leftover values
Template["afFormGroup_autoflow_bootstrap3_horizontal"].rendered = function () {
    reactiveFieldDict.clear();
};

// DA: added so that any dependent fields can react appropriately
Template["afFormGroup_autoflow_bootstrap3_horizontal"].events({
    'change *': function (event, tmpl) {
        reactiveFieldDict.set('autoflow.' + $(event.target).attr('name'), $(event.target).val());
    }
});