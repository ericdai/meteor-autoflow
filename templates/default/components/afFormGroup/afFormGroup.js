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
    clear: function() {
        _.each(this.keys, function(val, key) {
            delete key;
        });
    }
};

var getSourceFieldVal = function getSourceFieldVal(sourceField, fieldSchema) {
    var formVal = reactiveFieldDict.get('autoflow.' + sourceField),
        selectionDepProperty = fieldSchema.autoflow.selectionDepProperty,
        sourceSchema = null,
        sourceFieldVal = null;

    if (selectionDepProperty) {
        sourceSchema = AutoForm.getSchemaForField(sourceField);
        sourceFieldVal = formVal || sourceSchema.autoform.defaultValue;
        //var sourceFieldVal = $("[name='" + sourceField + "']").val() || sourceSchema.autoform.defaultValue;
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

    _.each(formSchema, function(fieldSettings, fieldName) {
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

Template['afFormGroup_autoflow'].helpers({
    afFieldInputAtts: function () {
        var atts = _.clone(this.afFieldInputAtts || {}),
            fieldSchema = null,
            autoflow = null;

        if ('input-col-class' in atts) {
            delete atts['input-col-class'];
        }
        // We have a special template for check boxes, but otherwise we
        // want to use the same as those defined for bootstrap3 template.
        if (AutoForm.getInputType(this.afFieldInputAtts) === "boolean-checkbox") {
            atts.template = "bootstrap3-horizontal";
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
        if (autoflow.formulaDep) atts.value = getFormulaVal(autoflow.formulaDep, AutoForm.getFormSchema()._schema);

        //console.log('Stringified, atts = ' + JSON.stringify(atts, null, 4));
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
    autoFlowFieldAtts: function() {
        //console.log('********* ' + this.name);
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        //console.log('Stringified, AutoForm.getSchemaForField() = ' + this.name + ', ' + JSON.stringify(fieldSchema, null, 4));
        //console.log('Stringified, this = ' + JSON.stringify(this, null, 4));
        return fieldSchema.autoflow;
    },
    // Added by DA
    hiddenAttr: function() {
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        if (fieldSchema.autoflow && fieldSchema.autoflow.hidden) {
            return "hidden"
        }
    },
    // Added by DA
    mapsTo: function() {
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        return fieldSchema.autoflow && fieldSchema.autoflow.mapsTo;
    },
    mapsToName: function() {
        return this.name + '.mapsTo';
    }
});

// DA: Clear leftover values
Template["afFormGroup_autoflow"].rendered = function() {
    reactiveFieldDict.clear();
};

// DA: added so that any dependent fields can react appropriately
Template["afFormGroup_autoflow"].events({
    'change *': function (event, tmpl) {
        //console.log('Something was changed, this = ' + JSON.stringify(this, null, 4));
        //var name = $(event.target).attr('name');
        //var value = $(event.target).val();
        reactiveFieldDict.set('autoflow.' + $(event.target).attr('name'), $(event.target).val());
    }
});
