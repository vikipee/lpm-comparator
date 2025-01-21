import { useState, useEffect } from 'react';
import { ResponsiveHeatMapCanvas } from '@nivo/heatmap';

const MyResponsiveHeatMap = ({ data }: { data: any }) => {
  const [themeColors, setThemeColors] = useState<any>(null);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);

    const getHslColor = (variable: string) => {
      const value = rootStyles.getPropertyValue(variable);
      return `hsl(${value.trim()})`;
    };

    const colors = {
      background: getHslColor('--background'),
      foreground: getHslColor('--foreground'),
      primary: getHslColor('--primary'),
      primaryForeground: getHslColor('--primary-foreground'),
      // ... other colors as needed
    };

    const fontFamily =
      rootStyles.getPropertyValue('--font-sans').trim() || 'Inter, sans-serif';

    setThemeColors({ ...colors, fontFamily });
  }, []);

  if (!themeColors) {
    return null; // or loading indicator
  }

  const heatmapTheme = {
    fontFamily: themeColors.fontFamily,
    fontSize: 12,
    textColor: themeColors.foreground,
    axis: {
      domain: {
        line: {
          stroke: themeColors.foreground,
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: themeColors.foreground,
          strokeWidth: 1,
        },
        text: {
          fontSize: 12,
          fill: themeColors.foreground,
        },
      },
      legend: {
        text: {
          fontSize: 14,
          fill: themeColors.foreground,
        },
      },
    },
    legends: {
      text: {
        fontSize: 12,
        fill: themeColors.foreground,
      },
    },
    labels: {
      text: {
        fontSize: 12,
        fill: themeColors.primaryForeground,
      },
    },
    tooltip: {
      container: {
        background: themeColors.background,
        color: themeColors.foreground,
        fontSize: 12,
        fontFamily: themeColors.fontFamily,
      },
    },
  };

  return (
    <ResponsiveHeatMapCanvas
      data={data}
      theme={heatmapTheme}
      colors={{
        type: 'quantize',
        scheme: 'blues',
        steps: 10,
      }}
      emptyColor={themeColors.background}
      margin={{ top: 120, right: 120, bottom: 120, left: 120 }}
      valueFormat=".2f"
      axisTop={{
        tickSize: 5,

        tickPadding: 10,

        tickRotation: -30,

        legend: 'Set B',

        legendOffset: -100,

        legendPosition: 'middle',
      }}
      axisLeft={{
        tickSize: 5,

        tickPadding: 10,

        tickRotation: -50,

        legend: 'Set A',

        legendPosition: 'middle',

        legendOffset: -100,
      }}
      legends={[
        {
          anchor: 'bottom',
          translateX: 0,
          translateY: 40,
          length: 400,
          thickness: 8,

          direction: 'row',

          tickPosition: 'after',

          tickSize: 3,

          tickSpacing: 4,

          tickOverlap: false,

          tickFormat: '.2f',

          title: 'Value →',

          titleAlign: 'start',

          titleOffset: 4,
        },
      ]}
    />
  );
};

export default MyResponsiveHeatMap;
