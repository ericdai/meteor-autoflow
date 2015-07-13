# AutoFlow
AutoFlow is a Meteor package that enables multi-page forms and page flows entirely from JSON.  This package requires and automatically installs the [AutoForm](https://github.com/aldeed/meteor-autoform), [SimpleSchema](https://github.com/aldeed/meteor-simple-schema), and [JSON Schema to SimpleSchema](https://github.com/yodata/meteor-json-simple-schema/) packages. You can optionally use it with the [Collection2](https://github.com/aldeed/meteor-collection2) package, which you have to add to your app yourself.

## Disclaimer
This package is not expected to be usable until September 2015.  It undoubtedly contains many serious bugs.

## Form Functionality

Since this package uses AutoForm, the forms generated include most of the goodness of the AutoForm package, including form generation and form validation.  In addition, AutoFlow adds:



## Demo
Check out the [AutoFlow demo](http://autoflow-demo.meteor.com/) to play with different flow definitions.

## Quick Start

Only two steps are necessary to create a series of forms/pages:

- Include the quickFlow template in your template code (`{{< quickFlow}}`)
- Create an AutoFlow definition (which is passed as a parameter to the quickFlow template)

Basic template code using defaults:

    {{> quickFlow autoFlowDef=flowDef }}

Full template code overriding defaults:

    {{> quickFlow autoFlowDef=flowDef id="basicForm" type="autoflow-method-update" meteormethod="autoFlowUpsert" template="autoflow_bootstrap3_horizontal" label-class="col-sm-3" input-col-class="col-sm-6" }}
    
JSON definition (from within Template helper): 

    Template.myTemplate.helpers({
        flowDef: [
            {
                "formId": "form1",
                "collectionName": "People",
                "collectionId": "PersonID1",
                "nextForm": "form2",
                "schemaFormat": "SimpleSchema",
                "schema": {
                    "name": {
                        "type": "String",
                        "label": "Your name",
                        "max": 50
                    },
                    "email": {
                        "type": "String",
                        "label": "E-mail address"
                    }
                }
            },
            {
                "formId": "form2",
                "collectionName": "People",
                "collectionId": "PersonID1",
                "nextForm": "form1",
                "schemaFormat": "SimpleSchema",
                "schema": {
                    "color": {
                        "type": "String",
                        "label": "Favorite color",
                        "defaultValue": "Orange",
                        "allowedValues": [
                            "Purple",
                            "Blue",
                            "Orange",
                            "Green"
                        ]
                    }
                }
            }
        ]
    });


## AutoFlow flow definition

####AutoFlow form definition top-level members/properties:

- `formId` -- string, unique ID for that form
- `collectionName` -- string, name of the collection to be updated
- `collectionId` -- string, the `_id` of the doc to be updated
- `nextForm` -- string, must be the `formId` field of another form in the flow definition
- `nextPage` -- string, can be a relative path or absolute url.  After submitting the form, user will be redirected to this page by calling `window.location.href = <nextPage value>` 
- `schemaFormat` -- string, value can be `SimpleSchema` or `JSONSchema` (JSONSchema format will be converted to SimpleSchema using the [JSON Schema to SimpleSchema](https://github.com/yodata/meteor-json-simple-schema/) package)
- `schema` -- JSON object, the form definition, in SimpleSchema" or JSONSchema format


#### AutoFlow field members/properties
- `readOnly` -- boolean, make input element read only by adding `readonly` attribute
- `displayOnly` -- boolean, create a display element
- `units` -- string, add units to input element
- `selectionDep` (change name) -- string, name of another field 
- `selectionDepProperty` (change name) -- string, a property of the field specified by `selectionDep`
- `formulaDep` (change name) -- string, basic math formula.  String interpolation performed on tokens containing field names within brackets (e.g. `[]`)
- `closed` -- boolean, limited to objects types (fieldsets), initial display of fieldset will be closed/collapsed
- `mapTo` -- string, the property of `collectionName` that should be updated with this value.  Use dot notation. 
- deprecate?? `hidden` -- boolean, make field a hidden field (use autoform omit instead??)


#### AutoForm/SimpleSchema field properties
- `autoform.type` -- manual control of input type
- `autoform.rows` -- number, number of rows for type `textarea`
- `autoform.class` -- class for field (input?)
- `autoform.omit` -- field not included in html form
- `type` -- string, value can be "String", "Number", "Boolean", "Object", "[String]", "[Number]", "[Boolean]", "[Object]" 
- `label`
- `defaultValue`
- `optional`
- `min` and `max`
- `exclusiveMin` and `exclusiveMax`
- `decimal` -- boolean, `true` indicates non-integers are allowed, `false` indicates they are not allowed .  Default is `false`.
- `minCount` and `maxCount` -- number, for arrays
- `allowedValues` -- array of allowed values
- `regEx`
- `blackbox` -- boolean, skip validation of entire contents of fieldset
- `trim` -- boolean, default is `true`
- `autoValue` -- function
- `custom` -- function


## More complex AutoFlow form definition


## Customizing Form Templates
Currently, the default set of templates are the "autoflow_bootstrap3_horizontal" template

