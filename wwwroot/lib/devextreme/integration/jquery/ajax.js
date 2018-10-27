/**
 * DevExtreme (integration/jquery/ajax.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var jQuery = require("jquery");
var ajax = require("../../core/utils/ajax");
var useJQuery = require("./use_jquery")();
if (useJQuery) {
    ajax.inject({
        sendRequest: function(options) {
            if (!options.responseType && !options.upload) {
                return jQuery.ajax(options)
            }
            return this.callBase.apply(this, [options])
        }
    })
}