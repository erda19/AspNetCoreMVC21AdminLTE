/**
 * DevExtreme (ui/tree_list/ui.tree_list.master_detail.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var treeListCore = require("./ui.tree_list.core"),
    masterDetailModule = require("../grid_core/ui.grid_core.master_detail"),
    extend = require("../../core/utils/extend").extend;
treeListCore.registerModule("masterDetail", extend(true, {}, masterDetailModule, {
    extenders: {
        controllers: {
            data: {
                isRowExpanded: function() {
                    return this.callBase.apply(this, arguments)
                },
                _processItems: function() {
                    return this.callBase.apply(this, arguments)
                },
                _processDataItem: function() {
                    return this.callBase.apply(this, arguments)
                }
            }
        }
    }
}));
