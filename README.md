# AutoFlow
AutoFlow is a Meteor package that enables multi-page forms and page flows entirely from JSON.  This package requires and automatically installs the [AutoForm](https://github.com/aldeed/meteor-autoform), [SimpleSchema](https://github.com/aldeed/meteor-simple-schema), and [JSON Schema to SimpleSchema](https://github.com/yodata/meteor-json-simple-schema/) packages. You can optionally use it with the [Collection2](https://github.com/aldeed/meteor-collection2) package, which you have to add to your app yourself.

## Disclaimer
This package is currently in a "Proof of Concept" state.  It contains many serious bugs and lacks development of many mainstream use cases, error handling, edge-cases, etc.  However, you are encouraged to add to it and submit a pull request.

## Demo
Check out the [AutoFlow demo](http://autoflow-demo.meteor.com/) to see the package in action and play with different flow definitions.

## Form Functionality
Since this package uses AutoForm, the forms generated include most of the goodness of the AutoForm package, including form generation and form validation.  In addition, AutoFlow adds these capabilities (with JSON alone):

- create multiple forms and link them (upon form submission)
- enable navigation to other urls (after form submission)
- specify the collection and doc to update
- map form values to any member/property of a collection
- create reactive formulas that depend on the values of other fields
- create readOnly inputs
- create displayOnly fields
- add units/post-text after inputs
- display various properties (not just `value`) of select options

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
*From AutoFlow*

- `autoflow.readOnly` -- boolean, make input element read only by adding `readonly` attribute
- `autoflow.displayOnly` -- boolean, create a display element
- `autoflow.units` -- string, add units to input element
- `autoflow.selectionDep` (change name) -- string, name of another field 
- `autoflow.selectionDepProperty` (change name) -- string, a property of the field specified by `selectionDep`
- `autoflow.formulaDep` (change name) -- string, basic math formula.  String interpolation performed on tokens containing field names within brackets (e.g. `[]`)
- `autoflow.closed` -- boolean, limited to objects types (fieldsets), initial display of fieldset will be closed/collapsed
- `autoflow.mapTo` -- string, the property of `collectionName` that should be updated with this value.  Use dot notation. 

*From AutoForm*

- `autoform.type` -- manual control of input type
- `autoform.rows` -- number, number of rows for type `textarea`
- `autoform.class` -- class for field (input?)
- `autoform.omit` -- field not included in html form

*From SimpleSchema*

- `type` -- string, value can be `String`, `Number`, `Boolean`, `Object`, `[String]`, `[Number]`, `[Boolean]`, `[Object]` 
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


## Example of Complex AutoFlow form definition

    Template.myTemplate.helpers({
        flowDef:[
            {
                formId: "form1",
                schemaFormat: "SimpleSchema",
                "nextForm": "form2",
                "nextRoute": "fracsim",
                "collectionName": "Jobs",
                "collectionId": "JobID1",
                schema: {
                    "Status_HydraulicFractureSimulation": {
                        "type": "String",
                        "defaultValue": "submitted",
                        "autoflow": {
                            "mapTo": "Status.HydraulicFractureSimulation",
                            "hidden": true
                        }
                    },
                    "Status_ProppantTransportSimulation": {
                        "type": "String",
                        "defaultValue": "submitted",
                        "autoflow": {
                            "mapTo": "Status.ProppantTransportSimulation",
                            "hidden": true
                        }
                    },
                    "demoMode": {
                        "type": "String",
                        defaultValue: 1,
                        "autoflow": {
                            "hidden": true
                        }
                    },
                    "Hydraulic Fracture": {
                        "type": "Object"
                    },
                    "Hydraulic Fracture.injectionRate": {
                        "type": "String",
                        "label": "Injection Rate",
                        "defaultValue": "40",
                        "autoflow": {
                            "mapTo": "Simulations.FluidSimulation.BoundaryConditions.FlowRate",
                            "units": "kg/s"
                        }
                    },
                    "Hydraulic Fracture.fluidType": {
                        "type": "String",
                        "label": "Fluid Type",
                        "autoform": {
                            "defaultValue": "Water",
                            "options": [
                                {
                                    "label": "Water",
                                    "value": "Water",
                                    "density": "1000 kg m^{-3}",
                                    "viscosity": "0.001 Pa s"
                                },
                                {
                                    "label": "Slick Stuff",
                                    "value": "Slick Stuff",
                                    "density": "20",
                                    "viscosity": "30"
                                }
                            ]
                        },
                        "autoflow": {
                            "mapTo": "Simulations.FluidSimulation.Materials.FluidType"
                        }
                    },
                    "Hydraulic Fracture.density": {
                        "type": "String",
                        "label": "Density",
                        "optional": true,
                        "autoflow": {
                            "displayOnly": true,
                            "selectionDep": "Hydraulic Fracture.fluidType",
                            "selectionDepProperty": "density"
                        }
                    },
                    "Hydraulic Fracture.viscosity": {
                        "type": "String",
                        "label": "Viscosity",
                        "optional": true,
                        "autoflow": {
                            "displayOnly": true,
                            "selectionDep": "Hydraulic Fracture.fluidType",
                            "selectionDepProperty": "viscosity"
                        }
                    },
                    "Proppant": {
                        "type": "Object"
                    },
                    "Proppant.injectionTime": {
                        "type": "String",
                        "label": "Injection Time",
                        "defaultValue": "600",
                        "autoflow": {
                            "mapTo": "Simulations.ProppantTransportSimulation.InjectionTime",
                            "units": "s"
                        }
                    },
                    "Proppant.injectionRate": {
                        "type": "String",
                        "label": "Injection Rate",
                        "defaultValue": "17",
                        "autoflow": {
                            "mapTo": "Simulations.ProppantTransportSimulation.InjectionRate",
                            "units": "kg/s"
                        }
                    },
                    "Proppant.amount": {
                        "type": "String",
                        "label": "Amount",
                        "optional": true,
                        "autoflow": {
                            "displayOnly": true,
                            "formula": "[Proppant.injectionTime] * [Proppant.injectionRate]",
                            "units": "kg"
                        }
                    },
                    "Proppant.proppantType": {
                        "type": "String",
                        "label": "Proppant Type",
                        "autoform": {
                            "defaultValue": "Melior60",
                            "options": [
                                {
                                    "label": "WhiteSand100",
                                    "value": "WhiteSand100",
                                    "density": "2650 kg m^{-3}",
                                    "diameter": "0.00015 m"
                                },
                                {
                                    "label": "Kryptosphere25",
                                    "value": "Kryptosphere25",
                                    "density": "3900 kg m^{-3}",
                                    "diameter": "0.00078 m"
                                },
                                {
                                    "label": "WhiteSand30",
                                    "value": "WhiteSand30",
                                    "density": "2650 kg m^{-3}",
                                    "diameter": "0.000595 m"
                                },
                                {
                                    "label": "Melior60",
                                    "value": "Melior60",
                                    "density": "1980 kg m^{-3}",
                                    "diameter": "0.00025 m"
                                }
                            ]
                        },
                        "autoflow": {
                            "mapTo": "Simulations.ProppantTransportSimulation.Materials.ProppantType"
                        }
                    },
                    "Proppant.density": {
                        "type": "String",
                        "label": "Density",
                        "optional": true,
                        "autoflow": {
                            "displayOnly": true,
                            "selectionDep": "Proppant.proppantType",
                            "selectionDepProperty": "density"
                        }
                    },
                    "Proppant.diameter": {
                        "type": "String",
                        "label": "Diameter",
                        "optional": true,
                        "autoflow": {
                            "displayOnly": true,
                            "selectionDep": "Proppant.proppantType",
                            "selectionDepProperty": "diameter"
                        }
                    }
                }
            },
            {
                formId: "form2",
                schemaFormat: "SimpleSchema",
                nextForm: "form3",
            ...
            ...
            ...
        ]


## Customizing Form Templates
Currently, the default set of templates are the "autoflow_bootstrap3_horizontal" template

