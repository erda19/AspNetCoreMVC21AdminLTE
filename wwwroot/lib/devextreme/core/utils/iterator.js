/**
 * DevExtreme (core/utils/iterator.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var applyCallback = function(index, values, callback, result) {
    var value = callback(values[index], index);
    if (null != value) {
        result.push(value)
    }
};
var map = function(values, callback) {
    var result = [];
    if ("length" in values) {
        for (var index = 0; index < values.length; index++) {
            applyCallback(index, values, callback, result)
        }
    } else {
        for (var key in values) {
            applyCallback(key, values, callback, result)
        }
    }
    return [].concat.apply([], result)
};
var each = function(values, callback) {
    if (!values) {
        return
    }
    if ("length" in values) {
        for (var i = 0; i < values.length; i++) {
            if (false === callback.call(values[i], i, values[i])) {
                break
            }
        }
    } else {
        for (var key in values) {
            if (false === callback.call(values[key], key, values[key])) {
                break
            }
        }
    }
    return values
};
exports.map = map;
exports.each = each;
