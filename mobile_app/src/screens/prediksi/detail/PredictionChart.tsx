import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { Colors } from '../../../styles';
import { ChartPoint } from '../../../services/predictionService';

interface PredictionChartProps {
  actual: ChartPoint[];
  predicted: ChartPoint[];
  width?: number;
  height?: number;
}

const PADDING = 24;

const PredictionChart = ({
  actual,
  predicted,
  width = 320,
  height = 180,
}: PredictionChartProps) => {
  const allPoints = [...actual, ...predicted];

  if (allPoints.length === 0) {
    return (
      <View style={[styles.emptyBox, { height }]}>
        <Text style={styles.emptyText}>Belum ada data grafik</Text>
      </View>
    );
  }

  const quantities = allPoints.map(p => p.quantity);
  const upperBounds = predicted.map(p => p.upper ?? p.quantity);
  const maxQty = Math.max(...quantities, ...upperBounds, 1);

  const chartWidth = width - PADDING * 2;
  const chartHeight = height - PADDING * 2;

  const getX = (index: number) =>
    PADDING +
    (allPoints.length === 1
      ? chartWidth / 2
      : (index / (allPoints.length - 1)) * chartWidth);
  const getY = (value: number) =>
    PADDING + chartHeight - (value / maxQty) * chartHeight;

  const actualPoints = actual
    .map((p, i) => `${getX(i)},${getY(p.quantity)}`)
    .join(' ');

  const predictedStartIndex = actual.length > 0 ? actual.length - 1 : 0;
  const predictedPoints = predicted
    .map((p, i) => `${getX(predictedStartIndex + 1 + i)},${getY(p.quantity)}`)
    .join(' ');

  // Sambungkan garis prediksi dari titik terakhir aktual biar nyambung visual
  const bridgePoint =
    actual.length > 0
      ? `${getX(actual.length - 1)},${getY(
          actual[actual.length - 1].quantity,
        )} `
      : '';

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke="#eee"
          strokeWidth={1}
        />
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke="#eee"
          strokeWidth={1}
        />

        {actual.length > 0 && (
          <Polyline
            points={actualPoints}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2}
          />
        )}

        {predicted.length > 0 && (
          <Polyline
            points={bridgePoint + predictedPoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
        )}

        {actual.map((p, i) => (
          <Circle
            key={`a-${i}`}
            cx={getX(i)}
            cy={getY(p.quantity)}
            r={3}
            fill={Colors.primary}
          />
        ))}
        {predicted.map((p, i) => (
          <Circle
            key={`p-${i}`}
            cx={getX(predictedStartIndex + 1 + i)}
            cy={getY(p.quantity)}
            r={3}
            fill="#f59e0b"
          />
        ))}
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.primary }]}
          />
          <Text style={styles.legendText}>Aktual</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Prediksi</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default PredictionChart;
