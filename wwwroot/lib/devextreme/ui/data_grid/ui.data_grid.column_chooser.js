/**
 * DevExtreme (ui/data_grid/ui.data_grid.column_chooser.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var gridCore = require("./ui.data_grid.core"),
    columnChooserModule = require("../grid_core/ui.grid_core.column_chooser");
exports.ColumnChooserController = columnChooserModule.controllers.columnChooser;
exports.ColumnChooserView = columnChooserModule.views.columnChooserView;
gridCore.registerModule("columnChooser", columnChooserModule);
