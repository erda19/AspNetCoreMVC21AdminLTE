/**
 * DevExtreme (client_exporter.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var fileSaver = require("./client_exporter/file_saver").fileSaver,
    _isFunction = require("./core/utils/type").isFunction;
exports.export = function(data, options, getData) {
    if (!data) {
        return
    }
    var exportingAction = options.exportingAction,
        exportedAction = options.exportedAction,
        fileSavingAction = options.fileSavingAction,
        eventArgs = {
            fileName: options.fileName,
            format: options.format,
            cancel: false
        };
    _isFunction(exportingAction) && exportingAction(eventArgs);
    if (!eventArgs.cancel) {
        getData(data, options, function(blob) {
            _isFunction(exportedAction) && exportedAction();
            if (_isFunction(fileSavingAction)) {
                eventArgs.data = blob;
                fileSavingAction(eventArgs)
            }
            if (!eventArgs.cancel) {
                fileSaver.saveAs(eventArgs.fileName, options.format, blob, options.proxyUrl, void 0, options.forceProxy)
            }
        })
    }
};
exports.fileSaver = fileSaver;
exports.excel = {
    creator: require("./client_exporter/excel_creator").ExcelCreator,
    getData: require("./client_exporter/excel_creator").getData,
    formatConverter: require("./client_exporter/excel_format_converter")
};
exports.image = {
    creator: require("./client_exporter/image_creator").imageCreator,
    getData: require("./client_exporter/image_creator").getData
};
exports.pdf = {
    getData: require("./client_exporter/pdf_creator").getData
};
exports.svg = {
    creator: require("./client_exporter/svg_creator").svgCreator,
    getData: require("./client_exporter/svg_creator").getData
};
