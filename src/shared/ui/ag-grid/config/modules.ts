import { AllCommunityModule, type Module } from "ag-grid-community";
import { CellSelectionModule } from "ag-grid-enterprise";

export const DEFAULT_AG_GRID_MODULES: Module[] = [
  AllCommunityModule,
  CellSelectionModule,
];

export const mergeAgGridModules = (modules: Module[] = []) => {
  const moduleMap = new Map<string, Module>();

  for (const module of [...DEFAULT_AG_GRID_MODULES, ...modules]) {
    moduleMap.set(module.moduleName, module);
  }

  return [...moduleMap.values()];
};
