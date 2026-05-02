import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { G, Line, Path, Svg, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/design';

interface DayData {
  x: string;
  y: number;
}

interface SpendingBarChartProps {
  data: DayData[];
}

const CHART_W = Dimensions.get('window').width - 72;
const CHART_H = 150;
const PAD = { top: 8, bottom: 28, left: 20, right: 9 };
const BAR_W = 26;
const BAR_R = 4;
const DOM_PAD = 18;
const Y_FACTOR = 1.25;
const TICK_COUNT = 4;

function formatY(v: number): string {
  const r = Math.round(v);
  if (r === 0) return '';
  if (r >= 1000) return `${(r / 1000).toFixed(0)}k`;
  return `${r}`;
}

function roundedTopBar(x: number, y: number, w: number, h: number, r: number): string {
  if (h <= 0) return '';
  const cr = Math.min(r, h, w / 2);
  return `M ${x},${y + h} L ${x},${y + cr} Q ${x},${y} ${x + cr},${y} L ${x + w - cr},${y} Q ${x + w},${y} ${x + w},${y + cr} L ${x + w},${y + h} Z`;
}

export function SpendingBarChart({ data }: SpendingBarChartProps) {
  const total = data.reduce((s, d) => s + d.y, 0);
  const hasData = total > 0;

  const weekTotal = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;
  const n = data.length;
  const spacing = n > 0 ? (plotW - DOM_PAD * 2) / n : plotW;
  const yMax = hasData ? Math.max(...data.map((d) => d.y)) * Y_FACTOR : 100;
  const toY = (v: number) => plotH - (v / yMax) * plotH;
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => yMax * ((i + 1) / TICK_COUNT));

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>Total nos últimos 7 dias</Text>
        <Text style={[styles.total, !hasData && styles.empty]}>
          {hasData ? weekTotal : 'Sem gastos'}
        </Text>
      </View>

      <Svg width={CHART_W} height={CHART_H}>
        <G x={PAD.left} y={PAD.top}>
          {ticks.map((tick, i) => (
            <G key={i}>
              <Line
                x1={0} y1={toY(tick)}
                x2={plotW} y2={toY(tick)}
                stroke={Colors.bdr2}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <SvgText
                x={-4} y={toY(tick) + 3}
                fontSize={8}
                fill={Colors.t3}
                textAnchor="end"
              >
                {formatY(tick)}
              </SvgText>
            </G>
          ))}

          <Line
            x1={0} y1={plotH}
            x2={plotW} y2={plotH}
            stroke={Colors.bdr}
            strokeWidth={1}
          />

          {data.map((d, i) => {
            const cx = DOM_PAD + i * spacing + spacing / 2;
            const bh = (d.y / yMax) * plotH;
            const isToday = d.x === 'Hoje';

            return (
              <G key={i}>
                {bh > 0 && (
                  <Path
                    d={roundedTopBar(cx - BAR_W / 2, toY(d.y), BAR_W, bh, BAR_R)}
                    fill={Colors.expense}
                    fillOpacity={isToday ? 1 : 0.35}
                  />
                )}
                <SvgText
                  x={cx} y={plotH + 16}
                  fontSize={9}
                  fill={isToday ? Colors.t1 : Colors.t2}
                  fontWeight={isToday ? '600' : '400'}
                  textAnchor="middle"
                >
                  {d.x}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#000',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.expense,
  },
  empty: {
    color: '#d1d1d1',
    fontWeight: '500',
    fontSize: 13,
  },
});
