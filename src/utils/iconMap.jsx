import React from 'react';
import { 
  TbBeach, 
  TbBuildingBurjAlArab, 
  TbBuildingMosque, 
  TbBuildingCastle, 
  TbBuildingMonument, 
  TbMountain, 
  TbTent, 
  TbScubaDiving, 
  TbBuildingLighthouse, 
  TbBuildingEiffelTower,
  TbBuildingSkyscraper,
  TbBuildingBridge2,
  TbCampfire,
  TbBuildingChurch,
  TbBuildingCarousel,
  TbBuildingAirport,
  TbBuildingArch,
  TbSunset
} from 'react-icons/tb';

import { 
  GiCamel, 
  GiPalmTree, 
  GiPagoda, 
  GiTempleGate,
  GiMountainCave,
  GiIsland,
  GiWaterfall,
  GiVillage,
  GiPineTree,
  GiSailboat,
  GiAsianLantern
} from 'react-icons/gi';

import {
  MdOutlineTempleHindu
} from 'react-icons/md';

export const iconMap = {
  // Beaches & Islands
  'TbBeach': <TbBeach />,
  'GiPalmTree': <GiPalmTree />,
  'GiIsland': <GiIsland />,
  'TbScubaDiving': <TbScubaDiving />,
  
  // Landmarks & Buildings
  'TbBuildingBurjAlArab': <TbBuildingBurjAlArab />,
  'TbBuildingEiffelTower': <TbBuildingEiffelTower />,
  'TbBuildingCastle': <TbBuildingCastle />,
  'TbBuildingMonument': <TbBuildingMonument />,
  'TbBuildingSkyscraper': <TbBuildingSkyscraper />,
  'TbBuildingLighthouse': <TbBuildingLighthouse />,
  'TbBuildingBridge2': <TbBuildingBridge2 />,
  'TbBuildingCarousel': <TbBuildingCarousel />,
  'TbBuildingAirport': <TbBuildingAirport />,
  'TbBuildingArch': <TbBuildingArch />,
  
  // Religious / Cultural
  'TbBuildingMosque': <TbBuildingMosque />,
  'MdOutlineTempleHindu': <MdOutlineTempleHindu />,
  'GiPagoda': <GiPagoda />,
  'GiTempleGate': <GiTempleGate />,
  'GiAsianLantern': <GiAsianLantern />,
  'TbBuildingChurch': <TbBuildingChurch />,
  
  // Nature & Adventure
  'TbMountain': <TbMountain />,
  'GiMountainCave': <GiMountainCave />,
  'TbTent': <TbTent />,
  'TbCampfire': <TbCampfire />,
  'GiCamel': <GiCamel />,
  'GiWaterfall': <GiWaterfall />,
  'GiVillage': <GiVillage />,
  'GiPineTree': <GiPineTree />,
  'GiSailboat': <GiSailboat />,
  'TbSunset': <TbSunset />
};

export const iconNamesMap = {
  // Beaches & Islands
  'TbBeach': 'Beach',
  'GiPalmTree': 'Palm Tree',
  'GiIsland': 'Island',
  'TbScubaDiving': 'Scuba Diving',
  
  // Landmarks & Buildings
  'TbBuildingBurjAlArab': 'Burj Al Arab',
  'TbBuildingEiffelTower': 'Eiffel Tower',
  'TbBuildingCastle': 'Castle',
  'TbBuildingMonument': 'Monument',
  'TbBuildingSkyscraper': 'Skyscraper',
  'TbBuildingLighthouse': 'Lighthouse',
  'TbBuildingBridge2': 'Bridge',
  'TbBuildingCarousel': 'Amusement Park',
  'TbBuildingAirport': 'Airport',
  'TbBuildingArch': 'Gateway / Arch',
  
  // Religious / Cultural
  'TbBuildingMosque': 'Mosque',
  'MdOutlineTempleHindu': 'Hindu Temple',
  'GiPagoda': 'Pagoda',
  'GiTempleGate': 'Temple Gate',
  'GiAsianLantern': 'Asian Lantern',
  'TbBuildingChurch': 'Church',
  
  // Nature & Adventure
  'TbMountain': 'Mountain',
  'GiMountainCave': 'Mountain Cave',
  'TbTent': 'Camping Tent',
  'TbCampfire': 'Campfire',
  'GiCamel': 'Camel',
  'GiWaterfall': 'Waterfall',
  'GiVillage': 'Village',
  'GiPineTree': 'Pine Tree',
  'GiSailboat': 'Sailboat',
  'TbSunset': 'Sunset'
};

export const getIcon = (iconName) => {
  return iconMap[iconName] || <TbBuildingSkyscraper />;
};
