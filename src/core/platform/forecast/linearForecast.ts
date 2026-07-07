/**
 * Calixo Platform - Rule-Based Linear Forecast
 *
 * A simple linear-trend extrapolation over a real historical series —
 * explicitly NOT a trained model. Shared so Dashboard and Analytics (and
 * any future module) compute forecasts identically instead of each
 * re-deriving the same three-line formula.
 */

export interface ForecastPoint {
  label: string;
  projectedValue: number;
}

export function linearForecast(series: number[], steps: number): ForecastPoint[] {
  if (series.length < 2) return [];
  const n = series.length;
  const avgStep = (series[n - 1] - series[0]) / (n - 1);
  const last = series[n - 1];
  return Array.from({ length: steps }, (_, i) => ({
    label: `+${i + 1}d`,
    projectedValue: Math.max(0, Math.round(last + avgStep * (i + 1))),
  }));
}
