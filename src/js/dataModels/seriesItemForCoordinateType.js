/**
 * @fileoverview SeriesItemForCoordinateType is a element of SeriesGroup.items.
 * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');

var SeriesItemForCoordinateType = tui.util.defineClass(/** @lends SeriesItemForCoordinateType.prototype */{
    /**
     * SeriesItemForCoordinateType is a element of SeriesGroup.items.
     * SeriesItemForCoordinateType has processed terminal data like x, y, r, xRatio, yRatio, rRatio.
     * @constructs SeriesItemForCoordinateType
     * @param {object} params - parameters
     *      @param {Array.<number>|{x: number, y:number, r: ?number, label: ?string}} params.datum - raw series datum
     *      @param {string} params.chartType - type of chart
     *      @param {?Array.<function>} params.formatFunctions - format functions
     *      @param {number} params.index - raw data index
     */
    init: function(params) {
        /**
         * type of chart
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * format functions
         * @type {Array.<function>}
         */
        this.formatFunctions = params.formatFunctions;

        /**
         * x axis type
         * @type {?string}
         */
        this.xAxisType = params.xAxisType;

        /**
         * date format
         * @type {?string}
         */
        this.dateFormat = params.dateFormat;

        /**
         * ratio map
         * @type {object}
         */
        this.ratioMap = {};

        this._initData(params.datum, params.index);
    },

    /**
     * Initialize data of item.
     @param {Array.<number>|{x: number, y:number, r: ?number, label: ?string}} rawSeriesDatum - raw series datum
     * @param {number} index - raw data index
     * @private
     */
    _initData: function(rawSeriesDatum, index) {
        var date;

        if (tui.util.isArray(rawSeriesDatum)) {
            this.x = rawSeriesDatum[0] || 0;
            this.y = rawSeriesDatum[1] || 0;
            this.r = rawSeriesDatum[2];
        } else {
            this.x = rawSeriesDatum.x;
            this.y = rawSeriesDatum.y;
            this.r = rawSeriesDatum.r;
        }

        if (predicate.isDatetimeType(this.xAxisType)) {
            date = tui.util.isDate(this.x) ? this.x : (new Date(this.x));
            this.x = date.getTime() || 0;
        }

        this.index = index;

        if (predicate.isLineTypeChart(this.chartType)) {
            this.label = renderUtil.formatValue(this.y, this.formatFunctions, this.chartType, 'series');
        } else {
            this.label = rawSeriesDatum.label || '';
        }
    },

    /**
     * Add start.
     * @param {number} value - value
     * @private
     */
    addStart: function(value) {
        this.start = value;
    },

    /**
     * Add ratio.
     * @param {string} valueType - type of value like x, y, r
     * @param {?number} divNumber - number for division
     * @param {?number} subNumber - number for subtraction
     */
    addRatio: function(valueType, divNumber, subNumber) {
        if (!tui.util.isExisty(this.ratioMap[valueType]) && divNumber) {
            this.ratioMap[valueType] = (this[valueType] - subNumber) / divNumber;
        }
    },

    /**
     * Pick value map.
     * @returns {{x: (number | null), y: (number | null), r: (number | null)}}
     */
    pickValueMap: function() {
        var formatFunctions = this.formatFunctions;
        var chartType = this.chartType;
        var valueMap = {
            x: this.ratioMap.x ? this.x : null,
            y: this.ratioMap.y ? this.y : null,
            r: this.ratioMap.r ? this.r : null
        };

        if (predicate.isLineTypeChart(this.chartType)) {
            if (predicate.isDatetimeType(this.xAxisType)) {
                valueMap.category = renderUtil.formatDate(this.x, this.dateFormat);
            } else {
                valueMap.category = renderUtil.formatValue(this.x, formatFunctions, chartType, 'category');
            }
        }

        return valueMap;
    }
});

module.exports = SeriesItemForCoordinateType;