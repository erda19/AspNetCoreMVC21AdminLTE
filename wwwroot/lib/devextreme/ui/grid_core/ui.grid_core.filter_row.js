/**
 * DevExtreme (ui/grid_core/ui.grid_core.filter_row.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    isDefined = require("../../core/utils/type").isDefined,
    extend = require("../../core/utils/extend").extend,
    iteratorUtils = require("../../core/utils/iterator"),
    modules = require("./ui.grid_core.modules"),
    gridCoreUtils = require("./ui.grid_core.utils"),
    messageLocalization = require("../../localization/message"),
    Editor = require("../editor/editor"),
    Overlay = require("../overlay"),
    Menu = require("../menu");
var OPERATION_ICONS = {
    "=": "filter-operation-equals",
    "<>": "filter-operation-not-equals",
    "<": "filter-operation-less",
    "<=": "filter-operation-less-equal",
    ">": "filter-operation-greater",
    ">=": "filter-operation-greater-equal",
    "default": "filter-operation-default",
    notcontains: "filter-operation-not-contains",
    contains: "filter-operation-contains",
    startswith: "filter-operation-starts-with",
    endswith: "filter-operation-ends-with",
    between: "filter-operation-between"
};
var OPERATION_DESCRIPTORS = {
    "=": "equal",
    "<>": "notEqual",
    "<": "lessThan",
    "<=": "lessThanOrEqual",
    ">": "greaterThan",
    ">=": "greaterThanOrEqual",
    startswith: "startsWith",
    contains: "contains",
    notcontains: "notContains",
    endswith: "endsWith",
    between: "between"
};
var FILTERING_TIMEOUT = 700,
    CORRECT_FILTER_RANGE_OVERLAY_WIDTH = 1,
    FILTER_ROW_CLASS = "filter-row",
    FILTER_RANGE_OVERLAY_CLASS = "filter-range-overlay",
    FILTER_RANGE_START_CLASS = "filter-range-start",
    FILTER_RANGE_END_CLASS = "filter-range-end",
    MENU_CLASS = "dx-menu",
    EDITOR_WITH_MENU_CLASS = "dx-editor-with-menu",
    EDITOR_CONTAINER_CLASS = "dx-editor-container",
    EDITOR_CELL_CLASS = "dx-editor-cell",
    FILTER_MENU = "dx-filter-menu",
    APPLY_BUTTON_CLASS = "dx-apply-button",
    HIGHLIGHT_OUTLINE_CLASS = "dx-highlight-outline",
    FOCUSED_CLASS = "dx-focused",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    FILTER_RANGE_CONTENT_CLASS = "dx-filter-range-content",
    FILTER_MODIFIED_CLASS = "dx-filter-modified",
    EDITORS_INPUT_SELECTOR = "input:not([type='hidden'])";

function isOnClickApplyFilterMode(that) {
    return "onClick" === that.option("filterRow.applyFilter")
}
var ColumnHeadersViewFilterRowExtender = function() {
    var getEditorInstance = function($editorContainer) {
        var $editor = $editorContainer && $editorContainer.children(),
            componentNames = $editor && $editor.data("dxComponents"),
            editor = componentNames && componentNames.length && $editor.data(componentNames[0]);
        if (editor instanceof Editor) {
            return editor
        }
    };
    var getRangeTextByFilterValue = function(that, column) {
        var result = "",
            rangeEnd = "",
            filterValue = getColumnFilterValue(that, column),
            formatOptions = gridCoreUtils.getFormatOptionsByColumn(column, "filterRow");
        if (Array.isArray(filterValue)) {
            result = gridCoreUtils.formatValue(filterValue[0], formatOptions);
            rangeEnd = gridCoreUtils.formatValue(filterValue[1], formatOptions);
            if ("" !== rangeEnd) {
                result += " - " + rangeEnd
            }
        } else {
            if (isDefined(filterValue)) {
                result = gridCoreUtils.formatValue(filterValue, formatOptions)
            }
        }
        return result
    };
    var getColumnFilterValue = function(that, column) {
        if (column) {
            return isOnClickApplyFilterMode(that) && void 0 !== column.bufferedFilterValue ? column.bufferedFilterValue : column.filterValue
        }
    };
    var getColumnSelectedFilterOperation = function(that, column) {
        if (column) {
            return isOnClickApplyFilterMode(that) && void 0 !== column.bufferedSelectedFilterOperation ? column.bufferedSelectedFilterOperation : column.selectedFilterOperation
        }
    };
    var getFilterValue = function(that, columnIndex, $editorContainer) {
        var column = that._columnsController.columnOption(columnIndex),
            filterValue = getColumnFilterValue(that, column),
            isFilterRange = $editorContainer.closest("." + that.addWidgetPrefix(FILTER_RANGE_OVERLAY_CLASS)).length,
            isRangeStart = $editorContainer.hasClass(that.addWidgetPrefix(FILTER_RANGE_START_CLASS));
        if (filterValue && Array.isArray(filterValue) && "between" === getColumnSelectedFilterOperation(that, column)) {
            if (isRangeStart) {
                return filterValue[0]
            } else {
                return filterValue[1]
            }
        }
        return !isFilterRange && void 0 !== filterValue ? filterValue : null
    };
    var normalizeFilterValue = function(that, filterValue, column, $editorContainer) {
        if ("between" === getColumnSelectedFilterOperation(that, column)) {
            var columnFilterValue = getColumnFilterValue(that, column);
            if ($editorContainer.hasClass(that.addWidgetPrefix(FILTER_RANGE_START_CLASS))) {
                return [filterValue, Array.isArray(columnFilterValue) ? columnFilterValue[1] : void 0]
            } else {
                return [Array.isArray(columnFilterValue) ? columnFilterValue[0] : columnFilterValue, filterValue]
            }
        }
        return filterValue
    };
    var updateFilterValue = function(that, options) {
        var value = "" === options.value ? null : options.value,
            $editorContainer = options.container,
            column = that._columnsController.columnOption(options.column.index),
            filterValue = getFilterValue(that, column.index, $editorContainer);
        if (!isDefined(filterValue) && !isDefined(value)) {
            return
        }
        that._applyFilterViewController.setHighLight($editorContainer, filterValue !== value);
        that._columnsController.columnOption(column.index, isOnClickApplyFilterMode(that) ? "bufferedFilterValue" : "filterValue", normalizeFilterValue(that, value, column, $editorContainer), options.notFireEvent)
    };
    return {
        _updateEditorValue: function(column, $editorContainer) {
            var that = this,
                editor = getEditorInstance($editorContainer);
            editor && editor.option("value", getFilterValue(that, column.index, $editorContainer))
        },
        _columnOptionChanged: function(e) {
            var overlayInstance, visibleIndex, column, $cell, $editorContainer, $editorRangeElements, $menu, that = this,
                optionNames = e.optionNames;
            if (gridCoreUtils.checkChanges(optionNames, ["filterValue", "bufferedFilterValue", "selectedFilterOperation", "bufferedSelectedFilterOperation"]) && void 0 !== e.columnIndex) {
                visibleIndex = that._columnsController.getVisibleIndex(e.columnIndex);
                column = that._columnsController.columnOption(e.columnIndex);
                $cell = that._getCellElement(that.element().find("." + that.addWidgetPrefix(FILTER_ROW_CLASS)).index(), visibleIndex) || $();
                $editorContainer = $cell.find("." + EDITOR_CONTAINER_CLASS).first();
                if (optionNames.filterValue || optionNames.bufferedFilterValue) {
                    that._updateEditorValue(column, $editorContainer);
                    overlayInstance = $cell.find("." + that.addWidgetPrefix(FILTER_RANGE_OVERLAY_CLASS)).data("dxOverlay");
                    if (overlayInstance) {
                        $editorRangeElements = overlayInstance.$content().find("." + EDITOR_CONTAINER_CLASS);
                        that._updateEditorValue(column, $editorRangeElements.first());
                        that._updateEditorValue(column, $editorRangeElements.last())
                    }
                    if (!overlayInstance || !overlayInstance.option("visible")) {
                        that._updateFilterRangeContent($cell, getRangeTextByFilterValue(that, column))
                    }
                }
                if (optionNames.selectedFilterOperation || optionNames.bufferedSelectedFilterOperation) {
                    if (visibleIndex >= 0 && column) {
                        $menu = $cell.find("." + MENU_CLASS);
                        if ($menu.length) {
                            that._updateFilterOperationChooser($menu, column, $editorContainer);
                            if ("between" === getColumnSelectedFilterOperation(that, column)) {
                                that._renderFilterRangeContent($cell, column)
                            } else {
                                if ($editorContainer.find("." + FILTER_RANGE_CONTENT_CLASS).length) {
                                    that._renderEditor($editorContainer, that._getEditorOptions($editorContainer, column));
                                    that._hideFilterRange()
                                }
                            }
                        }
                    }
                }
                return
            }
            that.callBase(e)
        },
        _renderCore: function() {
            this._filterRangeOverlayInstance = null;
            this.callBase.apply(this, arguments)
        },
        _resizeCore: function() {
            this.callBase.apply(this, arguments);
            this._filterRangeOverlayInstance && this._filterRangeOverlayInstance.repaint()
        },
        isFilterRowVisible: function() {
            return this._isElementVisible(this.option("filterRow"))
        },
        isVisible: function() {
            return this.callBase() || this.isFilterRowVisible()
        },
        init: function() {
            this.callBase();
            this._applyFilterViewController = this.getController("applyFilter")
        },
        _initFilterRangeOverlay: function($cell, column) {
            var that = this,
                sharedData = {},
                $editorContainer = $cell.find(".dx-editor-container"),
                $overlay = $("<div>").addClass(that.addWidgetPrefix(FILTER_RANGE_OVERLAY_CLASS)).appendTo($cell);
            return that._createComponent($overlay, Overlay, {
                height: "auto",
                shading: false,
                showTitle: false,
                focusStateEnabled: false,
                closeOnTargetScroll: false,
                closeOnOutsideClick: true,
                animation: false,
                position: {
                    my: "top",
                    at: "top",
                    of: $editorContainer.length && $editorContainer || $cell,
                    offset: "0 -1"
                },
                contentTemplate: function(contentElement) {
                    var editorOptions, $editor = $("<div>").addClass(EDITOR_CONTAINER_CLASS + " " + that.addWidgetPrefix(FILTER_RANGE_START_CLASS)).appendTo(contentElement);
                    column = that._columnsController.columnOption(column.index);
                    editorOptions = that._getEditorOptions($editor, column);
                    editorOptions.sharedData = sharedData;
                    that._renderEditor($editor, editorOptions);
                    eventsEngine.on($editor.find(EDITORS_INPUT_SELECTOR), "keydown", function(e) {
                        var $prevElement = $cell.find("[tabindex]").not(e.target).first();
                        if (9 === e.which && e.shiftKey) {
                            e.preventDefault();
                            that._hideFilterRange();
                            if (!$prevElement.length) {
                                $prevElement = $cell.prev().find("[tabindex]").last()
                            }
                            eventsEngine.trigger($prevElement, "focus")
                        }
                    });
                    $editor = $("<div>").addClass(EDITOR_CONTAINER_CLASS + " " + that.addWidgetPrefix(FILTER_RANGE_END_CLASS)).appendTo(contentElement);
                    editorOptions = that._getEditorOptions($editor, column);
                    editorOptions.sharedData = sharedData;
                    that._renderEditor($editor, editorOptions);
                    eventsEngine.on($editor.find(EDITORS_INPUT_SELECTOR), "keydown", function(e) {
                        if (9 === e.which && !e.shiftKey) {
                            e.preventDefault();
                            that._hideFilterRange();
                            eventsEngine.trigger($cell.next().find("[tabindex]").first(), "focus")
                        }
                    });
                    return $(contentElement).addClass(that.getWidgetContainerClass())
                },
                onShown: function(e) {
                    var $editor = e.component.$content().find("." + EDITOR_CONTAINER_CLASS).first();
                    eventsEngine.trigger($editor.find(EDITORS_INPUT_SELECTOR), "focus")
                },
                onHidden: function() {
                    column = that._columnsController.columnOption(column.index);
                    $cell.find("." + MENU_CLASS).parent().addClass(EDITOR_WITH_MENU_CLASS);
                    if ("between" === getColumnSelectedFilterOperation(that, column)) {
                        that._updateFilterRangeContent($cell, getRangeTextByFilterValue(that, column));
                        that.component.updateDimensions()
                    }
                }
            })
        },
        _updateFilterRangeOverlay: function(options) {
            var overlayInstance = this._filterRangeOverlayInstance;
            overlayInstance && overlayInstance.option(options)
        },
        _showFilterRange: function($cell, column) {
            var that = this,
                $overlay = $cell.children("." + that.addWidgetPrefix(FILTER_RANGE_OVERLAY_CLASS)),
                overlayInstance = $overlay.length && $overlay.data("dxOverlay");
            if (!overlayInstance && column) {
                overlayInstance = that._initFilterRangeOverlay($cell, column)
            }
            if (!overlayInstance.option("visible")) {
                that._filterRangeOverlayInstance && that._filterRangeOverlayInstance.hide();
                that._filterRangeOverlayInstance = overlayInstance;
                that._updateFilterRangeOverlay({
                    width: $cell.outerWidth(true) + CORRECT_FILTER_RANGE_OVERLAY_WIDTH
                });
                that._filterRangeOverlayInstance && that._filterRangeOverlayInstance.show()
            }
        },
        _hideFilterRange: function() {
            var overlayInstance = this._filterRangeOverlayInstance;
            overlayInstance && overlayInstance.hide()
        },
        getFilterRangeOverlayInstance: function() {
            return this._filterRangeOverlayInstance
        },
        _createRow: function(row) {
            var $row = this.callBase(row);
            if ("filter" === row.rowType) {
                $row.addClass(this.addWidgetPrefix(FILTER_ROW_CLASS))
            }
            return $row
        },
        _getRows: function() {
            var result = this.callBase();
            if (this.isFilterRowVisible()) {
                result.push({
                    rowType: "filter"
                })
            }
            return result
        },
        _renderCellContent: function($cell, options) {
            var $container, $editorContainer, that = this,
                column = options.column;
            if ("filter" === options.rowType) {
                if (column.command) {
                    $cell.html("&nbsp;")
                } else {
                    if (column.allowFiltering) {
                        that.setAria("label", messageLocalization.format("dxDataGrid-ariaColumn") + " " + column.caption + ", " + messageLocalization.format("dxDataGrid-ariaFilterCell"), $cell);
                        $cell.addClass(EDITOR_CELL_CLASS);
                        $container = $("<div>").appendTo($cell);
                        $editorContainer = $("<div>").addClass(EDITOR_CONTAINER_CLASS).appendTo($container);
                        if ("between" === getColumnSelectedFilterOperation(that, column)) {
                            that._renderFilterRangeContent($cell, column)
                        } else {
                            that._renderEditor($editorContainer, that._getEditorOptions($editorContainer, column))
                        }
                        if (column.alignment) {
                            $cell.find(EDITORS_INPUT_SELECTOR).first().css("textAlign", column.alignment)
                        }
                        if (column.filterOperations && column.filterOperations.length) {
                            that._renderFilterOperationChooser($container, column, $editorContainer)
                        }
                    }
                }
            }
            that.callBase($cell, options)
        },
        _getEditorOptions: function($editorContainer, column) {
            var that = this,
                result = extend({}, column, {
                    value: getFilterValue(that, column.index, $editorContainer),
                    parentType: "filterRow",
                    showAllText: that.option("filterRow.showAllText"),
                    updateValueTimeout: "onClick" === that.option("filterRow.applyFilter") ? 0 : FILTERING_TIMEOUT,
                    width: null,
                    setValue: function(value, notFireEvent) {
                        updateFilterValue(that, {
                            column: column,
                            value: value,
                            container: $editorContainer,
                            notFireEvent: notFireEvent
                        })
                    }
                });
            if ("between" === getColumnSelectedFilterOperation(that, column)) {
                if ($editorContainer.hasClass(that.addWidgetPrefix(FILTER_RANGE_START_CLASS))) {
                    result.placeholder = that.option("filterRow.betweenStartText")
                } else {
                    result.placeholder = that.option("filterRow.betweenEndText")
                }
            }
            return result
        },
        _renderEditor: function($editorContainer, options) {
            $editorContainer.empty();
            return this.getController("editorFactory").createEditor($("<div>").appendTo($editorContainer), options)
        },
        _renderFilterRangeContent: function($cell, column) {
            var that = this,
                $editorContainer = $cell.find("." + EDITOR_CONTAINER_CLASS).first();
            $editorContainer.empty();
            var $filterRangeContent = $("<div>").addClass(FILTER_RANGE_CONTENT_CLASS).attr("tabindex", this.option("tabIndex"));
            eventsEngine.on($filterRangeContent, "focusin", function() {
                that._showFilterRange($cell, column)
            });
            $filterRangeContent.appendTo($editorContainer);
            that._updateFilterRangeContent($cell, getRangeTextByFilterValue(that, column))
        },
        _updateFilterRangeContent: function($cell, value) {
            var $filterRangeContent = $cell.find("." + FILTER_RANGE_CONTENT_CLASS);
            if ($filterRangeContent.length) {
                if ("" === value) {
                    $filterRangeContent.html("&nbsp;")
                } else {
                    $filterRangeContent.text(value)
                }
            }
        },
        _updateFilterOperationChooser: function($menu, column, $editorContainer) {
            var isCellWasFocused, that = this;
            that._createComponent($menu, Menu, {
                integrationOptions: {},
                activeStateEnabled: false,
                selectionMode: "single",
                cssClass: that.getWidgetContainerClass() + " " + CELL_FOCUS_DISABLED_CLASS + " " + FILTER_MENU,
                showFirstSubmenuMode: "onHover",
                hideSubmenuOnMouseLeave: true,
                items: [{
                    disabled: column.filterOperations && column.filterOperations.length ? false : true,
                    icon: OPERATION_ICONS[getColumnSelectedFilterOperation(that, column) || "default"],
                    selectable: false,
                    items: that._getFilterOperationMenuItems(column)
                }],
                onItemClick: function(properties) {
                    var selectedFilterOperation = properties.itemData.name,
                        columnSelectedFilterOperation = getColumnSelectedFilterOperation(that, column),
                        notFocusEditor = false,
                        isOnClickMode = isOnClickApplyFilterMode(that),
                        options = {};
                    if (properties.itemData.items || selectedFilterOperation && selectedFilterOperation === columnSelectedFilterOperation) {
                        return
                    }
                    if (selectedFilterOperation) {
                        options[isOnClickMode ? "bufferedSelectedFilterOperation" : "selectedFilterOperation"] = selectedFilterOperation;
                        if ("between" === selectedFilterOperation || "between" === columnSelectedFilterOperation) {
                            notFocusEditor = "between" === selectedFilterOperation;
                            options[isOnClickMode ? "bufferedFilterValue" : "filterValue"] = null
                        }
                    } else {
                        options[isOnClickMode ? "bufferedFilterValue" : "filterValue"] = null;
                        options[isOnClickMode ? "bufferedSelectedFilterOperation" : "selectedFilterOperation"] = column.defaultSelectedFilterOperation || null
                    }
                    that._columnsController.columnOption(column.index, options);
                    that._applyFilterViewController.setHighLight($editorContainer, true);
                    if (!selectedFilterOperation) {
                        var editor = getEditorInstance($editorContainer);
                        if (editor && "dxDateBox" === editor.NAME && !editor.option("isValid")) {
                            editor.reset();
                            editor.option("isValid", true)
                        }
                    }
                    if (!notFocusEditor) {
                        that._focusEditor($editorContainer)
                    } else {
                        that._showFilterRange($editorContainer.closest("." + EDITOR_CELL_CLASS), column)
                    }
                },
                onSubmenuShown: function() {
                    isCellWasFocused = that._isEditorFocused($editorContainer);
                    that.getController("editorFactory").loseFocus()
                },
                onSubmenuHiding: function() {
                    var menu = Menu.getInstance($menu);
                    eventsEngine.trigger($menu, "blur");
                    menu && menu.option("focusedElement", null);
                    isCellWasFocused && that._focusEditor($editorContainer)
                },
                rtlEnabled: that.option("rtlEnabled")
            })
        },
        _isEditorFocused: function($container) {
            return $container.hasClass(FOCUSED_CLASS) || $container.parents("." + FOCUSED_CLASS).length
        },
        _focusEditor: function($container) {
            this.getController("editorFactory").focus($container);
            eventsEngine.trigger($container.find(EDITORS_INPUT_SELECTOR), "focus")
        },
        _renderFilterOperationChooser: function($container, column, $editorContainer) {
            var $menu, that = this;
            if (that.option("filterRow.showOperationChooser")) {
                $container.addClass(EDITOR_WITH_MENU_CLASS);
                $menu = $("<div>").prependTo($container);
                that._updateFilterOperationChooser($menu, column, $editorContainer)
            }
        },
        _getFilterOperationMenuItems: function(column) {
            var that = this,
                result = [{}],
                filterRowOptions = that.option("filterRow"),
                operationDescriptions = filterRowOptions && filterRowOptions.operationDescriptions || {};
            if (column.filterOperations && column.filterOperations.length) {
                var availableFilterOperations = column.filterOperations.filter(function(value) {
                    return isDefined(OPERATION_DESCRIPTORS[value])
                });
                result = iteratorUtils.map(availableFilterOperations, function(value) {
                    var descriptionName = OPERATION_DESCRIPTORS[value];
                    return {
                        name: value,
                        selected: (getColumnSelectedFilterOperation(that, column) || column.defaultFilterOperation) === value,
                        text: operationDescriptions[descriptionName],
                        icon: OPERATION_ICONS[value]
                    }
                });
                result.push({
                    name: null,
                    text: filterRowOptions && filterRowOptions.resetOperationText,
                    icon: OPERATION_ICONS.default
                })
            }
            return result
        },
        optionChanged: function(args) {
            var that = this;
            switch (args.name) {
                case "filterRow":
                case "showColumnLines":
                    this._invalidate(true, true);
                    args.handled = true;
                    break;
                default:
                    that.callBase(args)
            }
        }
    }
}();
var DataControllerFilterRowExtender = {
    skipCalculateColumnFilters: function() {
        return false
    },
    _calculateAdditionalFilter: function() {
        if (this.skipCalculateColumnFilters()) {
            return this.callBase()
        }
        var filters = [this.callBase()],
            columns = this._columnsController.getVisibleColumns();
        iteratorUtils.each(columns, function() {
            var filter;
            if (this.allowFiltering && this.calculateFilterExpression && isDefined(this.filterValue)) {
                filter = this.createFilterExpression(this.filterValue, this.selectedFilterOperation || this.defaultFilterOperation, "filterRow");
                filters.push(filter)
            }
        });
        return gridCoreUtils.combineFilters(filters)
    }
};
exports.ApplyFilterViewController = modules.ViewController.inherit({
    _getHeaderPanel: function() {
        if (!this._headerPanel) {
            this._headerPanel = this.getView("headerPanel")
        }
        return this._headerPanel
    },
    setHighLight: function($element, value) {
        if (isOnClickApplyFilterMode(this)) {
            $element && $element.toggleClass(HIGHLIGHT_OUTLINE_CLASS, value) && $element.closest("." + EDITOR_CELL_CLASS).toggleClass(FILTER_MODIFIED_CLASS, value);
            this._getHeaderPanel().enableApplyButton(value)
        }
    },
    applyFilter: function() {
        var columnsController = this.getController("columns"),
            columns = columnsController.getColumns();
        columnsController.beginUpdate();
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (void 0 !== column.bufferedFilterValue) {
                columnsController.columnOption(i, "filterValue", column.bufferedFilterValue);
                column.bufferedFilterValue = void 0
            }
            if (void 0 !== column.bufferedSelectedFilterOperation) {
                columnsController.columnOption(i, "selectedFilterOperation", column.bufferedSelectedFilterOperation);
                column.bufferedSelectedFilterOperation = void 0
            }
        }
        columnsController.endUpdate();
        this.removeHighLights()
    },
    removeHighLights: function() {
        if (isOnClickApplyFilterMode(this)) {
            var columnHeadersViewElement = this.getView("columnHeadersView").element();
            columnHeadersViewElement.find("." + this.addWidgetPrefix(FILTER_ROW_CLASS) + " ." + HIGHLIGHT_OUTLINE_CLASS).removeClass(HIGHLIGHT_OUTLINE_CLASS);
            columnHeadersViewElement.find("." + this.addWidgetPrefix(FILTER_ROW_CLASS) + " ." + FILTER_MODIFIED_CLASS).removeClass(FILTER_MODIFIED_CLASS);
            this._getHeaderPanel().enableApplyButton(false)
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            filterRow: {
                visible: false,
                showOperationChooser: true,
                showAllText: messageLocalization.format("dxDataGrid-filterRowShowAllText"),
                resetOperationText: messageLocalization.format("dxDataGrid-filterRowResetOperationText"),
                applyFilter: "auto",
                applyFilterText: messageLocalization.format("dxDataGrid-applyFilterText"),
                operationDescriptions: {
                    equal: messageLocalization.format("dxDataGrid-filterRowOperationEquals"),
                    notEqual: messageLocalization.format("dxDataGrid-filterRowOperationNotEquals"),
                    lessThan: messageLocalization.format("dxDataGrid-filterRowOperationLess"),
                    lessThanOrEqual: messageLocalization.format("dxDataGrid-filterRowOperationLessOrEquals"),
                    greaterThan: messageLocalization.format("dxDataGrid-filterRowOperationGreater"),
                    greaterThanOrEqual: messageLocalization.format("dxDataGrid-filterRowOperationGreaterOrEquals"),
                    startsWith: messageLocalization.format("dxDataGrid-filterRowOperationStartsWith"),
                    contains: messageLocalization.format("dxDataGrid-filterRowOperationContains"),
                    notContains: messageLocalization.format("dxDataGrid-filterRowOperationNotContains"),
                    endsWith: messageLocalization.format("dxDataGrid-filterRowOperationEndsWith"),
                    between: messageLocalization.format("dxDataGrid-filterRowOperationBetween"),
                    isBlank: messageLocalization.format("dxFilterBuilder-filterOperationIsBlank"),
                    isNotBlank: messageLocalization.format("dxFilterBuilder-filterOperationIsNotBlank")
                },
                betweenStartText: messageLocalization.format("dxDataGrid-filterRowOperationBetweenStartText"),
                betweenEndText: messageLocalization.format("dxDataGrid-filterRowOperationBetweenEndText")
            }
        }
    },
    controllers: {
        applyFilter: exports.ApplyFilterViewController
    },
    extenders: {
        controllers: {
            data: DataControllerFilterRowExtender,
            columnsResizer: {
                _startResizing: function() {
                    var cellIndex, overlayInstance, that = this;
                    that.callBase.apply(that, arguments);
                    if (that.isResizing()) {
                        overlayInstance = that._columnHeadersView.getFilterRangeOverlayInstance();
                        if (overlayInstance) {
                            cellIndex = overlayInstance.$element().closest("td").index();
                            if (cellIndex === that._targetPoint.columnIndex || cellIndex === that._targetPoint.columnIndex + 1) {
                                overlayInstance.$content().hide()
                            }
                        }
                    }
                },
                _endResizing: function() {
                    var $cell, overlayInstance, that = this;
                    if (that.isResizing()) {
                        overlayInstance = that._columnHeadersView.getFilterRangeOverlayInstance();
                        if (overlayInstance) {
                            $cell = overlayInstance.$element().closest("td");
                            that._columnHeadersView._updateFilterRangeOverlay({
                                width: $cell.outerWidth(true) + CORRECT_FILTER_RANGE_OVERLAY_WIDTH
                            });
                            overlayInstance.$content().show()
                        }
                    }
                    that.callBase.apply(that, arguments)
                }
            }
        },
        views: {
            columnHeadersView: ColumnHeadersViewFilterRowExtender,
            headerPanel: {
                _getToolbarItems: function() {
                    var items = this.callBase(),
                        filterItem = this._prepareFilterItem(items);
                    return filterItem.concat(items)
                },
                _prepareFilterItem: function() {
                    var that = this,
                        filterItem = [];
                    if (that._isShowApplyFilterButton()) {
                        var hintText = that.option("filterRow.applyFilterText"),
                            columns = that._columnsController.getColumns(),
                            disabled = !columns.filter(function(column) {
                                return void 0 !== column.bufferedFilterValue
                            }).length,
                            onInitialized = function(e) {
                                $(e.element).addClass(that._getToolbarButtonClass(APPLY_BUTTON_CLASS))
                            },
                            onClickHandler = function() {
                                that._applyFilterViewController.applyFilter()
                            },
                            toolbarItem = {
                                widget: "dxButton",
                                options: {
                                    icon: "apply-filter",
                                    disabled: disabled,
                                    onClick: onClickHandler,
                                    hint: hintText,
                                    text: hintText,
                                    onInitialized: onInitialized
                                },
                                showText: "inMenu",
                                name: "applyFilterButton",
                                location: "after",
                                locateInMenu: "auto",
                                sortIndex: 10
                            };
                        filterItem.push(toolbarItem)
                    }
                    return filterItem
                },
                _isShowApplyFilterButton: function() {
                    var filterRowOptions = this.option("filterRow");
                    return filterRowOptions && filterRowOptions.visible && "onClick" === filterRowOptions.applyFilter
                },
                init: function() {
                    this.callBase();
                    this._dataController = this.getController("data");
                    this._applyFilterViewController = this.getController("applyFilter")
                },
                enableApplyButton: function(value) {
                    this.setToolbarItemDisabled("applyFilterButton", !value)
                },
                isVisible: function() {
                    return this.callBase() || this._isShowApplyFilterButton()
                },
                optionChanged: function(args) {
                    if ("filterRow" === args.name) {
                        this._invalidate();
                        args.handled = true
                    } else {
                        this.callBase(args)
                    }
                }
            }
        }
    }
};