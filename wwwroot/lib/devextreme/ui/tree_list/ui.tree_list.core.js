/**
 * DevExtreme (ui/tree_list/ui.tree_list.core.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var extend = require("../../core/utils/extend").extend,
    modules = require("../grid_core/ui.grid_core.modules");
extend(exports, modules, {
    modules: [],
    foreachNodes: function(nodes, callBack) {
        for (var i = 0; i < nodes.length; i++) {
            if (false !== callBack(nodes[i]) && nodes[i].hasChildren && nodes[i].children.length) {
                this.foreachNodes(nodes[i].children, callBack)
            }
        }
    }
});
