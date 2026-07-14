import { AllCommunityModule, type Module } from "ag-grid-community";
import { CellSelectionModule } from "ag-grid-enterprise";

// 대부분의 목록 화면에서 사용하는 기본 모듈만 등록한다. TreeDataModule은 필요한 화면에서만 추가한다.
export const DEFAULT_AG_GRID_MODULES: Module[] = [
  AllCommunityModule,
  CellSelectionModule,
];

// 화면별 modules를 합치되 같은 moduleName은 한 번만 전달한다.
export const mergeAgGridModules = (modules: Module[] = []) => {
  const moduleMap = new Map<string, Module>();

  for (const module of [...DEFAULT_AG_GRID_MODULES, ...modules]) {
    moduleMap.set(module.moduleName, module);
  }

  return [...moduleMap.values()];
};
