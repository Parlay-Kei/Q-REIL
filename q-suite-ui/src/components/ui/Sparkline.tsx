import React from 'react';
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'cyan' | 'violet' | 'teal' | 'success' | 'danger' | 'warning';
  showArea?: boolean;
  className?: string;
}
const colorMap = {
  cyan: {
    stroke: '#45D7FF',
    fill: 'rgba(69, 215, 255, 0.2)'
  },
  violet: {
    stroke: '#7A5CFF',
    fill: 'rgba(122, 92, 255, 0.2)'
  },
  teal: {
    stroke: '#1EF2C6',
    fill: 'rgba(30, 242, 198, 0.2)'
  },
  success: {
    stroke: '#2BE6A6',
    fill: 'rgba(43, 230, 166, 0.2)'
  },
  danger: {
    stroke: '#FF4D6D',
    fill: 'rgba(255, 77, 109, 0.2)'
  },
  warning: {
    stroke: '#FFB020',
    fill: 'rgba(255, 176, 32, 0.2)'
  }
};
export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = 'cyan',
  showArea = true,
  className = ''
}: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = data.map((value, index) => {
    const x = padding + index / (data.length - 1) * chartWidth;
    const y = padding + chartHeight - (value - min) / range * chartHeight;
    return {
      x,
      y
    };
  });
  const linePath = points.
  map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).
  join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
  const { stroke, fill } = colorMap[color];
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}>

      {showArea && <path d={areaPath} fill={fill} />}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round" />

      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={stroke} />

    </svg>);

}