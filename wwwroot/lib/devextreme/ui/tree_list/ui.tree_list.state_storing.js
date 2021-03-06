/**
 * DevExtreme (ui/tree_list/ui.tree_list.state_storing.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var treeListCore = require("./ui.tree_list.core"),
    extend = require("../../core/utils/extend").extend,
    stateStoringModule = require("../grid_core/ui.grid_core.state_storing"),
    origApplyState = stateStoringModule.extenders.controllers.stateStoring.applyState;
treeListCore.registerModule("stateStoring", extend(true, {}, stateStoringModule, {
    extenders: {
        controllers: {
            stateStoring: {
                applyState: function(state) {
                    origApplyState.apply(this, arguments);
                    if (state.hasOwnProperty("expandedRowKeys")) {
                        this.option("expandedRowKeys", state.expandedRowKeys)
                    }
                }
            },
            data: {
                getUserState: function() {
                    var state = this.callBase.apply(this, arguments);
                    if (!this.option("autoExpandAll")) {
                        state.expandedRowKeys = this.option("expandedRowKeys")
                    }
                    return state
                }
            }
        }
    }
}));
