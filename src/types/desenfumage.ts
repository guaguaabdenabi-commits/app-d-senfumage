export type BuildingCategory = 'erp' | 'ert' | 'habitation' | 'icpe' | 'ps' | 'igh';

export type ERPType = 
  | 'M' // Magasins
  | 'L' // Spectacles, conférences
  | 'N' // Restaurants
  | 'O' // Hôtels
  | 'P' // Salles de jeux
  | 'R' // Enseignement
  | 'S' // Bibliothèques
  | 'T' // Expositions
  | 'U' // Établissements de soins
  | 'V' // Lieux de culte
  | 'W' // Bureaux, administrations
  | 'X' // Établissements sportifs
  | 'Y'; // Musées

export type ERPCategory = '1' | '2' | '3' | '4' | '5';

export type HabitationFamily = '1' | '2' | '3A' | '3B' | '4';

export type SpaceKind = 
  | 'local' // Local / Grande salle / Pièce
  | 'circulation' // Circulation horizontale encloisonnée
  | 'escalier' // Cage d'escalier encloisonnée
  | 'cellule_stockage' // Cellule d'entrepôt ICPE
  | 'parking_box'; // Parc de stationnement

export type DesenfumageMode = 'naturel' | 'mecanique' | 'surpression';

export interface DENFCStandardSize {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  cv: number; // Coefficient d'efficacité aéraulique moyen (0.55 à 0.70)
  avM2: number; // Surface géométrique = (W * H) / 10000
  sueM2: number; // Av * Cv
}

export interface RoomInput {
  id: string;
  name: string;
  buildingCategory: BuildingCategory;
  erpType?: ERPType;
  erpCategory?: ERPCategory;
  habitationFamily?: HabitationFamily;
  spaceKind: SpaceKind;
  
  // Dimensions
  area: number; // Surface en m²
  length: number; // Longueur en m
  width: number; // Largeur en m
  ceilingHeight: number; // Hauteur sous plafond H en m
  clearSmokeHeight?: number; // Hauteur libre de fumée H' en m (défaut: 1.80m ou H/2)
  
  // Paramètres spécifiques
  mode: DesenfumageMode;
  isBasement: boolean; // Local en sous-sol
  isBlind: boolean; // Local aveugle (sans fenêtres)
  isSleepingRoom?: boolean; // Locaux à sommeil
  
  // Parking
  vehicleCount?: number;
  
  // DENFC choisi pour le dimensionnement
  selectedDENFCId: string;
  customDENFC?: {
    sueM2: number;
    name: string;
  };
}

export interface CantonmentInfo {
  required: boolean;
  cantonCount: number;
  maxAreaPerCanton: number;
  screenDepthM: number; // Retombée de l'écran de cantonnement
  smokeLayerThicknessM: number; // Épaisseur de la couche de fumée E = H - H'
  clearHeightM: number; // Hauteur libre H'
  explanation: string;
}

export interface CalculationResult {
  isSubjectToDesenfumage: boolean;
  subjectReason: string;
  regulatoryText: string;
  mode: DesenfumageMode;
  
  // Cantonnement
  cantonment: CantonmentInfo;
  
  // Désenfumage Naturel
  natural: {
    sueTotalM2: number; // Surface Utile d'Évacuation totale
    suePerCantonM2: number; // SUE par canton
    ruleUsed: string; // ex: "1/200ème de la surface", "1% Code du Travail", "2% ICPE"
    denfcCountTotal: number; // Nombre total d'exutoires
    denfcCountPerCanton: number; // Nombre par canton
    selectedDENFC: DENFCStandardSize;
    airInletGeometricAreaM2: number; // Surface libre d'amenée d'air requise (m²)
    spacingRules: string[];
  };
  
  // Désenfumage Mécanique
  mechanical: {
    extractionFlowRateM3h: number; // Débit total en m³/h
    extractionFlowRateM3s: number; // Débit en m³/s
    extractionFlowRatePerCantonM3h: number;
    ruleUsed: string; // ex: "1 m³/s pour 100 m² (IT 246)", "0.5 m³/s par tronçon"
    airInletFlowRateM3h: number; // Débit amenée d'air (0.6 x Débit extraction)
    airInletFlowRateM3s: number;
    
    // Dimensionnement aéraulique indicatif (vitesse maxi)
    extractionDuctMinSectionM2: number; // À 5 m/s max
    extractionDuctMinSectionDm2: number;
    suggestedExtractionGrilleCount: number;
    airInletMinSectionM2: number; // À 2 m/s max (ou 5 m/s)
    airInletMinSectionDm2: number;
    
    fanSpecifications: {
      fireRating: string; // ex: "F400 120 (400°C / 2h)"
      comfortOverheat: boolean;
      interlocks: string[];
    };
  };
  
  // Surpression (pour escalier / sas)
  overpressure?: {
    differentialPressureRangePa: string; // "20 à 80 Pa"
    airSpeedOpenDoorMs: number; // 0.5 m/s
    recommendations: string[];
  };
  
  // Avertissements & Recommandations
  notes: string[];
  warnings: string[];
}

export interface ProjectData {
  id: string;
  name: string;
  buildingName: string;
  buildingCategory: BuildingCategory;
  erpType: ERPType;
  erpCategory: ERPCategory;
  habitationFamily: HabitationFamily;
  address: string;
  author: string;
  date: string;
  rooms: RoomInput[];
}
