"use client";

import { useSyncExternalStore } from "react";
import type { MetricSelectionState, MetricSelectionStore } from "../state/metric-selection-contract";

export function useMetricSelection(store: MetricSelectionStore): MetricSelectionState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
