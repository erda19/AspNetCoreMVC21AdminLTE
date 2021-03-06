/**
 * DevExtreme (ui/grid_core/ui.grid_core.rows.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    windowUtils = require("../../core/utils/window"),
    window = windowUtils.getWindow(),
    eventsEngine = require("../../events/core/events_engine"),
    commonUtils = require("../../core/utils/common"),
    styleUtils = require("../../core/utils/style"),
    typeUtils = require("../../core/utils/type"),
    each = require("../../core/utils/iterator").each,
    extend = require("../../core/utils/extend").extend,
    stringUtils = require("../../core/utils/string"),
    getDefaultAlignment = require("../../core/utils/position").getDefaultAlignment,
    compileGetter = require("../../core/utils/data").compileGetter,
    errors = require("../widget/ui.errors"),
    gridCoreUtils = require("./ui.grid_core.utils"),
    columnsView = require("./ui.grid_core.columns_view"),
    Scrollable = require("../scroll_view/ui.scrollable"),
    removeEvent = require("../../core/remove_event"),
    messageLocalization = require("../../localization/message"),
    browser = require("../../core/utils/browser"),
    isDefined = typeUtils.isDefined;
var ROWS_VIEW_CLASS = "rowsview",
    CONTENT_CLASS = "content",
    NOWRAP_CLASS = "nowrap",
    GROUP_ROW_CLASS = "dx-group-row",
    GROUP_CELL_CLASS = "dx-group-cell",
    DATA_ROW_CLASS = "dx-data-row",
    FREE_SPACE_CLASS = "dx-freespace-row",
    ROW_LINES_CLASS = "dx-row-lines",
    COLUMN_LINES_CLASS = "dx-column-lines",
    ROW_ALTERNATION_CLASS = "dx-row-alt",
    LAST_ROW_BORDER = "dx-last-row-border",
    EMPTY_CLASS = "dx-empty",
    LOADPANEL_HIDE_TIMEOUT = 200;
module.exports = {
    defaultOptions: function() {
        return {
            hoverStateEnabled: false,
            scrolling: {
                useNative: "auto"
            },
            loadPanel: {
                enabled: "auto",
                text: messageLocalization.format("Loading"),
                width: 200,
                height: 90,
                showIndicator: true,
                indicatorSrc: "",
                showPane: true
            },
            rowTemplate: null,
            columnAutoWidth: false,
            noDataText: messageLocalization.format("dxDataGrid-noDataText"),
            wordWrapEnabled: false,
            showColumnLines: true,
            showRowLines: false,
            rowAlternationEnabled: false,
            activeStateEnabled: false,
            twoWayBindingEnabled: true
        }
    },
    views: {
        rowsView: columnsView.ColumnsView.inherit(function() {
            var appendFreeSpaceRowTemplate = {
                render: function(options) {
                    var $tbody = options.container.find("tbody");
                    if ($tbody.length) {
                        $tbody.last().append(options.content)
                    } else {
                        options.container.append(options.content)
                    }
                }
            };
            return {
                _getDefaultTemplate: function(column) {
                    switch (column.command) {
                        case "empty":
                            return function(container) {
                                container.html("&nbsp;")
                            };
                        default:
                            return function($container, options) {
                                var isDataTextEmpty = stringUtils.isEmpty(options.text) && "data" === options.rowType,
                                    text = isDataTextEmpty ? "&nbsp;" : options.text,
                                    container = $container.get(0);
                                if (column.encodeHtml && !isDataTextEmpty) {
                                    container.textContent = text
                                } else {
                                    container.innerHTML = text
                                }
                            }
                    }
                },
                _getDefaultGroupTemplate: function(column) {
                    var that = this,
                        summaryTexts = that.option("summary.texts");
                    return function($container, options) {
                        var data = options.data,
                            text = options.column.caption + ": " + options.text,
                            container = $container.get(0);
                        if (options.summaryItems && options.summaryItems.length) {
                            text += " " + gridCoreUtils.getGroupRowSummaryText(options.summaryItems, summaryTexts)
                        }
                        if (data) {
                            if (options.groupContinuedMessage && options.groupContinuesMessage) {
                                text += " (" + options.groupContinuedMessage + ". " + options.groupContinuesMessage + ")"
                            } else {
                                if (options.groupContinuesMessage) {
                                    text += " (" + options.groupContinuesMessage + ")"
                                } else {
                                    if (options.groupContinuedMessage) {
                                        text += " (" + options.groupContinuedMessage + ")"
                                    }
                                }
                            }
                        }
                        $container.addClass(GROUP_CELL_CLASS);
                        if (column.encodeHtml) {
                            container.textContent = text
                        } else {
                            container.innerHTML = text
                        }
                    }
                },
                _update: function() {},
                _getCellTemplate: function(options) {
                    var template, that = this,
                        column = options.column;
                    if ("group" === options.rowType && isDefined(column.groupIndex) && !column.showWhenGrouped && !column.command) {
                        template = column.groupCellTemplate || {
                            allowRenderToDetachedContainer: true,
                            render: that._getDefaultGroupTemplate(column)
                        }
                    } else {
                        template = column.cellTemplate || {
                            allowRenderToDetachedContainer: true,
                            render: that._getDefaultTemplate(column)
                        }
                    }
                    return template
                },
                _createRow: function(row) {
                    var isGroup, isDataRow, isRowExpanded, $row = this.callBase(row);
                    if (row) {
                        isGroup = "group" === row.rowType;
                        isDataRow = "data" === row.rowType;
                        isDataRow && $row.addClass(DATA_ROW_CLASS);
                        isDataRow && row.dataIndex % 2 === 1 && this.option("rowAlternationEnabled") && $row.addClass(ROW_ALTERNATION_CLASS);
                        isDataRow && this.option("showRowLines") && $row.addClass(ROW_LINES_CLASS);
                        this.option("showColumnLines") && $row.addClass(COLUMN_LINES_CLASS);
                        if (false === row.visible) {
                            $row.hide()
                        }
                        if (isGroup) {
                            $row.addClass(GROUP_ROW_CLASS);
                            isRowExpanded = row.isExpanded;
                            this.setAria("role", "row", $row);
                            this.setAria("expanded", isDefined(isRowExpanded) && isRowExpanded.toString(), $row)
                        }
                        this._setAriaRowIndex(row, $row)
                    }
                    return $row
                },
                _setAriaRowIndex: function(row, $row) {
                    var component = this.component,
                        isPagerMode = "standard" === component.option("scrolling.mode") && "virtual" !== component.option("scrolling.rowRenderingMode"),
                        rowIndex = row.rowIndex + 1;
                    if (isPagerMode) {
                        rowIndex = component.pageIndex() * component.pageSize() + rowIndex
                    } else {
                        rowIndex += this._dataController.getRowIndexOffset()
                    }
                    this.setAria("rowindex", rowIndex, $row)
                },
                _afterRowPrepared: function(e) {
                    var arg = e.args[0],
                        dataController = this._dataController,
                        watch = this.option("integrationOptions.watchMethod");
                    if (!arg.data || "data" !== arg.rowType || arg.inserted || !this.option("twoWayBindingEnabled") || !watch) {
                        return
                    }
                    var dispose = watch(function() {
                        return dataController.generateDataValues(arg.data, arg.columns)
                    }, function() {
                        dataController.repaintRows([arg.rowIndex])
                    }, {
                        deep: true,
                        skipImmediate: true
                    });
                    eventsEngine.on(arg.rowElement, removeEvent, dispose)
                },
                _renderScrollable: function(force) {
                    var that = this,
                        $element = that.element();
                    if (!$element.children().length) {
                        $element.append("<div>")
                    }
                    if (force || !that._loadPanel) {
                        that._renderLoadPanel($element, $element.parent(), that._dataController.isLocalStore())
                    }
                    if ((force || !that.getScrollable()) && that._dataController.isLoaded()) {
                        var columns = that.getColumns(),
                            allColumnsHasWidth = true;
                        for (var i = 0; i < columns.length; i++) {
                            if (!columns[i].width && !columns[i].minWidth) {
                                allColumnsHasWidth = false;
                                break
                            }
                        }
                        if (that.option("columnAutoWidth") || that._hasHeight || allColumnsHasWidth || that._columnsController._isColumnFixing()) {
                            that._renderScrollableCore($element)
                        }
                    }
                },
                _handleScroll: function(e) {
                    var that = this;
                    that._isScrollByEvent = !!e.event;
                    that._scrollTop = e.scrollOffset.top;
                    that._scrollLeft = e.scrollOffset.left;
                    that.scrollChanged.fire(e.scrollOffset, that.name)
                },
                _renderScrollableCore: function($element) {
                    var that = this,
                        dxScrollableOptions = that._createScrollableOptions(),
                        scrollHandler = that._handleScroll.bind(that);
                    dxScrollableOptions.onScroll = scrollHandler;
                    dxScrollableOptions.onStop = scrollHandler;
                    that._scrollable = that._createComponent($element, Scrollable, dxScrollableOptions);
                    that._scrollableContainer = that._scrollable && that._scrollable._$container
                },
                _renderLoadPanel: gridCoreUtils.renderLoadPanel,
                _renderContent: function(contentElement, tableElement) {
                    contentElement.replaceWith($("<div>").addClass(this.addWidgetPrefix(CONTENT_CLASS)).append(tableElement));
                    this.setAria("role", "presentation", contentElement);
                    return this._findContentElement()
                },
                _updateContent: function(newTableElement, change) {
                    var that = this,
                        tableElement = that._getTableElement(),
                        contentElement = that._findContentElement(),
                        changeType = change && change.changeType,
                        executors = [];
                    switch (changeType) {
                        case "update":
                            each(change.rowIndices, function(index, rowIndex) {
                                var $newRowElement = that._getRowElements(newTableElement).eq(index),
                                    changeType = change.changeTypes && change.changeTypes[index],
                                    item = change.items && change.items[index];
                                executors.push(function() {
                                    var $rowsElement = that._getRowElements(),
                                        $rowElement = $rowsElement.eq(rowIndex);
                                    switch (changeType) {
                                        case "update":
                                            if (item) {
                                                if (isDefined(item.visible) && item.visible !== $rowElement.is(":visible")) {
                                                    $rowElement.toggle(item.visible)
                                                } else {
                                                    $rowElement.replaceWith($newRowElement)
                                                }
                                            }
                                            break;
                                        case "insert":
                                            if (!$rowsElement.length) {
                                                $newRowElement.prependTo(tableElement.children("tbody"))
                                            } else {
                                                if ($rowElement.length) {
                                                    $newRowElement.insertBefore($rowElement)
                                                } else {
                                                    $newRowElement.insertAfter($rowsElement.last())
                                                }
                                            }
                                            break;
                                        case "remove":
                                            $rowElement.remove()
                                    }
                                })
                            });
                            each(executors, function() {
                                this()
                            });
                            newTableElement.remove();
                            break;
                        default:
                            that._setTableElement(newTableElement);
                            contentElement.addClass(that.addWidgetPrefix(CONTENT_CLASS));
                            that._renderContent(contentElement, newTableElement)
                    }
                },
                _createEmptyRow: function() {
                    var i, that = this,
                        $row = that._createRow(),
                        columns = this.getColumns();
                    $row.toggleClass(COLUMN_LINES_CLASS, that.option("showColumnLines"));
                    for (i = 0; i < columns.length; i++) {
                        $row.append(that._createCell({
                            column: columns[i],
                            rowType: "freeSpace",
                            columnIndex: i,
                            columns: columns
                        }))
                    }
                    return $row
                },
                _renderFreeSpaceRow: function(tableElement, options) {
                    var freeSpaceRowElement = this._createEmptyRow().addClass(FREE_SPACE_CLASS);
                    this._appendRow(tableElement, freeSpaceRowElement, appendFreeSpaceRowTemplate)
                },
                _checkRowKeys: function(options) {
                    var that = this,
                        rows = that._getRows(options),
                        keyExpr = that._dataController.store() && that._dataController.store().key();
                    keyExpr && rows.some(function(row) {
                        if ("data" === row.rowType && void 0 === row.key) {
                            that._dataController.dataErrorOccurred.fire(errors.Error("E1046", keyExpr));
                            return true
                        }
                    })
                },
                _needUpdateRowHeight: function(itemsCount) {
                    return itemsCount > 0 && !this._rowHeight
                },
                _getRowsHeight: function($tableElement) {
                    var $rowElements = $tableElement.children("tbody").children().not(".dx-virtual-row").not("." + FREE_SPACE_CLASS);
                    return $rowElements.toArray().reduce(function(sum, row) {
                        return sum + row.getBoundingClientRect().height
                    }, 0)
                },
                _updateRowHeight: function() {
                    var rowsHeight, that = this,
                        $tableElement = that._getTableElement(),
                        itemsCount = that._dataController.items().length;
                    if ($tableElement && that._needUpdateRowHeight(itemsCount)) {
                        rowsHeight = that._getRowsHeight($tableElement);
                        that._rowHeight = rowsHeight / itemsCount
                    }
                },
                _findContentElement: function() {
                    var $content = this.element(),
                        scrollable = this.getScrollable();
                    if ($content) {
                        if (scrollable) {
                            $content = scrollable.$content()
                        }
                        return $content.children().first()
                    }
                },
                _getRowElements: function(tableElement) {
                    var $rows = this.callBase(tableElement);
                    return $rows && $rows.not("." + FREE_SPACE_CLASS)
                },
                _getFreeSpaceRowElements: function($table) {
                    var tableElements = $table || this.getTableElements();
                    return tableElements && tableElements.children("tbody").children("." + FREE_SPACE_CLASS)
                },
                _getNoDataText: function() {
                    return this.option("noDataText")
                },
                _rowClick: function(e) {
                    var item = this._dataController.items()[e.rowIndex] || {};
                    this.executeAction("onRowClick", extend({
                        evaluate: function(expr) {
                            var getter = compileGetter(expr);
                            return getter(item.data)
                        }
                    }, e, item))
                },
                _getGroupCellOptions: function(options) {
                    var columnIndex = (options.row.groupIndex || 0) + options.columnsCountBeforeGroups;
                    return {
                        columnIndex: columnIndex,
                        colspan: options.columns.length - columnIndex - 1
                    }
                },
                _renderCells: function($row, options) {
                    if ("group" === options.row.rowType) {
                        this._renderGroupedCells($row, options)
                    } else {
                        if (options.row.values) {
                            this.callBase($row, options)
                        }
                    }
                },
                _renderGroupedCells: function($row, options) {
                    var i, expandColumn, isExpanded, groupColumn, groupColumnAlignment, row = options.row,
                        columns = options.columns,
                        rowIndex = row.rowIndex,
                        groupCellOptions = this._getGroupCellOptions(options);
                    for (i = 0; i <= groupCellOptions.columnIndex; i++) {
                        if (i === groupCellOptions.columnIndex && columns[i].allowCollapsing && "infinite" !== options.scrollingMode) {
                            isExpanded = !!row.isExpanded;
                            expandColumn = columns[i]
                        } else {
                            isExpanded = null;
                            expandColumn = {
                                command: "expand",
                                cssClass: columns[i].cssClass
                            }
                        }
                        this._renderCell($row, {
                            value: isExpanded,
                            row: row,
                            rowIndex: rowIndex,
                            column: expandColumn,
                            columnIndex: i
                        })
                    }
                    groupColumnAlignment = getDefaultAlignment(this.option("rtlEnabled"));
                    groupColumn = extend({}, columns[groupCellOptions.columnIndex], {
                        command: null,
                        cssClass: null,
                        showWhenGrouped: false,
                        alignment: groupColumnAlignment
                    });
                    if (groupCellOptions.colspan > 1) {
                        groupColumn.colspan = groupCellOptions.colspan
                    }
                    this._renderCell($row, {
                        value: row.values[row.groupIndex],
                        row: row,
                        rowIndex: rowIndex,
                        column: groupColumn,
                        columnIndex: groupCellOptions.columnIndex
                    })
                },
                _renderRows: function($table, options) {
                    var i, that = this,
                        columns = options.columns,
                        columnsCountBeforeGroups = 0,
                        scrollingMode = that.option("scrolling.mode");
                    for (i = 0; i < columns.length; i++) {
                        if ("expand" === columns[i].command) {
                            columnsCountBeforeGroups = i;
                            break
                        }
                    }
                    that.callBase($table, extend({
                        scrollingMode: scrollingMode,
                        columnsCountBeforeGroups: columnsCountBeforeGroups
                    }, options));
                    that._checkRowKeys(options.change);
                    that._renderFreeSpaceRow($table);
                    if (!that._hasHeight) {
                        that.updateFreeSpaceRowHeight($table)
                    }
                },
                _renderRow: function($table, options) {
                    var that = this,
                        row = options.row,
                        rowTemplate = that.option("rowTemplate");
                    if (("data" === row.rowType || "group" === row.rowType) && !isDefined(row.groupIndex) && rowTemplate) {
                        that.renderTemplate($table, rowTemplate, extend({
                            columns: options.columns
                        }, row), true)
                    } else {
                        that.callBase($table, options)
                    }
                },
                _renderTable: function(options) {
                    var that = this,
                        $table = that.callBase(options),
                        resizeCompletedHandler = function resizeCompletedHandler() {
                            var scrollableInstance = that.getScrollable();
                            if (scrollableInstance && that.element().closest(window.document).length) {
                                that.resizeCompleted.remove(resizeCompletedHandler);
                                scrollableInstance._visibilityChanged(true)
                            }
                        };
                    if (!isDefined(that._getTableElement())) {
                        that._setTableElement($table);
                        that._renderScrollable(true);
                        that.resizeCompleted.add(resizeCompletedHandler)
                    } else {
                        that._renderScrollable()
                    }
                    return $table
                },
                _createTable: function() {
                    var $table = this.callBase.apply(this, arguments);
                    if (this.option("rowTemplate")) {
                        $table.appendTo(this.component.$element())
                    }
                    return $table
                },
                _renderCore: function(change) {
                    var $table, that = this,
                        $element = that.element();
                    $element.addClass(that.addWidgetPrefix(ROWS_VIEW_CLASS)).toggleClass(that.addWidgetPrefix(NOWRAP_CLASS), !that.option("wordWrapEnabled"));
                    $element.toggleClass(EMPTY_CLASS, 0 === that._dataController.items().length);
                    that.setAria("role", "presentation", $element);
                    $table = that._renderTable({
                        change: change
                    });
                    that._updateContent($table, change);
                    that.callBase(change);
                    that._lastColumnWidths = null
                },
                _getRows: function(change) {
                    return change && change.items || this._dataController.items()
                },
                _getCellOptions: function(options) {
                    var parameters, groupingTextsOptions, scrollingMode, that = this,
                        column = options.column,
                        row = options.row,
                        data = row.data,
                        summaryCells = row && row.summaryCells,
                        value = options.value,
                        displayValue = gridCoreUtils.getDisplayValue(column, value, data, row.rowType);
                    parameters = this.callBase(options);
                    parameters.value = value;
                    parameters.displayValue = displayValue;
                    parameters.row = row;
                    parameters.key = row.key;
                    parameters.data = data;
                    parameters.rowType = row.rowType;
                    parameters.values = row.values;
                    parameters.text = !column.command ? gridCoreUtils.formatValue(displayValue, column) : "";
                    parameters.rowIndex = row.rowIndex;
                    parameters.summaryItems = summaryCells && summaryCells[options.columnIndex];
                    parameters.resized = column.resizedCallbacks;
                    if (isDefined(column.groupIndex) && !column.command) {
                        groupingTextsOptions = that.option("grouping.texts");
                        scrollingMode = that.option("scrolling.mode");
                        if ("virtual" !== scrollingMode && "infinite" !== scrollingMode) {
                            parameters.groupContinuesMessage = data && data.isContinuationOnNextPage && groupingTextsOptions && groupingTextsOptions.groupContinuesMessage;
                            parameters.groupContinuedMessage = data && data.isContinuation && groupingTextsOptions && groupingTextsOptions.groupContinuedMessage
                        }
                    }
                    return parameters
                },
                _setRowsOpacityCore: function($rows, visibleColumns, columnIndex, value) {
                    var columnsController = this._columnsController,
                        columns = columnsController.getColumns(),
                        column = columns && columns[columnIndex],
                        columnID = column && column.isBand && column.index;
                    each($rows, function(rowIndex, row) {
                        if (!$(row).hasClass(GROUP_ROW_CLASS)) {
                            for (var i = 0; i < visibleColumns.length; i++) {
                                if (typeUtils.isNumeric(columnID) && columnsController.isParentBandColumn(visibleColumns[i].index, columnID) || visibleColumns[i].index === columnIndex) {
                                    $rows.eq(rowIndex).children().eq(i).css({
                                        opacity: value
                                    });
                                    if (!typeUtils.isNumeric(columnID)) {
                                        break
                                    }
                                }
                            }
                        }
                    })
                },
                _getDevicePixelRatio: function() {
                    return window.devicePixelRatio
                },
                renderNoDataText: gridCoreUtils.renderNoDataText,
                getCellOptions: function(rowIndex, columnIdentifier) {
                    var cellOptions, column, rowOptions = this._dataController.items()[rowIndex];
                    if (rowOptions) {
                        if (typeUtils.isString(columnIdentifier)) {
                            column = this._columnsController.columnOption(columnIdentifier)
                        } else {
                            column = this._columnsController.getVisibleColumns()[columnIdentifier]
                        }
                        if (column) {
                            cellOptions = this._getCellOptions({
                                value: column.calculateCellValue(rowOptions.data),
                                rowIndex: rowOptions.rowIndex,
                                row: rowOptions,
                                column: column
                            })
                        }
                    }
                    return cellOptions
                },
                getRow: function(index) {
                    if (index >= 0) {
                        var rows = this._getRowElements();
                        if (rows.length > index) {
                            return $(rows[index])
                        }
                    }
                },
                getCellIndex: function($cell) {
                    var cellIndex = $cell.length ? $cell[0].cellIndex : -1;
                    return cellIndex
                },
                updateFreeSpaceRowHeight: function($table) {
                    var freeSpaceRowCount, scrollingMode, that = this,
                        itemCount = that._dataController.items().length,
                        contentElement = that._findContentElement(),
                        freeSpaceRowElements = that._getFreeSpaceRowElements($table);
                    if (freeSpaceRowElements && contentElement) {
                        var isFreeSpaceRowVisible = false;
                        if (itemCount > 0) {
                            if (!that._hasHeight) {
                                freeSpaceRowCount = that._dataController.pageSize() - itemCount;
                                scrollingMode = that.option("scrolling.mode");
                                if (freeSpaceRowCount > 0 && that._dataController.pageCount() > 1 && "virtual" !== scrollingMode && "infinite" !== scrollingMode) {
                                    styleUtils.setHeight(freeSpaceRowElements, freeSpaceRowCount * that._rowHeight);
                                    isFreeSpaceRowVisible = true
                                }
                                if (!isFreeSpaceRowVisible && $table) {
                                    styleUtils.setHeight(freeSpaceRowElements, 0)
                                } else {
                                    freeSpaceRowElements.toggle(isFreeSpaceRowVisible)
                                }
                                that._updateLastRowBorder(isFreeSpaceRowVisible)
                            } else {
                                freeSpaceRowElements.hide();
                                commonUtils.deferUpdate(function() {
                                    var scrollbarWidth = that.getScrollbarWidth(true),
                                        elementHeightWithoutScrollbar = that.element().height() - scrollbarWidth,
                                        contentHeight = contentElement.outerHeight(),
                                        showFreeSpaceRow = elementHeightWithoutScrollbar - contentHeight > 0,
                                        rowsHeight = that._getRowsHeight(contentElement.children().first()),
                                        $tableElement = $table || that.getTableElements(),
                                        borderTopWidth = Math.ceil(parseFloat($tableElement.css("borderTopWidth"))),
                                        heightCorrection = browser.webkit && that._getDevicePixelRatio() >= 2 ? 1 : 0,
                                        resultHeight = elementHeightWithoutScrollbar - rowsHeight - borderTopWidth - heightCorrection;
                                    if (showFreeSpaceRow) {
                                        commonUtils.deferRender(function() {
                                            freeSpaceRowElements.css("height", resultHeight);
                                            isFreeSpaceRowVisible = true;
                                            freeSpaceRowElements.show()
                                        })
                                    }
                                    commonUtils.deferRender(function() {
                                        that._updateLastRowBorder(isFreeSpaceRowVisible)
                                    })
                                })
                            }
                        } else {
                            freeSpaceRowElements.css("height", 0);
                            freeSpaceRowElements.show();
                            that._updateLastRowBorder(true)
                        }
                    }
                },
                _columnOptionChanged: function(e) {
                    var optionNames = e.optionNames;
                    if (e.changeTypes.grouping) {
                        return
                    }
                    if (optionNames.width || optionNames.visibleWidth) {
                        this.callBase(e);
                        this._fireColumnResizedCallbacks()
                    }
                },
                getScrollable: function() {
                    return this._scrollable
                },
                init: function() {
                    var that = this,
                        dataController = that.getController("data");
                    that.callBase();
                    that._editorFactoryController = that.getController("editorFactory");
                    that._rowHeight = 0;
                    that._scrollTop = 0;
                    that._scrollLeft = -1;
                    that._hasHeight = false;
                    dataController.loadingChanged.add(function(isLoading, messageText) {
                        that.setLoading(isLoading, messageText)
                    });
                    dataController.dataSourceChanged.add(function() {
                        if (that._scrollLeft >= 0) {
                            that._handleScroll({
                                scrollOffset: {
                                    top: that._scrollTop,
                                    left: that._scrollLeft
                                }
                            })
                        }
                    })
                },
                _handleDataChanged: function(change) {
                    var that = this;
                    switch (change.changeType) {
                        case "refresh":
                        case "prepend":
                        case "append":
                        case "update":
                            that.render(null, change);
                            break;
                        default:
                            that._update(change)
                    }
                },
                publicMethods: function() {
                    return ["isScrollbarVisible", "getTopVisibleRowData", "getScrollbarWidth", "getCellElement", "getRowElement", "getScrollable"]
                },
                contentWidth: function() {
                    return this.element().width() - this.getScrollbarWidth()
                },
                getScrollbarWidth: function(isHorizontal) {
                    var scrollableContainer = this._scrollableContainer && this._scrollableContainer.get(0),
                        scrollbarWidth = 0;
                    if (scrollableContainer) {
                        if (!isHorizontal) {
                            scrollbarWidth = scrollableContainer.clientWidth ? scrollableContainer.offsetWidth - scrollableContainer.clientWidth : 0
                        } else {
                            scrollbarWidth = scrollableContainer.clientHeight ? scrollableContainer.offsetHeight - scrollableContainer.clientHeight : 0
                        }
                    }
                    return scrollbarWidth > 0 ? scrollbarWidth : 0
                },
                _fireColumnResizedCallbacks: function() {
                    var i, that = this,
                        lastColumnWidths = that._lastColumnWidths || [],
                        columnWidths = [],
                        columns = that.getColumns();
                    for (i = 0; i < columns.length; i++) {
                        columnWidths[i] = columns[i].visibleWidth;
                        if (columns[i].resizedCallbacks && !isDefined(columns[i].groupIndex) && lastColumnWidths[i] !== columnWidths[i]) {
                            columns[i].resizedCallbacks.fire(columnWidths[i])
                        }
                    }
                    that._lastColumnWidths = columnWidths
                },
                _updateLastRowBorder: function(isFreeSpaceRowVisible) {
                    if (this.option("showBorders") && this.option("showRowLines") && !isFreeSpaceRowVisible) {
                        this.element().addClass(LAST_ROW_BORDER)
                    } else {
                        this.element().removeClass(LAST_ROW_BORDER)
                    }
                },
                _updateScrollable: function() {
                    var dxScrollable = Scrollable.getInstance(this.element());
                    if (dxScrollable) {
                        dxScrollable.update();
                        this._updateHorizontalScrollPosition()
                    }
                },
                _updateHorizontalScrollPosition: function() {
                    var scrollable = this.getScrollable(),
                        scrollLeft = scrollable && scrollable.scrollOffset().left;
                    if (this._scrollLeft >= 0 && scrollLeft !== this._scrollLeft) {
                        scrollable.scrollTo({
                            x: this._scrollLeft
                        })
                    }
                },
                _resizeCore: function() {
                    var that = this;
                    that._fireColumnResizedCallbacks();
                    that._updateRowHeight();
                    commonUtils.deferRender(function() {
                        that._renderScrollable();
                        that.renderNoDataText();
                        that.updateFreeSpaceRowHeight();
                        commonUtils.deferUpdate(function() {
                            that._updateScrollable()
                        })
                    })
                },
                scrollTo: function(location) {
                    var $element = this.element(),
                        dxScrollable = $element && Scrollable.getInstance($element);
                    if (dxScrollable) {
                        dxScrollable.scrollTo(location)
                    }
                },
                height: function(_height, hasHeight) {
                    var that = this,
                        $element = this.element();
                    if (0 === arguments.length) {
                        return $element ? $element.outerHeight(true) : 0
                    }
                    that._hasHeight = void 0 === hasHeight ? "auto" !== _height : hasHeight;
                    if (isDefined(_height) && $element) {
                        styleUtils.setHeight($element, _height)
                    }
                },
                setLoading: function(isLoading, messageText) {
                    var visibilityOptions, that = this,
                        loadPanel = that._loadPanel,
                        dataController = that._dataController,
                        loadPanelOptions = that.option("loadPanel") || {},
                        animation = dataController.isLoaded() ? loadPanelOptions.animation : null,
                        $element = that.element();
                    if (!windowUtils.hasWindow()) {
                        return
                    }
                    if (!loadPanel && void 0 !== messageText && dataController.isLocalStore() && "auto" === loadPanelOptions.enabled && $element) {
                        that._renderLoadPanel($element, $element.parent());
                        loadPanel = that._loadPanel
                    }
                    if (loadPanel) {
                        visibilityOptions = {
                            message: messageText || loadPanelOptions.text,
                            animation: animation,
                            visible: isLoading
                        };
                        clearTimeout(that._hideLoadingTimeoutID);
                        if (loadPanel.option("visible") && !isLoading) {
                            that._hideLoadingTimeoutID = setTimeout(function() {
                                loadPanel.option(visibilityOptions)
                            }, LOADPANEL_HIDE_TIMEOUT)
                        } else {
                            loadPanel.option(visibilityOptions)
                        }
                    }
                },
                setRowsOpacity: function(columnIndex, value) {
                    var $rows = this._getRowElements().not("." + GROUP_ROW_CLASS) || [];
                    this._setRowsOpacityCore($rows, this.getColumns(), columnIndex, value)
                },
                _getCellElementsCore: function(rowIndex) {
                    var groupCellIndex, $cells = this.callBase(rowIndex);
                    if ($cells) {
                        groupCellIndex = $cells.filter("." + GROUP_CELL_CLASS).index();
                        if (groupCellIndex >= 0 && $cells.length > groupCellIndex + 1) {
                            return $cells.slice(0, groupCellIndex + 1)
                        }
                    }
                    return $cells
                },
                getTopVisibleItemIndex: function() {
                    var rowElements, rowElement, that = this,
                        itemIndex = 0,
                        prevOffsetTop = 0,
                        offsetTop = 0,
                        scrollPosition = that._scrollTop,
                        contentElementOffsetTop = that._findContentElement().offset().top,
                        items = that._dataController.items(),
                        tableElement = that._getTableElement();
                    if (items.length && tableElement) {
                        rowElements = that._getRowElements(tableElement).filter(":visible");
                        for (itemIndex = 0; itemIndex < items.length; itemIndex++) {
                            prevOffsetTop = offsetTop;
                            rowElement = rowElements.eq(itemIndex);
                            if (rowElement.length) {
                                offsetTop = rowElement.offset().top - contentElementOffsetTop;
                                if (offsetTop > scrollPosition) {
                                    if (2 * scrollPosition < Math.round(offsetTop + prevOffsetTop) && itemIndex) {
                                        itemIndex--
                                    }
                                    break
                                }
                            }
                        }
                        if (itemIndex && itemIndex === items.length) {
                            itemIndex--
                        }
                    }
                    return itemIndex
                },
                getTopVisibleRowData: function() {
                    var itemIndex = this.getTopVisibleItemIndex(),
                        items = this._dataController.items();
                    if (items[itemIndex]) {
                        return items[itemIndex].data
                    }
                },
                optionChanged: function(args) {
                    var that = this;
                    that.callBase(args);
                    switch (args.name) {
                        case "wordWrapEnabled":
                        case "showColumnLines":
                        case "showRowLines":
                        case "rowAlternationEnabled":
                        case "rowTemplate":
                        case "twoWayBindingEnabled":
                            that._invalidate(true, true);
                            args.handled = true;
                            break;
                        case "scrolling":
                            that._rowHeight = null;
                            that._tableElement = null;
                            args.handled = true;
                            break;
                        case "rtlEnabled":
                            that._rowHeight = null;
                            that._tableElement = null;
                            break;
                        case "loadPanel":
                            that._tableElement = null;
                            that._invalidate(true, true);
                            args.handled = true;
                            break;
                        case "noDataText":
                            that.renderNoDataText();
                            args.handled = true
                    }
                },
                dispose: function() {
                    clearTimeout(this._hideLoadingTimeoutID)
                },
                setScrollerSpacing: function() {}
            }
        }())
    }
};
