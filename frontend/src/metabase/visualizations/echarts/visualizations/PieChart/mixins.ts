import { useState } from "react";
import type { SunburstSeriesOption } from "echarts";

import type { EChartsMixin } from "metabase/visualizations/types";
import {
  computeLabelDecimals,
  formatPercent,
} from "metabase/visualizations/visualizations/PieChart/utils";

export const pieSeriesMixin: EChartsMixin = ({ option, props }) => {
  option.series = {
    type: "sunburst",
    radius: ["60%", "90%"], // TODO calculate this like we do in PieChart.jsx
    data: props.data.rows.map(r => ({
      // TODO fix type error
      value: r[props.settings["pie._metricIndex"]] ?? undefined,
      name: r[props.settings["pie._dimensionIndex"]] ?? undefined,
    })),
  };

  return { option };
};

export const showPercentagesOnChartMixin: EChartsMixin = ({
  option,
  props,
}) => {
  if (props.settings["pie.percent_visibility"] !== "inside") {
    return { option };
  }
  const metricIndex = props.settings["pie._metricIndex"];
  // TODO deal with possible null values and fix types
  const total = props.data.rows.reduce((sum, r) => sum + r[metricIndex], 0);
  const percentages = props.data.rows.map(r => r[metricIndex] / total);
  const labelDecimals = computeLabelDecimals({ percentages });

  (option.series as SunburstSeriesOption).data?.forEach((d, index) => {
    d.label = {
      ...d.label,
      formatter: () =>
        formatPercent({
          percent: percentages[index],
          decimals: labelDecimals ?? 0,
          settings: props.settings,
          cols: props.data.cols,
        }),
    };
  });

  return { option };
};

export const seriesColorMixin: EChartsMixin = ({ option, props }) => {
  option.series = {
    ...option.series,
    // TODO fix type errors
    data: option?.series?.data.map(d => ({
      ...d,
      itemStyle: {
        ...d.itemStyle,
        color: props.settings["pie._colors"][d.name],
      },
    })),
  };

  return { option };
};

// Will later use this for changing total on hover
export function usePieTotalMixin() {
  const [text, setText] = useState("");

  const pieTotalMixin: EChartsMixin = ({ option }) => {
    // TODO fix any type
    const mouseoverHandler = (event: any) => {
      setText(`${event.data.name} - ${event.data.value}`);
    };
    const mouseoutHandler = (event: any) => {
      setText("Total...");
    };

    option.graphic = {
      type: "text",
      left: "center",
      top: "center",
      // TODO styles
      style: {
        fill: "#000",
        font: "bold 26px sans-serif",
        text: text || "Total...",
      },
    };
    option.hoverLayerThreshold = 0;

    return {
      option,
      eventHandlers: [
        {
          eventName: "mouseover",
          query: "series.sunburst",
          handler: mouseoverHandler,
        },
        { eventName: "mouseout", handler: mouseoutHandler },
      ],
    };
  };

  return pieTotalMixin;
}