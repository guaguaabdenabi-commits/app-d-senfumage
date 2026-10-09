import { RoomInput, CalculationResult, CantonmentInfo, DENFCStandardSize } from '../types/desenfumage';
import { STANDARD_DENFC_CATALOG, BUILDING_CATEGORIES_INFO } from '../constants/regulations';

export function calculateRoomDesenfumage(room: RoomInput): CalculationResult {
  const {
    area, length, width, ceilingHeight, spaceKind, buildingCategory,
    isBasement, isBlind, mode, vehicleCount, selectedDENFCId, customDENFC,
  } = room;

  let isSubject = false;
  let subjectReason = '';
  let regulatoryText = BUILDING_CATEGORIES_INFO[buildingCategory]?.regulatoryReference || 'Réglementation Sécurité Incendie';

  switch (buildingCategory) {
    case 'erp':
      if (spaceKind === 'escalier') {
        isSubject = true; subjectReason = 'Les escaliers encloisonnés en ERP doivent obligatoirement être désenfumés.'; regulatoryText = 'Arrêté du 25 juin 1980';
      } else if (spaceKind === 'circulation') {
        isSubject = length > 30 || isBasement || Boolean(room.isSleepingRoom); subjectReason = isSubject ? 'Circulation > 30 m, en sous-sol ou locaux à sommeil.' : 'Circulation ≤ 30 m hors sous-sol.'; regulatoryText = 'IT 246';
      } else {
        if (isBasement && area > 100) { isSubject = true; subjectReason = 'Local en sous-sol > 100 m².'; } 
        else if (isBlind && area > 100) { isSubject = true; subjectReason = 'Local aveugle > 100 m².'; } 
        else if (area > 300) { isSubject = true; subjectReason = 'Local > 300 m².'; } 
        else { isSubject = false; subjectReason = 'Surface ≤ 300 m² non aveugle et hors sous-sol.'; }
        regulatoryText = 'IT 246 § 3';
      }
      break;
    case 'ert':
      if (spaceKind === 'escalier') { isSubject = true; subjectReason = 'Escalier encloisonné (Art. R. 4216-14).'; regulatoryText = 'Code du Travail'; } 
      else if (spaceKind === 'circulation') { isSubject = length > 30 || isBasement; subjectReason = isSubject ? 'Circulation > 30 m ou sous-sol.' : 'Circulation ≤ 30 m.'; regulatoryText = 'Code du Travail'; } 
      else {
        if (isBasement && area > 100) { isSubject = true; subjectReason = 'Local sous-sol > 100 m².'; } 
        else if (isBlind && area > 100) { isSubject = true; subjectReason = 'Local aveugle > 100 m².'; } 
        else if (area > 300) { isSubject = true; subjectReason = 'Local > 300 m².'; } 
        else { isSubject = false; subjectReason = 'Local ≤ 300 m² non aveugle.'; }
        regulatoryText = 'Code du Travail';
      }
      break;
    case 'habitation':
      if (spaceKind === 'escalier') { isSubject = true; subjectReason = 'Escalier encloisonné.'; regulatoryText = 'Arrêté du 31 janvier 1986'; } 
      else if (spaceKind === 'circulation') { isSubject = room.habitationFamily === '3B' || room.habitationFamily === '4'; subjectReason = isSubject ? 'Circulation 3e famille B ou 4e famille.' : 'Non obligatoire en 1ère/2ème famille.'; regulatoryText = 'Arrêté 31 janvier 1986'; } 
      else { isSubject = area > 300; subjectReason = isSubject ? 'Local > 300 m².' : 'Non assujetti.'; regulatoryText = 'Arrêté 31 janvier 1986'; }
      break;
    case 'icpe': isSubject = true; subjectReason = 'Cellule d\'entrepôt ICPE.'; regulatoryText = 'ICPE 1510'; break;
    case 'ps': isSubject = true; subjectReason = 'Parc de stationnement couvert.'; regulatoryText = 'Arrêté du 9 mai 2006'; break;
    case 'igh': isSubject = true; subjectReason = 'Immeuble de Grande Hauteur.'; regulatoryText = 'Règlement IGH'; break;
  }

  const maxCantonArea = 1600; const maxCantonLength = 60;
  const needsCantonment = (area > maxCantonArea || length > maxCantonLength || width > maxCantonLength) && spaceKind === 'local';
  let cantonCount = 1;
  if (needsCantonment) cantonCount = Math.max(Math.ceil(area / maxCantonArea), Math.ceil(length / maxCantonLength) * Math.ceil(width / maxCantonLength), 2);
  const cantonArea = area / cantonCount;

  const clearHeightM = room.clearSmokeHeight && room.clearSmokeHeight > 0 ? room.clearSmokeHeight : Math.max(1.80, ceilingHeight / 2);
  const smokeLayerThicknessM = Math.max(0.5, ceilingHeight - clearHeightM);
  const screenDepthM = Math.max(0.5, ceilingHeight * 0.25, smokeLayerThicknessM);

  const cantonmentInfo: CantonmentInfo = { required: needsCantonment, cantonCount, maxAreaPerCanton: cantonArea, screenDepthM: Number(screenDepthM.toFixed(2)), smokeLayerThicknessM: Number(smokeLayerThicknessM.toFixed(2)), clearHeightM: Number(clearHeightM.toFixed(2)), explanation: needsCantonment ? `Découpage requis en ${cantonCount} cantons.` : `Canton unique.` };

  let selectedDENFC: DENFCStandardSize = STANDARD_DENFC_CATALOG[1];
  if (customDENFC && customDENFC.sueM2 > 0) {
    selectedDENFC = { id: 'custom', name: customDENFC.name || 'DENFC Personnalisé', widthCm: 100, heightCm: 100, cv: 0.65, avM2: Number((customDENFC.sueM2 / 0.65).toFixed(2)), sueM2: customDENFC.sueM2 };
  } else {
    const found = STANDARD_DENFC_CATALOG.find((d) => d.id === selectedDENFCId); if (found) selectedDENFC = found;
  }

  let naturalSueTotalM2 = 0, naturalSuePerCantonM2 = 0, naturalAirInletGeometricAreaM2 = 0, naturalRuleUsed = ''; const naturalSpacingRules: string[] = [];
  if (spaceKind === 'escalier') { naturalSueTotalM2 = 1.0; naturalRuleUsed = 'SGO ≥ 1 m² en partie haute.'; naturalAirInletGeometricAreaM2 = 1.0; } 
  else if (spaceKind === 'circulation') { naturalSueTotalM2 = Math.max(area * 0.01, Math.max(1, Math.ceil(length / 30)) * 0.10); naturalRuleUsed = `10 dm² par tronçon de 30m.`; naturalAirInletGeometricAreaM2 = naturalSueTotalM2; } 
  else if (spaceKind === 'cellule_stockage' || buildingCategory === 'icpe') { naturalSueTotalM2 = area * 0.02; naturalRuleUsed = 'SUE ≥ 2% de la surface.'; naturalAirInletGeometricAreaM2 = naturalSueTotalM2 / cantonCount; } 
  else if (buildingCategory === 'ert') { naturalSueTotalM2 = area <= 1000 ? area * 0.01 : area * 0.005; naturalRuleUsed = area <= 1000 ? 'SUE ≥ 1% (S ≤ 1000 m²)' : 'SUE ≥ 0.5% (IT 246)'; naturalAirInletGeometricAreaM2 = naturalSueTotalM2 / cantonCount; } 
  else if (buildingCategory === 'ps') { naturalSueTotalM2 = Math.max((vehicleCount || 0) * 0.06, area * 0.005); naturalRuleUsed = '6 m² / 100 véhicules ou 0,5%.'; naturalAirInletGeometricAreaM2 = naturalSueTotalM2; } 
  else { naturalSueTotalM2 = area / 200; naturalRuleUsed = 'Règle du 1/200ème (0,5%).'; naturalAirInletGeometricAreaM2 = naturalSueTotalM2 / cantonCount; }
  naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
  
  let denfcCountPerCanton = Math.ceil(naturalSuePerCantonM2 / selectedDENFC.sueM2);
  if (spaceKind === 'local' && cantonArea > 250) denfcCountPerCanton = Math.max(denfcCountPerCanton, Math.ceil(cantonArea / 250));
  if (denfcCountPerCanton < 1 && isSubject) denfcCountPerCanton = 1;

  let extractionFlowRateM3s = 0; let mechanicalRuleUsed = '';
  if (spaceKind === 'escalier') { extractionFlowRateM3s = 0; mechanicalRuleUsed = 'Interdit en escalier.'; } 
  else if (spaceKind === 'circulation') { extractionFlowRateM3s = Math.max(1, Math.ceil(length / 30)) * 0.5; mechanicalRuleUsed = `0,5 m³/s par tronçon de 30 m.`; } 
  else if (buildingCategory === 'ps') { extractionFlowRateM3s = ((vehicleCount || Math.max(10, Math.round(area / 25))) * 600) / 3600; mechanicalRuleUsed = `600 m³/h par véhicule.`; } 
  else { extractionFlowRateM3s = Math.max(1.5, (area / 100) * 1.0); mechanicalRuleUsed = `1 m³/s par 100 m² (mini 1,5 m³/s).`; }

  const extractionFlowRateM3h = extractionFlowRateM3s * 3600;
  const airInletFlowRateM3s = extractionFlowRateM3s * 0.6;
  const airInletFlowRateM3h = airInletFlowRateM3s * 3600;

  // NOUVEAU : Récupération des vitesses G.P-T (ou valeurs par défaut)
  const vExtDuct = room.velocityExtractionDuct || 12;
  const vExtGrille = room.velocityExtractionGrille || 5;
  const vInDuct = room.velocityInletDuct || 10;
  const vInGrille = room.velocityInletGrille || 5;

  const extractionDuctMinSectionM2 = extractionFlowRateM3s > 0 ? extractionFlowRateM3s / vExtDuct : 0;
  const extractionGrilleMinSectionM2 = extractionFlowRateM3s > 0 ? extractionFlowRateM3s / vExtGrille : 0;
  const suggestedExtractionGrilleCount = Math.max(1, Math.ceil(extractionGrilleMinSectionM2 / 0.25));

  const airInletDuctMinSectionM2 = airInletFlowRateM3s > 0 ? airInletFlowRateM3s / vInDuct : 0;
  const airInletGrilleMinSectionM2 = airInletFlowRateM3s > 0 ? airInletFlowRateM3s / vInGrille : 0;

  const notes: string[] = []; const warnings: string[] = [];
  if (!isSubject) notes.push('Local non soumis au désenfumage obligatoire.');
  if (ceilingHeight < 2.5 && spaceKind === 'local') warnings.push('Hauteur sous plafond faible.');
  if (mode === 'mecanique' && spaceKind === 'escalier') warnings.push('INTERDICTION : Extraction mécanique interdite en escalier.');

  return {
    isSubjectToDesenfumage: isSubject, subjectReason, regulatoryText, mode, cantonment: cantonmentInfo,
    natural: {
      sueTotalM2: Number(naturalSueTotalM2.toFixed(3)), suePerCantonM2: Number(naturalSuePerCantonM2.toFixed(3)),
      ruleUsed: naturalRuleUsed, denfcCountTotal: denfcCountPerCanton * cantonCount, denfcCountPerCanton,
      selectedDENFC, airInletGeometricAreaM2: Number(naturalAirInletGeometricAreaM2.toFixed(2)), spacingRules: naturalSpacingRules,
    },
    mechanical: {
      extractionFlowRateM3h: Math.round(extractionFlowRateM3h), extractionFlowRateM3s: Number(extractionFlowRateM3s.toFixed(2)),
      extractionFlowRatePerCantonM3h: Math.round(extractionFlowRateM3h / cantonCount), ruleUsed: mechanicalRuleUsed,
      airInletFlowRateM3h: Math.round(airInletFlowRateM3h), airInletFlowRateM3s: Number(airInletFlowRateM3s.toFixed(2)),
      
      extractionDuctMinSectionM2: Number(extractionDuctMinSectionM2.toFixed(3)),
      extractionDuctMinSectionDm2: Number((extractionDuctMinSectionM2 * 100).toFixed(1)),
      extractionGrilleMinSectionM2: Number(extractionGrilleMinSectionM2.toFixed(3)),
      extractionGrilleMinSectionDm2: Number((extractionGrilleMinSectionM2 * 100).toFixed(1)),
      suggestedExtractionGrilleCount,
      
      airInletDuctMinSectionM2: Number(airInletDuctMinSectionM2.toFixed(3)),
      airInletDuctMinSectionDm2: Number((airInletDuctMinSectionM2 * 100).toFixed(1)),
      airInletGrilleMinSectionM2: Number(airInletGrilleMinSectionM2.toFixed(3)),
      airInletGrilleMinSectionDm2: Number((airInletGrilleMinSectionM2 * 100).toFixed(1)),
      
      velocitiesUsed: {
        extractionDuct: vExtDuct,
        extractionGrille: vExtGrille,
        inletDuct: vInDuct,
        inletGrille: vInGrille,
      },
      
      fanSpecifications: { fireRating: 'Classé F400 120 selon NF EN 12101-3', comfortOverheat: true, interlocks: ['Asservissement CMSI', 'Pressostat différentiel', 'Coffret de relayage', 'Câble CR1'] },
    },
    overpressure: spaceKind === 'escalier' ? { differentialPressureRangePa: '20 Pa à 80 Pa', airSpeedOpenDoorMs: 0.5, recommendations: [] } : undefined,
    notes, warnings,
  };
}
