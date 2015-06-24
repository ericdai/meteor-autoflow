/* global AutoForm */

Template["afObjectField_autoflow"].helpers({
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
    var atts = _.pick(this, 'name', 'id-prefix', 'input-col-class', 'label-class');
    return atts;
  },
  formattedName: function () {
    return this.name.replace(' ', '-').toLowerCase();
  }
});
