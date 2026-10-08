import { RoomInput, CalculationResult, CantonmentInfo, DENFCStandardSize } from '../types/desenfumage';
import { STANDARD_DENFC_CATALOG, BUILDING_CATEGORIES_INFO } from '../constants/regulations';

export function calculateRoomDesenfumage(room: RoomInput): CalculationResult {
  const {
    area,
    length,
    width,
    ceilingHeight,
    spaceKind,
    buildingCategory,
    isBasement,
    isBlind,
    mode,
    vehicleCount,
    selectedDENFCId,
    customDENFC,
  } = room;

  // 1. Détermination de l'assujettissement réglementaire
  let isSubject = false;
  let subjectReason = '';
  let regulatoryText = BUILDING_CATEGORIES_INFO[buildingCategory]?.regulatoryReference || 'Réglementation Sécurité Incendie';

  switch (buildingCategory) {
    case 'erp':
      if (spaceKind === 'escalier') {
        isSubject = true;
        subjectReason = 'Les escaliers encloisonnés en ERP doivent obligatoirement être désenfumés (balayage naturel ou surpression) pour préserver l\'évacuation du public.';
        regulatoryText = 'Arrêté du 25 juin 1980 modifié, Art. DF 3 à DF 8';
      } else if (spaceKind === 'circulation') {
        isSubject = length > 30 || isBasement || Boolean(room.isSleepingRoom);
        subjectReason = isSubject
          ? 'Circulation encloisonnée de plus de 30 m, en sous-sol ou desservant des locaux à sommeil (obligation IT 246).'
          : 'Circulation ≤ 30 m en étage/RDC non assujettie obligatoirement, sauf dispositions particulières du type d\'ERP.';
        regulatoryText = 'IT 246 - Dispositions applicables aux dégagements et circulations';
      } else {
        if (isBasement && area > 100) {
          isSubject = true;
          subjectReason = 'Local en sous-sol de surface supérieure à 100 m² (Art. DF 3 § 2).';
        } else if (isBlind && area > 100) {
          isSubject = true;
          subjectReason = 'Local aveugle de surface supérieure à 100 m² (Art. DF 3 § 2).';
        } else if (area > 300) {
          isSubject = true;
          subjectReason = 'Local en RDC ou en étage d\'une surface supérieure à 300 m² (Art. DF 3 § 1).';
        } else {
          isSubject = false;
          subjectReason = 'Surface ≤ 300 m² en étage/RDC avec ouvertures directes : non assujetti au désenfumage réglementaire obligatoire (sauf dispositions particulières par type d\'ERP).';
        }
        regulatoryText = 'Arrêté du 25 juin 1980 (Art. DF 3 et IT 246 § 3)';
      }
      break;

    case 'ert':
      if (spaceKind === 'escalier') {
        isSubject = true;
        subjectReason = 'Escalier encloisonné dans un bâtiment de travail soumis à l\'article R. 4216-14.';
        regulatoryText = 'Code du Travail Art. R. 4216-14';
      } else if (spaceKind === 'circulation') {
        isSubject = length > 30 || isBasement;
        subjectReason = isSubject
          ? 'Circulation de longueur > 30 m ou en sous-sol : désenfumage obligatoire (Art. R. 4216-13).'
          : 'Circulation de longueur ≤ 30 m hors sous-sol non assujettie au désenfumage obligatoire.';
        regulatoryText = 'Code du Travail Art. R. 4216-13 & 14';
      } else {
        if (isBasement && area > 100) {
          isSubject = true;
          subjectReason = 'Local de travail en sous-sol de plus de 100 m² (Art. R. 4216-13).';
        } else if (isBlind && area > 100) {
          isSubject = true;
          subjectReason = 'Local de travail aveugle de plus de 100 m² (Art. R. 4216-13).';
        } else if (area > 300) {
          isSubject = true;
          subjectReason = 'Local de travail en RDC ou étage de surface supérieure à 300 m² (Art. R. 4216-13).';
        } else {
          isSubject = false;
          subjectReason = 'Local de travail ≤ 300 m² non aveugle et hors sous-sol (non soumis à l\'obligation R. 4216-13).';
        }
        regulatoryText = 'Code du Travail Art. R. 4216-13 à R. 4216-17';
      }
      break;

    case 'habitation':
      if (spaceKind === 'escalier') {
        isSubject = true;
        subjectReason = 'Escalier encloisonné d\'immeuble collectif (2e, 3e famille A/B, 4e famille).';
        regulatoryText = 'Arrêté du 31 janvier 1986, Art. 25 & 38';
      } else if (spaceKind === 'circulation') {
        isSubject = room.habitationFamily === '3B' || room.habitationFamily === '4';
        subjectReason = isSubject
          ? 'Circulation horizontale protégée en 3e famille B ou 4e famille (désenfumage obligatoire Solution A ou B).'
          : 'Circulation horizontale en 1ère, 2ème ou 3ème famille A : désenfumage des circulations non obligatoire.';
        regulatoryText = 'Arrêté du 31 janvier 1986, Art. 38';
      } else {
        isSubject = area > 300;
        subjectReason = isSubject ? 'Grand local / hall technique > 300 m².' : 'Locaux privatifs/parties communes standard non assujettis.';
        regulatoryText = 'Arrêté du 31 janvier 1986';
      }
      break;

    case 'icpe':
      isSubject = true;
      subjectReason = 'Cellule d\'entrepôt ou bâtiment industriel relevant de la rubrique ICPE 1510 / 2662.';
      regulatoryText = 'Arrêté ministériel du 11 avril 2017 (Prescriptions ICPE 1510)';
      break;

    case 'ps':
      isSubject = true;
      subjectReason = 'Parc de stationnement couvert soumis aux exigences de désenfumage et de ventilation de secours.';
      regulatoryText = 'Arrêté du 9 mai 2006 (Type PS) & Arrêté du 31 janvier 1986';
      break;

    case 'igh':
      isSubject = true;
      subjectReason = 'Immeuble de Grande Hauteur : désenfumage mécanique obligatoire des circulations et surpression des escaliers et sas.';
      regulatoryText = 'Règlement de sécurité IGH, Arrêté du 30 décembre 2011';
      break;
  }

  // 2. Calcul du cantonnement (IT 246 § 3.3 et ICPE)
  const maxCantonArea = buildingCategory === 'icpe' ? 1600 : 1600;
  const maxCantonLength = 60;
  
  const needsCantonment = (area > maxCantonArea || length > maxCantonLength || width > maxCantonLength) && spaceKind === 'local';
  
  let cantonCount = 1;
  if (needsCantonment) {
    const countByArea = Math.ceil(area / maxCantonArea);
    const countByLength = Math.ceil(length / maxCantonLength);
    const countByWidth = Math.ceil(width / maxCantonLength);
    cantonCount = Math.max(countByArea, countByLength * countByWidth, 2);
  }

  const cantonArea = area / cantonCount;

  // Hauteur libre de fumée H' et retombée d'écran
  const clearHeightM = room.clearSmokeHeight && room.clearSmokeHeight > 0 
    ? room.clearSmokeHeight 
    : Math.max(1.80, ceilingHeight / 2);
  const smokeLayerThicknessM = Math.max(0.5, ceilingHeight - clearHeightM);
  
  // Retombée minimale de l'écran de cantonnement : au moins 0.5m ou 25% de la hauteur
  const screenDepthM = Math.max(0.5, ceilingHeight * 0.25, smokeLayerThicknessM);

  const cantonmentInfo: CantonmentInfo = {
    required: needsCantonment,
    cantonCount,
    maxAreaPerCanton: cantonArea,
    screenDepthM: Number(screenDepthM.toFixed(2)),
    smokeLayerThicknessM: Number(smokeLayerThicknessM.toFixed(2)),
    clearHeightM: Number(clearHeightM.toFixed(2)),
    explanation: needsCantonment 
      ? `Surface (${area} m²) > 1600 m² ou dimension > 60 m. Découpage requis en ${cantonCount} cantons de max ${cantonArea.toFixed(0)} m² avec écrans de retombée ≥ ${screenDepthM.toFixed(2)} m.`
      : `Surface ≤ 1600 m² et dimensions ≤ 60 m : Canton unique (aucun écran de cantonnement intermédiaire requis).`,
  };

  // 3. Choix du DENFC (pour désenfumage naturel)
  let selectedDENFC: DENFCStandardSize = STANDARD_DENFC_CATALOG[1]; // default 120x120
  if (customDENFC && customDENFC.sueM2 > 0) {
    selectedDENFC = {
      id: 'custom',
      name: customDENFC.name || 'DENFC Personnalisé',
      widthCm: 100,
      heightCm: 100,
      cv: 0.65,
      avM2: Number((customDENFC.sueM2 / 0.65).toFixed(2)),
      sueM2: customDENFC.sueM2,
    };
  } else {
    const found = STANDARD_DENFC_CATALOG.find((d) => d.id === selectedDENFCId);
    if (found) selectedDENFC = found;
  }

  // 4. Calcul Désenfumage Naturel
  let naturalSueTotalM2 = 0;
  let naturalSuePerCantonM2 = 0;
  let naturalRuleUsed = '';
  let naturalAirInletGeometricAreaM2 = 0;
  const naturalSpacingRules: string[] = [];

  if (spaceKind === 'escalier') {
    // Escaliers encloisonnés
    naturalSueTotalM2 = 1.0; // 1 m² de surface géométrique libre
    naturalSuePerCantonM2 = 1.0;
    naturalRuleUsed = '1 m² de surface géométrique libre d\'ouvrant en partie haute (SGO ≥ 1 m²) avec commande manuelle au pied d\'escalier.';
    naturalAirInletGeometricAreaM2 = 1.0; // Amenée d'air au pied de 1 m²
    naturalSpacingRules.push('Exutoire placé en partie supérieure de la cage d\'escalier.');
    naturalSpacingRules.push('Amenée d\'air en partie basse (ouvrant ou porte donnant sur l\'extérieur ou sas).');
  } else if (spaceKind === 'circulation') {
    // Circulations
    const trancheCount = Math.max(1, Math.ceil(length / 30));
    naturalSueTotalM2 = trancheCount * 0.10; // 10 dm² par tronçon de 30m ou 1/100 de la surface
    if (area * 0.01 > naturalSueTotalM2) {
      naturalSueTotalM2 = area * 0.01;
    }
    naturalSuePerCantonM2 = naturalSueTotalM2 / trancheCount;
    naturalRuleUsed = `${trancheCount} tronçon(s) de ≤ 30 m : 10 dm² d'évacuation par tronçon (ou 1/100 de la surface si plus contraignant).`;
    naturalAirInletGeometricAreaM2 = naturalSueTotalM2;
    naturalSpacingRules.push('Bouches d\'évacuation en tiers supérieur de paroi, bouches d\'amenée en tiers inférieur.');
    naturalSpacingRules.push('Distance maximale entre deux bouches : 10 à 15 m en ligne droite.');
  } else if (spaceKind === 'cellule_stockage' || buildingCategory === 'icpe') {
    // ICPE 1510 : règle des 2% de la surface au sol
    naturalSueTotalM2 = area * 0.02;
    naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
    naturalRuleUsed = 'Règle ICPE 1510 : SUE ≥ 2% de la surface de la cellule (DENFC avec fusible 93°C, déclencheur CO2 et classe 1200 J).';
    naturalAirInletGeometricAreaM2 = naturalSuePerCantonM2; // Amenée d'air au moins égale à la SUE du plus grand canton
    naturalSpacingRules.push('Au moins 1 DENFC pour 250 m² de toiture.');
    naturalSpacingRules.push('Distance maximale entre exutoires : ≤ 30 m.');
    naturalSpacingRules.push('Distance maximale exutoire / paroi : ≤ 10 m.');
  } else if (buildingCategory === 'ert') {
    // Code du travail
    if (area <= 1000) {
      naturalSueTotalM2 = area * 0.01; // 1% de la surface
      naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
      naturalRuleUsed = 'Code du Travail (Art. R. 4216-14 & Arrêté 5 août 1992) : SUE ≥ 1% de la surface au sol (pour S ≤ 1000 m²).';
    } else {
      naturalSueTotalM2 = area * 0.005; // Règle 1/200ème cantonné
      naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
      naturalRuleUsed = 'Code du Travail (> 1000 m²) : Application des règles IT 246 (1/200ème de la surface par canton).';
    }
    naturalAirInletGeometricAreaM2 = naturalSuePerCantonM2;
    naturalSpacingRules.push('Au moins 1 exutoire par canton.');
    naturalSpacingRules.push('Distance maximale entre exutoires : ≤ 30 m.');
    naturalSpacingRules.push('Distance exutoire / bord de bâtiment : ≤ 10 m.');
  } else if (buildingCategory === 'ps') {
    // Parking naturel
    const naturalVehiclesArea = vehicleCount ? (vehicleCount / 100) * 6 : area * 0.005;
    naturalSueTotalM2 = Math.max(naturalVehiclesArea, area * 0.005);
    naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
    naturalRuleUsed = 'Parking naturel : ouvertures permanentes de 6 m² pour 100 véhicules ou ≥ 0,5% de la surface de chaque niveau.';
    naturalAirInletGeometricAreaM2 = naturalSueTotalM2;
    naturalSpacingRules.push('Ouvertures réparties sur au moins deux façades opposées.');
  } else {
    // ERP IT 246 Standard : Règle du 1/200ème
    naturalSueTotalM2 = area / 200; // 0.5%
    naturalSuePerCantonM2 = naturalSueTotalM2 / cantonCount;
    naturalRuleUsed = 'IT 246 (Arrêté 22 mars 2004) : Règle forfaitaire du 1/200ème de la surface au sol (SUE = S / 200 = 0,5%).';
    naturalAirInletGeometricAreaM2 = naturalSuePerCantonM2;
    naturalSpacingRules.push('Au moins 1 DENFC pour 250 m² dans chaque canton.');
    naturalSpacingRules.push('Distance entre exutoires ≤ 30 m.');
    naturalSpacingRules.push('Distance exutoire / paroi la plus proche ≤ 10 m (ou ≤ 7 m en angle).');
  }

  // Nombre de DENFC
  let denfcCountPerCanton = Math.ceil(naturalSuePerCantonM2 / selectedDENFC.sueM2);
  if (spaceKind === 'local' && cantonArea > 250) {
    const minDensity = Math.ceil(cantonArea / 250);
    if (denfcCountPerCanton < minDensity) {
      denfcCountPerCanton = minDensity;
    }
  }
  if (denfcCountPerCanton < 1 && isSubject) denfcCountPerCanton = 1;
  const denfcCountTotal = denfcCountPerCanton * cantonCount;

  // 5. Calcul Désenfumage Mécanique
  let extractionFlowRateM3s = 0;
  let mechanicalRuleUsed = '';

  if (spaceKind === 'escalier') {
    // Les escaliers ne sont pas désenfumés par extraction mécanique directe pour éviter d'aspirer les fumées dans l'escalier !
    // Ils sont mis en surpression ou désenfumés naturellement.
    extractionFlowRateM3s = 0;
    mechanicalRuleUsed = 'ATTENTION : L\'extraction mécanique est strictement interdite dans une cage d\'escalier (risque de piégeage des occupants). Seule la surpression mécanique ou le balayage naturel est autorisée.';
  } else if (spaceKind === 'circulation') {
    const trancheCount = Math.max(1, Math.ceil(length / 30));
    extractionFlowRateM3s = trancheCount * 0.5; // 0.5 m³/s par tronçon de 30m
    mechanicalRuleUsed = `Circulation encloisonnée : Débit de 0,5 m³/s (1800 m³/h) par tronçon de 30 m (${trancheCount} tronçon(s)).`;
  } else if (buildingCategory === 'ps') {
    // Parcs de stationnement : 600 m³/h par véhicule en secours désenfumage
    const count = vehicleCount && vehicleCount > 0 ? vehicleCount : Math.max(10, Math.round(area / 25));
    const flowM3h = count * 600;
    extractionFlowRateM3s = flowM3h / 3600;
    mechanicalRuleUsed = `Parc de stationnement couvert : 600 m³/h par emplacement de véhicule pour ${count} véhicules estimés.`;
  } else if (buildingCategory === 'igh') {
    // IGH circulations et compartiments
    extractionFlowRateM3s = Math.max(1.5, (area / 100) * 1.0);
    mechanicalRuleUsed = 'Règlement IGH : 1 m³/s par 100 m² avec débit de balayage haute performance garanti.';
  } else {
    // ERP et Code du Travail : 1 m³/s pour 100 m² avec minimum de 1.5 m³/s
    const calcRate = (area / 100) * 1.0;
    extractionFlowRateM3s = Math.max(1.5, calcRate);
    mechanicalRuleUsed = area < 150 
      ? `Règle IT 246 § 4 : 1 m³/s pour 100 m² avec application du minimum réglementaire absolu de 1,5 m³/s (5400 m³/h) par local.`
      : `Règle IT 246 § 4 & Art. R. 4216-14 : Débit de 1 m³/s par 100 m² de surface au sol.`;
  }

  const extractionFlowRateM3h = extractionFlowRateM3s * 3600;
  const extractionFlowRatePerCantonM3h = extractionFlowRateM3h / cantonCount;

  // Amenée d'air mécanique compensatoire : 0.6 x Débit d'extraction
  const airInletFlowRateM3h = extractionFlowRateM3h * 0.6;
  const airInletFlowRateM3s = extractionFlowRateM3s * 0.6;

  // Dimensionnement aéraulique indicatif :
  // Vitesse d'air dans les gaines / bouches d'extraction : max 5 m/s
  const extractionDuctMinSectionM2 = extractionFlowRateM3s > 0 ? extractionFlowRateM3s / 5.0 : 0;
  const extractionDuctMinSectionDm2 = extractionDuctMinSectionM2 * 100;
  const suggestedExtractionGrilleCount = Math.max(1, Math.ceil(extractionDuctMinSectionM2 / 0.25));

  // Bouches d'amenée d'air : vitesse max 2 m/s à 3 m/s pour ne pas perturber la stratification
  const airInletMinSectionM2 = airInletFlowRateM3s > 0 ? airInletFlowRateM3s / 2.0 : 0;
  const airInletMinSectionDm2 = airInletMinSectionM2 * 100;

  // 6. Alertes et Recommandations
  const notes: string[] = [];
  const warnings: string[] = [];

  if (!isSubject) {
    notes.push('D\'après les dimensions et caractéristiques saisies, ce local n\'est pas soumis au désenfumage obligatoire au sens strict des textes généraux.');
    notes.push('Vérifiez toutefois les éventuelles prescriptions de la commission de sécurité ou de l\'assureur.');
  }

  if (ceilingHeight < 2.5 && spaceKind === 'local') {
    warnings.push(`Hauteur sous plafond faible (${ceilingHeight} m). La nappe de fumée risque d\'envahir rapidement la zone d\'évacuation. Prévoir une extraction adaptée.`);
  }

  if (mode === 'mecanique' && spaceKind === 'escalier') {
    warnings.push('INTERDICTION RÉGLEMENTAIRE : Ne jamais raccorder d\'extraction mécanique dans un escalier. Utilisez la mise en surpression mécanique ou le désenfumage naturel.');
  }

  if (mode === 'naturel' && isBasement) {
    warnings.push('Sous-sol : Le désenfumage naturel par toiture est généralement impossible. Prévoir des puits d\'évacuation débouchant à l\'air libre ou opter pour le désenfumage mécanique.');
  }

  if (needsCantonment) {
    notes.push(`Le volume dépasse les limites d\'un canton unique (S > 1600 m² ou L > 60 m). Le local doit comporter ${cantonCount} cantons délimités par des écrans de cantonnement DH 30 ou matériaux incombustibles.`);
  }

  notes.push('Les amenées d\'air doivent être situées en partie basse, dans la zone exempte de fumées (hauteur ≤ 1,00 m du sol).');
  notes.push('Les évacuations de fumée (DENFC ou bouches) doivent être situées en partie haute, dans la zone d\'enfumage.');

  return {
    isSubjectToDesenfumage: isSubject,
    subjectReason,
    regulatoryText,
    mode,
    cantonment: cantonmentInfo,
    natural: {
      sueTotalM2: Number(naturalSueTotalM2.toFixed(3)),
      suePerCantonM2: Number(naturalSuePerCantonM2.toFixed(3)),
      ruleUsed: naturalRuleUsed,
      denfcCountTotal,
      denfcCountPerCanton,
      selectedDENFC,
      airInletGeometricAreaM2: Number(naturalAirInletGeometricAreaM2.toFixed(2)),
      spacingRules: naturalSpacingRules,
    },
    mechanical: {
      extractionFlowRateM3h: Math.round(extractionFlowRateM3h),
      extractionFlowRateM3s: Number(extractionFlowRateM3s.toFixed(2)),
      extractionFlowRatePerCantonM3h: Math.round(extractionFlowRatePerCantonM3h),
      ruleUsed: mechanicalRuleUsed,
      airInletFlowRateM3h: Math.round(airInletFlowRateM3h),
      airInletFlowRateM3s: Number(airInletFlowRateM3s.toFixed(2)),
      extractionDuctMinSectionM2: Number(extractionDuctMinSectionM2.toFixed(3)),
      extractionDuctMinSectionDm2: Number(extractionDuctMinSectionDm2.toFixed(1)),
      suggestedExtractionGrilleCount,
      airInletMinSectionM2: Number(airInletMinSectionM2.toFixed(3)),
      airInletMinSectionDm2: Number(airInletMinSectionDm2.toFixed(1)),
      fanSpecifications: {
        fireRating: 'Classé F400 120 (400°C / 2 heures) selon NF EN 12101-3',
        comfortOverheat: true,
        interlocks: [
          'Asservissement au Centralisateur de Mise en Sécurité Incendie (CMSI)',
          'Pressostat différentiel pour contrôle effectif de débit',
          'Coffret de relayage conforme NF S 61-937 avec arrêt d\'urgence pompiers',
          'Câblage électrique résistant au feu CR1',
        ],
      },
    },
    overpressure: spaceKind === 'escalier' ? {
      differentialPressureRangePa: '20 Pa à 80 Pa (toutes portes fermées)',
      airSpeedOpenDoorMs: 0.5,
      recommendations: [
        'Surpression de sécurité pour empêcher la pénétration des fumées dans la cage.',
        'Vitesse de soufflage d\'air à travers la porte d\'accès ouverte ≥ 0,5 m/s.',
        'La force d\'ouverture manuelle de la porte ne doit pas dépasser 100 N (conformité NF EN 12101-6).',
      ],
    } : undefined,
    notes,
    warnings,
  };
}
