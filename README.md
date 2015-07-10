# AutoFlow
AutoFlow is a Meteor package that enables multi-page forms and page flows entirely from JSON.  This package requires and automatically installs the [AutoForm](https://github.com/aldeed/meteor-autoform), [SimpleSchema](https://github.com/aldeed/meteor-simple-schema), and [JSON Schema to SimpleSchema](https://github.com/yodata/meteor-json-simple-schema/) packages. You can optionally use it with the [Collection2](https://github.com/aldeed/meteor-collection2) package, which you have to add to your app yourself.

## Disclaimer
This package is not expected to be usable until September 2015.  It undoubtedly contains many serious bugs.

## Functionality

Since this package uses AutoForm, the forms generated include most of the goodness within the AutoForm package, including validation.

## Demo
Check out the [AutoFlow demo](http://autoflow-demo.meteor.com/) to play with different flow definitions.

## Quick Start

Only two steps are necessary to create a series of forms/pages:

- include the quickFlow template in the desired template
- create an autoflow definition (which is passed as a parameter to the quickFlow template (`{{< quickFlow}}`)

Template code:

    {{> quickFlow autoFlowDef=flowDef id="basicForm" type="autoflow-method-update" template="autoflow_bootstrap3_horizontal" label-class="col-sm-3" input-col-class="col-sm-6" }}
    
From within JSON AutoFlow definition: 

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

Explanation of AutoFlow definition:

- `formId`: unique ID for that form
- `collectionName`: name of the collection to be updated
- `collectionId`: `_id` of the doc to be updated
- `nextForm`: value must be the `formId` field of another form in the flow definition
- `nextPage`: can be a relative path or absolute url.  After submitting the form, user will be redirected to this page by calling `window.location.href = <nextPage value>` 
- `schemaFormat`: value can be `SimpleSchema` or `JSONSchema` (JSONSchema format will be converted to SimpleSchema using the [JSON Schema to SimpleSchema](https://github.com/yodata/meteor-json-simple-schema/) package)
- `schema`: the form definition, in SimpleSchema" or JSONSchema format

## Field Properties

#### AutoForm field properties



#### Additional properties added by AutoFlow package
- hidden
- 


## More complex AutoFlow form definition


## Customizing Form Templates
Currently, the default set of templates are the "autoflow_bootstrap3_horizontal" template

