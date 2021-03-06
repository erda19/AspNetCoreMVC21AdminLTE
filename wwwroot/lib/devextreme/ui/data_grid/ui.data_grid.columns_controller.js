/**
 * DevExtreme (ui/data_grid/ui.data_grid.columns_controller.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var gridCore = require("./ui.data_grid.core"),
    columnsControllerModule = require("../grid_core/ui.grid_core.columns_controller"),
    extend = require("../../core/utils/extend").extend;
gridCore.registerModule("columns", {
    defaultOptions: function() {
        return extend(true, {}, columnsControllerModule.defaultOptions(), {
            commonColumnSettings: {
                allowExporting: true
            }
        })
    },
    controllers: columnsControllerModule.controllers
});
