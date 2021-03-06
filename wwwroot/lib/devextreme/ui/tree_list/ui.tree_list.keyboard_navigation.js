/**
 * DevExtreme (ui/tree_list/ui.tree_list.keyboard_navigation.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var core = require("./ui.tree_list.core"),
    keyboardNavigationModule = require("../grid_core/ui.grid_core.keyboard_navigation"),
    extend = require("../../core/utils/extend").extend;
core.registerModule("keyboardNavigation", extend(true, {}, keyboardNavigationModule, {
    extenders: {
        controllers: {
            keyboardNavigation: {
                _leftRightKeysHandler: function(eventArgs, isEditing) {
                    var key, directionCode, rowIndex = this._getFocusedRowIndex(),
                        dataController = this._dataController;
                    if (eventArgs.ctrl) {
                        directionCode = this._getDirectionCodeByKey(eventArgs.key);
                        key = dataController.getKeyByRowIndex(rowIndex);
                        if ("nextInRow" === directionCode) {
                            dataController.expandRow(key)
                        } else {
                            dataController.collapseRow(key)
                        }
                    } else {
                        return this.callBase.apply(this, arguments)
                    }
                }
            }
        }
    }
}));
