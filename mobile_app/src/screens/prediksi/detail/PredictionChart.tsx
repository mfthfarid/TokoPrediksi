import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
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

type PeriodFilter = '3months' | '6months' | '1year' | 'all';
type ChartMode = 'overview' | 'prediction';

interface PredictionChartProps {
  actual: ChartPoint[];
  predicted: ChartPoint[];
  height?: number;
  // width?: number;
}

interface ChartItem extends ChartPoint {
  type: 'actual' | 'predicted';
  timestamp: number;
}

const CHART_HEIGHT = 270;
const PADDING = {
  top: 28,
  right: 16,
  bottom: 42,
  left: 42,
};

const GRID_COUNT = 4;
const FILTERS: {
  key: PeriodFilter;
  label: string;
}[] = [
  {
    key: '3months',
    label: '3 Bulan',
  },
  {
    key: '6months',
    label: '6 Bulan',
  },
  {
    key: '1year',
    label: '1 Tahun',
  },
  {
    key: 'all',
    label: 'Semua',
  },
];

const parseDate = (date: string): Date => {
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const formatFullDate = (date: string): string => {
  const parsedDate = parseDate(date);
  return parsedDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatAxisDate = (timestamp: number, showYear: boolean): string => {
  const date = new Date(timestamp);
  if (showYear) {
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      year: '2-digit',
    });
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
};

const getNiceMax = (value: number): number => {
  if (value <= 5) return 5;
  if (value <= 10) return 10;

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let niceNormalized;

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
  height = CHART_HEIGHT,
}: PredictionChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('1year');
  const [chartMode, setChartMode] = useState<ChartMode>('overview');
  const [selectedPoint, setSelectedPoint] = useState<ChartItem | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const normalizedActual = useMemo(() => {
    return actual
      .map(item => ({
        ...item,
        type: 'actual' as const,
        timestamp: parseDate(item.date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [actual]);

  const normalizedPredicted = useMemo(() => {
    return predicted
      .map(item => ({
        ...item,
        type: 'predicted' as const,
        timestamp: parseDate(item.date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [predicted]);

  // Data overview berdasarkan periode.
  const overviewData = useMemo(() => {
    if (normalizedActual.length === 0 && normalizedPredicted.length === 0) {
      return [];
    }

    const latestActual = normalizedActual[normalizedActual.length - 1];
    if (!latestActual) {
      return normalizedPredicted;
    }

    if (selectedPeriod === 'all') {
      return [...normalizedActual, ...normalizedPredicted];
    }

    const startDate = new Date(latestActual.timestamp);
    switch (selectedPeriod) {
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

    const startTimestamp = startDate.getTime();
    const filteredActual = normalizedActual.filter(
      point => point.timestamp >= startTimestamp,
    );

    return [...filteredActual, ...normalizedPredicted];
  }, [normalizedActual, normalizedPredicted, selectedPeriod]);

  // Data khusus Fokus Prediksi. Mengambil maksimal 5 data aktual terakhir
  const predictionFocusData = useMemo(() => {
    const recentActual = normalizedActual.slice(-5);
    return [...recentActual, ...normalizedPredicted];
  }, [normalizedActual, normalizedPredicted]);

  // Menentukan dataset aktif.
  const activeData =
    chartMode === 'overview' ? overviewData : predictionFocusData;
  const activeActual = activeData.filter(point => point.type === 'actual');
  const activePredicted = activeData.filter(
    point => point.type === 'predicted',
  );

  // Reset selected point ketika mode/filter berubah.
  React.useEffect(() => {
    setSelectedPoint(null);
  }, [selectedPeriod, chartMode]);

  if (activeData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Belum ada data penjualan untuk ditampilkan
        </Text>
      </View>
    );
  }

  // Range waktu.
  const timestamps = activeData.map(item => item.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const timeRange = maxTimestamp - minTimestamp || 1; // Mencegah pembagian 0 jika hanya ada satu tanggal.

  // Semua nilai untuk skala Y.
  const allValues = activeData.flatMap(point => {
    const values = [point.quantity];

    if (point.type === 'predicted') {
      if (point.lower !== undefined) {
        values.push(point.lower);
      }

      if (point.upper !== undefined) {
        values.push(point.upper);
      }
    }
    return values;
  });

  const maxValue = getNiceMax(Math.max(...allValues, 1));

  // Area chart sebenarnya.
  const plotWidth = Math.max(chartWidth - PADDING.left - PADDING.right, 1);
  const plotHeight = height - PADDING.top - PADDING.bottom;

  // Posisi X berdasarkan waktu.
  const getX = (timestamp: number) => {
    return PADDING.left + ((timestamp - minTimestamp) / timeRange) * plotWidth;
  };

  // Posisi Y berdasarkan nilai.
  const getY = (value: number) => {
    return PADDING.top + plotHeight - (value / maxValue) * plotHeight;
  };

  // Garis aktual.
  const actualLinePoints = activeActual
    .map(point => `${getX(point.timestamp)},${getY(point.quantity)}`)
    .join(' ');

  // Garis prediksi.
  const predictedLinePoints = [
    ...(activeActual.length > 0 ? [activeActual[activeActual.length - 1]] : []),
    ...activePredicted,
  ]
    .map(point => `${getX(point.timestamp)},${getY(point.quantity)}`)
    .join(' ');

  // Area rentang prediksi.
  const predictionRangePoints = useMemo(() => {
    const hasRange = activePredicted.some(
      point =>
        point.lower !== undefined &&
        point.upper !== undefined &&
        point.lower !== point.upper,
    );

    if (!hasRange) {
      return '';
    }

    const upperPoints = activePredicted.map(point => {
      const upper = point.upper ?? point.quantity;
      return `${getX(point.timestamp)},${getY(upper)}`;
    });

    const lowerPoints = [...activePredicted].reverse().map(point => {
      const lower = point.lower ?? point.quantity;
      return `${getX(point.timestamp)},${getY(lower)}`;
    });

    return [...upperPoints, ...lowerPoints].join(' ');
  }, [activePredicted, plotWidth, maxValue, minTimestamp, timeRange]);

  // Apakah rentang prediksi tersedia.
  const hasPredictionRange = activePredicted.some(
    point =>
      point.lower !== undefined &&
      point.upper !== undefined &&
      point.lower !== point.upper,
  );

  //  Menentukan jumlah label X.
  const axisTickCount =
    chartMode === 'prediction' ? Math.min(activeData.length, 6) : 5;

  // Membuat tick X berdasarkan waktu.
  const xAxisTicks = useMemo(() => {
    if (axisTickCount <= 1) {
      return [minTimestamp];
    }

    return Array.from({ length: axisTickCount }, (_, index) => {
      return minTimestamp + (timeRange / (axisTickCount - 1)) * index;
    });
  }, [axisTickCount, minTimestamp, timeRange]);

  const showYear =
    new Date(minTimestamp).getFullYear() !==
    new Date(maxTimestamp).getFullYear();

  const findNearestPoint = (touchX: number) => {
    if (activeData.length === 0) {
      return null;
    }

    let nearestPoint = activeData[0];
    let nearestDistance = Math.abs(getX(activeData[0].timestamp) - touchX);
    activeData.forEach(point => {
      const distance = Math.abs(getX(point.timestamp) - touchX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = point;
      }
    });
    return nearestPoint;
  };

  const handleTouch = (event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    const nearestPoint = findNearestPoint(touchX);
    if (nearestPoint) {
      setSelectedPoint(nearestPoint);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          handleTouch(event);
        },
        onPanResponderMove: event => {
          handleTouch(event);
        },
        onPanResponderRelease: () => {},
      }),
    [activeData, plotWidth, minTimestamp, timeRange],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {/* <Text style={styles.title}>Aktual vs Prediksi</Text> */}
          <Text style={styles.subtitle}>
            {chartMode === 'overview'
              ? 'Perkembangan penjualan'
              : 'Fokus hasil prediksi'}
          </Text>
        </View>
      </View>

      {/* Tab Mode */}
      <View style={styles.modeContainer}>
        {/* Grafik Semua */}
        <Pressable
          onPress={() => setChartMode('overview')}
          style={[
            styles.modeButton,
            chartMode === 'overview' && styles.modeButtonActive,
          ]}
        >
          <Text
            style={[
              styles.modeText,
              chartMode === 'overview' && styles.modeTextActive,
            ]}
          >
            Grafik Tren
          </Text>
        </Pressable>

        {/* Grafik Prediksi */}
        <Pressable
          onPress={() => setChartMode('prediction')}
          style={[
            styles.modeButton,
            chartMode === 'prediction' && styles.modeButtonActive,
          ]}
        >
          <Text
            style={[
              styles.modeText,
              chartMode === 'prediction' && styles.modeTextActive,
            ]}
          >
            Fokus Prediksi
          </Text>
        </Pressable>
      </View>

      {/* Filter hanya untuk overview */}
      {chartMode === 'overview' && (
        <View style={styles.filterContainer}>
          {FILTERS.map(filter => {
            const isActive = selectedPeriod === filter.key;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setSelectedPeriod(filter.key)}
                style={[
                  styles.filterButton,
                  isActive && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Informasi per tanggal */}
      <View style={styles.tooltip}>
        <Text style={styles.tooltipTitle}>Informasi per tanggal</Text>
        {selectedPoint ? (
          <>
            <Text style={styles.tooltipDate}>
              {formatFullDate(selectedPoint.date)}
            </Text>
            {selectedPoint.type === 'actual' ? (
              <Text style={styles.tooltipValue}>
                Aktual: {selectedPoint.quantity} unit
              </Text>
            ) : (
              <>
                <Text style={styles.tooltipValue}>
                  Prediksi: {selectedPoint.quantity} unit{' '}
                </Text>
                {selectedPoint.lower !== undefined &&
                  selectedPoint.upper !== undefined && (
                    <Text style={styles.tooltipRange}>
                      Rentang: {selectedPoint.lower}–{selectedPoint.upper} unit
                    </Text>
                  )}
              </>
            )}
          </>
        ) : (
          <Text style={styles.tooltipPlaceholder}>
            Sentuh grafik untuk melihat informasi
          </Text>
        )}
      </View>

      {/* Chart */}
      <View
        style={styles.chartContainer}
        onLayout={event => {
          setChartWidth(event.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}
      >
        {chartWidth > 0 && (
          <Svg width="100%" height={height}>
            {/* Grid horizontal */}
            {Array.from({
              length: GRID_COUNT + 1,
            }).map((_, index) => {
              const value = (maxValue / GRID_COUNT) * (GRID_COUNT - index);
              const y = getY(value);
              return (
                <React.Fragment key={`grid-${index}`}>
                  <Line
                    x1={PADDING.left}
                    y1={y}
                    x2={chartWidth - PADDING.right}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />

                  <SvgText
                    x={PADDING.left - 8}
                    y={y + 4}
                    fontSize={10}
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
              x1={PADDING.left}
              y1={PADDING.top}
              x2={PADDING.left}
              y2={height - PADDING.bottom}
              stroke="#D1D5DB"
              strokeWidth={1}
            />

            {/* Sumbu X */}
            <Line
              x1={PADDING.left}
              y1={height - PADDING.bottom}
              x2={chartWidth - PADDING.right}
              y2={height - PADDING.bottom}
              stroke="#D1D5DB"
              strokeWidth={1}
            />

            {/* Area Rentang Prediksi */}
            {predictionRangePoints !== '' && (
              <Polygon
                points={predictionRangePoints}
                fill="#F59E0B"
                fillOpacity={0.14}
              />
            )}

            {/* Garis Aktual */}
            {activeActual.length > 1 && (
              <Polyline
                points={actualLinePoints}
                fill="none"
                stroke={Colors.primary}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Garis Prediksi */}
            {activePredicted.length > 0 && (
              <Polyline
                points={predictedLinePoints}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeDasharray="7,5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Titik Aktual */}
            {activeActual.map(point => (
              <Circle
                key={`actual-${point.date}`}
                cx={getX(point.timestamp)}
                cy={getY(point.quantity)}
                r={3}
                fill={Colors.primary}
              />
            ))}

            {/* Titik Prediksi */}
            {activePredicted.map(point => (
              <Circle
                key={`predicted-${point.date}`}
                cx={getX(point.timestamp)}
                cy={getY(point.quantity)}
                r={3}
                fill="#F59E0B"
              />
            ))}

            {/* Crosshair */}
            {selectedPoint && (
              <>
                <Line
                  x1={getX(selectedPoint.timestamp)}
                  y1={PADDING.top}
                  x2={getX(selectedPoint.timestamp)}
                  y2={height - PADDING.bottom}
                  stroke="#94A3B8"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />

                {/* Highlight selected point */}
                <Circle
                  cx={getX(selectedPoint.timestamp)}
                  cy={getY(selectedPoint.quantity)}
                  r={6}
                  fill="#FFFFFF"
                  stroke={
                    selectedPoint.type === 'actual' ? Colors.primary : '#F59E0B'
                  }
                  strokeWidth={2.5}
                />
              </>
            )}

            {/* Label X */}
            {xAxisTicks.map((timestamp, index) => (
              <SvgText
                key={`tick-${index}`}
                x={getX(timestamp)}
                y={height - 14}
                fontSize={9}
                fill={Colors.textSecondary}
                textAnchor="middle"
              >
                {formatAxisDate(timestamp, showYear)}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      {/* Hint */}
      <Text style={styles.touchHint}>
        Sentuh dan geser pada grafik untuk melihat detail
      </Text>

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
            <View style={styles.legendDash} />
            <View style={styles.legendDash} />
          </View>
          <Text style={styles.legendText}>Prediksi</Text>
        </View>
        {hasPredictionRange && (
          <View style={styles.legendItem}>
            <View style={styles.rangeLegend} />
            <Text style={styles.legendText}>Rentang Prediksi</Text>
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

  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  tooltip: {
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  tooltipTitle: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  tooltipDate: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  tooltipValue: {
    fontSize: 12,
    color: Colors.text,
  },
  tooltipRange: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tooltipPlaceholder: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  chartContainer: {
    width: '100%',
  },

  touchHint: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textSecondary,
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 14,
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
    borderRadius: 3,
  },

  legendDashed: {
    width: 20,
    flexDirection: 'row',
    gap: 4,
  },

  legendDash: {
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },

  rangeLegend: {
    width: 16,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
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
