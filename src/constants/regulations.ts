import { DENFCStandardSize, BuildingCategory, ERPType, ERPCategory, HabitationFamily } from '../types/desenfumage';

export const STANDARD_DENFC_CATALOG: DENFCStandardSize[] = [
  {
    id: 'denfc-100-100',
    name: 'DENFC 100 x 100 cm',
    widthCm: 100,
    heightCm: 100,
    cv: 0.65,
    avM2: 1.00,
    sueM2: 0.65,
  },
  {
    id: 'denfc-120-120',
    name: 'DENFC 120 x 120 cm (Standard Toiture)',
    widthCm: 120,
    heightCm: 120,
    cv: 0.66,
    avM2: 1.44,
    sueM2: 0.95,
  },
  {
    id: 'denfc-140-140',
    name: 'DENFC 140 x 140 cm (Courant Grand Volume)',
    widthCm: 140,
    heightCm: 140,
    cv: 0.67,
    avM2: 1.96,
    sueM2: 1.31,
  },
  {
    id: 'denfc-150-150',
    name: 'DENFC 150 x 150 cm',
    widthCm: 150,
    heightCm: 150,
    cv: 0.68,
    avM2: 2.25,
    sueM2: 1.53,
  },
  {
    id: 'denfc-100-200',
    name: 'DENFC 100 x 200 cm (Rectangulaire)',
    widthCm: 100,
    heightCm: 200,
    cv: 0.65,
    avM2: 2.00,
    sueM2: 1.30,
  },
  {
    id: 'denfc-120-200',
    name: 'DENFC 120 x 200 cm',
    widthCm: 120,
    heightCm: 200,
    cv: 0.66,
    avM2: 2.40,
    sueM2: 1.58,
  },
  {
    id: 'denfc-150-200',
    name: 'DENFC 150 x 200 cm (Industriel ICPE)',
    widthCm: 150,
    heightCm: 200,
    cv: 0.68,
    avM2: 3.00,
    sueM2: 2.04,
  },
  {
    id: 'denfc-200-200',
    name: 'DENFC 200 x 200 cm (Grand Format)',
    widthCm: 200,
    heightCm: 200,
    cv: 0.70,
    avM2: 4.00,
    sueM2: 2.80,
  },
];

export const BUILDING_CATEGORIES_INFO: Record<BuildingCategory, {
  label: string;
  badge: string;
  description: string;
  regulatoryReference: string;
  keyRule: string;
}> = {
  erp: {
    label: 'ERP (Établissement Recevant du Public)',
    badge: 'Arrêté du 25 juin 1980 & IT 246',
    description: 'Bâtiments accueillant du public, classés par type (M, L, N, O...) et par catégorie (1 à 5). Réglementation stricte basée sur l\'Instruction Technique 246.',
    regulatoryReference: 'Arrêté du 25 juin 1980 modifié, Arrêté du 22 mars 2004, IT 246',
    keyRule: 'Naturel : SUE = S / 200 (ou barème α IT 246). Mécanique : Q = 1 m³/s pour 100 m² (mini 1,5 m³/s). Cantons max 1600 m² / 60 m.',
  },
  ert: {
    label: 'Code du Travail / ERT (Lieux de Travail)',
    badge: 'Code du Travail art. R. 4216',
    description: 'Bâtiments et locaux professionnels affectés au personnel et aux activités de travail (bureaux, ateliers, usines hors ICPE soumises à déclaration/autorisation).',
    regulatoryReference: 'Articles R. 4216-13 à R. 4216-17 du Code du Travail, Arrêté du 5 août 1992',
    keyRule: 'Naturel : SUE ≥ 1% de la surface (locaux ≤ 1000 m²) ou IT 246. Mécanique : 1 m³/s pour 100 m². Locaux aveugles ou sous-sol > 100 m², ou > 300 m².',
  },
  habitation: {
    label: 'Bâtiments d\'Habitation Collective',
    badge: 'Arrêté du 31 janvier 1986',
    description: 'Immeubles d\'habitation classés de la 1ère à la 4ème famille. Désenfumage des escaliers et des circulations horizontales protégées.',
    regulatoryReference: 'Arrêté du 31 janvier 1986 modifié (sécurité incendie dans les bâtiments d\'habitation)',
    keyRule: 'Escaliers : exutoire haut SGO ≥ 1 m² (commande au RDC) ou surpression mécanique. Circulations (3B et 4) : balayage naturel ou mécanique 0,5 m³/s par tronçon.',
  },
  icpe: {
    label: 'ICPE Entrepôts & Bâtiments Industriels',
    badge: 'Rubrique 1510 / Arrêté 11 avril 2017',
    description: 'Entrepôts couverts de stockage de matières combustibles (ICPE 1510, 2662, 2663...). Règles renforcées de protection des biens et secours.',
    regulatoryReference: 'Arrêté du 11 avril 2017 modifié (ICPE 1510), Normes NF EN 12101-2',
    keyRule: 'Exutoires : SUE ≥ 2% de la surface de la cellule. Cantons max 1600 m². Amenées d\'air ≥ surface utile des exutoires. Fusibles 93°C + commande CO2.',
  },
  ps: {
    label: 'Parcs de Stationnement Couverts',
    badge: 'Arrêté du 9 mai 2006 (ERP) & 1986',
    description: 'Parcs de stationnement couverts et garages (ERP PS ou parcs d\'habitation). Ventilation de sécurité et extraction de fumées.',
    regulatoryReference: 'Arrêté du 9 mai 2006 (Type PS) ou Arrêté du 31 janvier 1986',
    keyRule: 'Mécanique : 600 m³/h par véhicule en désenfumage secours (moteurs 400°C/2h). Naturel : ouvertures 6 m² pour 100 véhicules ou 0,5% surface.',
  },
  igh: {
    label: 'IGH (Immeubles de Grande Hauteur)',
    badge: 'Arrêté du 30 décembre 2011',
    description: 'Bâtiments dont le plancher bas du dernier niveau est à plus de 50 m (habitation) ou 28 m (autres). Compartimentage et solution mécanique absolue.',
    regulatoryReference: 'Arrêté du 30 décembre 2011 (Règlement de sécurité des IGH)',
    keyRule: 'Surpression mécanique des escaliers et sas d\'accès (20 à 80 Pa). Désenfumage mécanique des circulations avec inversion de tirage ou soufflage/extraction.',
  },
};

