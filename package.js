Package.describe({
    name: 'fullflavedave:autoflow',
    version: '0.0.6',
    summary: 'Produce multi-page forms and page flows entirely from JSON',
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
    api.use('underscore', ['client', 'server']);
    api.use('stevezhu:lodash@3.9.3', ['client', 'server']);
    //api.use('underscore', 'client');
    //api.use(['livedata', 'underscore', 'deps', 'templating', 'ui', 'blaze', 'ejson', 'reactive-var', 'reactive-dict', 'random'], 'client');
    api.use('aldeed:autoform@5.3.2');
    api.use('aldeed:simple-schema@1.3.3');
    api.use('bshamblen:json-simple-schema@0.0.8');
    api.addFiles('autoflow.js', ['client', 'server']);
    api.addFiles('quick-flow.html', ['client']);
    api.addFiles('quick-flow.js', ['client']);

    api.addFiles([
        'templates/autoflow_bootstrap3_horizontal/components/afArrayField/afArrayField.html',
        'templates/autoflow_bootstrap3_horizontal/components/afArrayField/afArrayField.js',
        'templates/autoflow_bootstrap3_horizontal/components/afFormGroup/afFormGroup.html',
        'templates/autoflow_bootstrap3_horizontal/components/afFormGroup/afFormGroup.js',
        'templates/autoflow_bootstrap3_horizontal/components/afObjectField/afObjectField.html',
        'templates/autoflow_bootstrap3_horizontal/components/afObjectField/afObjectField.js',
        'templates/autoflow_bootstrap3_horizontal/components/quickForm/quickForm.html',
        'templates/autoflow_bootstrap3_horizontal/components/quickForm/quickForm.js',
        'templates/autoflow_bootstrap3_horizontal/inputTypes/boolean-checkbox/boolean-checkbox.html',
        'templates/autoflow_bootstrap3_horizontal/inputTypes/boolean-checkbox/boolean-checkbox.js',
        'templates/autoflow_bootstrap3_horizontal/autoflow_bootstrap3_horizontal.css',

        'formTypes/autoflow-method-update.js'
    ], 'client');

    api.export(['AutoFlow'], ['server', 'client']);
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('fullflavedave:autoflow');
    api.addFiles('autoflow-tests.js');
});
