"use client";

/**
 * Calixo Reports Center - report builder pipeline state.
 * The only place allowed to call ReportBuilder and VisualizationEngine —
 * components pass plain data in and receive plain data back.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { ReportBuilder, reportRegistry, visualizationEngine } from "@/core/reports";
import type {
  ReportBuilderSaveInput,
  ReportBuilderStage,
  ReportCategory,
  ReportDefinition,
  ReportDimension,
  ReportFilter,
  ReportLayout,
  ReportMetric,
  ReportWidget,
  WidgetType,
} from "@/core/reports";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";

export function useReportBuilder() {
  const builderRef = useRef(new ReportBuilder());
  const [stage, setStage] = useState<ReportBuilderStage>("data");
  const [module, setModule] = useState<ModuleCategory | undefined>(undefined);
  const [category, setCategory] = useState<ReportCategory | undefined>(undefined);
  const [dimensions, setDimensions] = useState<ReportDimension[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [filters, setFiltersState] = useState<ReportFilter[]>([]);
  const [widgets, setWidgetsState] = useState<ReportWidget[]>([]);
  const [layout, setLayoutState] = useState<ReportLayout | undefined>(undefined);
  const [exportOptions, setExportOptionsState] = useState<{ supportedExports: ReportDefinition["supportedExports"]; supportedSchedules: ReportDefinition["supportedSchedules"] }>({
    supportedExports: [],
    supportedSchedules: [],
  });

  const selectData = useCallback((input: { module: ModuleCategory; category: ReportCategory; dimensions?: ReportDimension[] }) => {
    builderRef.current.selectData(input);
    setModule(input.module);
    setCategory(input.category);
    setDimensions(input.dimensions ?? []);
    setStage(builderRef.current.getStage());
  }, []);

  const selectMetrics = useCallback((next: ReportMetric[]) => {
    builderRef.current.selectMetrics(next);
    setMetrics(next);
    setStage(builderRef.current.getStage());
  }, []);

  const applyFilters = useCallback((next: ReportFilter[]) => {
    builderRef.current.setFilters(next);
    setFiltersState(next);
    setStage(builderRef.current.getStage());
  }, []);

  const applyVisualization = useCallback((next: ReportWidget[]) => {
    builderRef.current.setVisualization(next);
    setWidgetsState(next);
    setStage(builderRef.current.getStage());
  }, []);

  const applyLayout = useCallback((next: ReportLayout) => {
    builderRef.current.setLayout(next);
    setLayoutState(next);
    setStage(builderRef.current.getStage());
  }, []);

  const applyExportOptions = useCallback((next: { supportedExports: ReportDefinition["supportedExports"]; supportedSchedules?: ReportDefinition["supportedSchedules"] }) => {
    builderRef.current.setExportOptions(next);
    setExportOptionsState({ supportedExports: next.supportedExports, supportedSchedules: next.supportedSchedules ?? [] });
    setStage(builderRef.current.getStage());
  }, []);

  const reset = useCallback(() => {
    builderRef.current = new ReportBuilder();
    setStage("data");
    setModule(undefined);
    setCategory(undefined);
    setDimensions([]);
    setMetrics([]);
    setFiltersState([]);
    setWidgetsState([]);
    setLayoutState(undefined);
    setExportOptionsState({ supportedExports: [], supportedSchedules: [] });
  }, []);

  const save = useCallback(
    (input: ReportBuilderSaveInput): ReportDefinition => {
      const report = builderRef.current.save(input);
      reportRegistry.register(report);
      reset();
      return report;
    },
    [reset]
  );

  const widgetTypes = useMemo(() => visualizationEngine.getSupportedWidgetTypes(), []);

  const createWidget = useCallback(
    (params: { type: WidgetType; title: string; metricIds?: string[]; dimensionIds?: string[] }) => visualizationEngine.createWidget(params),
    []
  );

  const validateWidget = useCallback((widget: ReportWidget) => visualizationEngine.validateWidget(widget, { metrics, dimensions }), [metrics, dimensions]);

  const draftPreview: Partial<ReportDefinition> = useMemo(
    () => ({
      module,
      category,
      dimensions,
      metrics,
      filters,
      widgets,
      defaultLayout: layout,
      supportedExports: exportOptions.supportedExports,
      supportedSchedules: exportOptions.supportedSchedules,
    }),
    [module, category, dimensions, metrics, filters, widgets, layout, exportOptions]
  );

  return {
    stage,
    draftPreview,
    selectData,
    selectMetrics,
    applyFilters,
    applyVisualization,
    applyLayout,
    applyExportOptions,
    save,
    reset,
    widgetTypes,
    createWidget,
    validateWidget,
  };
}

export type UseReportBuilderResult = ReturnType<typeof useReportBuilder>;
