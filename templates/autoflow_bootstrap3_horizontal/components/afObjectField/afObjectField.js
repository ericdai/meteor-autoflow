/* global AutoForm */

Template["afObjectField_autoflow_bootstrap3_horizontal"].helpers({
    rightColumnClass: function () {
        return this['input-col-class'] || "";
    },
    afFieldLabelAtts: function () {
        // Use only atts beginning with label-
        var labelAtts = {};
        _.each(this, function (val, key) {
            if (key.indexOf("label-") === 0) {
                labelAtts[key.substring(6)] = val;
            }
        });
        // Add bootstrap class
        labelAtts = AutoForm.Utility.addClass(labelAtts, "control-label");
        return labelAtts;
    },
    quickFieldsAtts: function () {
        var atts = _.pick(this, 'name', 'id-prefix', 'input-col-class', 'label-class');  // DA added input-col-class, labal-class
        //var atts = _.pick(this, 'name', 'id-prefix');
        // We want to default to using bootstrap3 template below this point
        // because we don't want horizontal within horizontal
        //atts.template = 'bootstrap3';
        return atts;
    },
    formattedName: function () {
        return this.name.replace(' ', '-').toLowerCase();
    },
    hiddenAttr: function () {
        var fieldSchema = AutoForm.getSchemaForField(this.name);
        if (fieldSchema.autoflow && fieldSchema.autoflow.closed) {
            return 'hidden';
        } else {
            return '';
        }
    }
});

Template['afObjectField_autoflow_bootstrap3_horizontal']['events']({
    'click .expander-collapser': function (event) {
        event.preventDefault();
        var $target = $(event.target);
        var groupId = $target.closest('a').attr('href');
        $(groupId).slideToggle(500);
        $target.closest('a').toggle();
        $target.closest('a').siblings().toggle();
    }
});