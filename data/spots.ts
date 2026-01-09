/**
 * Modelo de Datos - Spots
 * Scope 1.1: Tipo Spot según definición de producto
 * 
 * Campos según definición:
 * - nombre (opcional)
 * - ubicación en mapa (lat/lng)
 * - fotos (array)
 * - descripción breve (opcional)
 * - horarios (si aplica)
 * - costos (si aplica)
 * - tipo (playa, café, mirador, museo, etc.)
 * - ubicación ajustable (pin ajustable)
 */

export type SpotType =
  | 'beach'
  | 'cafe'
  | 'viewpoint'
  | 'museum'
  | 'restaurant'
  | 'park'
  | 'monument'
  | 'market'
  | 'other';

export type SpotHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

export type SpotCost = {
  currency: string;
  amount: number;
  description?: string;
};

export type SpotHowToVisit = {
  bestTime?: {
    icon: string;
    text: string;
  };
  photography?: {
    icon: string;
    text: string;
  };
};

export type SpotNarration = {
  anticipation?: string;
  presence?: string;
  transition?: string;
};

export type AIGeneratedMetadata = {
  generatedAt?: Date;
  model?: string;
  source?: 'ai' | 'manual' | 'hybrid';
};

import { LocationRegion } from '@/types/locationRegion';

