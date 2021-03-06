/**
 * DevExtreme (integration/angular/template.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    TemplateBase = require("../../ui/widget/ui.template_base"),
    isFunction = require("../../core/utils/type").isFunction,
    domUtils = require("../../core/utils/dom");
var NgTemplate = TemplateBase.inherit({
    ctor: function(element, templateCompiler) {
        this._element = element;
        this._compiledTemplate = templateCompiler(domUtils.normalizeTemplateElement(this._element))
    },
    _renderCore: function(options) {
        var compiledTemplate = this._compiledTemplate,
            result = isFunction(compiledTemplate) ? compiledTemplate(options) : compiledTemplate;
        return result
    },
    source: function() {
        return $(this._element).clone()
    }
});
module.exports = NgTemplate;