export const ERP_TYPES_INFO: Record<ERPType, { code: string; label: string; example: string }> = {
  M: { code: 'M', label: 'Magasins de vente et centres commerciaux', example: 'Supermarché, boutique, galerie marchande' },
  L: { code: 'L', label: 'Salles de spectacles, conférences, réunions', example: 'Théâtre, cinéma, salle des fêtes, auditorium' },
  N: { code: 'N', label: 'Restaurants et débits de boissons', example: 'Restaurant, brasserie, café, bar' },
  O: { code: 'O', label: 'Hôtels et établissements d\'hébergement', example: 'Hôtel, résidence de tourisme' },
  P: { code: 'P', label: 'Salles de jeux et de danse', example: 'Discothèque, casino, bowling, escape game' },
  R: { code: 'R', label: 'Établissements d\'enseignement et internats', example: 'École, collège, lycée, université, crèche' },
  S: { code: 'S', label: 'Bibliothèques et centres de documentation', example: 'Médiathèque, bibliothèque universitaire' },
  T: { code: 'T', label: 'Salles d\'expositions', example: 'Foire, salon, parc des expositions' },
  U: { code: 'U', label: 'Établissements de santé et soins', example: 'Hôpital, clinique, EHPAD, maison de repos' },
  V: { code: 'V', label: 'Établissements de culte', example: 'Église, mosquée, synagogue, temple' },
  W: { code: 'W', label: 'Administrations, banques et bureaux', example: 'Mairie, préfecture, agence bancaire, siège tertiaire' },
  X: { code: 'X', label: 'Établissements sportifs couverts', example: 'Gymnase, piscine couverte, patinoire, salle de sport' },
  Y: { code: 'Y', label: 'Musées', example: 'Musée des beaux-arts, monument historique payant' },
};

export const GLOSSARY_ITEMS = [
  {
    term: 'SUE (Surface Utile d\'Évacuation)',
    definition: 'Surface géométrique d\'ouverture de l\'exutoire multipliée par son coefficient aéraulique Cv (SUE = Av × Cv). C\'est la valeur réelle prise en compte pour le calcul réglementaire de désenfumage.',
  },
  {
    term: 'DENFC (Dispositif d\'Évacuation Naturelle de Fumées et Chaleur)',
    definition: 'Appareil d\'évacuation de fumée placé en toiture ou en façade (lanterneau, exutoire, ouvrant de façade) certifié CE selon la norme NF EN 12101-2 et conforme NF S 61-937.',
  },
  {
    term: 'Canton de désenfumage',
    definition: 'Volume délimité sous la toiture par des écrans de cantonnement ou les parois du bâtiment, destiné à confiner les fumées au droit du foyer. Sa surface maximale est de 1600 m² (ou longueur ≤ 60 m).',
  },
  {
    term: 'Écran de cantonnement',
    definition: 'Séparation verticale suspendue en toiture réalisée en matériaux incombustibles (toile vitrocéramique, plâtre, tôle) pour empêcher l\'étalement horizontal des fumées. Retombée minimale généralement de 0,5 m ou 25% de la hauteur.',
  },
  {
    term: 'Coefficient aéraulique (Cv)',
    definition: 'Rapport entre le débit réel d\'air passant par le DENFC et le débit théorique d\'une ouverture parfaite de même surface. Généralement compris entre 0,55 et 0,72 selon le modèle et les déflecteurs de vent.',
  },
  {
    term: 'Zone libre de fumée (H\')',
    definition: 'Hauteur minimale mesurée à partir du sol qui doit rester exempte de fumées pour permettre l\'évacuation des personnes et l\'intervention des sapeurs-pompiers (au minimum 1,80 m ou H/2).',
  },
  {
    term: 'Amenée d\'air',
    definition: 'Ouvertures situées en partie basse du local (portes, volets, grilles) permettant l\'introduction d\'air frais pour compenser l\'évacuation des fumées et entretenir le balayage thermique.',
  },
  {
    term: 'CMSI & DAC / DCM',
    definition: 'Centralisateur de Mise en Sécurité Incendie (CMSI). Dispositif Adaptateur de Commande (DAC) et Dispositif de Commande Manuelle (DCM) : boîtiers à déclenchement pneumatique (cartouches CO2) ou électrique pour ouvrir les DENFC.',
  },
  {
    term: 'Classe de feu F400 120',
    definition: 'Exigence imposée aux ventilateurs d\'extraction mécanique : capacité certifiée à fonctionner à 400°C pendant au moins 120 minutes (norme NF EN 12101-3).',
  },
  {
    term: 'Règle du 1/200ème',
    definition: 'Règle forfaitaire de l\'IT 246 pour le désenfumage naturel des locaux en ERP : la surface utile totale des évacuations de fumée doit être au moins égale à 1/200 de la surface au sol du local (0,5%).',
  },
];
