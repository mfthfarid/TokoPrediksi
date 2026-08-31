import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import Svg, {
  Polyline,
  Circle,
  Line,
  Text as SvgText,
  Polygon,
} from 'react-native-svg';
import { Colors } from '../../../styles';
import { ChartPoint } from '../../../services/predictionService';

type PeriodFilter = 'latest' | '3months' | '6months' | '1year' | 'all';

interface PredictionChartProps {
  actual: ChartPoint[];
  predicted: ChartPoint[];
  height?: number;
}

const PADDING_LEFT = 42;
const PADDING_RIGHT = 16;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 42;

const POINT_SPACING = 58;
const MIN_CHART_WIDTH = 320;

const GRID_COUNT = 4;

const FILTERS: {
  key: PeriodFilter;
  label: string;
}[] = [
  { key: 'latest', label: 'Terbaru' },
  { key: '3months', label: '3 Bulan' },
  { key: '6months', label: '6 Bulan' },
  { key: '1year', label: '1 Tahun' },
  { key: 'all', label: 'Semua' },
];

/**
 * Mengubah DD/MM/YYYY menjadi Date.
 */
const parseDate = (date: string): Date => {
  const [day, month, year] = date.split('/').map(Number);

  return new Date(year, month - 1, day);
};

/**
 * Menentukan tanggal terbaru dari seluruh data.
 */
const getLatestDate = (
  actual: ChartPoint[],
  predicted: ChartPoint[],
): Date | null => {
  const allPoints = [...actual, ...predicted];

  if (allPoints.length === 0) {
    return null;
  }

  return allPoints.reduce((latest, point) => {
    const currentDate = parseDate(point.date);

    return currentDate > latest ? currentDate : latest;
  }, parseDate(allPoints[0].date));
};

const formatDate = (date: string, showYear: boolean): string => {
  const [day, month, year] = date.split('/');

  if (showYear) {
    return `${day}/${month}/${year.slice(-2)}`;
  }

  return `${day}/${month}`;
};

const getNiceMax = (value: number): number => {
  if (value <= 10) return 10;

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));

  const normalized = value / magnitude;
  let niceNormalized = 1;

  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  } else {
    niceNormalized = 10;
  }

  return niceNormalized * magnitude;
};

