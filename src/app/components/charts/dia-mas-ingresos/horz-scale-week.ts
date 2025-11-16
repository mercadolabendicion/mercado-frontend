import {
  IHorzScaleBehavior,
  ChartOptionsImpl,
  DataItem,
  HorzScaleItemConverterToInternalObj,
  InternalHorzScaleItem,
  InternalHorzScaleItemKey,
  TickMark,
  TimeMark,
  TimeScalePoint,
  Mutable,
  TickMarkWeightValue,
} from 'lightweight-charts';

/**
 * Horizontal scale item type: numeroDia (1..7 representing days of the week)
 */
export type HorzWeekItem = number;

/**
 * Custom horizontal scale behavior for displaying days of the week (Lunes, Martes, etc.)
 * Implements IHorzScaleBehavior to support non-time horizontal scales.
 *
 * @example
 * const horzBehavior = new HorzScaleBehaviorWeek();
 * const chart = createChartEx(container, horzBehavior, chartOptions);
 */
export class HorzScaleBehaviorWeek implements IHorzScaleBehavior<HorzWeekItem> {
  private _options!: ChartOptionsImpl<HorzWeekItem>;

  // Days of the week in Spanish (index 0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  private readonly DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  public options(): ChartOptionsImpl<HorzWeekItem> {
    return this._options;
  }

  public setOptions(options: ChartOptionsImpl<HorzWeekItem>): void {
    this._options = options;
  }

  /**
   * Preprocess data before it's used by the chart (not needed for this simple case)
   */
  public preprocessData(_data: DataItem<HorzWeekItem> | DataItem<HorzWeekItem>[]): void {}

  /**
   * Update formatter based on localization options (not needed for this simple case)
   */
  public updateFormatter(_options: any): void {}

  /**
   * Create converter function that transforms series data items to internal items
   * In this case, we just pass through the numeroDia value as-is
   */
  public createConverterToInternalObj(): HorzScaleItemConverterToInternalObj<HorzWeekItem> {
    return (value: HorzWeekItem) => value as unknown as InternalHorzScaleItem;
  }

  /**
   * Return a unique key for a given horizontal scale item
   */
  public key(internalItem: InternalHorzScaleItem | HorzWeekItem): InternalHorzScaleItemKey {
    return internalItem as unknown as InternalHorzScaleItemKey;
  }

  /**
   * Return cache key for internal item (numeric key for caching)
   */
  public cacheKey(internalItem: InternalHorzScaleItem): number {
    return (internalItem as unknown) as number;
  }

  /**
   * Convert horizontal scale item to internal item
   */
  public convertHorzItemToInternal(item: HorzWeekItem): InternalHorzScaleItem {
    return item as unknown as InternalHorzScaleItem;
  }

  /**
   * Format horizontal scale item as display string
   */
  public formatHorzItem(item: InternalHorzScaleItem): string {
    const n = (item as unknown) as number;
    return this.numeroDiaToLabel(n);
  }

  /**
   * Format tick mark as display string (shown on the axis)
   */
  public formatTickmark(item: TickMark, _localizationOptions: any): string {
    const n = (item.time as unknown) as number;
    return this.numeroDiaToLabel(n);
  }

  /**
   * Return maximum weight for tick marks (affects display prominence)
   */
  public maxTickMarkWeight(_marks: TimeMark[]): TickMarkWeightValue {
    return 8 as TickMarkWeightValue;
  }

  /**
   * Assign weights to sorted time points (for 7 items, default behavior is fine)
   */
  public fillWeightsForPoints(_sortedTimePoints: readonly Mutable<TimeScalePoint>[], _startIndex: number): void {}

  /**
   * Helper: Convert numeroDia (1..7) to day name
   * @param numeroDia - Day number (1 = Domingo, 2 = Lunes, ..., 7 = Sábado)
   * @returns Localized day name
   */
  private numeroDiaToLabel(numeroDia?: number): string {
    if (!numeroDia || numeroDia < 1 || numeroDia > 7) return '';
    // numeroDia is 1-indexed, array is 0-indexed
    return this.DIAS_SEMANA[numeroDia - 1];
  }
}