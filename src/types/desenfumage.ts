export type BuildingCategory = 'erp' | 'ert' | 'habitation' | 'icpe' | 'ps' | 'igh';

export type ERPType = 
  | 'M' | 'L' | 'N' | 'O' | 'P' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y';

export type ERPCategory = '1' | '2' | '3' | '4' | '5';

export type HabitationFamily = '1' | '2' | '3A' | '3B' | '4';

export type SpaceKind = 
  | 'local'
  | 'circulation'
  | 'escalier'
  | 'cellule_stockage'
  | 'parking_box';

export type DesenfumageMode = 'naturel' | 'mecanique' | 'surpression';

export interface DENFCStandardSize {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  cv: number;
  avM2: number;
  sueM2: number;
}

export interface RoomInput {
  id: string;
  name: string;
  buildingCategory: BuildingCategory;
  erpType?: ERPType;
  erpCategory?: ERPCategory;
  habitationFamily?: HabitationFamily;
  spaceKind: SpaceKind;
  area: number;
  length: number;
  width: number;
  ceilingHeight: number;
  clearSmokeHeight?: number;
  mode: DesenfumageMode;
  isBasement: boolean;
  isBlind: boolean;
  isSleepingRoom?: boolean;
  vehicleCount?: number;
  selectedDENFCId: string;
  customDENFC?: {
    sueM2: number;
    name: string;
  };
  // NOUVEAU : Vitesses aérauliques personnalisables
  velocityExtractionDuct?: number;
  velocityExtractionGrille?: number;
  velocityInletDuct?: number;
  velocityInletGrille?: number;
}

export interface CantonmentInfo {
  required: boolean;
  cantonCount: number;
  maxAreaPerCanton: number;
  screenDepthM: number;
  smokeLayerThicknessM: number;
  clearHeightM: number;
  explanation: string;
}

export interface CalculationResult {
  isSubjectToDesenfumage: boolean;
  subjectReason: string;
  regulatoryText: string;
  mode: DesenfumageMode;
  cantonment: CantonmentInfo;
  natural: {
    sueTotalM2: number;
    suePerCantonM2: number;
    ruleUsed: string;
    denfcCountTotal: number;
    denfcCountPerCanton: number;
    selectedDENFC: DENFCStandardSize;
    airInletGeometricAreaM2: number;
    spacingRules: string[];
  };
  mechanical: {
    extractionFlowRateM3h: number;
    extractionFlowRateM3s: number;
    extractionFlowRatePerCantonM3h: number;
    ruleUsed: string;
    airInletFlowRateM3h: number;
    airInletFlowRateM3s: number;
    
    // Dimensionnement aéraulique avec les vitesses choisies
    extractionDuctMinSectionM2: number;
    extractionDuctMinSectionDm2: number;
    extractionGrilleMinSectionM2: number;
    extractionGrilleMinSectionDm2: number;
    suggestedExtractionGrilleCount: number;
    
    airInletDuctMinSectionM2: number;
    airInletDuctMinSectionDm2: number;
    airInletGrilleMinSectionM2: number;
    airInletGrilleMinSectionDm2: number;
    
    // NOUVEAU : Vitesses réellement utilisées pour l'affichage
    velocitiesUsed: {
      extractionDuct: number;
      extractionGrille: number;
      inletDuct: number;
      inletGrille: number;
    };
    
    fanSpecifications: {
      fireRating: string;
      comfortOverheat: boolean;
      interlocks: string[];
    };
  };
  overpressure?: {
    differentialPressureRangePa: string;
    airSpeedOpenDoorMs: number;
    recommendations: string[];
  };
  notes: string[];
  warnings: string[];
}
