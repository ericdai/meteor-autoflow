Package.describe({
    name: 'fullflavedave:autoflow',
    version: '0.0.1',
    summary: 'Extends simple schema and autoform to produce multiple form page flows from json',
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.2');
    //api.use(['check', 'templating'], 'client');
    api.use('check', ['client', 'server']);
    api.use('templating', 'client');
    api.use('reactive-var', ['client', 'server']);
    api.use('underscore', 'client');
    //api.use(['livedata', 'underscore', 'deps', 'templating', 'ui', 'blaze', 'ejson', 'reactive-var', 'reactive-dict', 'random'], 'client');
    api.use('aldeed:autoform@5.1.2');
    api.use('aldeed:simple-schema@1.3.3');
    api.use('fullflavedave:json-schema@0.0.1');
    api.addFiles('autoflow.js', ['client', 'server']);
    api.addFiles('quick-flow.html', ['client']);
    api.addFiles('quick-flow.js', ['client']);

    api.addFiles([
        'templates/default/components/afArrayField/afArrayField.html',
        'templates/default/components/afArrayField/afArrayField.js',
        'templates/default/components/afFormGroup/afFormGroup.html',
        'templates/default/components/afFormGroup/afFormGroup.js',
        'templates/default/components/afObjectField/afObjectField.html',
        'templates/default/components/afObjectField/afObjectField.js',
        'templates/default/components/quickForm/quickForm.html',
        'templates/default/components/quickForm/quickForm.js',
        'templates/default/inputTypes/boolean-checkbox/boolean-checkbox.html',
        'templates/default/inputTypes/boolean-checkbox/boolean-checkbox.js'
    ], 'client');

    api.export(['AutoFlow'], ['server', 'client']);
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('fullflavedave:autoflow');
    api.addFiles('autoflow-tests.js');
});
