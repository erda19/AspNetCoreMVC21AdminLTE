/**
 * DevExtreme (viz/tree_map/tiling.rotated_slice_and_dice.js)
 * Version: 18.1.5
 * Build date: Fri Jul 27 2018
 *
 * Copyright (c) 2012 - 2018 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var tiling = require("./tiling"),
    sliceAndDiceAlgorithm = tiling.getAlgorithm("sliceanddice");

function rotatedSliceAndDice(data) {
    data.isRotated = !data.isRotated;
    return sliceAndDiceAlgorithm.call(this, data)
}
tiling.addAlgorithm("rotatedsliceanddice", rotatedSliceAndDice);
