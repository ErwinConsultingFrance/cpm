/* Copyright (c) 2012-2016 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery */

(function (cwApi, $) {
    "use strict";
    var cwTemplateLayout, loader = cwApi.CwAngularLoader;

    cwTemplateLayout = function (options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
        this.drawOneMethod = this.drawOne.bind(this);
        cwApi.registerLayoutForJSActions(this);
    };

    cwTemplateLayout.prototype.applyJavaScript = function () {
        var that = this;
        cwApi.CwAsyncLoader.load('angular', function () {
            var templatePath, $container = $('#' + that.domId);
            loader.setup();

            templatePath = loader.getLayoutTemplatePath('cwCustomSiteName', 'cwTemplateLayout', 'cwTemplateLayout');
            loader.loadControllerWithTemplate('cwTemplateLayout', $container, templatePath, function ($scope) {
                that.$scope = $scope;
            });
        });
    };

    cwTemplateLayout.prototype.drawOne = function (output, item, callback) {
        /*jslint unparam:true*/
    };

    cwTemplateLayout.prototype.drawAssociations = function (output, associationTitleText, object) {
        /*jslint unparam:true*/
        this.domId = this.nodeID + '-' + this.options.LayoutID;
        this.mainObject = object;
        output.push("<div id='", this.domId, "'></div>");
    };

    cwApi.cwLayouts.cwTemplateLayout = cwTemplateLayout;

}(cwAPI, jQuery));