/**
 * DevExtreme (ui/list/ui.list.edit.decorator_menu_helper.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var EditDecoratorMenuHelperMixin = {
    _menuEnabled: function() {
        return !!this._menuItems().length
    },
    _menuItems: function() {
        return this._list.option("menuItems")
    },
    _deleteEnabled: function() {
        return this._list.option("allowItemDeleting")
    },
    _fireMenuAction: function($itemElement, action) {
        this._list._itemEventHandlerByHandler($itemElement, action, {}, {
            excludeValidators: ["disabled", "readOnly"]
        })
    }
};
module.exports = EditDecoratorMenuHelperMixin;
