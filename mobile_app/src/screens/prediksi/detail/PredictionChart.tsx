import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../../styles';
import { ChartPoint } from '../../../services/predictionService';

interface PredictionChartProps {
  actual: ChartPoint[];
  predicted: ChartPoint[];
  width?: number;
  height?: number;
}

const PADDING_LEFT = 38;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;

const PredictionChart = ({
  actual,
  predicted,
  width = 320,
  height = 220,
}: PredictionChartProps) => {
  const allPoints = [...actual, ...predicted];

  if (allPoints.length === 0) {
    return (
      <View style={[styles.emptyBox, { height }]}>
        <Text style={styles.emptyText}>Belum ada data grafik</Text>
      </View>
    );
  }

  // Semua nilai quantity
  const quantities = allPoints.map(point => point.quantity);

  // Sertakan batas atas prediksi jika tersedia
  const upperBounds = predicted.map(point => point.upper ?? point.quantity);

  const maxQty = Math.max(...quantities, ...upperBounds, 1);

  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;

  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const getX = (index: number) => {
    if (allPoints.length === 1) {
      return PADDING_LEFT + chartWidth / 2;
    }

    return PADDING_LEFT + (index / (allPoints.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return PADDING_TOP + chartHeight - (value / maxQty) * chartHeight;
  };

  // Garis aktual
  const actualPoints = actual
    .map((point, index) => {
      return `${getX(index)},${getY(point.quantity)}`;
    })
    .join(' ');

  // Garis prediksi dimulai setelah data aktual
  const predictedPoints = predicted
    .map((point, index) => {
      const position = actual.length + index;

      return `${getX(position)},${getY(point.quantity)}`;
    })
    .join(' ');

  // Titik terakhir aktual sebagai penghubung prediksi
  const bridgePoint =
    actual.length > 0
      ? `${getX(actual.length - 1)},${getY(
          actual[actual.length - 1].quantity,
        )} `
      : '';

  // Format DD/MM/YYYY -> DD/MM
  const formatDate = (date: string) => {
    if (!date) return '';

    const parts = date.split('/');

    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }

    return date;
  };

  /*
   * Menentukan label tanggal yang ditampilkan.
   * Tidak semua tanggal ditampilkan agar tidak bertumpuk.
   */
  const getVisibleDateIndexes = () => {
    const indexes = new Set<number>();

    if (allPoints.length <= 5) {
      allPoints.forEach((_, index) => {
        indexes.add(index);
      });
    } else {
      indexes.add(0);

      indexes.add(Math.floor((allPoints.length - 1) / 2));

      indexes.add(allPoints.length - 1);
    }

    return indexes;
  };

  const visibleDateIndexes = getVisibleDateIndexes();

  // Jumlah garis horizontal
  const gridCount = 4;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Horizontal Grid */}
        {Array.from({
          length: gridCount + 1,
        }).map((_, index) => {
          const value = (maxQty / gridCount) * (gridCount - index);

          const y = getY(value);

          return (
            <React.Fragment key={`grid-${index}`}>
              <Line
                x1={PADDING_LEFT}
                y1={y}
                x2={width - PADDING_RIGHT}
                y2={y}
                stroke="#eeeeee"
                strokeWidth={1}
              />

              <SvgText
                x={PADDING_LEFT - 6}
                y={y + 4}
                fontSize="10"
                fill={Colors.textSecondary}
                textAnchor="end"
              >
                {Math.round(value)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Sumbu Y */}
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={height - PADDING_BOTTOM}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Sumbu X */}
        <Line
          x1={PADDING_LEFT}
          y1={height - PADDING_BOTTOM}
          x2={width - PADDING_RIGHT}
          y2={height - PADDING_BOTTOM}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Garis Aktual */}
        {actual.length > 0 && (
          <Polyline
            points={actualPoints}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Garis Prediksi */}
        {predicted.length > 0 && (
          <Polyline
            points={bridgePoint + predictedPoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="6,4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Titik Aktual */}
        {actual.map((point, index) => (
          <Circle
            key={`actual-${index}`}
            cx={getX(index)}
            cy={getY(point.quantity)}
            r={3.5}
            fill={Colors.primary}
          />
        ))}

        {/* Titik Prediksi */}
        {predicted.map((point, index) => {
          const position = actual.length + index;

          return (
            <Circle
              key={`predicted-${index}`}
              cx={getX(position)}
              cy={getY(point.quantity)}
              r={3.5}
              fill="#f59e0b"
            />
          );
        })}

        {/* Label Tanggal */}
        {allPoints.map((point, index) => {
          if (!visibleDateIndexes.has(index)) {
            return null;
          }

          return (
            <SvgText
              key={`date-${index}`}
              x={getX(index)}
              y={height - 8}
              fontSize="9"
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {formatDate(point.date)}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendLine, { backgroundColor: Colors.primary }]}
          />

          <Text style={styles.legendText}>Aktual</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.legendPrediction} />

          <Text style={styles.legendText}>Prediksi</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendLine: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },

  legendPrediction: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
  },

  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default PredictionChart;
