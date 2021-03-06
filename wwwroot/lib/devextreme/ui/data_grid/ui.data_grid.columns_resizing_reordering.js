/**
 * DevExtreme (ui/data_grid/ui.data_grid.columns_resizing_reordering.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var gridCore = require("./ui.data_grid.core"),
    columnsResizingReorderingModule = require("../grid_core/ui.grid_core.columns_resizing_reordering");
exports.DraggingHeaderView = columnsResizingReorderingModule.views.draggingHeaderView;
exports.DraggingHeaderViewController = columnsResizingReorderingModule.controllers.draggingHeader;
exports.ColumnsSeparatorView = columnsResizingReorderingModule.views.columnsSeparatorView;
exports.TablePositionViewController = columnsResizingReorderingModule.controllers.tablePosition;
exports.ColumnsResizerViewController = columnsResizingReorderingModule.controllers.columnsResizer;
exports.TrackerView = columnsResizingReorderingModule.views.trackerView;
gridCore.registerModule("columnsResizingReordering", columnsResizingReorderingModule);
