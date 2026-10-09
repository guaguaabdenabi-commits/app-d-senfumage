import { RoomInput, CalculationResult } from '../types/desenfumage';

export function calculateRoomDesenfumage(room: RoomInput): CalculationResult {
  const { area, length, width, ceilingHeight, clearSmokeHeight, spaceKind, isBlind, isBasement } = room;

  // ==========================================
  // 1. ASSUJETTISSEMENT (CORRECTIF FATAL APPLIQUÉ)
  // ==========================================
  let isRequired = false;
  let requirementReason = "Non requis selon les paramètres géométriques.";

  if (spaceKind === 'local') {
    if (area >= 300) {
      isRequired = true;
      requirementReason = `Surface (${area} m²) ≥ 300 m² (Règle IT 246 / Art. DF 7).`;
    } else if ((isBlind || isBasement) && area >= 100) {
      isRequired = true;
      requirementReason = `Local aveugle ou en sous-sol avec surface (${area} m²) ≥ 100 m².`;
    }
  } else if (spaceKind === 'circulation') {
    if (length >= 30) {
      isRequired = true;
      requirementReason = `Circulation de longueur (${length} m) ≥ 30 m.`;
    } else if (isBlind || isBasement) {
      isRequired = true;
      requirementReason = "Circulation aveugle ou en sous-sol.";
    }
  } else if (spaceKind === 'escalier') {
    isRequired = true;
    requirementReason = "Cage d'escalier encloisonnée (désenfumage toujours requis).";
  } else if (spaceKind === 'cellule_stockage') {
    isRequired = true;
    requirementReason = "Cellule d'entrepôt ICPE 1510 (désenfumage requis).";
  } else if (spaceKind === 'parking_box') {
    isRequired = true;
    requirementReason = "Parc de stationnement couvert (désenfumage requis).";
  }

  // ==========================================
  // 2. CANTONNEMENT (IT 246)
  // ==========================================
  const cantonRequired = area > 2000 || length > 60;
  const maxCantonAreaM2 = 1600;
  
  // Nombre de cantons
  let cantonCount = 1;
  if (cantonRequired) {
    cantonCount = Math.max(Math.ceil(area / maxCantonAreaM2), Math.ceil(length / 60));
  }

  // Hauteur libre de fumée (H')
  let clearH = Math.max(clearSmokeHeight, 1.8, ceilingHeight * 0.5);
  if (clearH >= ceilingHeight) clearH = ceilingHeight * 0.5;
  
  const smokeE = ceilingHeight - clearH;
  const screenDepthM = Math.max(smokeE, ceilingHeight * 0.25); // Minimum 25% de la hauteur

  // ==========================================
  // 3. CALCULS NATUREL
  // ==========================================
  // SUE = S / 200 (Cas le plus courant)
  const requiredSUE = area / 200;
  const suePerDenfc = 1.31; // Valeur moyenne standard (ex: 140x140)
  const denfcCountTotal = Math.max(1, Math.ceil(requiredSUE / suePerDenfc));
  
  // ==========================================
  // 4. CALCULS MÉCANIQUE
  // ==========================================
  // Débit = 1 m3/s pour 100m2 (mini 1.5 m3/s)
  let flowRateM3S = Math.max(1.5, area / 100);
  
  // Cas particulier Parking
  if (spaceKind === 'parking_box') {
    flowRateM3S = (600 * area) / 3600; // 600 m3/h par véhicule (simplifié à la surface)
  }

  const totalExtractionFlowRateM3H = flowRateM3S * 3600;
  const airInletGrilleMinSectionM2 = flowRateM3S / 5; // Vitesse < 5 m/s

  // Implantation Géométrique minimale (règle des 30m max d'espacement)
  const requiredCols = Math.ceil(length / 30);
  const requiredRows = Math.ceil(width / 30);
  const minRequiredGeometricPoints = requiredCols * requiredRows;

  return {
    isRequired,
    requirementReason,
    cantonment: {
      required: cantonRequired,
      cantonCount,
      maxCantonAreaM2,
      screenDepthM,
      clearHeightM: clearH
    },
    natural: {
      requiredSUE,
      denfcCountTotal,
      airInletGeometricAreaM2: requiredSUE
    },
    mechanical: {
      totalExtractionFlowRateM3H,
      totalExtractionFlowRateM3S: flowRateM3S,
      airInletGrilleMinSectionM2,
      suggestedExtractionGrilleCount: minRequiredGeometricPoints,
      totalAirInletFlowRateM3H: totalExtractionFlowRateM3H
    }
  };
}
