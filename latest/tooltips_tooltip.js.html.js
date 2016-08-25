tui.util.defineNamespace("fedoc.content", {});
fedoc.content["tooltips_tooltip.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Tooltip component.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar TooltipBase = require('./tooltipBase');\nvar singleTooltipMixer = require('./singleTooltipMixer');\nvar chartConst = require('../const');\nvar predicate = require('../helpers/predicate');\nvar renderUtil = require('../helpers/renderUtil');\nvar tooltipTemplate = require('./tooltipTemplate');\n\n/**\n * @classdesc Tooltip component.\n * @class Tooltip\n */\nvar Tooltip = tui.util.defineClass(TooltipBase, /** @lends Tooltip.prototype */ {\n    /**\n     * Tooltip component.\n     * @constructs Tooltip\n     * @override\n     */\n    init: function() {\n        TooltipBase.apply(this, arguments);\n    },\n\n    /**\n     * Make tooltip html.\n     * @param {string} category category\n     * @param {{value: string, legend: string, chartType: string, suffix: ?string}} item item data\n     * @returns {string} tooltip html\n     * @private\n     */\n    _makeTooltipHtml: function(category, item) {\n        var template;\n\n        if (predicate.isCoordinateTypeChart(this.chartType)) {\n            template = tooltipTemplate.tplCoordinatetypeChart;\n        } else {\n            template = tooltipTemplate.tplDefault;\n        }\n\n        return template(tui.util.extend({\n            categoryVisible: category ? 'show' : 'hide',\n            category: category\n        }, item));\n    },\n\n    /**\n     * Make html for value types like x, y, r\n     * @param {{x: ?number, y: ?number, r: ?number}} data - data\n     * @param {Array.&lt;string>} valueTypes - types of value\n     * @returns {string}\n     * @private\n     */\n    _makeHtmlForValueTypes: function(data, valueTypes) {\n        return tui.util.map(valueTypes, function(type) {\n            return (data[type]) ? '&lt;div>' + type + ': ' + data[type] + '&lt;/div>' : '';\n        }).join('');\n    },\n\n    /**\n     * Make single tooltip html.\n     * @param {string} chartType chart type\n     * @param {{groupIndex: number, index: number}} indexes indexes\n     * @returns {string} tooltip html\n     * @private\n     */\n    _makeSingleTooltipHtml: function(chartType, indexes) {\n        var data = tui.util.pick(this.data, chartType, indexes.groupIndex, indexes.index);\n\n        data = tui.util.extend({\n            suffix: this.suffix\n        }, data);\n        data.valueTypes = this._makeHtmlForValueTypes(data, ['x', 'y', 'r']);\n\n        return this.templateFunc(data.category, data);\n    },\n\n    /**\n     * Set default align option of tooltip.\n     * @private\n     * @override\n     */\n    _setDefaultTooltipPositionOption: function() {\n        if (this.options.align) {\n            return;\n        }\n\n        if (this.isVertical) {\n            this.options.align = chartConst.TOOLTIP_DEFAULT_ALIGN_OPTION;\n        } else {\n            this.options.align = chartConst.TOOLTIP_DEFAULT_HORIZONTAL_ALIGN_OPTION;\n        }\n    },\n\n    /**\n     * Make parameters for show tooltip user event.\n     * @param {{groupIndex: number, index: number}} indexes indexes\n     * @param {object} additionParams addition parameters\n     * @returns {{chartType: string, legend: string, legendIndex: number, index: number}} parameters for show tooltip\n     * @private\n     */\n    _makeShowTooltipParams: function(indexes, additionParams) {\n        var legendIndex = indexes.index;\n        var legendData = this.dataProcessor.getLegendItem(legendIndex);\n        var params;\n\n        if (!legendData) {\n            return null;\n        }\n\n        params = tui.util.extend({\n            chartType: legendData.chartType,\n            legend: legendData.label,\n            legendIndex: legendIndex,\n            index: indexes.groupIndex\n        }, additionParams);\n\n        return params;\n    },\n\n    /**\n     * Format value of valueMap\n     * @param {object} valueMap - map of value like value, x, y, r\n     * @returns {{}}\n     * @private\n     */\n    _formatValueMap: function(valueMap) {\n        var formatFunctions = this.dataProcessor.getFormatFunctions();\n        var chartType = this.chartType;\n        var formattedMap = {};\n\n        tui.util.forEach(valueMap, function(value, valueType) {\n            if (tui.util.isNumber(value)) {\n                value = renderUtil.formatValue(value, formatFunctions, chartType, 'tooltip', valueType);\n            }\n\n            formattedMap[valueType] = value;\n        });\n\n        return formattedMap;\n    },\n\n    /**\n     * Make tooltip datum.\n     * @param {Array.&lt;string>} legendLabels - legend labels\n     * @param {string} category - category\n     * @param {string} chartType - chart type\n     * @param {SeriesItem} seriesItem - SeriesItem\n     * @param {number} index - index\n     * @returns {Object}\n     * @private\n     */\n    _makeTooltipDatum: function(legendLabels, category, chartType, seriesItem, index) {\n        var legend = legendLabels[chartType][index] || '';\n        var labelPrefix = (legend &amp;&amp; seriesItem.label) ? ':&amp;nbsp;' : '';\n        var label = seriesItem.tooltipLabel || (seriesItem.label ? labelPrefix + seriesItem.label : '');\n        var valueMap = this._formatValueMap(seriesItem.pickValueMap());\n\n        if (category &amp;&amp; predicate.isDatetimeType(this.xAxisType)) {\n            category = renderUtil.formatDate(category, this.dateFormat);\n        }\n\n        return tui.util.extend({\n            category: category || '',\n            legend: legend,\n            label: label\n        }, valueMap);\n    },\n\n    /**\n     * Make tooltip data.\n     * @returns {Array.&lt;object>} tooltip data\n     * @override\n     */\n    _makeTooltipData: function() {\n        var self = this;\n        var orgLegendLabels = this.dataProcessor.getLegendLabels();\n        var isPivot = predicate.isTreemapChart(this.chartType);\n        var legendLabels = {};\n        var tooltipData = {};\n\n        if (tui.util.isArray(orgLegendLabels)) {\n            legendLabels[this.chartType] = orgLegendLabels;\n        } else {\n            legendLabels = orgLegendLabels;\n        }\n\n        this.dataProcessor.eachBySeriesGroup(function(seriesGroup, groupIndex, chartType) {\n            var data;\n\n            chartType = chartType || self.chartType;\n\n            data = seriesGroup.map(function(seriesItem, index) {\n                var category = self.dataProcessor.getTooltipCategory(groupIndex, index, self.isVertical);\n\n                return seriesItem ? self._makeTooltipDatum(legendLabels, category, chartType, seriesItem, index) : null;\n            });\n\n            if (!tooltipData[chartType]) {\n                tooltipData[chartType] = [];\n            }\n\n            tooltipData[chartType].push(data);\n        }, isPivot);\n\n        return tooltipData;\n    }\n});\n\nsingleTooltipMixer.mixin(Tooltip);\nmodule.exports = Tooltip;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"