export interface Spot {
  id: string;
  name?: string; // Opcional
  location: {
    latitude: number;
    longitude: number;
    adjustable?: boolean; // Pin ajustable
  };
  photos: string[]; // Array de URLs o paths
  description?: string; // Opcional, descripción breve (mantener para backwards compatibility)
  type: SpotType;
  hours?: SpotHours; // Si aplica
  cost?: SpotCost; // Si aplica
  restrictions?: string; // Restrictions information
  accessibility?: string; // Accessibility information
  // Campos para AI Content Generator (Scope 12.1)
  whyItMatters?: string; // Por qué importa este lugar - reemplaza uso de description en Spot Detail
  culturalContext?: string; // Contexto cultural
  howToVisit?: SpotHowToVisit; // Tips de visita (mejor hora, fotografía)
  narration?: SpotNarration; // Narrativas para audio (NO visibles en UI)
  aiGenerated?: AIGeneratedMetadata; // Metadatos de generación AI
  createdBy?: string; // ID del usuario que creó el spot (opcional para backward compatibility)
  /**
   * Región canónica normalizada derivada de Mapbox
   * CANONICAL: Estructura única de región en todo el dominio
   * 
   * Este campo debe derivarse exclusivamente de Mapbox Geocoding API
   * usando resolveRegion() desde core/region/RegionResolver.ts.
   * 
   * ⚠️ NUNCA usar texto libre para región.
   * ⚠️ NUNCA comparar por label, siempre usar regionId.
   * ⚠️ Este campo es OBLIGATORIO para spots nuevos y se migra automáticamente para legacy.
   * 
   * @see types/locationRegion.ts para la estructura completa
   * @see core/region/RegionResolver.ts para la función canónica de resolución
   */
  locationRegion?: LocationRegion;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spots reales de la Riviera Maya (Cancún a Tulum)
 * Basados en investigación de hidden gems y spots del CSV proporcionado
 */
export const mockSpots: Spot[] = [
  // === CANCÚN ===
  {
    id: 'cancun-yamil-luum',
    name: 'Yamil Lu\'um (Templo del Alacrán)',
    location: {
      latitude: 21.1325,
      longitude: -86.7472,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Small Mayan temple that served as a pre-Columbian lighthouse in Cancún\'s Hotel Zone.',
    type: 'monument',
    whyItMatters: 'Yamil Lu\'um stands as a testament to the Maya\'s sophisticated understanding of navigation and their deep connection to the sea. Perched on the highest natural point along Cancún\'s coastline, this temple served as a lighthouse for ancient mariners, guiding them safely through Caribbean waters. Its name, meaning "Scorpion Temple," comes from a sculpture found within, connecting the site to Maya cosmology.',
    culturalContext: 'Built during the late Postclassic period (1200-1550 AD), Yamil Lu\'um represents the Maya\'s maritime expertise. The temple\'s strategic location demonstrates how the Maya used natural topography to create functional sacred spaces. Today, it offers a rare glimpse into pre-Columbian navigation practices, standing as a bridge between ancient wisdom and modern understanding of the Caribbean coast.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for best lighting and fewer crowds. Sunset offers dramatic views over the Caribbean.',
      },
      photography: {
        icon: 'camera',
        text: 'The elevated position provides panoramic ocean views. Capture the contrast between ancient stone and modern coastline.',
      },
    },
    narration: {
      anticipation: 'Ancient stones emerge. The sea waits below.',
      presence: 'You stand where priests once stood. Land, sea, sky—all connected.',
      transition: 'Carry this wisdom forward. The Maya knew this place. Now you do too.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-el-rey',
    name: 'El Rey Archaeological Site',
    location: {
      latitude: 21.0636,
      longitude: -86.7789,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Mayan archaeological site with 47 structures in Cancún\'s Hotel Zone.',
    type: 'monument',
    whyItMatters: 'El Rey was a thriving coastal trading hub between 1300 and 1500 AD, connecting the Maya world with Caribbean trade routes. The site\'s 47 structures reveal a sophisticated urban center that flourished through commerce and cultural exchange. Its name comes from a sculpture of a monarch discovered here, symbolizing the site\'s importance.',
    culturalContext: 'El Rey represents the Postclassic Maya period, when coastal cities became vital trading centers. The site shows how the Maya adapted to maritime commerce, creating a unique blend of inland traditions and coastal innovation. Today, it stands as a peaceful reminder of Cancún\'s ancient past, nestled within the modern hotel zone.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) to avoid heat and crowds. The site opens at 8 AM daily.',
      },
      photography: {
        icon: 'camera',
        text: 'The temple structures offer interesting angles against the modern skyline. Early morning light creates dramatic shadows.',
      },
    },
    narration: {
      anticipation: 'Ancient stones emerge. A city once thrived here.',
      presence: 'You stand where traders gathered. Feel their energy flow through you.',
      transition: 'Past and present meet. Carry this continuity forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 65,
      description: 'General admission',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-isla-contoy',
    name: 'Isla Contoy',
    location: {
      latitude: 21.4774,
      longitude: -86.8081,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Protected and uninhabited island, sanctuary for over 150 species of tropical birds.',
    type: 'beach',
    whyItMatters: 'Isla Contoy is a pristine sanctuary where nature reigns supreme. This uninhabited island, accessible to only 200 visitors per day, protects one of the Caribbean\'s most important bird nesting sites. The untouched beaches and crystal-clear waters offer a rare glimpse of the Caribbean as it once was—wild, pristine, and teeming with life.',
    culturalContext: 'Protected as a national park since 1998, Isla Contoy represents Mexico\'s commitment to conservation. The island serves as a critical nesting ground for sea turtles and a sanctuary for over 150 bird species, including frigatebirds and brown pelicans. This is what the Caribbean looked like before mass tourism—a reminder of what we must protect.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Tours depart early morning (around 8 AM) from Cancún or Isla Mujeres. Book in advance as daily access is limited to 200 visitors.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring binoculars and a telephoto lens for bird watching. The pristine beaches offer stunning landscape photography opportunities.',
      },
    },
    narration: {
      anticipation: 'An island untouched. White sand. Bird calls fill the air.',
      presence: 'Nature rules here. Every step reveals life. The sea\'s rhythm pulses.',
      transition: 'This is the Caribbean as it was meant to be. Carry this vision forward.',
    },
    restrictions: 'Access limited to 200 visitors per day. No overnight stays. Bring your own food and water. No fishing or collecting shells.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cancun-musa',
    name: 'MUSA - Underwater Museum of Art',
    location: {
      latitude: 21.1000,
      longitude: -86.7833,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    ],
    description: 'Underwater museum with over 500 sculptures that promote coral life.',
    type: 'museum',
    whyItMatters: 'MUSA represents a unique fusion of art and marine conservation. Over 500 sculptures submerged between 3-6 meters create an artificial reef, promoting coral growth and marine biodiversity. This innovative project demonstrates how human creativity can support nature\'s resilience, creating a living underwater gallery that evolves with time.',
    culturalContext: 'Created by British sculptor Jason deCaires Taylor, MUSA opened in 2010 as a response to coral reef degradation. The sculptures, made from pH-neutral materials, provide surfaces for coral and marine life to colonize. This project shows how art can serve ecological purposes, creating beauty while supporting the underwater ecosystem.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best visibility is during dry season (November-April). Morning dives offer calmer conditions.',
      },
      photography: {
        icon: 'camera',
        text: 'Underwater photography requires waterproof equipment. The sculptures become more beautiful as coral and marine life colonize them.',
      },
    },
    narration: {
      anticipation: 'You descend. Sculptures emerge from the blue depths.',
      presence: 'You float among silent figures. Coral transforms them. Art becomes life.',
      transition: 'Art can heal. Art can grow. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 1500,
      description: 'Snorkel tour (includes equipment)',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PLAYA DEL CARMEN ===
  {
    id: 'playa-portal-maya',
    name: 'Portal Maya (Mayan Gateway)',
    location: {
      latitude: 20.6218395,
      longitude: -87.074722,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/774df971b_IMG_0363.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/2981c9aee_IMG_0361.jpeg',
    ],
    description: 'Contemporary monument celebrating Mayan heritage in Playa del Carmen.',
    type: 'monument',
    whyItMatters: 'Portal Maya stands as a vibrant celebration of the region\'s deep Mayan heritage. This contemporary installation serves as a symbolic gateway, connecting the ancient past with the modern present. The towering figures, incorporating symbols from Maya mythology, invite reflection on the enduring significance of this land and the civilization that once flourished here.',
    culturalContext: 'Located in the heart of Playa del Carmen, Portal Maya represents the town\'s evolution from a modest fishing village to a bustling tourist destination. The monument honors the Maya people\'s connection to nature and their ancestral roots, serving as a reminder of the rich cultural tapestry that defines the Riviera Maya. It embodies the resilience and ongoing relevance of Maya culture in today\'s world.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or during sunset for softer light and fewer crowds. The monument is beautifully lit at night.',
      },
      photography: {
        icon: 'camera',
        text: 'The intricate details and vibrant colors are best captured in natural light. Include the surrounding area to show context.',
      },
    },
    narration: {
      anticipation: 'Vibrant colors emerge. A modern tribute to ancient wisdom.',
      presence: 'Towering figures rise. Land meets sky. Maya culture flows through time.',
      transition: 'The past is always present. Carry this continuity forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-parque-fundadores',
    name: 'Parque Fundadores',
    location: {
      latitude: 20.6220372,
      longitude: -87.0749961,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/a14d94c9c_IMG_0362.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/7b8060950_IMG_0361.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/01921500f_IMG_0364.jpeg',
    ],
    description: 'Parque central de Playa del Carmen con el Portal Maya y eventos culturales.',
    type: 'park',
    whyItMatters: 'Parque Fundadores serves as the vibrant heart of Playa del Carmen, where locals and visitors gather to enjoy the beauty of nature and community. This park is not just a green space—it\'s a cultural hub where traditional music, art, and dance come alive, creating a sense of belonging and celebrating the town\'s identity.',
    culturalContext: 'The park holds significant place in Playa del Carmen\'s identity, symbolizing the connection to the region\'s rich Mayan heritage. The presence of the Portal Maya installation highlights the cultural depth of the area, inviting reflections on historical narratives and the contributions of the Mayan civilization. It serves as a living museum where past and present coexist harmoniously.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for a quieter experience, or in the evening when cultural events often take place.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the Portal Maya against the ocean backdrop. Evening events offer great opportunities for street photography.',
      },
    },
    narration: {
      anticipation: 'Ocean sounds grow. A gathering place awaits.',
      presence: 'You\'re in the heart of Playa. Community and culture meet here. Life pulses.',
      transition: 'This park is the town\'s soul. Carry this celebration forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-calle-38-norte',
    name: 'Calle 38 Norte',
    location: {
      latitude: 20.635344599113886,
      longitude: -87.06595301628114,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/20dc928f5_IMG_0341.jpeg',
    ],
    description: 'Vibrant street with boutiques, cafés and galleries showcasing authentic local life.',
    type: 'other',
    whyItMatters: 'Calle 38 Norte embodies the authentic spirit of Playa del Carmen, showcasing a unique blend of local life, art, and gastronomy. This lively street serves as a cultural and social artery, where colorful boutiques, quaint cafes, and galleries invite exploration. Here, you can experience the genuine warmth of local culture, from friendly shopkeepers to captivating street performances.',
    culturalContext: 'Historically, Calle 38 Norte has evolved alongside the local community, reflecting the changing dynamics of urban life. It has become a symbol of resilience and creativity, embodying the rich tapestry of traditions and practices of the people who inhabit it. The area has blossomed into a cultural hub, drawing inspiration from its surroundings while fostering a sense of belonging among its residents.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during late afternoon for cooler temperatures and vibrant street performances. Weekends are especially lively.',
      },
      photography: {
        icon: 'camera',
        text: 'The murals and street art are perfect for capturing memorable moments. Don\'t forget your camera for the colorful facades.',
      },
    },
    narration: {
      anticipation: 'Vibrant energy envelops you. The pulse of authentic Playa.',
      presence: 'Local life surrounds you. Music. Art. Community warmth. This is real.',
      transition: 'These streets tell stories. Carry this authenticity forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === TULUM ===
  {
    id: 'tulum-ruins',
    name: 'Tulum Ruins',
    location: {
      latitude: 20.2167082,
      longitude: -87.4352661,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/d6e3ce5f2_image.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/27c816d7f_image.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/9b2c84b97_image.jpg',
    ],
    description: 'Ruinas mayas costeras con vistas espectaculares al Mar Caribe.',
    type: 'monument',
    whyItMatters: 'The Tulum ruins serve as a breathtaking portal into Maya civilization, showcasing impressive architectural prowess against a stunning Caribbean backdrop. These well-preserved remnants stand on cliffs overlooking the sea, illustrating the synergy between nature and human ingenuity. The iconic El Castillo commands respect not just for its scale but for its strategic position, which served as both lighthouse and watchtower.',
    culturalContext: 'Tulum was a prominent city in the late post-classic period of Maya civilization, serving as a vital trade hub. The walls surrounding the ruins provided protection while framing a unique architectural style. Tulum\'s strategic coastal location allowed it to flourish as an economic center, where goods like jade, obsidian, and textiles were exchanged. Today, it stands as a symbol of indigenous identity and resilience.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) or late afternoon (4-5 PM) to avoid crowds and midday heat. Sunrise offers magical lighting.',
      },
      photography: {
        icon: 'camera',
        text: 'The combination of ancient architecture and Caribbean backdrop is stunning. El Castillo against the ocean is an iconic shot.',
      },
    },
    narration: {
      anticipation: 'Ancient walls rise. A city that watched over the sea.',
      presence: 'You stand where traders gathered. Sea meets civilization. The ocean stretches.',
      transition: 'This place connected worlds. Carry this connection forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 90,
      description: 'General admission',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-xcacel-beach',
    name: 'Xcacel Beach',
    location: {
      latitude: 20.3375839,
      longitude: -87.3483575,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/98b6b7acc_Xcacel_05.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/de94f8532_Xcacel.jpg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/7c16583d8_Xcacel-area-natural-protegida-estatal-PORTADA-900x675.png',
    ],
    description: 'Playa virgen y santuario de tortugas marinas entre Playa del Carmen y Tulum.',
    type: 'beach',
    whyItMatters: 'Xcacel Beach is a hidden gem on Mexico\'s Riviera Maya, known not only for its stunning natural beauty but also for its significant role in conservation efforts. This pristine beach is part of the larger Xcacel-Xcacelito protected area, which is crucial for the nesting of sea turtles, particularly the endangered green turtle. Every year, these majestic creatures return to the sandy shores to lay their eggs, making Xcacel Beach an important ecological site.',
    culturalContext: 'The significance of Xcacel Beach goes beyond its aesthetic appeal; it embodies the cultural connection of local communities to the land and its natural resources. The ancient Mayans revered the sea and considered it a vital source of life. In present-day, environmental conservation is intertwined with cultural identity for the descendants of the Mayans and local inhabitants. Protecting Xcacel\'s environment has become synonymous with preserving their heritage.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the day to enjoy tranquility and avoid crowds. Turtle nesting season is May-October.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the stunning coastal scenery and wildlife, but remember to respect the habitat. No flash photography near nesting areas.',
      },
    },
    narration: {
      anticipation: 'White sand beneath your feet. Waves greet you like an old friend.',
      presence: 'Nature rules here. Turtles nest. Water pristine. Beauty untouched.',
      transition: 'This is what beaches were meant to be. Carry this vision forward.',
    },
    restrictions: 'Respect nesting sites during turtle season (May-October). Avoid loud music and disruptive activities. Take your trash with you.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-laguna-kaan-luum',
    name: 'Laguna Kaan Luum',
    location: {
      latitude: 20.1165,
      longitude: -87.6315,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Laguna de color verde vibrante con un cenote profundo en su centro.',
    type: 'beach',
    whyItMatters: 'Laguna Kaan Luum is a stunning natural wonder just 15 minutes from Tulum, where vibrant turquoise waters encircle a deep cenote at its center. The contrast between the shallow, warm lagoon and the mysterious dark blue cenote creates a mesmerizing visual effect. This peaceful spot offers a perfect escape from crowded beaches, allowing you to connect with nature in tranquility.',
    culturalContext: 'The lagoon represents the unique geology of the Yucatán Peninsula, where cenotes (natural sinkholes) connect to underground river systems. For the ancient Maya, cenotes were sacred portals to the underworld. Today, Laguna Kaan Luum offers a modern connection to these natural wonders, showcasing the region\'s geological and cultural significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for fewer crowds and better light. The water is warm year-round.',
      },
      photography: {
        icon: 'camera',
        text: 'The color contrast between the shallow lagoon and deep cenote is stunning. Aerial views are especially dramatic.',
      },
    },
    narration: {
      anticipation: 'Turquoise waters appear. A lagoon that glows.',
      presence: 'Warm shallow waters drop into darkness. Light meets deep. Mesmerizing.',
      transition: 'Hidden depths beneath the surface. Carry this mystery forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-la-hoja-verde',
    name: 'La Hoja Verde',
    location: {
      latitude: 20.2112198,
      longitude: -87.4617417,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    ],
    description: 'Organic and sustainable restaurant celebrating Tulum\'s culinary ethics.',
    type: 'restaurant',
    whyItMatters: 'La Hoja Verde stands as a celebration of Tulum\'s culinary ethos, emphasizing organic and sustainable practices that honor the Earth. This restaurant is not just a place to eat; it\'s a hub for those who seek healthy, nourishing meals crafted with care. Each dish reflects the region\'s rich agricultural legacy, showcasing locally sourced vegetables that burst with flavor and color.',
    culturalContext: 'Tulum, with its deep-rooted Mayan heritage, has long been influenced by the surrounding natural landscape, which is mirrored in local culinary practices. La Hoja Verde embodies this connection, aligning with the local movement toward eco-friendly dining and wellness. Dining here is not only an act of nourishment but also a way of engaging with the identity of Tulum itself, which has transformed into a sanctuary for those seeking a retreat grounded in nature and conscious living.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during early evening to enjoy soft sunset light and cooler temperatures. Make reservations during busy seasons.',
      },
      photography: {
        icon: 'camera',
        text: 'The lush greenery and natural setting create beautiful dining photos. Fresh juices and colorful dishes are photogenic.',
      },
    },
    narration: {
      anticipation: 'Fresh aromas fill the air. Colors and life surround you.',
      presence: 'You dine under green shade. Nature and nourishment meet here.',
      transition: 'Food should nourish. Food should connect. Carry this forward.',
    },
    hours: {
      monday: '8:00 - 22:00',
      tuesday: '8:00 - 22:00',
      wednesday: '8:00 - 22:00',
      thursday: '8:00 - 22:00',
      friday: '8:00 - 23:00',
      saturday: '8:00 - 23:00',
      sunday: '8:00 - 22:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-calle-satelite-sur',
    name: 'Calle Satélite Sur',
    location: {
      latitude: 20.2105638,
      longitude: -87.4577519,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Lively street showcasing Tulum\'s authentic spirit with shops, cafés and galleries.',
    type: 'other',
    whyItMatters: 'Calle Satélite Sur stands as a pivotal point for both locals and visitors seeking to experience the authentic spirit of Tulum. This bustling street features a diverse array of shops, cafes, and art galleries, each contributing to the rich tapestry of local life. The blend of traditional and contemporary influences becomes palpable as you stroll along, showcasing the creativity and resilience of the Tulum community.',
    culturalContext: 'Historically, Calle Satélite Sur is indicative of Tulum\'s transformation and growth as a center for tourism while maintaining its cultural roots. This street reflects the innovative spirit of the local populace, who blend modern aesthetics with traditional craftsmanship. It stands testament to Tulum\'s ongoing narrative of sustainability, where community and ecology interweave in daily life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning or late afternoon for a cooler stroll. Weekends are especially vibrant with artisan markets.',
      },
      photography: {
        icon: 'camera',
        text: 'The street art and colorful facades are perfect for capturing the authentic Tulum vibe. Keep an eye out for artisan markets.',
      },
    },
    narration: {
      anticipation: 'Vibrant energy envelops you. Culture and community thrive here.',
      presence: 'Local life surrounds you. Artisans. Flavors. The spirit of Tulum.',
      transition: 'This street is Tulum\'s soul. Carry this authenticity forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tulum-parque-dos-aguas',
    name: 'Parque Dos Aguas',
    location: {
      latitude: 20.2100977,
      longitude: -87.4631378,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Peaceful park showcasing Tulum\'s dedication to preserving natural beauty.',
    type: 'park',
    whyItMatters: 'Parque Dos Aguas, often regarded as the heart of local serenity, showcases Tulum\'s dedication to preserving natural beauty amidst urban development. This park is not just a green space; it serves as a vibrant communal hub where families gather, children laugh, and locals connect with nature in their daily lives. With its lush greenery and winding paths, it offers a perfect backdrop for leisurely strolls or contemplative moments.',
    culturalContext: 'Parque Dos Aguas is emblematic of Tulum\'s approach to sustainable living and environmental stewardship. In a region marked by significant cultural heritage and a strong connection to nature, the park embodies local values that prioritize ecological conservation alongside community development. It reflects a movement towards responsible tourism and environmental awareness.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning or late afternoon for cooler temperatures and less crowding. The park is peaceful throughout the day.',
      },
      photography: {
        icon: 'camera',
        text: 'The lush greenery and natural setting create beautiful photos. Capture families enjoying the space and the natural beauty.',
      },
    },
    narration: {
      anticipation: 'A tranquil oasis unfolds. Escape from the bustle awaits.',
      presence: 'Nature and community meet here. Families gather. Life is preserved.',
      transition: 'Development and nature can coexist. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PUERTO MORELOS ===
  {
    id: 'puerto-morelos-faro-inclinado',
    name: 'Faro Inclinado (Leaning Lighthouse)',
    location: {
      latitude: 20.8475841,
      longitude: -86.8750631,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/fffbbc993_IMG_0426.webp',
    ],
    description: 'Iconic leaning lighthouse that is a symbol of Puerto Morelos\' resilience.',
    type: 'monument',
    whyItMatters: 'The Faro Inclinado, known as the Leaning Lighthouse, stands as a testament to Puerto Morelos\' maritime history. Originally built to guide fishermen and sailors safely home, this lighthouse has defied nature with its intriguing tilt, making it not only a functional structure but also a captivating piece of art. Its leaning structure has become a symbol of resilience and adaptation in the face of changing tides and storms.',
    culturalContext: 'Historically, the Faro Inclinado stands as part of the coastal navigation system that has been vital for maritime activities along the Yucatan Peninsula\'s shores. Its quirky lean, resulting from a hurricane in the late 20th century, has inadvertently turned it into a local icon. The community takes pride in its lighthouse, intertwining local identity with the surrounding natural beauty and the traditions of seafaring that define their history and culture.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is early morning or late afternoon to catch stunning light for photography.',
      },
      photography: {
        icon: 'camera',
        text: 'The unique tilt and surrounding scenery make for iconic photos. The lighthouse against the Caribbean is especially dramatic.',
      },
    },
    narration: {
      anticipation: 'The leaning lighthouse appears. It defies expectations.',
      presence: 'It leans but stands. A symbol of resilience. The sea stretches before you.',
      transition: 'This lighthouse embodies strength. Carry this resilience forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-muelle-pescadores',
    name: 'Muelle de Pescadores',
    location: {
      latitude: 20.847527469824062,
      longitude: -86.8750709295273,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/9c06ac0f2_IMG_0429.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/2476f1136_IMG_0428.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/e8a3d2583_IMG_0430.jpeg',
    ],
    description: 'Pier connecting the local fishing community with visitors, heart of Puerto Morelos.',
    type: 'other',
    whyItMatters: 'The Muelle de Pescadores serves as the lifeblood of Puerto Morelos, connecting the vibrant local fishing community with visitors eager to experience the genuine essence of this coastal town. Here, the sounds of fishermen preparing their boats echo against the surf, creating a symphony of daily life. This dock not only supports the livelihoods of local anglers but also invites travelers to engage with the maritime culture of the region.',
    culturalContext: 'Historically, Puerto Morelos has been a small fishing village that has evolved while maintaining a strong connection to its roots. The Muelle de Pescadores stands as a testament to this heritage, reflecting the town\'s identity shaped by the sea and its resources. This dock has served as a hub for fisheries and as a gathering place for local artisans and vendors, enhancing the community aspect of the town.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the early morning to see fishermen at work and enjoy cooler temperatures. This is when the dock is most active.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant colors of boats and markets provide great photography opportunities. Capture the daily life of the fishing community.',
      },
    },
    narration: {
      anticipation: 'Sea breeze carries you. The dock calls.',
      presence: 'You\'re at the heart of Puerto Morelos. Fishermen prepare. Life unfolds. This is real.',
      transition: 'This dock is the town\'s soul. Carry this community forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-centro-cultural',
    name: 'Centro Cultural y Museo Puerto Morelos',
    location: {
      latitude: 20.848464937887343,
      longitude: -86.87628865242006,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/079b95eb3_IMG_0434.jpeg',
    ],
    description: 'Centro cultural que preserva la historia y tradiciones de Puerto Morelos.',
    type: 'museum',
    whyItMatters: 'Nestled in the heart of Puerto Morelos, the Centro Cultural y Museo stands as a beacon of the town\'s rich history and cultural diversity. It serves not only as a museum showcasing the art and traditions of the region but also as a cultural center where community events and workshops take place, celebrating local artists and their contributions. Visitors are given a unique opportunity to engage with various exhibitions that reflect the life of the Mayans, the local marine environment, and the customs that shape the identity of Puerto Morelos today.',
    culturalContext: 'The Centro Cultural y Museo Puerto Morelos plays a vital role in emphasizing the significance of the local identity and heritage. Established to honor the deep-rooted connections of the community to its Mayan origins, the center serves as a living archive that educates visitors about the area\'s history, marine ecosystems, and artistic expressions. It reflects a profound respect for the indigenous cultures while showcasing the evolving narrative of Puerto Morelos as a modern coastal town.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best to visit in the morning or late afternoon when it\'s cooler and less crowded. Check the schedule for workshops or special events.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant exhibits and the atmosphere of the center are worth capturing. Ask staff about photography policies.',
      },
    },
    narration: {
      anticipation: 'A hidden treasure awaits. Local heritage unfolds.',
      presence: 'Stories surround you. Maya. Sea. A village that became a town. This is memory.',
      transition: 'This center preserves what matters. Carry this understanding forward.',
    },
    hours: {
      monday: '9:00 - 17:00',
      tuesday: '9:00 - 17:00',
      wednesday: '9:00 - 17:00',
      thursday: '9:00 - 17:00',
      friday: '9:00 - 17:00',
      saturday: '9:00 - 17:00',
      sunday: '10:00 - 15:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-parque-fundadores',
    name: 'Parque Fundadores Puerto Morelos',
    location: {
      latitude: 20.8477153,
      longitude: -86.8760676,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Parque que sirve como punto de encuentro central en Puerto Morelos.',
    type: 'park',
    whyItMatters: 'Parque Fundadores serves as a vibrant gathering spot in the coastal town, where locals and visitors alike can enjoy the beauty of nature and community. This park is not just a place to relax, but also a venue for various cultural events that showcase the rich traditions of the area. The pathways, lined with native plants, invite you to stroll leisurely while admiring the sculptures and art installations that celebrate the artistic spirit of Puerto Morelos.',
    culturalContext: 'Historically, Parque Fundadores has played a significant role in fostering community and celebrating local culture. As a space dedicated to both recreation and creativity, it reflects the town\'s evolution while honoring traditional customs. Local artisans often display their crafts here, emphasizing the importance of preserving cultural practices and promoting the identity of Puerto Morelos as a fishing village that has grown into a charming tourist destination.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the early morning or late afternoon for cooler temperatures and fewer crowds.',
      },
      photography: {
        icon: 'camera',
        text: 'The park\'s art and natural beauty are worth capturing. Don\'t forget your camera for the sculptures and coastal views.',
      },
    },
    narration: {
      anticipation: 'Ocean sounds set the stage. A refreshing experience awaits.',
      presence: 'Community gathers here. Art meets nature. The spirit comes alive.',
      transition: 'This park is the town\'s heart. Carry this community forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-arrecife',
    name: 'Parque Nacional Arrecife de Puerto Morelos',
    location: {
      latitude: 20.9054732,
      longitude: -86.828322,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/495ddc3f9_IMG_0431.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/d49eb7d7a_IMG_0432.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/0f65986b7_IMG_0433.jpeg',
    ],
    description: 'National park protecting one of the last reefs of the Mesoamerican barrier system.',
    type: 'park',
    whyItMatters: 'Parque Nacional Arrecife de Puerto Morelos is a treasure trove of marine biodiversity, celebrated for its stunning coral reefs that are among the last remaining in the Mesoamerican barrier reef system. This national park serves as a crucial sanctuary for countless marine species including sea turtles, rays, and a dazzling variety of fish. The clear turquoise waters and gentle waves not only provide a picturesque setting but also support a flourishing underwater community.',
    culturalContext: 'Historically, the area around the park has been integral to the local economy, particularly for fishing and tourism. The community has a deep-rooted connection to the sea, and this park embodies a commitment to sustaining that relationship with the environment. The establishment of the national park reflects a broader recognition of the need to protect delicate marine ecosystems, which are key to the cultural identity and livelihood of the residents.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is early morning for calm waters and fewer crowds. Dry season (November-April) offers best visibility.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring a waterproof camera to capture stunning underwater scenes. The coral and marine life are spectacular.',
      },
    },
    narration: {
      anticipation: 'Protected waters await. A world beneath the surface calls.',
      presence: 'You float above a living reef. Turtles glide. Fish dart. Life thrives.',
      transition: 'This reef sustains life. Carry this understanding forward.',
    },
    restrictions: 'Respect the coral—no touching or stepping on it. Use reef-safe sunscreen. Follow guide instructions for safety.',
    cost: {
      currency: 'MXN',
      amount: 150,
      description: 'Park entrance fee',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'puerto-morelos-galeria-artezissimo',
    name: 'Galería Artezissimo',
    location: {
      latitude: 20.855232582136225,
      longitude: -86.8733060359955,
      adjustable: false,
    },
    photos: [
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/ba1de3190_IMG_0437.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/4cee09ba6_IMG_0436.jpeg',
      'https://base44.app/api/apps/69497a788f7fc3c25241b46f/files/public/69497a788f7fc3c25241b46f/0e42b9da6_IMG_0435.jpeg',
    ],
    description: 'Contemporary art gallery showcasing local and international talent.',
    type: 'museum',
    whyItMatters: 'Galería Artezissimo is not just an art gallery; it is a hub of creativity where local and international artists converge to exhibit their work. This dynamic space showcases a diverse array of contemporary pieces, from stunning paintings to intricate sculptures, each telling its own story and reflecting the current artistic trends. What sets it apart is its commitment to fostering art appreciation within the community through workshops, artist talks, and collaborative events.',
    culturalContext: 'Galería Artezissimo plays an essential role in the artistic identity of the region. By promoting both emerging and established talent, the gallery contributes to the development of a thriving cultural environment. It helps bridge the gap between traditional art forms and contemporary practices, allowing local artists to explore their identities while engaging with broader themes relevant to society today.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Best time to visit is during the opening night of a new exhibition for a vibrant atmosphere. Weekdays are less crowded.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the intricate details and stunning artwork. Ask first if photography is allowed in specific exhibitions.',
      },
    },
    narration: {
      anticipation: 'A vibrant tapestry awaits. Contemporary art calls.',
      presence: 'Creativity surrounds you. Each piece tells a story. Art comes alive.',
      transition: 'Art connects us. Carry this expression forward.',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 20:00',
      saturday: '10:00 - 20:00',
      sunday: '11:00 - 17:00',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === CENOTES Y LAGUNAS ===
  {
    id: 'cenote-nohoch-nah-chich',
    name: 'Cenote Nohoch Nah Chich',
    location: {
      latitude: 20.2000,
      longitude: -87.4000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    ],
    description: 'Parte del sistema de cuevas Sac Actun, ideal para buceo y snorkel.',
    type: 'other',
    whyItMatters: 'Cenote Nohoch Nah Chich is part of the vast Sac Actun cave system, offering a mesmerizing underwater experience. With its crystal-clear waters and intricate limestone formations, it\'s a haven for divers and snorkelers. The cenote\'s name translates to "Giant Birdhouse," reflecting the area\'s rich biodiversity. This natural wonder connects to the world\'s largest underwater cave system, making it a must-visit for adventure seekers.',
    culturalContext: 'For the ancient Maya, cenotes were sacred portals to the underworld, places of ritual and spiritual significance. Today, these natural formations continue to inspire awe and respect. The extensive cave systems beneath the Yucatán Peninsula represent one of the world\'s most unique geological features, formed over millions of years and now protected as natural treasures.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for best visibility and fewer crowds. Dry season (November-April) offers clearest water.',
      },
      photography: {
        icon: 'camera',
        text: 'Underwater photography requires waterproof equipment. The limestone formations and clear water create stunning images.',
      },
    },
    narration: {
      anticipation: 'You descend. A subterranean world unfolds.',
      presence: 'Crystal water surrounds you. Ancient limestone. A sacred portal.',
      transition: 'The cenote connects you to hidden depths. Carry this mystery forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 500,
      description: 'Snorkel tour (includes equipment)',
    },
    restrictions: 'Follow guide instructions. No touching formations. Use biodegradable sunscreen only.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'cenote-nicte-ha',
    name: 'Cenote Nicte-Ha',
    location: {
      latitude: 20.2500,
      longitude: -87.4500,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Cenote abierto con lirios flotantes y aguas turquesas, perfecto para snorkel.',
    type: 'other',
    whyItMatters: 'Cenote Nicte-Ha is a serene, open-air cenote adorned with floating lily pads and surrounded by lush jungle. Its clear, calm waters are ideal for snorkeling, offering glimpses of underwater flora and fauna. The cenote\'s tranquil ambiance makes it a perfect spot for relaxation and reflection, away from the more frequented tourist sites.',
    culturalContext: 'The name "Nicte-Ha" means "flower water" in Maya, reflecting the cenote\'s natural beauty. These open cenotes were particularly important to the Maya, as they provided access to fresh water and served as gathering places. Today, they continue to be places of natural beauty and spiritual significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for the best light and peaceful atmosphere. The lily pads are most beautiful in morning light.',
      },
      photography: {
        icon: 'camera',
        text: 'The floating lily pads and turquoise water create stunning photos. Underwater shots of the flora are especially beautiful.',
      },
    },
    narration: {
      anticipation: 'Through the jungle, an emerald gem appears. Flowers float.',
      presence: 'Turquoise water surrounds you. Lily pads drift. Pure tranquility.',
      transition: 'Pure serenity awaits. Carry this calm forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 300,
      description: 'Entrance fee',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'punta-laguna',
    name: 'Punta Laguna Nature Reserve',
    location: {
      latitude: 20.6500,
      longitude: -87.5500,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Community sanctuary protecting spider and howler monkeys.',
    type: 'park',
    whyItMatters: 'Punta Laguna is a community-run sanctuary dedicated to the preservation of spider and howler monkeys. Visitors can kayak on the tranquil lagoon, zip-line across the water, and embark on guided jungle treks to observe monkeys in their natural habitat. The reserve offers an authentic and immersive experience, connecting visitors with the region\'s rich biodiversity and cultural heritage.',
    culturalContext: 'Punta Laguna represents a successful model of community-based conservation, where local people protect and benefit from their natural resources. The reserve showcases the importance of sustainable tourism and the role of local communities in preserving biodiversity. It also offers insights into Mayan culture through traditional ceremonies and interactions with local guides.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning when monkeys are most active. The reserve opens at 8 AM. Guided tours are recommended.',
      },
      photography: {
        icon: 'camera',
        text: 'Bring a telephoto lens for monkey photography. The jungle setting offers great opportunities for wildlife and nature shots.',
      },
    },
    narration: {
      anticipation: 'Howler calls echo. You enter their world.',
      presence: 'Monkeys swing. You kayak. The jungle\'s rhythm pulses. Nature is alive.',
      transition: 'Communities can protect nature. Carry this model forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 200,
      description: 'Entrance fee (guided tour extra)',
    },
    restrictions: 'Follow guide instructions. Keep quiet to observe monkeys. No feeding wildlife.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'muyil-sian-kaan',
    name: 'Muyil & Sian Ka\'an Canal Float',
    location: {
      latitude: 20.0700,
      longitude: -87.6060,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Mayan ruins and floating through ancient canals in the Sian Ka\'an Biosphere Reserve.',
    type: 'monument',
    whyItMatters: 'Muyil is an ancient Mayan trading post located at the edge of the Sian Ka\'an Biosphere Reserve. After exploring the ruins, visitors can embark on a unique experience: floating down a crystal-clear canal built by the Maya over a thousand years ago. This serene "lazy river" ride through mangroves and wetlands provides a peaceful connection with nature and history.',
    culturalContext: 'Sian Ka\'an, meaning "Gate of Heaven" in Maya, is a UNESCO World Heritage Site encompassing diverse ecosystems. Muyil was a vital trading hub, and the canals demonstrate the Maya\'s sophisticated understanding of water management. Today, the reserve protects one of Mexico\'s most important ecosystems, showcasing the connection between ancient wisdom and modern conservation.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for cooler temperatures and better wildlife viewing. The float is especially peaceful in the morning.',
      },
      photography: {
        icon: 'camera',
        text: 'The ruins and canal offer stunning photography opportunities. Waterproof camera recommended for the float.',
      },
    },
    narration: {
      anticipation: 'Ancient ruins emerge. Maya canals await.',
      presence: 'You float through a thousand-year-old canal. Mangroves surround. Timeless.',
      transition: 'The Maya understood this place. Carry this wisdom forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 100,
      description: 'Ruins entrance (canal tour extra)',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    restrictions: 'Follow guide instructions in the reserve. Use biodegradable sunscreen. Respect wildlife.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === PLAYAS SECRETAS ===
  {
    id: 'playa-punta-esmeralda',
    name: 'Punta Esmeralda',
    location: {
      latitude: 20.6483209,
      longitude: -87.0507496,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Playa escondida conocida por su belleza natural y ambiente relajado, perfecta para escapar de las playas bulliciosas.',
    type: 'beach',
    whyItMatters: 'Punta Esmeralda is a hidden gem known for its stunning natural beauty and laid-back atmosphere, making it the perfect escape from the bustling beaches of Playa del Carmen. This serene beach features soft white sand and clear, calm waters, ideal for swimming, sunbathing, and watching the local wildlife. The beach is also distinguished by its unique cenote, which offers a refreshing contrast to the warm ocean waters.',
    culturalContext: 'Punta Esmeralda is part of the Yucatán Peninsula\'s diverse ecological and cultural tapestry, where land and sea converge to create unique habitats. As part of the larger Riviera Maya region, it reflects the area\'s historical roots, influenced by both the ancient Mayan civilization and the diverse modern communities that have settled here. This beach embodies the harmonious blend of tradition and contemporary life, showcasing the enduring connection the local population has with the natural surroundings.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the morning or late afternoon for the best lighting and fewer crowds. The cenote is especially refreshing in the afternoon.',
      },
      photography: {
        icon: 'camera',
        text: 'The combination of beach and cenote creates unique photo opportunities. Capture the contrast between ocean and cenote waters.',
      },
    },
    narration: {
      anticipation: 'Sandy shores await. Turquoise water captures your breath.',
      presence: 'Tranquility reigns here. Cenote meets ocean. Beauty undisturbed.',
      transition: 'This is the Riviera Maya as it should be. Carry this serenity forward.',
    },
    restrictions: 'Respect the natural environment. Take your trash with you. The cenote requires caution—check depth before diving.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'playa-72',
    name: 'Playa 72',
    location: {
      latitude: 20.64130351842349,
      longitude: -87.05734312534332,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Refugio tranquilo donde las aguas azules se encuentran con las arenas doradas, ofreciendo un escape perfecto.',
    type: 'beach',
    whyItMatters: 'Playa 72 is not just another beach; it\'s a tranquil haven where the azure waters meet the golden sands, offering a perfect escape from the bustling world. Renowned for its serene beauty and lesser crowds, this beach provides a unique space for relaxation and reflection, making it a favorite among locals seeking respite from daily life. Here, you can unwind under the sun, take leisurely strolls along the shore, or indulge in various water activities like snorkeling and paddleboarding.',
    culturalContext: 'Historically, Playa 72 reflects the evolving identity of the region, where traditions of fishing and community connection to the sea have shaped the local lifestyle. This coastline has long been a gathering place, not only for leisure but also for cultural expressions, such as music and dance, fostering a sense of belonging among those who visit. As seaside development has increased, Playa 72 has maintained its character, standing as a testament to the community\'s efforts to preserve its natural beauty and cultural significance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early in the morning or late in the afternoon to avoid midday heat and enjoy stunning sunrises or sunsets.',
      },
      photography: {
        icon: 'camera',
        text: 'The golden hour provides stunning lighting for beach photography. Capture families enjoying the space and the natural beauty.',
      },
    },
    narration: {
      anticipation: 'Soft sand beneath your feet. Waves greet you like an old friend.',
      presence: 'Time slows here. Families gather. Sun sets. Simple joys unfold.',
      transition: 'This beach embodies coastal living. Carry this peace forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'xpu-ha-secret',
    name: 'Xpu-Ha Secret Beach',
    location: {
      latitude: 20.5000,
      longitude: -87.2000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Tramo de playa de arena blanca conocida por sus aguas claras y ambiente relajado.',
    type: 'beach',
    whyItMatters: 'Xpu-Ha is a stretch of white-sand beach known for its clear waters and laid-back atmosphere. While parts of the beach have gained popularity, there are lesser-known entrances leading to quieter sections where visitors can enjoy the sun and sea in relative solitude. Local beach bars offer fresh ceviche and cold drinks, enhancing the authentic beach experience.',
    culturalContext: 'Xpu-Ha represents the authentic beach culture of the Riviera Maya, where local businesses and natural beauty coexist. The beach has maintained its character despite nearby development, offering visitors a glimpse of the region\'s coastal lifestyle. It serves as a reminder of the simple pleasures of beach life—sun, sand, sea, and good food.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during weekdays for fewer crowds. Early morning offers the most peaceful experience.',
      },
      photography: {
        icon: 'camera',
        text: 'The white sand and turquoise water create classic beach photos. Capture the relaxed atmosphere and local beach bars.',
      },
    },
    narration: {
      anticipation: 'White sand appears. Turquoise water. A classic Caribbean scene.',
      presence: 'This beach feels authentic. Fresh food. Clear water. Relaxed vibe.',
      transition: 'Beach life as it should be. Carry this ease forward.',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === EK BALAM (Valladolid area, but important for Riviera Maya) ===
  {
    id: 'ek-balam',
    name: 'Ek Balam Archaeological Site',
    location: {
      latitude: 20.8920,
      longitude: -88.1415,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Mayan archaeological site with an impressive pyramid that can still be climbed for panoramic views.',
    type: 'monument',
    whyItMatters: 'Ek Balam is a Maya archaeological site that stands out for its impressive main pyramid, the Acropolis, which visitors can still climb for panoramic views of the surrounding jungle. Less crowded than Chichén Itzá, it offers a more intimate experience with Maya history. The site\'s well-preserved structures and intricate stucco decorations provide a unique glimpse into Maya artistry and architectural sophistication.',
    culturalContext: 'Ek Balam, meaning "Black Jaguar" in Maya, was a powerful city during the Late Classic period (600-900 AD). The site is renowned for its elaborate stucco decorations, including the famous "Winged Warriors" on the Acropolis. Unlike many other Maya sites, Ek Balam allows visitors to climb its structures, offering a rare opportunity to experience these ancient buildings from the perspective of the Maya themselves.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning (8-10 AM) to avoid heat and crowds. The climb is easier in cooler temperatures.',
      },
      photography: {
        icon: 'camera',
        text: 'The view from the Acropolis is spectacular. Capture the jungle panorama and the intricate stucco decorations.',
      },
    },
    narration: {
      anticipation: 'The Acropolis rises. A pyramid that invites you to climb.',
      presence: 'You stand where priests once stood. The view is timeless. Connection profound.',
      transition: 'Intimacy with Maya history. Carry this wisdom forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 413,
      description: 'Entrance fee',
    },
    hours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '8:00 - 17:00',
      sunday: '8:00 - 17:00',
    },
    restrictions: 'Climbing requires caution. Follow marked paths. No climbing during rain.',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },

  // === CDMX - CONDESA ===
  {
    id: 'cdmx-condesa-parque-mexico',
    name: 'Parque México',
    location: {
      latitude: 19.4119,
      longitude: -99.1714,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Iconic art déco park in the heart of Condesa, a green oasis in the city.',
    type: 'park',
    whyItMatters: 'Parque México stands as the beating heart of Condesa, a neighborhood that breathes through its green spaces. This art déco masterpiece, designed in the 1920s, offers a rare moment of tranquility in one of Mexico City\'s most vibrant districts. The park\'s circular design, fountains, and mature trees create a sanctuary where locals gather, dogs play, and the city\'s rhythm slows to a contemplative pace.',
    culturalContext: 'Built during Mexico City\'s golden age of urban planning, Parque México represents the city\'s embrace of modernism and public space. The Condesa neighborhood, once a horse racing track, transformed into an architectural showcase of art déco and functionalist design. Today, the park remains a symbol of the neighborhood\'s bohemian spirit and commitment to preserving green spaces in an ever-growing metropolis.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for joggers and dog walkers, or late afternoon when families gather. Evenings are especially vibrant.',
      },
      photography: {
        icon: 'camera',
        text: 'The art déco fountains and mature trees create beautiful compositions. Golden hour offers stunning light through the canopy.',
      },
    },
    narration: {
      anticipation: 'Green spaces unfold. The city\'s rhythm slows.',
      presence: 'You stand in the heart of Condesa. Fountains flow. Life gathers. A sanctuary in the city.',
      transition: 'This park is the neighborhood\'s soul. Carry this tranquility forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-parque-espana',
    name: 'Parque España',
    location: {
      latitude: 19.4108,
      longitude: -99.1725,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Intimate park connecting Condesa and Roma, a peaceful gathering place.',
    type: 'park',
    whyItMatters: 'Parque España serves as a gentle bridge between Condesa and Roma, two neighborhoods that define Mexico City\'s bohemian character. Smaller and more intimate than its neighbor Parque México, this park offers quiet corners for reading, shaded paths for strolling, and a sense of community that feels both local and universal. Here, the city\'s energy softens, allowing for moments of reflection and connection.',
    culturalContext: 'The park reflects the European influence that shaped Condesa and Roma in the early 20th century, when these neighborhoods became home to immigrants and intellectuals. Parque España, named to honor the Spanish community, represents the cultural melting pot that defines modern Mexico City—a place where diverse influences converge to create something uniquely Mexican.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful stroll, or late afternoon when the light filters beautifully through the trees.',
      },
      photography: {
        icon: 'camera',
        text: 'The intimate scale and mature trees create cozy compositions. Capture the neighborhood\'s character through the park\'s details.',
      },
    },
    narration: {
      anticipation: 'A gentle bridge awaits. Two neighborhoods meet here.',
      presence: 'You stand in an intimate space. Quiet corners. Shaded paths. Community gathers.',
      transition: 'This park connects worlds. Carry this connection forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-cafe-toscano',
    name: 'Café Toscano',
    location: {
      latitude: 19.4115,
      longitude: -99.1718,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    ],
    description: 'Beloved neighborhood café embodying Condesa\'s café culture.',
    type: 'cafe',
    whyItMatters: 'Café Toscano represents the soul of Condesa\'s café culture—a place where time slows, conversations flow, and the neighborhood\'s bohemian spirit comes alive. This isn\'t just a coffee shop; it\'s a gathering place where writers, artists, and locals find inspiration in the simple act of sharing space. The aroma of freshly ground coffee, the clatter of cups, and the hum of conversation create a symphony of daily life.',
    culturalContext: 'Condesa\'s café culture emerged in the 1990s when the neighborhood became a haven for artists and intellectuals. Cafés like Toscano became the living rooms of the neighborhood, places where ideas were exchanged and community was built. Today, they represent the neighborhood\'s commitment to preserving spaces for human connection in an increasingly digital world.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for the best coffee and a quieter atmosphere, or late afternoon for the neighborhood\'s social energy.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the intimate atmosphere and neighborhood character. The café\'s details tell the story of Condesa\'s culture.',
      },
    },
    narration: {
      anticipation: 'Coffee aromas fill the air. A neighborhood gathering place awaits.',
      presence: 'You sit where ideas flow. Conversations hum. Community builds. This is Condesa\'s soul.',
      transition: 'Cafés connect us. Carry this warmth forward.',
    },
    hours: {
      monday: '7:00 - 22:00',
      tuesday: '7:00 - 22:00',
      wednesday: '7:00 - 22:00',
      thursday: '7:00 - 22:00',
      friday: '7:00 - 23:00',
      saturday: '8:00 - 23:00',
      sunday: '8:00 - 22:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-avenida-michoacan',
    name: 'Avenida Michoacán',
    location: {
      latitude: 19.4100,
      longitude: -99.1700,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Tree-lined avenue showcasing Condesa\'s art déco architecture and vibrant street life.',
    type: 'other',
    whyItMatters: 'Avenida Michoacán embodies the essence of Condesa—a tree-lined boulevard where architecture, nature, and daily life converge. The art déco buildings that line this avenue tell stories of a neighborhood that embraced modernism while preserving its human scale. Walking here, you feel the rhythm of a community that values beauty, connection, and the simple pleasure of a neighborhood stroll.',
    culturalContext: 'Avenida Michoacán represents Condesa\'s golden age of development in the 1920s and 1930s, when architects like Juan Segura and Francisco J. Serrano created buildings that blended European modernism with Mexican sensibilities. The wide sidewalks and mature trees reflect a vision of urban living that prioritized pedestrians and green space—a philosophy that continues to define the neighborhood today.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning when the light filters through the trees, or late afternoon when the neighborhood comes alive.',
      },
      photography: {
        icon: 'camera',
        text: 'The art déco facades and tree-lined streets create beautiful compositions. Capture the neighborhood\'s architectural character.',
      },
    },
    narration: {
      anticipation: 'Tree-lined streets await. Art déco beauty unfolds.',
      presence: 'You walk where architecture meets life. Buildings tell stories. The neighborhood breathes.',
      transition: 'This avenue embodies Condesa\'s spirit. Carry this beauty forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-plaza-popocatépetl',
    name: 'Plaza Popocatépetl',
    location: {
      latitude: 19.4095,
      longitude: -99.1695,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Intimate plaza at the heart of Condesa, a gathering place for the neighborhood.',
    type: 'park',
    whyItMatters: 'Plaza Popocatépetl serves as a microcosm of Condesa\'s community spirit—a small but vital space where neighbors meet, children play, and the neighborhood\'s rhythm becomes tangible. Named after the volcano visible from Mexico City on clear days, this plaza connects the urban experience to the natural world that surrounds the city. It\'s a reminder that even in the densest urban environments, spaces for gathering and reflection remain essential.',
    culturalContext: 'The plaza reflects Condesa\'s evolution from a residential neighborhood to a cultural hub. As the neighborhood grew, these small public spaces became anchors for community life. Plaza Popocatépetl, like many of Condesa\'s plazas, represents the neighborhood\'s commitment to preserving human-scale urban design in a city that constantly grows upward.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful moment, or late afternoon when families and neighbors gather.',
      },
      photography: {
        icon: 'camera',
        text: 'The intimate scale and neighborhood character create authentic moments. Capture the community spirit.',
      },
    },
    narration: {
      anticipation: 'A small plaza awaits. Community gathers here.',
      presence: 'You stand where neighbors meet. Children play. The neighborhood\'s rhythm pulses.',
      transition: 'This plaza anchors community. Carry this connection forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-casa-luis-barragán',
    name: 'Casa Luis Barragán',
    location: {
      latitude: 19.4102,
      longitude: -99.1945,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'UNESCO World Heritage site, the home and studio of Mexico\'s most celebrated architect.',
    type: 'museum',
    whyItMatters: 'Casa Luis Barragán stands as a testament to the power of architecture to create emotional and spiritual experiences. This isn\'t just a building; it\'s a meditation on light, color, and space. Barragán\'s home, where he lived and worked, reveals his philosophy that architecture should serve the soul, not just function. Every corner, every play of light, every carefully chosen color tells a story of a man who understood that buildings can be poetry.',
    culturalContext: 'Luis Barragán, Mexico\'s most celebrated architect, created a body of work that fused modernism with Mexican tradition, spirituality with function. His home, now a museum, represents his complete vision—a place where architecture becomes art, where space becomes experience. The house influenced generations of architects worldwide and remains a pilgrimage site for those who believe architecture can touch the human spirit.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Book in advance as visits are limited. Morning tours offer the best light to experience Barragán\'s mastery of natural illumination.',
      },
      photography: {
        icon: 'camera',
        text: 'Photography is restricted, but the experience of light and color is unforgettable. Focus on being present in the space.',
      },
    },
    narration: {
      anticipation: 'A house of light awaits. Architecture becomes poetry.',
      presence: 'You stand where Barragán lived. Light plays. Color speaks. Space becomes experience.',
      transition: 'Architecture can touch the soul. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 400,
      description: 'Guided tour (advance booking required)',
    },
    hours: {
      monday: '10:00 - 14:00',
      tuesday: '10:00 - 14:00',
      wednesday: '10:00 - 14:00',
      thursday: '10:00 - 14:00',
      friday: '10:00 - 14:00',
      saturday: '10:00 - 13:00',
      sunday: 'Closed',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-condesa-mercado-condesa',
    name: 'Mercado de Condesa',
    location: {
      latitude: 19.4090,
      longitude: -99.1705,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Neighborhood market offering fresh produce and local flavors in the heart of Condesa.',
    type: 'market',
    whyItMatters: 'Mercado de Condesa represents the neighborhood\'s connection to food, community, and daily life. Unlike the grand markets of the city center, this market feels intimate and local—a place where neighbors shop, vendors know their customers, and the rhythm of daily life unfolds. Here, you experience the authentic Condesa, where modern bohemian culture meets traditional Mexican market life.',
    culturalContext: 'Markets have always been the heart of Mexican neighborhoods, places where commerce, community, and culture converge. Mercado de Condesa, while smaller than the city\'s famous markets, maintains this tradition while adapting to the neighborhood\'s contemporary character. It represents how traditional spaces can evolve while preserving their essential role in community life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for the freshest produce and most vibrant atmosphere. Weekends are especially lively.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the vibrant colors, textures, and community spirit. Ask vendors before photographing.',
      },
    },
    narration: {
      anticipation: 'Market sounds grow. Fresh aromas fill the air.',
      presence: 'You stand where neighbors shop. Vendors know faces. Community thrives.',
      transition: 'Markets connect us to place. Carry this connection forward.',
    },
    hours: {
      monday: '7:00 - 19:00',
      tuesday: '7:00 - 19:00',
      wednesday: '7:00 - 19:00',
      thursday: '7:00 - 19:00',
      friday: '7:00 - 19:00',
      saturday: '7:00 - 20:00',
      sunday: '8:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === CDMX - ROMA ===
  {
    id: 'cdmx-roma-mercado-roma',
    name: 'Mercado Roma',
    location: {
      latitude: 19.4190,
      longitude: -99.1610,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Modern food hall reimagining the traditional market for contemporary Roma.',
    type: 'market',
    whyItMatters: 'Mercado Roma represents the evolution of Roma—a neighborhood that honors its past while embracing innovation. This modern food hall takes the traditional market concept and reimagines it for a new generation, creating a space where culinary creativity, community, and contemporary design converge. It\'s a place where you can taste the future of Mexican food while feeling the neighborhood\'s vibrant energy.',
    culturalContext: 'Roma has always been a neighborhood of innovation and reinvention. From its origins as an upscale residential area to its bohemian transformation, Roma has consistently evolved. Mercado Roma embodies this spirit, showing how traditional spaces can be reimagined while maintaining their role as community gathering places. It represents the neighborhood\'s commitment to culinary excellence and social connection.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during lunch or dinner hours for the full experience. Weekends are especially vibrant with families and friends gathering.',
      },
      photography: {
        icon: 'camera',
        text: 'The modern design and vibrant food stalls create beautiful compositions. Capture the energy and creativity.',
      },
    },
    narration: {
      anticipation: 'A modern market awaits. Innovation meets tradition.',
      presence: 'You stand where food becomes art. Creativity flows. Community gathers.',
      transition: 'This market reimagines tradition. Carry this innovation forward.',
    },
    hours: {
      monday: '12:00 - 22:00',
      tuesday: '12:00 - 22:00',
      wednesday: '12:00 - 22:00',
      thursday: '12:00 - 23:00',
      friday: '12:00 - 23:00',
      saturday: '11:00 - 23:00',
      sunday: '11:00 - 22:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-roma-plaza-rio-janeiro',
    name: 'Plaza Río de Janeiro',
    location: {
      latitude: 19.4185,
      longitude: -99.1605,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Iconic plaza featuring a replica of Michelangelo\'s David, a symbol of Roma\'s cultural aspirations.',
    type: 'park',
    whyItMatters: 'Plaza Río de Janeiro stands as a testament to Roma\'s cultural ambitions and its connection to global art and ideas. The replica of Michelangelo\'s David, standing in the center of this neighborhood plaza, represents the neighborhood\'s aspiration to bring world culture to local spaces. It\'s a place where high art meets daily life, where the neighborhood\'s bohemian spirit finds expression in unexpected ways.',
    culturalContext: 'Roma has always been a neighborhood that looked outward, embracing European and global influences while maintaining its Mexican identity. The plaza\'s David, installed in the 1970s, represents this cosmopolitan spirit—a neighborhood that believes art belongs in public spaces, that culture should be accessible, and that beauty can transform ordinary places into extraordinary ones.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for softer light on the sculpture, or late afternoon when the plaza comes alive with neighborhood activity.',
      },
      photography: {
        icon: 'camera',
        text: 'The David sculpture against the neighborhood backdrop creates interesting compositions. Capture the contrast between art and daily life.',
      },
    },
    narration: {
      anticipation: 'A plaza awaits. Art meets daily life.',
      presence: 'You stand before David. High art in a neighborhood space. Culture becomes accessible.',
      transition: 'Art belongs in public spaces. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-roma-calle-colima',
    name: 'Calle Colima',
    location: {
      latitude: 19.4195,
      longitude: -99.1615,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Vibrant street showcasing Roma\'s bohemian character with galleries, cafés, and street art.',
    type: 'other',
    whyItMatters: 'Calle Colima embodies the bohemian spirit of Roma—a street where art, culture, and daily life merge seamlessly. This is where galleries showcase contemporary work, cafés serve as meeting places for creatives, and street art tells stories of the neighborhood\'s evolving identity. Walking here, you feel the pulse of a neighborhood that values creativity, community, and the power of public space to inspire.',
    culturalContext: 'Roma has long been a magnet for artists, writers, and intellectuals. Calle Colima represents this tradition, where cultural spaces and everyday life coexist. The street reflects the neighborhood\'s history as a center of Mexican intellectual and artistic life, while also embracing the contemporary energy that makes Roma one of Mexico City\'s most dynamic neighborhoods.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for gallery browsing, or late afternoon when the street comes alive with café culture and evening energy.',
      },
      photography: {
        icon: 'camera',
        text: 'The street art, galleries, and café scenes create vibrant compositions. Capture the neighborhood\'s creative energy.',
      },
    },
    narration: {
      anticipation: 'A vibrant street awaits. Art and life merge here.',
      presence: 'You walk where creativity flows. Galleries. Cafés. Street art. The neighborhood pulses.',
      transition: 'This street embodies Roma\'s spirit. Carry this energy forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-roma-casa-lamm',
    name: 'Casa Lamm',
    location: {
      latitude: 19.4180,
      longitude: -99.1600,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Cultural center and gallery in a restored Porfirian mansion, showcasing contemporary art.',
    type: 'museum',
    whyItMatters: 'Casa Lamm represents Roma\'s commitment to preserving architectural heritage while fostering contemporary culture. This restored Porfirian mansion, transformed into a cultural center, bridges the neighborhood\'s elegant past with its vibrant present. Here, contemporary art exhibitions, literary events, and cultural programming create a space where history and innovation dialogue, where the neighborhood\'s cultural ambitions find expression.',
    culturalContext: 'Built during the Porfiriato, Casa Lamm represents Roma\'s origins as an upscale residential neighborhood. Its transformation into a cultural center reflects the neighborhood\'s evolution from residential elegance to bohemian creativity. Today, it stands as a symbol of how historic buildings can serve contemporary cultural needs, preserving architectural heritage while supporting artistic innovation.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during exhibition hours or attend one of the cultural events. Check the schedule for openings and special programs.',
      },
      photography: {
        icon: 'camera',
        text: 'The restored architecture and contemporary exhibitions create beautiful contrasts. Ask about photography policies.',
      },
    },
    narration: {
      anticipation: 'A restored mansion awaits. History meets contemporary culture.',
      presence: 'You stand where past and present dialogue. Art flows. Culture thrives.',
      transition: 'Historic spaces can serve contemporary needs. Carry this vision forward.',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-roma-parque-spain',
    name: 'Parque España',
    location: {
      latitude: 19.4175,
      longitude: -99.1595,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Tranquil park offering a green respite in the heart of Roma.',
    type: 'park',
    whyItMatters: 'Parque España provides a moment of calm in Roma\'s vibrant energy—a green space where the neighborhood can breathe. This park, smaller and more intimate than some of the city\'s grand plazas, offers something essential: a place to pause, to reflect, to connect with nature in the urban environment. It represents the neighborhood\'s understanding that great cities need both energy and tranquility, both activity and rest.',
    culturalContext: 'Parque España reflects Roma\'s European influences and its commitment to creating livable urban spaces. The park, like many in the neighborhood, represents a vision of urban life that values green space, pedestrian experience, and community gathering. It stands as a reminder that neighborhoods thrive when they offer both stimulation and sanctuary.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful moment, or late afternoon when the neighborhood gathers and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The intimate scale and mature trees create serene compositions. Capture the neighborhood\'s peaceful character.',
      },
    },
    narration: {
      anticipation: 'A green respite awaits. The neighborhood can breathe here.',
      presence: 'You stand in a moment of calm. Trees shade. Life pauses. Tranquility flows.',
      transition: 'Great cities need both energy and rest. Carry this balance forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-roma-cafe-pendulo',
    name: 'Café Péndulo',
    location: {
      latitude: 19.4190,
      longitude: -99.1610,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    ],
    description: 'Iconic bookstore café that has been Roma\'s intellectual hub for decades.',
    type: 'cafe',
    whyItMatters: 'Café Péndulo represents Roma\'s intellectual soul—a place where books, coffee, and conversation have created a community of readers and thinkers for decades. This isn\'t just a bookstore with a café; it\'s a cultural institution where ideas flow, where writers and readers meet, and where the neighborhood\'s commitment to intellectual life finds expression. Here, the act of browsing books becomes a form of community participation.',
    culturalContext: 'Roma has always been a neighborhood of intellectuals, writers, and artists. Café Péndulo, established in the 1990s, became a gathering place for this community, a space where literary culture and café culture merged. It represents the neighborhood\'s belief that bookstores are essential public spaces, that reading is a social act, and that ideas need places to flourish.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for quiet reading, or afternoon when the café buzzes with conversation and intellectual energy.',
      },
      photography: {
        icon: 'camera',
        text: 'Capture the bookstore atmosphere and café culture. The shelves and reading spaces tell stories of intellectual community.',
      },
    },
    narration: {
      anticipation: 'Books and coffee await. Ideas flow here.',
      presence: 'You stand where readers gather. Conversations hum. Intellectual life thrives.',
      transition: 'Bookstores are essential spaces. Carry this culture forward.',
    },
    hours: {
      monday: '8:00 - 22:00',
      tuesday: '8:00 - 22:00',
      wednesday: '8:00 - 22:00',
      thursday: '8:00 - 22:00',
      friday: '8:00 - 23:00',
      saturday: '9:00 - 23:00',
      sunday: '9:00 - 22:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === CDMX - CENTRO HISTÓRICO ===
  {
    id: 'cdmx-centro-zocalo',
    name: 'Zócalo',
    location: {
      latitude: 19.4326,
      longitude: -99.1332,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'The main square of Mexico City, the heart of the nation and one of the largest public plazas in the world.',
    type: 'park',
    whyItMatters: 'The Zócalo stands as the beating heart of Mexico—a vast plaza that has witnessed centuries of history, from Aztec ceremonies to modern protests. This is where the nation gathers, where history lives in every stone, and where the past and present of Mexico converge. Standing here, you feel the weight of history and the pulse of a living, breathing city that continues to evolve while honoring its deep roots.',
    culturalContext: 'The Zócalo sits on the site of the Aztec Templo Mayor, the spiritual center of Tenochtitlan. After the Spanish conquest, it became the Plaza Mayor of New Spain. Today, it remains the symbolic center of Mexican identity, a place where political, cultural, and social life converges. The plaza represents the continuity of Mexican civilization, from pre-Columbian times through colonial rule to modern independence.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds, or late afternoon when the light is beautiful. Avoid rush hours for a more contemplative experience.',
      },
      photography: {
        icon: 'camera',
        text: 'The vast scale and surrounding architecture create dramatic compositions. Capture the relationship between the plaza and the surrounding buildings.',
      },
    },
    narration: {
      anticipation: 'The heart of Mexico awaits. History lives in every stone.',
      presence: 'You stand where the nation gathers. Centuries converge. The city pulses.',
      transition: 'This plaza is Mexico\'s soul. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-centro-palacio-bellas-artes',
    name: 'Palacio de Bellas Artes',
    location: {
      latitude: 19.4342,
      longitude: -99.1413,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Mexico City\'s premier cultural center, a masterpiece of art nouveau and art déco architecture.',
    type: 'museum',
    whyItMatters: 'Palacio de Bellas Artes represents Mexico\'s cultural ambition—a building that houses the nation\'s most important artistic expressions while itself being a work of art. This is where Diego Rivera\'s murals meet the stage, where architecture becomes performance, and where Mexico\'s artistic identity finds its most public expression. The building stands as a testament to the belief that art belongs to everyone, that culture is a public good, and that beauty can elevate a nation.',
    culturalContext: 'Built over three decades, the Palacio represents Mexico\'s cultural renaissance in the early 20th century. It houses Diego Rivera\'s famous murals, hosts the nation\'s premier performing arts, and serves as a symbol of Mexico\'s commitment to making high culture accessible. The building\'s fusion of art nouveau and art déco styles reflects Mexico\'s embrace of international modernism while maintaining its unique cultural identity.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during exhibition hours or attend a performance. Check the schedule for murals viewing and cultural events.',
      },
      photography: {
        icon: 'camera',
        text: 'The architecture and murals create stunning compositions. Photography policies vary by area—ask staff.',
      },
    },
    narration: {
      anticipation: 'A cultural palace awaits. Art becomes public.',
      presence: 'You stand where art meets the people. Murals speak. Culture flows.',
      transition: 'Art belongs to everyone. Carry this vision forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 80,
      description: 'General admission (exhibitions may have separate fees)',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-centro-catedral-metropolitana',
    name: 'Catedral Metropolitana',
    location: {
      latitude: 19.4344,
      longitude: -99.1334,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'The largest cathedral in the Americas, a masterpiece of colonial architecture and spiritual center of Mexico.',
    type: 'monument',
    whyItMatters: 'The Catedral Metropolitana stands as a testament to faith, history, and architectural ambition. Built over three centuries, this cathedral represents the fusion of European and Mexican sensibilities, where baroque grandeur meets indigenous influences. More than a building, it\'s a living monument to the complex history of Mexico, where Spanish colonial power and indigenous resilience created something uniquely Mexican. Standing here, you feel the weight of centuries of prayer, the continuity of faith, and the power of architecture to express the inexpressible.',
    culturalContext: 'The cathedral was built on the site of the Aztec Templo Mayor, symbolizing the Spanish conquest and the imposition of Christianity. Yet over centuries, it became a uniquely Mexican expression of faith, incorporating indigenous elements and reflecting the complex cultural synthesis that defines Mexico. Today, it serves as both a place of worship and a symbol of Mexico\'s layered history.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or attend a mass to experience the cathedral as a living place of worship.',
      },
      photography: {
        icon: 'camera',
        text: 'The baroque architecture and interior details create stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A cathedral rises. Centuries of faith await.',
      presence: 'You stand where history and faith meet. Architecture speaks. Prayer flows.',
      transition: 'This cathedral embodies Mexico\'s layered history. Carry this understanding forward.',
    },
    hours: {
      monday: '7:00 - 20:00',
      tuesday: '7:00 - 20:00',
      wednesday: '7:00 - 20:00',
      thursday: '7:00 - 20:00',
      friday: '7:00 - 20:00',
      saturday: '7:00 - 20:00',
      sunday: '7:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-centro-templo-mayor',
    name: 'Templo Mayor',
    location: {
      latitude: 19.4347,
      longitude: -99.1329,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Archaeological site revealing the heart of the Aztec capital, Tenochtitlan.',
    type: 'monument',
    whyItMatters: 'Templo Mayor represents the rediscovery of Mexico\'s pre-Columbian past—a site that lay buried beneath the colonial city until 1978, when construction workers uncovered the great Coyolxauhqui stone. This discovery opened a window into the Aztec world, revealing the spiritual center of Tenochtitlan. Standing here, you connect with a civilization that built one of the world\'s great cities, a culture whose influence continues to shape modern Mexico.',
    culturalContext: 'Templo Mayor was the spiritual and political center of the Aztec empire, a place where the dual temples of Huitzilopochtli and Tlaloc represented the Aztec worldview. The site\'s discovery in the late 20th century sparked a renaissance of interest in Mexico\'s indigenous heritage, challenging narratives that began with the Spanish conquest. Today, it stands as a symbol of Mexico\'s complex identity, where pre-Columbian, colonial, and modern histories coexist.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning to avoid crowds and heat. Allow time for both the ruins and the excellent museum.',
      },
      photography: {
        icon: 'camera',
        text: 'The archaeological site and museum artifacts create powerful compositions. The contrast with the surrounding colonial city is striking.',
      },
    },
    narration: {
      anticipation: 'Ancient stones await. The Aztec heart emerges.',
      presence: 'You stand where Tenochtitlan\'s spirit lived. History resurfaces. Connection deepens.',
      transition: 'This site reveals Mexico\'s layered past. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 90,
      description: 'General admission (includes museum)',
    },
    hours: {
      monday: '9:00 - 17:00',
      tuesday: '9:00 - 17:00',
      wednesday: '9:00 - 17:00',
      thursday: '9:00 - 17:00',
      friday: '9:00 - 17:00',
      saturday: '9:00 - 17:00',
      sunday: '9:00 - 17:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-centro-madero-walking-street',
    name: 'Calle Madero',
    location: {
      latitude: 19.4335,
      longitude: -99.1380,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Pedestrian street connecting the Zócalo to the Alameda, showcasing colonial architecture and vibrant street life.',
    type: 'other',
    whyItMatters: 'Calle Madero represents the transformation of Mexico City\'s historic center—a street that was once clogged with traffic and is now a pedestrian paradise. This transformation reflects the city\'s commitment to reclaiming public space for people, to honoring its architectural heritage, and to creating livable urban environments. Walking here, you experience the historic center as it was meant to be experienced: slowly, on foot, with time to notice the details that tell stories of centuries past.',
    culturalContext: 'Calle Madero, named after Francisco I. Madero, the revolutionary leader, connects two of the city\'s most important public spaces. The street\'s colonial buildings, now housing shops, restaurants, and cultural spaces, represent the historic center\'s evolution from residential to commercial to cultural hub. The pedestrianization project, completed in 2010, represents a new vision for the historic center, prioritizing people over cars and heritage over convenience.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful stroll, or late afternoon when the street comes alive with activity and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The colonial architecture and street life create vibrant compositions. Capture the relationship between historic buildings and contemporary life.',
      },
    },
    narration: {
      anticipation: 'A pedestrian street awaits. History unfolds on foot.',
      presence: 'You walk where the city reclaims space. Architecture tells stories. Life flows.',
      transition: 'Streets belong to people. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === CDMX - POLANCO ===
  {
    id: 'cdmx-polanco-museo-soumaya',
    name: 'Museo Soumaya',
    location: {
      latitude: 19.4400,
      longitude: -99.2030,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Striking contemporary museum housing one of Latin America\'s most important art collections.',
    type: 'museum',
    whyItMatters: 'Museo Soumaya represents a bold vision of making art accessible to all—a museum that charges no admission and houses a world-class collection in an architectural statement that challenges conventions. The building itself, with its shimmering aluminum facade, is a work of art that reflects Mexico City\'s sky and the changing light of day. Inside, the collection spans centuries and continents, from pre-Columbian artifacts to European masters, creating a dialogue between cultures and eras.',
    culturalContext: 'Founded by Carlos Slim, one of Mexico\'s most prominent businessmen, Museo Soumaya represents a new model of cultural philanthropy in Mexico. The museum\'s free admission policy reflects a commitment to making art accessible to everyone, regardless of economic means. The building, designed by Fernando Romero, represents contemporary Mexican architecture\'s engagement with global design while maintaining a uniquely Mexican identity.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds, or late afternoon when the building\'s facade reflects the changing light beautifully.',
      },
      photography: {
        icon: 'camera',
        text: 'The building\'s architecture and the collection create stunning compositions. The interior spiral ramp offers unique perspectives.',
      },
    },
    narration: {
      anticipation: 'A shimmering building awaits. Art becomes accessible.',
      presence: 'You stand where cultures dialogue. Centuries meet. Art flows freely.',
      transition: 'Art belongs to everyone. Carry this vision forward.',
    },
    hours: {
      monday: '10:30 - 18:30',
      tuesday: '10:30 - 18:30',
      wednesday: '10:30 - 18:30',
      thursday: '10:30 - 18:30',
      friday: '10:30 - 18:30',
      saturday: '10:30 - 18:30',
      sunday: '10:30 - 18:30',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-polanco-parque-lincoln',
    name: 'Parque Lincoln',
    location: {
      latitude: 19.4320,
      longitude: -99.2000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Elegant park in the heart of Polanco, offering tranquility in one of Mexico City\'s most upscale neighborhoods.',
    type: 'park',
    whyItMatters: 'Parque Lincoln represents Polanco\'s commitment to creating livable urban spaces—a park that offers both tranquility and community gathering. This isn\'t just green space; it\'s a carefully designed environment where mature trees, walking paths, and open areas create a sense of sanctuary in the city. Here, the neighborhood can breathe, children can play, and the pace of urban life slows to a contemplative rhythm.',
    culturalContext: 'Polanco, developed in the 1930s and 1940s, represents Mexico City\'s embrace of modern urban planning and international style architecture. Parque Lincoln, like the neighborhood itself, reflects a vision of urban living that values green space, pedestrian experience, and community. The park represents the neighborhood\'s evolution from a residential enclave to a vibrant cultural and commercial center while maintaining its commitment to quality of life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for joggers and peaceful moments, or late afternoon when families gather and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The mature trees and elegant design create serene compositions. Capture the neighborhood\'s character through the park\'s details.',
      },
    },
    narration: {
      anticipation: 'A tranquil park awaits. The neighborhood can breathe here.',
      presence: 'You stand in an elegant space. Trees shade. Life gathers. Peace flows.',
      transition: 'This park embodies urban quality of life. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-polanco-avenida-presidente-masaryk',
    name: 'Avenida Presidente Masaryk',
    location: {
      latitude: 19.4300,
      longitude: -99.1980,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Polanco\'s main shopping avenue, showcasing luxury boutiques and contemporary architecture.',
    type: 'other',
    whyItMatters: 'Avenida Presidente Masaryk represents Polanco\'s evolution into one of Latin America\'s premier shopping destinations, while also showcasing contemporary Mexican architecture. This isn\'t just a commercial street; it\'s a showcase of design, where international luxury brands meet Mexican architectural innovation. Walking here, you experience the neighborhood\'s sophisticated character, its embrace of global culture, and its commitment to quality and design.',
    culturalContext: 'Named after Tomáš Masaryk, the first president of Czechoslovakia, the avenue reflects Polanco\'s international character and its history as a neighborhood that welcomed European immigrants. Today, it represents the neighborhood\'s transformation into a global destination while maintaining its residential character. The avenue showcases how commercial and residential uses can coexist harmoniously in well-designed urban environments.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for window shopping and architecture appreciation, or late afternoon when the street comes alive with activity.',
      },
      photography: {
        icon: 'camera',
        text: 'The contemporary architecture and street design create interesting compositions. Capture the neighborhood\'s sophisticated character.',
      },
    },
    narration: {
      anticipation: 'A sophisticated avenue awaits. Design meets commerce.',
      presence: 'You walk where luxury meets innovation. Architecture speaks. Culture flows.',
      transition: 'This avenue embodies Polanco\'s character. Carry this sophistication forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === CDMX - COYOACÁN ===
  {
    id: 'cdmx-coyoacan-plaza-hidalgo',
    name: 'Plaza Hidalgo',
    location: {
      latitude: 19.3500,
      longitude: -99.1620,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'The heart of Coyoacán, a historic plaza where the neighborhood\'s bohemian spirit comes alive.',
    type: 'park',
    whyItMatters: 'Plaza Hidalgo stands as the soul of Coyoacán—a plaza that has been the neighborhood\'s gathering place for centuries. This is where history lives in the cobblestones, where the neighborhood\'s bohemian character finds expression, and where the pace of life slows to allow for conversation, contemplation, and connection. The plaza represents Coyoacán\'s unique character: a neighborhood that feels like a village within a megacity, where community and culture converge.',
    culturalContext: 'Coyoacán, meaning "place of coyotes" in Nahuatl, was an important pre-Columbian settlement that became a colonial town and eventually a neighborhood of Mexico City. Plaza Hidalgo, like the neighborhood itself, preserves this layered history while embracing its contemporary role as a cultural hub. The plaza has long been a gathering place for artists, intellectuals, and bohemians, maintaining Coyoacán\'s reputation as Mexico City\'s most bohemian neighborhood.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit on weekends when the plaza comes alive with markets, musicians, and neighborhood activity. Evenings are especially vibrant.',
      },
      photography: {
        icon: 'camera',
        text: 'The historic architecture and vibrant street life create beautiful compositions. Capture the neighborhood\'s bohemian character.',
      },
    },
    narration: {
      anticipation: 'A historic plaza awaits. The neighborhood\'s soul gathers here.',
      presence: 'You stand where history lives. Cobblestones tell stories. Community thrives.',
      transition: 'This plaza is Coyoacán\'s heart. Carry this spirit forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-coyoacan-casa-azul',
    name: 'Casa Azul (Frida Kahlo Museum)',
    location: {
      latitude: 19.3550,
      longitude: -99.1625,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'The iconic blue house where Frida Kahlo was born, lived, and died, now a museum celebrating her life and art.',
    type: 'museum',
    whyItMatters: 'Casa Azul stands as a pilgrimage site for those who understand that art and life are inseparable. This isn\'t just a museum; it\'s the place where Frida Kahlo\'s pain and passion found expression, where her unique vision of Mexican identity was born, and where she created some of the 20th century\'s most powerful art. Walking through these rooms, you don\'t just see her paintings; you feel her presence, understand her struggles, and connect with a woman who transformed personal pain into universal art.',
    culturalContext: 'Frida Kahlo has become an icon of Mexican identity, a symbol of resilience, and a voice for those who have been marginalized. Casa Azul, preserved exactly as she left it, offers an intimate glimpse into her world. The house reflects her deep connection to Mexican folk art, her political commitments, and her personal relationships. Today, it stands as a testament to how one person\'s art can speak to millions, how personal expression can become universal, and how a house can become a shrine to creativity.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Book tickets in advance online. Visit early morning for fewer crowds. Allow time to absorb the intimate atmosphere.',
      },
      photography: {
        icon: 'camera',
        text: 'Photography is restricted in some areas. Focus on being present in the space where Frida lived and created.',
      },
    },
    narration: {
      anticipation: 'A blue house awaits. Frida\'s world unfolds.',
      presence: 'You stand where pain became art. Her presence lingers. Creativity flows.',
      transition: 'Art and life are one. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 250,
      description: 'General admission (advance booking recommended)',
    },
    hours: {
      monday: '10:00 - 17:30',
      tuesday: '10:00 - 17:30',
      wednesday: '10:00 - 17:30',
      thursday: '10:00 - 17:30',
      friday: '10:00 - 17:30',
      saturday: '10:00 - 17:30',
      sunday: '10:00 - 17:30',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-coyoacan-calle-ignacio-allende',
    name: 'Calle Ignacio Allende',
    location: {
      latitude: 19.3520,
      longitude: -99.1630,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Cobblestone street showcasing Coyoacán\'s colonial architecture and bohemian character.',
    type: 'other',
    whyItMatters: 'Calle Ignacio Allende represents Coyoacán\'s essence—a street where colonial architecture, cobblestone paths, and bohemian culture create an atmosphere that feels both historic and alive. Walking here, you experience the neighborhood as it was meant to be experienced: slowly, with attention to detail, with time to notice the way light falls on colonial facades, the way plants spill from balconies, and the way the neighborhood\'s creative spirit finds expression in every corner.',
    culturalContext: 'Coyoacán\'s cobblestone streets preserve the neighborhood\'s colonial character while accommodating contemporary life. Calle Ignacio Allende, like many streets in the neighborhood, represents this balance—where historic preservation meets modern living, where architecture tells stories of the past while serving the needs of the present. The street reflects Coyoacán\'s unique character as a neighborhood that feels like a village within a megacity.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for peaceful strolling, or late afternoon when the light is beautiful and the neighborhood comes alive.',
      },
      photography: {
        icon: 'camera',
        text: 'The colonial architecture and cobblestone streets create beautiful compositions. Capture the neighborhood\'s timeless character.',
      },
    },
    narration: {
      anticipation: 'Cobblestone streets await. Colonial beauty unfolds.',
      presence: 'You walk where history lives. Architecture tells stories. The neighborhood breathes.',
      transition: 'This street embodies Coyoacán\'s character. Carry this beauty forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'cdmx-coyoacan-viveros-coyoacan',
    name: 'Viveros de Coyoacán',
    location: {
      latitude: 19.3450,
      longitude: -99.1550,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Urban nursery and park offering a green sanctuary in the heart of Coyoacán.',
    type: 'park',
    whyItMatters: 'Viveros de Coyoacán represents the city\'s commitment to green space and environmental education—a place where trees are grown for the city\'s parks, where joggers find their rhythm, and where nature and urban life coexist harmoniously. This isn\'t just a park; it\'s a working nursery that serves the entire city, a place where you can see the trees that will one day shade other neighborhoods, where the cycle of urban greening becomes visible.',
    culturalContext: 'Viveros was established in the early 20th century as part of Mexico City\'s urban planning vision. It represents the city\'s understanding that great cities need both built and natural environments, that green space is essential infrastructure, and that environmental education happens best in places where people can see and experience the natural world. The nursery reflects Mexico City\'s ongoing commitment to greening the city despite its challenges.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for joggers and peaceful moments, or late afternoon when families gather and the light filters through the trees.',
      },
      photography: {
        icon: 'camera',
        text: 'The nursery rows and mature trees create beautiful compositions. Capture the relationship between cultivation and recreation.',
      },
    },
    narration: {
      anticipation: 'A green sanctuary awaits. Trees grow for the city.',
      presence: 'You stand where nature serves the urban. Trees mature. Life cycles.',
      transition: 'Green space is essential infrastructure. Carry this understanding forward.',
    },
    hours: {
      monday: '6:00 - 18:00',
      tuesday: '6:00 - 18:00',
      wednesday: '6:00 - 18:00',
      thursday: '6:00 - 18:00',
      friday: '6:00 - 18:00',
      saturday: '6:00 - 18:00',
      sunday: '6:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === OAXACA - CAPITAL ===
  {
    id: 'oaxaca-capital-mercado-20-noviembre',
    name: 'Mercado 20 de Noviembre',
    location: {
      latitude: 17.0614,
      longitude: -96.7236,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Vibrant market showcasing Oaxaca\'s culinary traditions and local flavors.',
    type: 'market',
    whyItMatters: 'Mercado 20 de Noviembre stands as the heart of Oaxaca\'s food culture—a market where the region\'s legendary cuisine comes alive. This isn\'t just a place to shop; it\'s a sensory experience where the aromas of mole, tlayudas, and chapulines fill the air, where vendors share generations of culinary knowledge, and where the act of eating becomes a connection to Oaxaca\'s deep cultural roots. Here, food is more than sustenance; it\'s a form of cultural expression, a way of preserving tradition, and a bridge between past and present.',
    culturalContext: 'Oaxaca is Mexico\'s culinary capital, and Mercado 20 de Noviembre represents this tradition. The market showcases ingredients and techniques that have been passed down through generations, from pre-Columbian times through colonial influences to contemporary innovation. The market reflects Oaxaca\'s unique position as a place where indigenous, Spanish, and contemporary Mexican cultures have created one of the world\'s great cuisines.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for the freshest ingredients and most vibrant atmosphere. Lunch hours are perfect for experiencing the food stalls.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant colors, textures, and food displays create stunning compositions. Ask vendors before photographing.',
      },
    },
    narration: {
      anticipation: 'Market aromas fill the air. Oaxaca\'s culinary heart awaits.',
      presence: 'You stand where food becomes culture. Flavors tell stories. Tradition flows.',
      transition: 'Food connects us to place. Carry this connection forward.',
    },
    hours: {
      monday: '6:00 - 20:00',
      tuesday: '6:00 - 20:00',
      wednesday: '6:00 - 20:00',
      thursday: '6:00 - 20:00',
      friday: '6:00 - 20:00',
      saturday: '6:00 - 20:00',
      sunday: '6:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-capital-templo-santo-domingo',
    name: 'Templo de Santo Domingo',
    location: {
      latitude: 17.0628,
      longitude: -96.7244,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Baroque masterpiece and spiritual center of Oaxaca, a testament to colonial artistry.',
    type: 'monument',
    whyItMatters: 'Templo de Santo Domingo represents the height of Mexican baroque architecture—a church where European design met indigenous artistry to create something uniquely Mexican. The church\'s ornate facade, gilded interior, and intricate details tell a story of faith, power, and cultural synthesis. More than a building, it\'s a work of art that has served as Oaxaca\'s spiritual center for centuries, a place where the sacred and the artistic merge into something transcendent.',
    culturalContext: 'Built by the Dominican order in the 16th and 17th centuries, Santo Domingo represents the fusion of Spanish colonial power and indigenous craftsmanship. The church\'s baroque style, adapted to Mexican sensibilities, reflects the complex cultural synthesis that defines Oaxaca. Today, it stands as both a place of worship and a symbol of Oaxaca\'s layered history, where colonial and indigenous influences created something uniquely Mexican.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or attend a mass to experience the church as a living place of worship.',
      },
      photography: {
        icon: 'camera',
        text: 'The baroque architecture and gilded interior create stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A baroque masterpiece awaits. Faith and art merge.',
      presence: 'You stand where cultures synthesized. Architecture speaks. Spirit flows.',
      transition: 'This church embodies Oaxaca\'s layered history. Carry this understanding forward.',
    },
    hours: {
      monday: '7:00 - 13:00, 16:00 - 20:00',
      tuesday: '7:00 - 13:00, 16:00 - 20:00',
      wednesday: '7:00 - 13:00, 16:00 - 20:00',
      thursday: '7:00 - 13:00, 16:00 - 20:00',
      friday: '7:00 - 13:00, 16:00 - 20:00',
      saturday: '7:00 - 13:00, 16:00 - 20:00',
      sunday: '7:00 - 13:00, 16:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-capital-zocalo',
    name: 'Zócalo de Oaxaca',
    location: {
      latitude: 17.0617,
      longitude: -96.7239,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'The main square of Oaxaca, a vibrant gathering place surrounded by colonial architecture.',
    type: 'park',
    whyItMatters: 'The Zócalo of Oaxaca stands as the city\'s living room—a plaza where daily life unfolds, where history lives in the surrounding architecture, and where the city\'s rhythm becomes tangible. This isn\'t just a square; it\'s a stage for Oaxaca\'s cultural life, where musicians play, vendors sell, families gather, and the city\'s identity finds expression. The plaza represents Oaxaca\'s unique character: a city that honors its past while embracing its present, where tradition and modernity coexist harmoniously.',
    culturalContext: 'Oaxaca\'s Zócalo has been the city\'s center since colonial times, serving as both a political and social gathering place. The surrounding architecture, from the Government Palace to the arcades that house shops and restaurants, tells the story of a city that has evolved while preserving its character. The plaza reflects Oaxaca\'s position as a cultural capital, a place where indigenous, colonial, and contemporary influences create a uniquely Oaxacan identity.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful moment, or late afternoon when the plaza comes alive with activity, music, and evening energy.',
      },
      photography: {
        icon: 'camera',
        text: 'The colonial architecture and vibrant street life create beautiful compositions. Capture the plaza\'s role as a gathering place.',
      },
    },
    narration: {
      anticipation: 'A vibrant plaza awaits. The city\'s heart gathers here.',
      presence: 'You stand where daily life unfolds. Music plays. Community thrives.',
      transition: 'This plaza is Oaxaca\'s soul. Carry this spirit forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-capital-calle-macedonio-alcala',
    name: 'Calle Macedonio Alcalá',
    location: {
      latitude: 17.0620,
      longitude: -96.7240,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Pedestrian street showcasing Oaxaca\'s colonial architecture and vibrant cultural life.',
    type: 'other',
    whyItMatters: 'Calle Macedonio Alcalá represents Oaxaca\'s commitment to creating livable urban spaces—a pedestrian street where architecture, culture, and daily life merge seamlessly. Walking here, you experience the city as it was meant to be experienced: slowly, on foot, with time to notice the colonial facades, the art galleries, the cafés, and the way the city\'s cultural life finds expression in public space. This street embodies Oaxaca\'s understanding that great cities are made for people, not cars.',
    culturalContext: 'The pedestrianization of Calle Macedonio Alcalá represents Oaxaca\'s vision of urban life, where historic preservation meets contemporary needs. The street showcases the city\'s colonial architecture while serving as a cultural corridor, connecting the Zócalo to Santo Domingo and housing galleries, shops, and cultural spaces. It reflects Oaxaca\'s commitment to making culture accessible and public space vibrant.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for peaceful strolling, or late afternoon when the street comes alive with activity and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The colonial architecture and street life create vibrant compositions. Capture the relationship between historic buildings and contemporary culture.',
      },
    },
    narration: {
      anticipation: 'A pedestrian street awaits. Culture unfolds on foot.',
      presence: 'You walk where architecture meets life. Galleries. Cafés. Culture flows.',
      transition: 'Streets belong to people. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-capital-museo-textil',
    name: 'Museo Textil de Oaxaca',
    location: {
      latitude: 17.0625,
      longitude: -96.7242,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Museum celebrating Oaxaca\'s textile traditions, showcasing the region\'s weaving heritage.',
    type: 'museum',
    whyItMatters: 'Museo Textil de Oaxaca stands as a testament to the region\'s textile traditions—a museum that honors the artistry, skill, and cultural significance of Oaxacan weaving. This isn\'t just a collection of textiles; it\'s a celebration of a living tradition, where ancient techniques meet contemporary innovation, where indigenous knowledge finds expression in thread and color, and where the act of weaving becomes a form of cultural preservation and artistic expression.',
    culturalContext: 'Oaxaca is one of Mexico\'s most important textile regions, with traditions that span centuries and communities. The museum represents the region\'s commitment to preserving these traditions while supporting contemporary weavers. It showcases how textile arts serve as both cultural expression and economic activity, how traditional knowledge can inform contemporary practice, and how museums can serve living communities.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during exhibition hours. Check the schedule for workshops and special events that connect visitors with weavers.',
      },
      photography: {
        icon: 'camera',
        text: 'The textiles and exhibitions create beautiful compositions. Ask about photography policies.',
      },
    },
    narration: {
      anticipation: 'A textile museum awaits. Thread and color tell stories.',
      presence: 'You stand where tradition meets innovation. Weaving becomes art. Culture preserves.',
      transition: 'Textiles connect us to place. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 50,
      description: 'General admission',
    },
    hours: {
      monday: '10:00 - 20:00',
      tuesday: '10:00 - 20:00',
      wednesday: '10:00 - 20:00',
      thursday: '10:00 - 20:00',
      friday: '10:00 - 20:00',
      saturday: '10:00 - 20:00',
      sunday: '10:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === OAXACA - PUERTO ESCONDIDO ===
  {
    id: 'oaxaca-puerto-escondido-playa-zicatela',
    name: 'Playa Zicatela',
    location: {
      latitude: 15.8500,
      longitude: -97.0667,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Legendary surf beach known for powerful waves and bohemian beach culture.',
    type: 'beach',
    whyItMatters: 'Playa Zicatela represents Puerto Escondido\'s transformation from a fishing village to a world-renowned surf destination, while maintaining its authentic character. This isn\'t just a beach; it\'s a place where the ocean\'s power meets human courage, where surfers from around the world test themselves against waves that can reach 15 feet, and where a bohemian beach culture has flourished. The beach embodies Puerto Escondido\'s unique character: a place where adventure and tranquility coexist, where the raw power of nature meets human resilience.',
    culturalContext: 'Zicatela, meaning "place of large thorns" in Zapotec, has become one of the world\'s most famous surf breaks. The beach\'s transformation reflects Puerto Escondido\'s evolution while maintaining its authentic character. The bohemian culture that developed here represents a unique blend of local Oaxacan traditions and international surf culture, creating a community that values both adventure and connection to place.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for the best surf conditions and fewer crowds. Sunset offers stunning views and a vibrant beach scene.',
      },
      photography: {
        icon: 'camera',
        text: 'The powerful waves and beach culture create dramatic compositions. Capture the surfers and the natural beauty.',
      },
    },
    narration: {
      anticipation: 'A legendary beach awaits. Ocean power meets human courage.',
      presence: 'You stand where waves challenge. Surfers test limits. Nature\'s force flows.',
      transition: 'This beach embodies adventure and authenticity. Carry this spirit forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-puerto-escondido-mirador',
    name: 'Mirador de Puerto Escondido',
    location: {
      latitude: 15.8600,
      longitude: -97.0700,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Scenic viewpoint offering panoramic views of Puerto Escondido and the Pacific Ocean.',
    type: 'viewpoint',
    whyItMatters: 'The Mirador offers a moment to step back and see Puerto Escondido in its full context—a town where the mountains meet the sea, where development and nature coexist, and where the vastness of the Pacific reminds you of your place in the world. This isn\'t just a viewpoint; it\'s a place for perspective, where the town\'s scale becomes clear, where the ocean\'s immensity becomes tangible, and where you can appreciate Puerto Escondido as both a destination and a place in the larger natural world.',
    culturalContext: 'The mirador represents Puerto Escondido\'s position between the Sierra Madre del Sur and the Pacific Ocean, a geography that has shaped the town\'s character. The viewpoint offers a perspective on how the town has grown while respecting its natural setting, how development has been shaped by topography, and how the relationship between land and sea defines the place.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit at sunset for the most dramatic views, or early morning for clear visibility and fewer crowds.',
      },
      photography: {
        icon: 'camera',
        text: 'The panoramic views create stunning compositions. Capture the relationship between town, mountains, and ocean.',
      },
    },
    narration: {
      anticipation: 'A viewpoint awaits. Perspective opens.',
      presence: 'You stand where mountains meet sea. The town unfolds. Ocean stretches.',
      transition: 'This view offers perspective. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'oaxaca-puerto-escondido-playa-carrizalillo',
    name: 'Playa Carrizalillo',
    location: {
      latitude: 15.8550,
      longitude: -97.0650,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Intimate cove beach offering calm waters and a more relaxed atmosphere than Zicatela.',
    type: 'beach',
    whyItMatters: 'Playa Carrizalillo offers a different side of Puerto Escondido—a sheltered cove where the ocean\'s power gives way to tranquility, where families can swim safely, and where the pace of life slows to match the gentle waves. This beach represents the town\'s diversity, showing that Puerto Escondido offers both adventure and peace, both challenge and rest. It\'s a reminder that great destinations offer multiple experiences, that the same ocean can be both powerful and gentle.',
    culturalContext: 'Carrizalillo represents Puerto Escondido\'s appeal to diverse visitors—from surfers seeking challenge to families seeking tranquility. The beach reflects the town\'s evolution as a destination that can accommodate different travel styles and preferences, showing how a place can maintain its authentic character while offering varied experiences.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for the calmest conditions, or late afternoon when the light is beautiful and the beach is less crowded.',
      },
      photography: {
        icon: 'camera',
        text: 'The cove setting and calm waters create serene compositions. Capture the contrast with Zicatela\'s power.',
      },
    },
    narration: {
      anticipation: 'A sheltered cove awaits. Tranquility flows.',
      presence: 'You stand where ocean calms. Families gather. Peace flows.',
      transition: 'This beach offers rest. Carry this tranquility forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === SAN LUIS POTOSÍ ===
  {
    id: 'slp-capital-plaza-armas',
    name: 'Plaza de Armas',
    location: {
      latitude: 22.1514,
      longitude: -100.9764,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'The main square of San Luis Potosí, surrounded by baroque architecture and colonial history.',
    type: 'park',
    whyItMatters: 'Plaza de Armas stands as the heart of San Luis Potosí—a plaza where the city\'s colonial past lives in the surrounding baroque architecture, where daily life unfolds in the shade of mature trees, and where the city\'s identity finds expression. This isn\'t just a square; it\'s a stage for the city\'s cultural life, where the rhythm of a colonial city becomes tangible, where history and present meet, and where the city\'s character is most clearly expressed.',
    culturalContext: 'San Luis Potosí was founded as a mining town in the 16th century, and Plaza de Armas has been its center ever since. The surrounding baroque architecture reflects the city\'s wealth during the colonial period, when silver mining made it one of New Spain\'s most important cities. Today, the plaza represents the city\'s commitment to preserving its historic character while serving contemporary needs.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for a peaceful moment, or late afternoon when the plaza comes alive with activity and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The baroque architecture and plaza life create beautiful compositions. Capture the relationship between historic buildings and daily life.',
      },
    },
    narration: {
      anticipation: 'A colonial plaza awaits. History lives in stone.',
      presence: 'You stand where the city\'s heart beats. Architecture tells stories. Life flows.',
      transition: 'This plaza is the city\'s soul. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'slp-capital-catedral-metropolitana',
    name: 'Catedral Metropolitana',
    location: {
      latitude: 22.1516,
      longitude: -100.9766,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Baroque cathedral showcasing the city\'s colonial wealth and architectural ambition.',
    type: 'monument',
    whyItMatters: 'The Catedral Metropolitana represents San Luis Potosí\'s colonial ambition—a baroque masterpiece that reflects the city\'s wealth during the silver mining boom. The cathedral\'s ornate facade, intricate details, and grand scale tell a story of faith, power, and artistic achievement. More than a building, it\'s a testament to the city\'s position as one of New Spain\'s most important centers, where mining wealth funded architectural grandeur.',
    culturalContext: 'Built over several centuries, the cathedral reflects the evolution of baroque architecture in Mexico. The building represents the fusion of European design and Mexican craftsmanship, where Spanish colonial power found expression in stone and mortar. Today, it stands as both a place of worship and a symbol of the city\'s layered history.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or attend a mass to experience the cathedral as a living place of worship.',
      },
      photography: {
        icon: 'camera',
        text: 'The baroque architecture creates stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A baroque cathedral awaits. Faith and ambition merge.',
      presence: 'You stand where wealth became art. Architecture speaks. History flows.',
      transition: 'This cathedral embodies the city\'s past. Carry this understanding forward.',
    },
    hours: {
      monday: '7:00 - 20:00',
      tuesday: '7:00 - 20:00',
      wednesday: '7:00 - 20:00',
      thursday: '7:00 - 20:00',
      friday: '7:00 - 20:00',
      saturday: '7:00 - 20:00',
      sunday: '7:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'slp-capital-jardin-hidalgo',
    name: 'Jardín Hidalgo',
    location: {
      latitude: 22.1520,
      longitude: -100.9770,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Intimate garden offering a green respite in the historic center.',
    type: 'park',
    whyItMatters: 'Jardín Hidalgo offers a moment of tranquility in the historic center—a garden where the city can breathe, where the pace of life slows, and where the relationship between built and natural environments becomes clear. This isn\'t just a park; it\'s a reminder that great cities need both architecture and nature, both activity and rest, both the grand and the intimate.',
    culturalContext: 'The garden represents San Luis Potosí\'s commitment to creating livable urban spaces, where historic preservation includes not just buildings but also green spaces. Jardín Hidalgo reflects the city\'s understanding that quality of life depends on both architectural heritage and natural environments.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for peaceful moments, or late afternoon when the light filters beautifully through the trees.',
      },
      photography: {
        icon: 'camera',
        text: 'The intimate scale and mature trees create serene compositions. Capture the garden\'s role as a sanctuary.',
      },
    },
    narration: {
      anticipation: 'A garden awaits. The city can breathe here.',
      presence: 'You stand in a moment of tranquility. Trees shade. Life pauses.',
      transition: 'Great cities need both architecture and nature. Carry this balance forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'slp-capital-museo-regional',
    name: 'Museo Regional Potosino',
    location: {
      latitude: 22.1518,
      longitude: -100.9768,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Regional museum showcasing the history and culture of San Luis Potosí.',
    type: 'museum',
    whyItMatters: 'The Museo Regional Potosino represents the city\'s commitment to preserving and sharing its history—a museum that tells the story of San Luis Potosí from pre-Columbian times through the colonial period to modern independence. This isn\'t just a collection of artifacts; it\'s a narrative of how a mining town became a city, how indigenous, Spanish, and Mexican cultures created a unique regional identity, and how history continues to shape the present.',
    culturalContext: 'The museum reflects San Luis Potosí\'s layered history, from its origins as a mining center to its role in Mexican independence and revolution. The collection showcases how regional identity emerges from the interaction of diverse cultures and how local history connects to national narratives.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during exhibition hours. Allow time to absorb the regional history and cultural context.',
      },
      photography: {
        icon: 'camera',
        text: 'The exhibitions create interesting compositions. Ask about photography policies.',
      },
    },
    narration: {
      anticipation: 'A regional museum awaits. History unfolds.',
      presence: 'You stand where stories converge. Cultures meet. Identity forms.',
      transition: 'History shapes the present. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 60,
      description: 'General admission',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === GUADALAJARA ===
  {
    id: 'guadalajara-centro-catedral',
    name: 'Catedral de Guadalajara',
    location: {
      latitude: 20.6766,
      longitude: -103.3473,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Neo-Gothic cathedral and spiritual center of Guadalajara, a symbol of the city\'s faith and architectural ambition.',
    type: 'monument',
    whyItMatters: 'The Catedral de Guadalajara stands as the city\'s spiritual and symbolic center—a neo-Gothic masterpiece that has watched over Guadalajara for centuries. This isn\'t just a church; it\'s a landmark that defines the city\'s skyline, a place where faith and architecture merge, and where the city\'s identity finds its most visible expression. The cathedral\'s twin towers, visible from throughout the historic center, serve as a constant reminder of the city\'s deep Catholic roots and its commitment to preserving architectural heritage.',
    culturalContext: 'Built over several centuries, the cathedral reflects Guadalajara\'s evolution from a colonial city to Mexico\'s second-largest metropolis. The neo-Gothic style, unusual in Mexico, represents the city\'s embrace of European architectural trends while maintaining its Mexican character. Today, the cathedral serves as both a place of worship and a symbol of Guadalajara\'s position as the cultural capital of western Mexico.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or attend a mass to experience the cathedral as a living place of worship.',
      },
      photography: {
        icon: 'camera',
        text: 'The neo-Gothic architecture and twin towers create stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A neo-Gothic cathedral awaits. Faith rises in stone.',
      presence: 'You stand where the city\'s spirit lives. Architecture speaks. History flows.',
      transition: 'This cathedral embodies Guadalajara\'s identity. Carry this understanding forward.',
    },
    hours: {
      monday: '7:00 - 20:00',
      tuesday: '7:00 - 20:00',
      wednesday: '7:00 - 20:00',
      thursday: '7:00 - 20:00',
      friday: '7:00 - 20:00',
      saturday: '7:00 - 20:00',
      sunday: '7:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'guadalajara-centro-teatro-degollado',
    name: 'Teatro Degollado',
    location: {
      latitude: 20.6764,
      longitude: -103.3471,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Neoclassical theater and cultural icon of Guadalajara, showcasing the city\'s commitment to the arts.',
    type: 'museum',
    whyItMatters: 'Teatro Degollado represents Guadalajara\'s cultural ambition—a neoclassical masterpiece that has served as the city\'s premier performing arts venue for over a century. This isn\'t just a theater; it\'s a symbol of the city\'s commitment to culture, a place where the arts find their most public expression, and where Guadalajara\'s identity as Mexico\'s cultural capital becomes tangible. The building stands as a testament to the belief that great cities need great cultural spaces.',
    culturalContext: 'Built in the mid-19th century, Teatro Degollado reflects Guadalajara\'s embrace of neoclassical architecture and its position as a cultural center. The theater has hosted everything from opera to contemporary performances, representing the city\'s diverse cultural life. Today, it stands as both a historic landmark and a living cultural institution.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit during performance hours or take a guided tour. Check the schedule for shows and cultural events.',
      },
      photography: {
        icon: 'camera',
        text: 'The neoclassical architecture creates stunning compositions. Ask about photography policies during performances.',
      },
    },
    narration: {
      anticipation: 'A neoclassical theater awaits. Culture finds expression.',
      presence: 'You stand where arts come alive. Performance flows. Ambition rises.',
      transition: 'Great cities need great cultural spaces. Carry this vision forward.',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'guadalajara-centro-mercado-san-juan',
    name: 'Mercado San Juan de Dios',
    location: {
      latitude: 20.6750,
      longitude: -103.3460,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'One of Latin America\'s largest markets, a vibrant showcase of Guadalajara\'s commerce and culture.',
    type: 'market',
    whyItMatters: 'Mercado San Juan de Dios represents the scale and energy of Guadalajara—a market so vast it feels like a city within a city, where commerce, culture, and daily life converge in a symphony of activity. This isn\'t just a market; it\'s a microcosm of Mexican life, where you can find everything from traditional crafts to modern goods, where vendors represent generations of family businesses, and where the act of shopping becomes a form of cultural immersion. The market embodies Guadalajara\'s character: a city that honors tradition while embracing modernity.',
    culturalContext: 'The market reflects Guadalajara\'s position as a commercial hub of western Mexico, a city that has long served as a center of trade and commerce. Mercado San Juan de Dios represents this tradition while adapting to contemporary needs, showing how traditional markets can evolve while maintaining their essential role in community life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for the most vibrant atmosphere, or late afternoon when the market buzzes with activity.',
      },
      photography: {
        icon: 'camera',
        text: 'The vibrant colors, textures, and activity create stunning compositions. Ask vendors before photographing.',
      },
    },
    narration: {
      anticipation: 'A vast market awaits. Commerce and culture merge.',
      presence: 'You stand where the city\'s energy pulses. Vendors call. Life flows.',
      transition: 'Markets are the city\'s heart. Carry this understanding forward.',
    },
    hours: {
      monday: '7:00 - 20:00',
      tuesday: '7:00 - 20:00',
      wednesday: '7:00 - 20:00',
      thursday: '7:00 - 20:00',
      friday: '7:00 - 20:00',
      saturday: '7:00 - 20:00',
      sunday: '7:00 - 20:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'guadalajara-centro-hospicio-cabanas',
    name: 'Hospicio Cabañas',
    location: {
      latitude: 20.6770,
      longitude: -103.3465,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'UNESCO World Heritage site and cultural center, home to Orozco\'s famous murals.',
    type: 'museum',
    whyItMatters: 'Hospicio Cabañas represents the fusion of architecture and art—a neoclassical building that houses some of Mexico\'s most powerful murals by José Clemente Orozco. This isn\'t just a museum; it\'s a place where architecture becomes a canvas, where art serves social purpose, and where the relationship between built space and artistic expression reaches its highest form. The building stands as a testament to the belief that architecture and art can work together to create transformative experiences.',
    culturalContext: 'Built as an orphanage and hospital, Hospicio Cabañas represents a vision of social architecture, where beautiful spaces serve humanitarian purposes. Orozco\'s murals, painted in the 1930s, transformed the building into a work of art, creating a dialogue between architecture and painting that remains powerful today. The site\'s UNESCO designation recognizes both its architectural significance and its role in Mexican muralism.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds and better light to appreciate the murals. Allow time to absorb both architecture and art.',
      },
      photography: {
        icon: 'camera',
        text: 'The architecture and murals create stunning compositions. Ask about photography policies.',
      },
    },
    narration: {
      anticipation: 'A neoclassical building awaits. Architecture becomes canvas.',
      presence: 'You stand where art and architecture merge. Murals speak. Space transforms.',
      transition: 'Architecture and art can transform. Carry this understanding forward.',
    },
    cost: {
      currency: 'MXN',
      amount: 80,
      description: 'General admission',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'guadalajara-centro-plaza-tapatia',
    name: 'Plaza Tapatía',
    location: {
      latitude: 20.6768,
      longitude: -103.3470,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Modern plaza connecting the historic center, showcasing contemporary urban design.',
    type: 'park',
    whyItMatters: 'Plaza Tapatía represents Guadalajara\'s vision of connecting historic and contemporary spaces—a modern plaza that bridges the city\'s past and present. This isn\'t just a public space; it\'s a demonstration of how cities can evolve while honoring their heritage, how contemporary design can complement historic architecture, and how public spaces can serve as connectors between different parts of the urban fabric.',
    culturalContext: 'Built in the 1980s, Plaza Tapatía represents a new approach to urban planning in Guadalajara, where pedestrian spaces and contemporary design were used to revitalize the historic center. The plaza reflects the city\'s commitment to creating livable urban environments while preserving its architectural heritage.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for peaceful strolling, or late afternoon when the plaza comes alive with activity.',
      },
      photography: {
        icon: 'camera',
        text: 'The contemporary design and relationship to historic buildings create interesting compositions.',
      },
    },
    narration: {
      anticipation: 'A modern plaza awaits. Past and present connect.',
      presence: 'You stand where design bridges time. Architecture dialogues. Space flows.',
      transition: 'Cities can evolve while honoring heritage. Carry this vision forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === BARCELONA ===
  {
    id: 'barcelona-gothic-barri-gotic',
    name: 'Barri Gòtic',
    location: {
      latitude: 41.3833,
      longitude: 2.1769,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'The Gothic Quarter, Barcelona\'s historic heart with medieval streets and hidden plazas.',
    type: 'other',
    whyItMatters: 'The Barri Gòtic stands as Barcelona\'s historic soul—a labyrinth of medieval streets where every corner reveals layers of history, where Roman walls meet Gothic cathedrals, and where the city\'s past lives in the present. This isn\'t just a neighborhood; it\'s a journey through time, where walking becomes exploration, where architecture tells stories of conquest and culture, and where the city\'s identity finds its deepest roots. The quarter represents Barcelona\'s unique character: a city that honors its past while embracing its future.',
    culturalContext: 'The Gothic Quarter preserves Barcelona\'s medieval past, from its Roman foundations to its Gothic golden age. The neighborhood reflects the city\'s position as a Mediterranean power, a center of trade and culture, and a place where different civilizations have left their mark. Today, it stands as both a historic preservation area and a vibrant contemporary neighborhood, showing how the past can serve the present.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for peaceful exploration, or late afternoon when the light filters beautifully through the narrow streets.',
      },
      photography: {
        icon: 'camera',
        text: 'The medieval architecture and narrow streets create dramatic compositions. Capture the relationship between light and shadow.',
      },
    },
    narration: {
      anticipation: 'Medieval streets await. History lives in stone.',
      presence: 'You walk where centuries converge. Architecture tells stories. Time layers.',
      transition: 'This quarter is Barcelona\'s soul. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-gothic-catedral-barcelona',
    name: 'Catedral de Barcelona',
    location: {
      latitude: 41.3839,
      longitude: 2.1761,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Gothic cathedral and spiritual center of Barcelona, a masterpiece of medieval architecture.',
    type: 'monument',
    whyItMatters: 'The Catedral de Barcelona stands as a testament to the city\'s medieval power and artistic achievement—a Gothic masterpiece that has watched over Barcelona for centuries. This isn\'t just a church; it\'s a symbol of the city\'s identity, a place where faith and architecture merge, and where the Gothic Quarter finds its spiritual center. The cathedral\'s soaring vaults, intricate details, and peaceful cloister represent the height of Catalan Gothic architecture.',
    culturalContext: 'Built over several centuries, the cathedral reflects Barcelona\'s position as a Mediterranean power and a center of Catalan culture. The Gothic style, adapted to local sensibilities, represents the unique character of Catalan architecture. Today, the cathedral serves as both a place of worship and a symbol of Barcelona\'s layered history.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or attend a mass to experience the cathedral as a living place of worship.',
      },
      photography: {
        icon: 'camera',
        text: 'The Gothic architecture and cloister create stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A Gothic cathedral awaits. Faith rises in stone.',
      presence: 'You stand where medieval power found expression. Architecture soars. Spirit flows.',
      transition: 'This cathedral embodies Barcelona\'s identity. Carry this understanding forward.',
    },
    hours: {
      monday: '8:00 - 19:30',
      tuesday: '8:00 - 19:30',
      wednesday: '8:00 - 19:30',
      thursday: '8:00 - 19:30',
      friday: '8:00 - 19:30',
      saturday: '8:00 - 19:30',
      sunday: '8:00 - 19:30',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-born-santa-maria-del-mar',
    name: 'Santa Maria del Mar',
    location: {
      latitude: 41.3840,
      longitude: 2.1820,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'The "Cathedral of the Sea," a perfect example of Catalan Gothic architecture.',
    type: 'monument',
    whyItMatters: 'Santa Maria del Mar stands as a testament to the power of community and the beauty of pure architecture—a church built by the people of the Ribera neighborhood, where merchants and sailors funded a building that represents the height of Catalan Gothic. This isn\'t just a church; it\'s a symbol of civic pride, a place where architecture achieves perfection through simplicity, and where the relationship between a building and its community becomes tangible.',
    culturalContext: 'Built in the 14th century by the people of the Ribera, Santa Maria del Mar represents a unique moment in architectural history, where a community came together to create something extraordinary. The church\'s pure Gothic style, unadorned and focused on space and light, represents the essence of Catalan Gothic architecture. Today, it stands as both a place of worship and a symbol of Barcelona\'s maritime heritage.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning when the light streams through the windows, creating a magical atmosphere.',
      },
      photography: {
        icon: 'camera',
        text: 'The pure architecture and play of light create stunning compositions. Respect worshippers and photography policies.',
      },
    },
    narration: {
      anticipation: 'A cathedral of the sea awaits. Community built this.',
      presence: 'You stand where architecture achieves perfection. Light streams. Space soars.',
      transition: 'This church embodies civic pride. Carry this understanding forward.',
    },
    hours: {
      monday: '9:00 - 20:30',
      tuesday: '9:00 - 20:30',
      wednesday: '9:00 - 20:30',
      thursday: '9:00 - 20:30',
      friday: '9:00 - 20:30',
      saturday: '9:00 - 20:30',
      sunday: '10:00 - 20:30',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-eixample-sagrada-familia',
    name: 'Sagrada Família',
    location: {
      latitude: 41.4036,
      longitude: 2.1744,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Gaudí\'s unfinished masterpiece, a symbol of Barcelona and one of the world\'s most unique buildings.',
    type: 'monument',
    whyItMatters: 'The Sagrada Família stands as a testament to vision, faith, and the power of architecture to inspire—a building that has been under construction for over a century and continues to evolve. This isn\'t just a church; it\'s Gaudí\'s vision of architecture as nature, where organic forms meet spiritual purpose, where construction becomes a form of worship, and where the relationship between human creativity and divine inspiration finds expression. The building represents Barcelona\'s unique character: a city that embraces innovation while honoring tradition.',
    culturalContext: 'Designed by Antoni Gaudí, the Sagrada Família represents the height of Catalan Modernisme, a movement that fused art, architecture, and nature. The building\'s ongoing construction reflects both Gaudí\'s ambitious vision and the city\'s commitment to completing his work. Today, it stands as both a place of worship and a symbol of Barcelona\'s creative spirit.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Book tickets in advance online. Visit early morning or late afternoon for the best light. Allow time to absorb the interior.',
      },
      photography: {
        icon: 'camera',
        text: 'The organic architecture and play of light create stunning compositions. The interior is especially photogenic.',
      },
    },
    narration: {
      anticipation: 'Gaudí\'s masterpiece awaits. Architecture becomes nature.',
      presence: 'You stand where vision meets faith. Organic forms soar. Light transforms.',
      transition: 'This building embodies creative spirit. Carry this inspiration forward.',
    },
    cost: {
      currency: 'EUR',
      amount: 26,
      description: 'General admission (advance booking required)',
    },
    hours: {
      monday: '9:00 - 18:00',
      tuesday: '9:00 - 18:00',
      wednesday: '9:00 - 18:00',
      thursday: '9:00 - 18:00',
      friday: '9:00 - 18:00',
      saturday: '9:00 - 18:00',
      sunday: '9:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-gracia-park-guell',
    name: 'Park Güell',
    location: {
      latitude: 41.4145,
      longitude: 2.1527,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Gaudí\'s magical park, where architecture and nature merge in a celebration of creativity.',
    type: 'park',
    whyItMatters: 'Park Güell represents Gaudí\'s vision of architecture as a celebration of life—a park where organic forms, colorful mosaics, and natural landscapes merge into something that feels both designed and wild. This isn\'t just a park; it\'s a work of art that you can walk through, a place where the boundary between built and natural environments disappears, and where creativity becomes a form of play. The park embodies Barcelona\'s character: a city that values beauty, innovation, and the joy of public space.',
    culturalContext: 'Designed as a residential garden city, Park Güell became a public park when the development failed. Gaudí\'s vision of integrating architecture with nature, of creating spaces that celebrate life, found its perfect expression here. Today, the park represents both Gaudí\'s artistic genius and Barcelona\'s commitment to making art accessible to everyone.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Book tickets in advance for the monumental zone. Visit early morning or late afternoon for fewer crowds and better light.',
      },
      photography: {
        icon: 'camera',
        text: 'The organic architecture and city views create stunning compositions. The mosaic work is especially photogenic.',
      },
    },
    narration: {
      anticipation: 'A magical park awaits. Architecture and nature merge.',
      presence: 'You stand where creativity becomes play. Forms flow. Life celebrates.',
      transition: 'This park embodies joy. Carry this spirit forward.',
    },
    cost: {
      currency: 'EUR',
      amount: 10,
      description: 'Monumental zone (advance booking recommended)',
    },
    hours: {
      monday: '8:00 - 20:30',
      tuesday: '8:00 - 20:30',
      wednesday: '8:00 - 20:30',
      thursday: '8:00 - 20:30',
      friday: '8:00 - 20:30',
      saturday: '8:00 - 20:30',
      sunday: '8:00 - 20:30',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-barceloneta-beach',
    name: 'Barceloneta Beach',
    location: {
      latitude: 41.3800,
      longitude: 2.1900,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    ],
    description: 'Urban beach where the city meets the Mediterranean, a symbol of Barcelona\'s relationship with the sea.',
    type: 'beach',
    whyItMatters: 'Barceloneta Beach represents Barcelona\'s transformation—a beach that was created for the 1992 Olympics and has become an essential part of the city\'s identity. This isn\'t just a beach; it\'s a place where urban and natural environments meet, where the city\'s energy gives way to the Mediterranean\'s calm, and where the relationship between Barcelona and the sea becomes tangible. The beach embodies the city\'s character: a place that values both urban sophistication and natural beauty.',
    culturalContext: 'The beach\'s creation for the Olympics represented Barcelona\'s vision of reclaiming its waterfront and connecting the city to the sea. Today, Barceloneta serves as both a recreational space and a symbol of the city\'s relationship with the Mediterranean, showing how cities can transform their relationship with natural environments.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for peaceful moments, or late afternoon when the beach comes alive with activity and the light is beautiful.',
      },
      photography: {
        icon: 'camera',
        text: 'The urban beach setting and city skyline create stunning compositions. Sunset offers especially dramatic light.',
      },
    },
    narration: {
      anticipation: 'An urban beach awaits. City meets sea.',
      presence: 'You stand where urban energy meets Mediterranean calm. Life flows. Connection deepens.',
      transition: 'This beach embodies the city\'s relationship with the sea. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'barcelona-montjuic-mirador',
    name: 'Mirador del Alcalde',
    location: {
      latitude: 41.3600,
      longitude: 2.1600,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Scenic viewpoint offering panoramic views of Barcelona and the Mediterranean.',
    type: 'viewpoint',
    whyItMatters: 'The Mirador del Alcalde offers a moment to see Barcelona in its full context—a city that stretches from the mountains to the sea, where historic neighborhoods meet contemporary development, and where the relationship between the built environment and natural setting becomes clear. This isn\'t just a viewpoint; it\'s a place for perspective, where the city\'s scale becomes tangible, where its position between land and sea becomes visible, and where you can appreciate Barcelona as both a destination and a place in the larger world.',
    culturalContext: 'Montjuïc, the hill that hosts the viewpoint, has been central to Barcelona\'s history, from its role as a defensive position to its transformation for the 1929 International Exposition and 1992 Olympics. The viewpoint represents the city\'s relationship with its geography, showing how topography shapes urban development.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit at sunset for the most dramatic views, or early morning for clear visibility and fewer crowds.',
      },
      photography: {
        icon: 'camera',
        text: 'The panoramic views create stunning compositions. Capture the relationship between city, mountains, and sea.',
      },
    },
    narration: {
      anticipation: 'A viewpoint awaits. Perspective opens.',
      presence: 'You stand where the city unfolds. Mountains meet sea. Scale becomes clear.',
      transition: 'This view offers perspective. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },

  // === BERLIN ===
  {
    id: 'berlin-mitte-brandenburg-gate',
    name: 'Brandenburg Gate',
    location: {
      latitude: 52.5163,
      longitude: 13.3777,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Iconic neoclassical gate and symbol of German unity, a witness to Berlin\'s history.',
    type: 'monument',
    whyItMatters: 'The Brandenburg Gate stands as a symbol of Berlin\'s resilience and transformation—a neoclassical masterpiece that has witnessed war, division, and reunification. This isn\'t just a monument; it\'s a testament to the city\'s ability to endure and evolve, a place where history lives in every stone, and where the relationship between past and present becomes tangible. The gate represents Berlin\'s unique character: a city that honors its history while embracing its future.',
    culturalContext: 'Built in the late 18th century, the Brandenburg Gate has been central to Berlin\'s history, from Napoleon\'s occupation to the Cold War division to German reunification. The gate\'s transformation from a symbol of division to a symbol of unity represents Berlin\'s journey and Germany\'s evolution. Today, it stands as both a historic landmark and a symbol of hope.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds, or at night when the gate is beautifully lit.',
      },
      photography: {
        icon: 'camera',
        text: 'The neoclassical architecture and symbolic significance create powerful compositions. Capture the gate from different angles.',
      },
    },
    narration: {
      anticipation: 'An iconic gate awaits. History lives in stone.',
      presence: 'You stand where division became unity. History speaks. Hope rises.',
      transition: 'This gate embodies Berlin\'s transformation. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-mitte-reichstag',
    name: 'Reichstag Building',
    location: {
      latitude: 52.5186,
      longitude: 13.3762,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Historic parliament building with Norman Foster\'s glass dome, symbol of German democracy.',
    type: 'monument',
    whyItMatters: 'The Reichstag represents Germany\'s journey from empire to democracy—a building that has witnessed the rise and fall of regimes, that was damaged in war and restored in peace, and that now stands as a symbol of transparent democracy. Foster\'s glass dome, added in the 1990s, represents the building\'s transformation: a transparent structure that allows citizens to look down on their representatives, embodying the principle that government should be open and accountable.',
    culturalContext: 'The Reichstag has been central to German history, from the Weimar Republic to the Nazi era to reunification. Foster\'s renovation, which preserved the building\'s historic character while adding contemporary elements, represents Germany\'s approach to dealing with its past: honoring history while building for the future. The glass dome symbolizes transparency and democratic values.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Book free tickets in advance online. Visit at sunset for stunning views from the dome.',
      },
      photography: {
        icon: 'camera',
        text: 'The glass dome and city views create stunning compositions. The interior architecture is especially photogenic.',
      },
    },
    narration: {
      anticipation: 'A historic building awaits. Democracy finds expression.',
      presence: 'You stand where history meets transparency. Glass soars. Democracy flows.',
      transition: 'This building embodies democratic values. Carry this understanding forward.',
    },
    hours: {
      monday: '8:00 - 24:00',
      tuesday: '8:00 - 24:00',
      wednesday: '8:00 - 24:00',
      thursday: '8:00 - 24:00',
      friday: '8:00 - 24:00',
      saturday: '8:00 - 24:00',
      sunday: '8:00 - 24:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-mitte-memorial-mur',
    name: 'Memorial to the Murdered Jews of Europe',
    location: {
      latitude: 52.5139,
      longitude: 13.3787,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'Powerful memorial designed by Peter Eisenman, a place for reflection and remembrance.',
    type: 'monument',
    whyItMatters: 'The Memorial to the Murdered Jews of Europe represents Germany\'s commitment to remembering the Holocaust—a place where architecture becomes memory, where abstract forms create emotional experiences, and where the act of walking through the field of stelae becomes a form of contemplation. This isn\'t just a monument; it\'s a space for reflection, a place where the enormity of loss becomes tangible, and where the responsibility to remember becomes clear.',
    culturalContext: 'The memorial, completed in 2005, represents Germany\'s ongoing process of Vergangenheitsbewältigung—coming to terms with the past. Eisenman\'s design, with its 2,711 concrete stelae, creates an abstract space that allows visitors to experience the memorial in personal ways, reflecting the complexity of memory and the importance of remembrance.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for quiet contemplation, or late afternoon when the light creates dramatic shadows.',
      },
      photography: {
        icon: 'camera',
        text: 'The abstract forms create powerful compositions. Be respectful of the memorial\'s purpose and other visitors.',
      },
    },
    narration: {
      anticipation: 'A memorial awaits. Memory becomes space.',
      presence: 'You stand where loss becomes tangible. Stelae rise. Reflection deepens.',
      transition: 'This memorial embodies the responsibility to remember. Carry this understanding forward.',
    },
    hours: {
      monday: '24 hours',
      tuesday: '24 hours',
      wednesday: '24 hours',
      thursday: '24 hours',
      friday: '24 hours',
      saturday: '24 hours',
      sunday: '24 hours',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-kreuzberg-east-side-gallery',
    name: 'East Side Gallery',
    location: {
      latitude: 52.5050,
      longitude: 13.4400,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Longest remaining section of the Berlin Wall, transformed into an open-air art gallery.',
    type: 'museum',
    whyItMatters: 'The East Side Gallery represents the transformation of division into art—a section of the Berlin Wall that has become a canvas for artists from around the world, where political statements meet artistic expression, and where a symbol of oppression becomes a celebration of freedom. This isn\'t just a gallery; it\'s a testament to the power of art to transform meaning, to the human capacity for creativity in the face of adversity, and to Berlin\'s commitment to remembering while moving forward.',
    culturalContext: 'Created in 1990, shortly after the wall\'s fall, the East Side Gallery represents a moment when artists transformed a symbol of division into a celebration of unity. The murals, painted by artists from around the world, reflect themes of freedom, peace, and hope. Today, the gallery stands as both a historic monument and a living work of art, showing how cities can repurpose difficult history for positive purposes.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds, or late afternoon when the light is beautiful on the murals.',
      },
      photography: {
        icon: 'camera',
        text: 'The murals create powerful compositions. Each section tells a different story—take time to appreciate the diversity of artistic expression.',
      },
    },
    narration: {
      anticipation: 'A transformed wall awaits. Art meets history.',
      presence: 'You stand where division became art. Murals speak. Freedom celebrates.',
      transition: 'Art can transform meaning. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-prenzlauer-berg-mauerpark',
    name: 'Mauerpark',
    location: {
      latitude: 52.5450,
      longitude: 13.4020,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Park built on the former death strip, now a vibrant gathering place and symbol of transformation.',
    type: 'park',
    whyItMatters: 'Mauerpark represents Berlin\'s ability to transform spaces of division into places of community—a park built on the former death strip that is now one of the city\'s most vibrant gathering places. This isn\'t just a park; it\'s a testament to the city\'s resilience, a place where the past\'s darkness gives way to the present\'s joy, and where a space of fear becomes a space of freedom. The park embodies Berlin\'s character: a city that confronts its history while building for the future.',
    culturalContext: 'Built on the former death strip between East and West Berlin, Mauerpark represents the city\'s transformation since reunification. The park\'s Sunday karaoke, flea markets, and community gatherings show how spaces of division can become spaces of connection. Today, it stands as both a memorial to the wall and a celebration of the city\'s contemporary life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit on Sunday for the famous karaoke and flea market, or any day for a peaceful moment in the park.',
      },
      photography: {
        icon: 'camera',
        text: 'The park\'s transformation and community life create vibrant compositions. Capture the contrast between history and present.',
      },
    },
    narration: {
      anticipation: 'A transformed park awaits. Division became community.',
      presence: 'You stand where fear became freedom. Life gathers. Joy flows.',
      transition: 'This park embodies transformation. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-mitte-museum-island',
    name: 'Museum Island',
    location: {
      latitude: 52.5219,
      longitude: 13.4000,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    ],
    description: 'UNESCO World Heritage site with five world-class museums, a testament to Berlin\'s cultural ambition.',
    type: 'museum',
    whyItMatters: 'Museum Island represents Berlin\'s cultural ambition—a collection of five world-class museums on an island in the Spree River, where art, archaeology, and history converge. This isn\'t just a museum complex; it\'s a testament to the city\'s commitment to culture, a place where human achievement finds expression, and where the relationship between art and architecture reaches its highest form. The island embodies Berlin\'s character: a city that values culture as essential to human experience.',
    culturalContext: 'Built in the 19th and early 20th centuries, Museum Island represents Prussia\'s cultural ambitions and Berlin\'s position as a center of learning and art. The complex, damaged in World War II and restored after reunification, reflects the city\'s commitment to preserving cultural heritage. Today, it stands as both a historic landmark and a living cultural institution.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit early morning for fewer crowds. Consider a Museum Island pass for access to multiple museums.',
      },
      photography: {
        icon: 'camera',
        text: 'The neoclassical architecture and island setting create stunning compositions. Ask about photography policies in museums.',
      },
    },
    narration: {
      anticipation: 'A museum island awaits. Culture finds expression.',
      presence: 'You stand where art and architecture merge. Collections speak. Ambition rises.',
      transition: 'This island embodies cultural commitment. Carry this understanding forward.',
    },
    cost: {
      currency: 'EUR',
      amount: 19,
      description: 'Museum Island day pass',
    },
    hours: {
      monday: '10:00 - 18:00',
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 20:00',
      friday: '10:00 - 18:00',
      saturday: '10:00 - 18:00',
      sunday: '10:00 - 18:00',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-kreuzberg-gorlitzer-park',
    name: 'Görlitzer Park',
    location: {
      latitude: 52.4970,
      longitude: 13.4400,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    ],
    description: 'Vibrant park in Kreuzberg, a gathering place for Berlin\'s diverse and creative community.',
    type: 'park',
    whyItMatters: 'Görlitzer Park represents Kreuzberg\'s character—a park that serves as a gathering place for one of Berlin\'s most diverse and creative neighborhoods. This isn\'t just a park; it\'s a microcosm of contemporary Berlin, where different cultures, lifestyles, and creative expressions coexist, where the city\'s energy finds expression, and where community is built through shared space. The park embodies Berlin\'s character: a city that values diversity, creativity, and the power of public space to bring people together.',
    culturalContext: 'Kreuzberg has long been one of Berlin\'s most diverse and creative neighborhoods, home to immigrants, artists, and activists. Görlitzer Park reflects this character, serving as a space where the neighborhood\'s diversity becomes visible and where community is built through interaction. The park represents Berlin\'s approach to public space: inclusive, vibrant, and essential to urban life.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the afternoon when the park comes alive with activity, or early evening for the neighborhood\'s social energy.',
      },
      photography: {
        icon: 'camera',
        text: 'The park\'s vibrant community life creates authentic compositions. Be respectful of people\'s privacy.',
      },
    },
    narration: {
      anticipation: 'A vibrant park awaits. Community gathers here.',
      presence: 'You stand where diversity thrives. Cultures meet. Creativity flows.',
      transition: 'This park embodies Berlin\'s character. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'berlin-mitte-hackescher-markt',
    name: 'Hackescher Markt',
    location: {
      latitude: 52.5225,
      longitude: 13.4025,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    description: 'Vibrant square in Mitte, showcasing Berlin\'s contemporary culture and historic architecture.',
    type: 'other',
    whyItMatters: 'Hackescher Markt represents Berlin\'s transformation—a square that has evolved from a transportation hub to a cultural center, where historic architecture meets contemporary life, and where the city\'s energy finds expression. This isn\'t just a square; it\'s a microcosm of modern Berlin, where cafes, galleries, and street life create a vibrant atmosphere, and where the relationship between past and present becomes tangible.',
    culturalContext: 'The square has been central to Berlin\'s life for centuries, serving as a market, transportation hub, and gathering place. Its recent transformation reflects the city\'s evolution since reunification, showing how historic spaces can serve contemporary needs while preserving their character. Today, it stands as both a historic landmark and a vibrant contemporary space.',
    howToVisit: {
      bestTime: {
        icon: 'sun',
        text: 'Visit in the morning for café culture, or late afternoon when the square comes alive with activity.',
      },
      photography: {
        icon: 'camera',
        text: 'The historic architecture and contemporary street life create vibrant compositions.',
      },
    },
    narration: {
      anticipation: 'A vibrant square awaits. Past and present meet.',
      presence: 'You stand where history serves the present. Cafés buzz. Life flows.',
      transition: 'This square embodies Berlin\'s transformation. Carry this understanding forward.',
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
];