const PredictionChart = ({
  actual,
  predicted,
  height = 260,
}: PredictionChartProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState<PeriodFilter>('latest');

  const filteredData = useMemo(() => {
    if (actual.length === 0 && predicted.length === 0) {
      return {
        actual: [],
        predicted: [],
      };
    }

    const filteredPredicted = predicted;
    if (selectedFilter === 'all') {
      return {
        actual,
        predicted: filteredPredicted,
      };
    }

    if (selectedFilter === 'latest') {
      return {
        actual: actual.slice(-10),
        predicted: filteredPredicted,
      };
    }

    const latestDate = getLatestDate(actual, predicted);
    if (!latestDate) {
      return {
        actual: [],
        predicted: filteredPredicted,
      };
    }

    const startDate = new Date(latestDate);
    switch (selectedFilter) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;

      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;

      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const filteredActual = actual.filter(point => {
      const pointDate = parseDate(point.date);
      return pointDate >= startDate;
    });

    return {
      actual: filteredActual,
      predicted: filteredPredicted,
    };
  }, [actual, predicted, selectedFilter]);

  const filteredActual = filteredData.actual;
  const filteredPredicted = filteredData.predicted;
  const allPoints = useMemo(
    () => [...filteredActual, ...filteredPredicted],
    [filteredActual, filteredPredicted],
  );

  if (allPoints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Belum ada data untuk ditampilkan</Text>
      </View>
    );
  }

  const chartWidth = Math.max(
    screenWidth - 32,
    MIN_CHART_WIDTH,
    PADDING_LEFT +
      PADDING_RIGHT +
      Math.max(allPoints.length - 1, 1) * POINT_SPACING,
  );

  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const allValues = [
    ...allPoints.map(point => point.quantity),

    ...filteredPredicted
      .filter(point => point.lower !== undefined)
      .map(point => point.lower as number),

    ...filteredPredicted
      .filter(point => point.upper !== undefined)
      .map(point => point.upper as number),
  ];

  const rawMaxValue = Math.max(...allValues, 1);
  const maxValue = getNiceMax(rawMaxValue);
  const getX = (index: number) => {
    return PADDING_LEFT + index * POINT_SPACING;
  };

  const getY = (value: number) => {
    return PADDING_TOP + chartHeight - (value / maxValue) * chartHeight;
  };

  const actualLinePoints = filteredActual
    .map((point, index) => {
      return `${getX(index)},${getY(point.quantity)}`;
    })
    .join(' ');

  const predictedLinePoints = filteredPredicted
    .map((point, index) => {
      const position = filteredActual.length + index;
      return `${getX(position)},${getY(point.quantity)}`;
    })
    .join(' ');

  const bridgePoint =
    filteredActual.length > 0
      ? `${getX(filteredActual.length - 1)},${getY(
          filteredActual[filteredActual.length - 1].quantity,
        )}`
      : '';

  const predictionPolylinePoints =
    bridgePoint && predictedLinePoints
      ? `${bridgePoint} ${predictedLinePoints}`
      : predictedLinePoints;

  const predictionRangePoints = (() => {
    const hasRange = filteredPredicted.some(
      point =>
        point.lower !== undefined &&
        point.upper !== undefined &&
        point.lower !== point.upper,
    );

    if (!hasRange) {
      return '';
    }

    const upperPoints = filteredPredicted.map((point, index) => {
      const position = filteredActual.length + index;
      const upper = point.upper ?? point.quantity;
      return `${getX(position)},${getY(upper)}`;
    });

    const lowerPoints = [...filteredPredicted]
      .reverse()
      .map((point, reverseIndex) => {
        const originalIndex = filteredPredicted.length - 1 - reverseIndex;
        const position = filteredActual.length + originalIndex;
        const lower = point.lower ?? point.quantity;
        return `${getX(position)},${getY(lower)}`;
      });
    return [...upperPoints, ...lowerPoints].join(' ');
  })();

  const years = new Set(
    allPoints.map(point => {
      const [, , year] = point.date.split('/');
      return year;
    }),
  );

  const showYear = years.size > 1;
  const hasPredictionRange = filteredPredicted.some(
    point =>
      point.lower !== undefined &&
      point.upper !== undefined &&
      point.lower !== point.upper,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aktual vs Prediksi</Text>
        <Text style={styles.subtitle}>Riwayat penjualan dan proyeksi</Text>
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map(filter => {
          const isActive = selectedFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scroll hint */}
      {allPoints.length > 6 && (
        <Text style={styles.scrollHint}>
          Geser grafik untuk melihat data lainnya
        </Text>
      )}

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScrollContainer}
      >
        <Svg width={chartWidth} height={height}>
          {/* Grid horizontal + label Y */}
          {Array.from({
            length: GRID_COUNT + 1,
          }).map((_, index) => {
            const value = (maxValue / GRID_COUNT) * (GRID_COUNT - index);
            const y = getY(value);
            return (
              <React.Fragment key={`grid-${index}`}>
                <Line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - PADDING_RIGHT}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                />
                <SvgText
                  x={PADDING_LEFT - 8}
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
            stroke="#D1D5DB"
            strokeWidth={1}
          />

          {/* Sumbu X */}
          <Line
            x1={PADDING_LEFT}
            y1={height - PADDING_BOTTOM}
            x2={chartWidth - PADDING_RIGHT}
            y2={height - PADDING_BOTTOM}
            stroke="#D1D5DB"
            strokeWidth={1}
          />

          {/* Rentang Prediksi */}
          {predictionRangePoints !== '' && (
            <Polygon
              points={predictionRangePoints}
              fill="#F59E0B"
              fillOpacity={0.15}
            />
          )}

          {/* Garis Aktual */}
          {filteredActual.length > 1 && (
            <Polyline
              points={actualLinePoints}
              fill="none"
              stroke={Colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Jika hanya ada satu data aktual */}
          {filteredActual.length === 1 && (
            <Circle
              cx={getX(0)}
              cy={getY(filteredActual[0].quantity)}
              r={4}
              fill={Colors.primary}
            />
          )}

          {/* Garis Prediksi */}
          {filteredPredicted.length > 0 && (
            <Polyline
              points={predictionPolylinePoints}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={2.5}
              strokeDasharray="7,5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Titik Aktual */}
          {filteredActual.map((point, index) => (
            <Circle
              key={`actual-${index}`}
              cx={getX(index)}
              cy={getY(point.quantity)}
              r={3.5}
              fill={Colors.primary}
            />
          ))}

          {/* Titik Prediksi */}
          {filteredPredicted.map((point, index) => {
            const position = filteredActual.length + index;

            return (
              <Circle
                key={`predicted-${index}`}
                cx={getX(position)}
                cy={getY(point.quantity)}
                r={3.5}
                fill="#F59E0B"
              />
            );
          })}

          {/* Label tanggal */}
          {allPoints.map((point, index) => (
            <SvgText
              key={`date-${index}`}
              x={getX(index)}
              y={height - 12}
              fontSize="9"
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {formatDate(point.date, showYear)}
            </SvgText>
          ))}
        </Svg>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendLine, { backgroundColor: Colors.primary }]}
          />
          <Text style={styles.legendText}>Aktual</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDashed}>
            <View style={[styles.dash, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.dash, { backgroundColor: '#F59E0B' }]} />
          </View>
          <Text style={styles.legendText}>Prediksi</Text>
        </View>

        {hasPredictionRange && (
          <View style={styles.legendItem}>
            <View style={styles.rangeBox} />
            <Text style={styles.legendText}>Rentang</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    marginBottom: 14,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  filterContainer: {
    paddingBottom: 12,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },

  filterButtonActive: {
    backgroundColor: Colors.primary,
  },

  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  scrollHint: {
    marginBottom: 6,
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  chartScrollContainer: {
    paddingRight: 16,
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 10,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
  },

  legendDashed: {
    width: 20,
    flexDirection: 'row',
    gap: 4,
  },

  dash: {
    width: 8,
    height: 3,
    borderRadius: 2,
  },

  rangeBox: {
    width: 16,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },

  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default PredictionChart;
