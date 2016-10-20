/*global cwAPI*/
(function (cwApi) {
    'use strict';
    var loader = cwApi.CwAngularLoader;
    cwApi.ngDirectives.push(function () {
        loader.registerDirective('CwTemplateDirective', function () {
            return {
                restrict: 'AE',
                templateUrl: loader.getCustomLayoutTemplatePath('CustomFolder', 'LayoutHost', 'CwTemplateDirective')
            };
        });
    });
}(cwAPI));