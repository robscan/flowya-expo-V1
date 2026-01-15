-- Carga directa de seeds como spots canonicos (sin tablas legacy)
-- Pega el JSON UNA SOLA VEZ en el bloque de seed_payload.
-- Nota: este script IGNORA image.* y solo usa campos canonicos.

-- 0) Crear payload temporal y pegar JSON una sola vez
create temp table if not exists seed_payload (data jsonb);
truncate table seed_payload;

insert into seed_payload (data)
values (
  $$[
  {
    "id": "helsinki-senate-square",
    "name": "Senate Square",
    "type": "monument",
    "location": {
      "lat": 60.1699,
      "lng": 24.9384,
      "city": "Helsinki",
      "country": "Finland"
    },
    "shortDescription": "The heart of Helsinki, where neoclassical architecture meets the city's vibrant energy. A perfect starting point for exploring Finnish culture.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "helsinki-suomenlinna",
    "name": "Suomenlinna Fortress",
    "type": "monument",
    "location": {
      "lat": 60.147,
      "lng": 24.989,
      "city": "Helsinki",
      "country": "Finland"
    },
    "shortDescription": "A sea fortress spread across six islands, where history and nature create an unforgettable escape from the city.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oslo-opera-house",
    "name": "Oslo Opera House",
    "type": "monument",
    "location": {
      "lat": 59.9076,
      "lng": 10.7522,
      "city": "Oslo",
      "country": "Norway"
    },
    "shortDescription": "A stunning architectural masterpiece where you can walk on the roof, offering panoramic views of the fjord and city skyline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oslo-vigeland-park",
    "name": "Vigeland Sculpture Park",
    "type": "park",
    "location": {
      "lat": 59.9272,
      "lng": 10.7005,
      "city": "Oslo",
      "country": "Norway"
    },
    "shortDescription": "The world's largest sculpture park by a single artist, where over 200 bronze and granite figures explore the human experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-tower-bridge",
    "name": "Tower Bridge",
    "type": "monument",
    "location": {
      "lat": 51.5055,
      "lng": -0.0754,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "London's iconic Victorian bridge, where engineering meets elegance. Walk across for stunning Thames views and city panoramas.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-covent-garden",
    "name": "Covent Garden",
    "type": "market",
    "location": {
      "lat": 51.5125,
      "lng": -0.1236,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "A vibrant piazza where street performers, boutique shops, and historic architecture create London's most charming neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-hyde-park",
    "name": "Hyde Park",
    "type": "park",
    "location": {
      "lat": 51.5073,
      "lng": -0.1657,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "London's green heart, where Serpentine Lake, ancient trees, and open spaces offer a peaceful escape in the city center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "berlin-brandenburg-gate",
    "name": "Brandenburg Gate",
    "type": "monument",
    "location": {
      "lat": 52.5163,
      "lng": 13.3777,
      "city": "Berlin",
      "country": "Germany"
    },
    "shortDescription": "Berlin's most iconic symbol, where history and hope converge. A powerful reminder of division and unity.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "berlin-east-side-gallery",
    "name": "East Side Gallery",
    "type": "monument",
    "location": {
      "lat": 52.5054,
      "lng": 13.44,
      "city": "Berlin",
      "country": "Germany"
    },
    "shortDescription": "The longest remaining section of the Berlin Wall, transformed into an open-air gallery celebrating freedom and creativity.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-rijksmuseum",
    "name": "Rijksmuseum",
    "type": "museum",
    "location": {
      "lat": 52.36,
      "lng": 4.8852,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Home to Rembrandt's Night Watch and masterpieces of the Dutch Golden Age, where art and history come alive.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-jordaan",
    "name": "Jordaan District",
    "type": "other",
    "location": {
      "lat": 52.3779,
      "lng": 4.8764,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Amsterdam's most charming neighborhood, where narrow canals, hidden courtyards, and cozy cafés create an authentic Dutch experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-eiffel-tower",
    "name": "Eiffel Tower",
    "type": "monument",
    "location": {
      "lat": 48.8584,
      "lng": 2.2945,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The iron lady of Paris, where engineering marvel meets romantic icon. Ascend for breathtaking city views or admire from the Champ de Mars.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-montmartre",
    "name": "Montmartre",
    "type": "viewpoint",
    "location": {
      "lat": 48.8867,
      "lng": 2.3431,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The bohemian hilltop village where artists, cobblestone streets, and Sacré-Cœur create Paris's most romantic neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-louvre",
    "name": "Louvre Museum",
    "type": "museum",
    "location": {
      "lat": 48.8606,
      "lng": 2.3376,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The world's largest art museum, where the Mona Lisa, Venus de Milo, and countless masterpieces await in a former royal palace.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "madrid-prado",
    "name": "Prado Museum",
    "type": "museum",
    "location": {
      "lat": 40.4138,
      "lng": -3.6921,
      "city": "Madrid",
      "country": "Spain"
    },
    "shortDescription": "Home to Velázquez, Goya, and El Greco, where Spanish art history unfolds in one of the world's greatest collections.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "barcelona-sagrada-familia",
    "name": "Sagrada Família",
    "type": "monument",
    "location": {
      "lat": 41.4036,
      "lng": 2.1744,
      "city": "Barcelona",
      "country": "Spain"
    },
    "shortDescription": "Gaudí's unfinished masterpiece, where nature-inspired architecture reaches toward the sky in a symphony of light and stone.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "barcelona-park-guell",
    "name": "Park Güell",
    "type": "park",
    "location": {
      "lat": 41.4145,
      "lng": 2.1527,
      "city": "Barcelona",
      "country": "Spain"
    },
    "shortDescription": "Gaudí's whimsical park, where colorful mosaics, organic forms, and panoramic city views create a magical escape.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-york-central-park",
    "name": "Central Park",
    "type": "park",
    "location": {
      "lat": 40.7829,
      "lng": -73.9654,
      "city": "New York",
      "country": "United States"
    },
    "shortDescription": "Manhattan's green oasis, where lakes, meadows, and winding paths offer a peaceful escape from the city's energy.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-york-brooklyn-bridge",
    "name": "Brooklyn Bridge",
    "type": "monument",
    "location": {
      "lat": 40.7061,
      "lng": -73.9969,
      "city": "New York",
      "country": "United States"
    },
    "shortDescription": "Walk across this iconic 19th-century bridge for stunning views of Manhattan's skyline and the East River.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-francisco-golden-gate",
    "name": "Golden Gate Bridge",
    "type": "monument",
    "location": {
      "lat": 37.8199,
      "lng": -122.4783,
      "city": "San Francisco",
      "country": "United States"
    },
    "shortDescription": "The iconic orange bridge spanning the bay, where fog, ocean, and city create one of the world's most photographed views.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "los-angeles-griffith-observatory",
    "name": "Griffith Observatory",
    "type": "viewpoint",
    "location": {
      "lat": 34.1183,
      "lng": -118.3003,
      "city": "Los Angeles",
      "country": "United States"
    },
    "shortDescription": "Perched above the city, where astronomy, architecture, and panoramic views of LA create an unforgettable experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "toronto-cn-tower",
    "name": "CN Tower",
    "type": "viewpoint",
    "location": {
      "lat": 43.6426,
      "lng": -79.3871,
      "city": "Toronto",
      "country": "Canada"
    },
    "shortDescription": "Toronto's iconic tower, where glass floors and 360-degree views offer a bird's-eye perspective of the city and lake.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "vancouver-stanley-park",
    "name": "Stanley Park",
    "type": "park",
    "location": {
      "lat": 49.3017,
      "lng": -123.1417,
      "city": "Vancouver",
      "country": "Canada"
    },
    "shortDescription": "A 1000-acre urban forest where ocean views, totem poles, and winding trails create Vancouver's natural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "mexico-city-zocalo",
    "name": "Zócalo",
    "type": "monument",
    "location": {
      "lat": 19.4326,
      "lng": -99.1332,
      "city": "Mexico City",
      "country": "Mexico"
    },
    "shortDescription": "The heart of Mexico City, where Aztec ruins, colonial cathedrals, and modern life converge in Latin America's largest square.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "mexico-city-frida-kahlo-museum",
    "name": "Frida Kahlo Museum",
    "type": "museum",
    "location": {
      "lat": 19.355,
      "lng": -99.1622,
      "city": "Mexico City",
      "country": "Mexico"
    },
    "shortDescription": "The Blue House where Frida Kahlo was born and died, now a museum celebrating her life, art, and indomitable spirit.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "tulum-ruins",
    "name": "Tulum Archaeological Site",
    "type": "monument",
    "location": {
      "lat": 20.215,
      "lng": -87.4292,
      "city": "Tulum",
      "country": "Mexico"
    },
    "shortDescription": "Ancient Mayan ruins perched on cliffs above the Caribbean, where history and turquoise waters create a breathtaking setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "chichen-itza",
    "name": "Chichén Itzá",
    "type": "monument",
    "location": {
      "lat": 20.6843,
      "lng": -88.5678,
      "city": "Yucatán",
      "country": "Mexico"
    },
    "shortDescription": "One of the New Seven Wonders, where the Pyramid of Kukulkan reveals the Maya's astronomical genius and architectural mastery.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "antigua-guatemala",
    "name": "Antigua Guatemala",
    "type": "other",
    "location": {
      "lat": 14.5586,
      "lng": -90.7333,
      "city": "Antigua",
      "country": "Guatemala"
    },
    "shortDescription": "A UNESCO World Heritage colonial city, where cobblestone streets, colorful facades, and volcano views create Central America's most charming town.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-jose-costa-rica",
    "name": "San José Central Market",
    "type": "market",
    "location": {
      "lat": 9.9333,
      "lng": -84.0833,
      "city": "San José",
      "country": "Costa Rica"
    },
    "shortDescription": "A vibrant market where local flavors, crafts, and the pulse of Costa Rican life create an authentic cultural experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lima-miraflores",
    "name": "Miraflores District",
    "type": "viewpoint",
    "location": {
      "lat": -12.1224,
      "lng": -77.0305,
      "city": "Lima",
      "country": "Peru"
    },
    "shortDescription": "Lima's coastal district, where cliffside parks, ocean views, and modern cafés create the city's most vibrant neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "machu-picchu",
    "name": "Machu Picchu",
    "type": "monument",
    "location": {
      "lat": -13.1631,
      "lng": -72.545,
      "city": "Cusco",
      "country": "Peru"
    },
    "shortDescription": "The lost city of the Incas, perched in the clouds, where ancient engineering and breathtaking mountain vistas create a once-in-a-lifetime experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rio-copacabana",
    "name": "Copacabana Beach",
    "type": "beach",
    "location": {
      "lat": -22.9711,
      "lng": -43.1822,
      "city": "Rio de Janeiro",
      "country": "Brazil"
    },
    "shortDescription": "Rio's iconic beach, where golden sand, azure waters, and the city's vibrant energy create the world's most famous coastline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rio-christ-redeemer",
    "name": "Christ the Redeemer",
    "type": "monument",
    "location": {
      "lat": -22.9519,
      "lng": -43.2105,
      "city": "Rio de Janeiro",
      "country": "Brazil"
    },
    "shortDescription": "The iconic statue atop Corcovado Mountain, where faith, engineering, and panoramic city views create Rio's most powerful symbol.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "buenos-aires-recoleta",
    "name": "Recoleta Cemetery",
    "type": "monument",
    "location": {
      "lat": -34.5875,
      "lng": -58.3933,
      "city": "Buenos Aires",
      "country": "Argentina"
    },
    "shortDescription": "An open-air museum of mausoleums, where art, architecture, and history create one of the world's most beautiful cemeteries.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "buenos-aires-san-telmo",
    "name": "San Telmo Market",
    "type": "market",
    "location": {
      "lat": -34.6208,
      "lng": -58.3731,
      "city": "Buenos Aires",
      "country": "Argentina"
    },
    "shortDescription": "A historic market where tango, antiques, and local flavors capture the soul of Buenos Aires.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rome-colosseum",
    "name": "Colosseum",
    "type": "monument",
    "location": {
      "lat": 41.8902,
      "lng": 12.4922,
      "city": "Rome",
      "country": "Italy"
    },
    "shortDescription": "The iconic amphitheater where gladiators once fought, now standing as a powerful symbol of ancient Rome's grandeur and engineering genius.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rome-trevi-fountain",
    "name": "Trevi Fountain",
    "type": "monument",
    "location": {
      "lat": 41.9009,
      "lng": 12.4833,
      "city": "Rome",
      "country": "Italy"
    },
    "shortDescription": "Baroque masterpiece where Neptune's chariot emerges from water, and tossing a coin ensures your return to the Eternal City.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "venice-st-mark-square",
    "name": "St. Mark's Square",
    "type": "monument",
    "location": {
      "lat": 45.4342,
      "lng": 12.3388,
      "city": "Venice",
      "country": "Italy"
    },
    "shortDescription": "Venice's grand piazza, where Byzantine domes, Renaissance architecture, and the lagoon's magic create an unforgettable setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "prague-charles-bridge",
    "name": "Charles Bridge",
    "type": "monument",
    "location": {
      "lat": 50.0865,
      "lng": 14.4114,
      "city": "Prague",
      "country": "Czech Republic"
    },
    "shortDescription": "A 14th-century stone bridge adorned with baroque statues, where history, art, and the Vltava River create Prague's most romantic walk.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "vienna-schonbrunn",
    "name": "Schönbrunn Palace",
    "type": "monument",
    "location": {
      "lat": 48.1847,
      "lng": 16.3122,
      "city": "Vienna",
      "country": "Austria"
    },
    "shortDescription": "The former imperial summer residence, where baroque architecture, manicured gardens, and Habsburg history create Vienna's grandest palace.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "chicago-millennium-park",
    "name": "Millennium Park",
    "type": "park",
    "location": {
      "lat": 41.8825,
      "lng": -87.6228,
      "city": "Chicago",
      "country": "United States"
    },
    "shortDescription": "Chicago's modern park, where Cloud Gate's mirrored surface, public art, and skyline views create the city's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "miami-south-beach",
    "name": "South Beach",
    "type": "beach",
    "location": {
      "lat": 25.7907,
      "lng": -80.13,
      "city": "Miami",
      "country": "United States"
    },
    "shortDescription": "Art Deco architecture meets turquoise waters, where golden sand, vibrant energy, and ocean breezes create Miami's iconic coastline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "seattle-space-needle",
    "name": "Space Needle",
    "type": "viewpoint",
    "location": {
      "lat": 47.6205,
      "lng": -122.3493,
      "city": "Seattle",
      "country": "United States"
    },
    "shortDescription": "Seattle's iconic tower, where rotating glass floors offer 360-degree views of the city, mountains, and Puget Sound.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oaxaca-zocalo",
    "name": "Zócalo de Oaxaca",
    "type": "monument",
    "location": {
      "lat": 17.0606,
      "lng": -96.7253,
      "city": "Oaxaca",
      "country": "Mexico"
    },
    "shortDescription": "The heart of Oaxaca, where colonial architecture, vibrant markets, and indigenous culture converge in one of Mexico's most beautiful squares.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "guadalajara-tequila",
    "name": "Tequila Town",
    "type": "other",
    "location": {
      "lat": 20.88,
      "lng": -103.8367,
      "city": "Tequila",
      "country": "Mexico"
    },
    "shortDescription": "The birthplace of tequila, where blue agave fields, traditional distilleries, and Mexican heritage create an authentic cultural experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cartagena-old-town",
    "name": "Cartagena Old Town",
    "type": "monument",
    "location": {
      "lat": 10.391,
      "lng": -75.4794,
      "city": "Cartagena",
      "country": "Colombia"
    },
    "shortDescription": "A walled colonial city where colorful balconies, cobblestone streets, and Caribbean charm create Colombia's most romantic destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "santiago-cerro-san-cristobal",
    "name": "Cerro San Cristóbal",
    "type": "viewpoint",
    "location": {
      "lat": -33.425,
      "lng": -70.6378,
      "city": "Santiago",
      "country": "Chile"
    },
    "shortDescription": "Santiago's highest hill, where a funicular ride leads to panoramic city views, a giant statue of the Virgin Mary, and peaceful gardens.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "stockholm-gamla-stan",
    "name": "Gamla Stan",
    "type": "other",
    "location": {
      "lat": 59.3251,
      "lng": 18.0711,
      "city": "Stockholm",
      "country": "Sweden"
    },
    "shortDescription": "Stockholm's medieval old town, where narrow cobblestone streets, colorful buildings, and royal palaces create a fairy-tale setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "copenhagen-nyhavn",
    "name": "Nyhavn",
    "type": "other",
    "location": {
      "lat": 55.6794,
      "lng": 12.5906,
      "city": "Copenhagen",
      "country": "Denmark"
    },
    "shortDescription": "Copenhagen's iconic canal, where colorful 17th-century houses, historic ships, and waterfront cafés create the city's most picturesque scene.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lisbon-belem-tower",
    "name": "Belém Tower",
    "type": "monument",
    "location": {
      "lat": 38.6916,
      "lng": -9.216,
      "city": "Lisbon",
      "country": "Portugal"
    },
    "shortDescription": "A 16th-century fortress on the Tagus River, where Manueline architecture and maritime history mark Portugal's Age of Discovery.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "istanbul-hagia-sophia",
    "name": "Hagia Sophia",
    "type": "monument",
    "location": {
      "lat": 41.0086,
      "lng": 28.9802,
      "city": "Istanbul",
      "country": "Turkey"
    },
    "shortDescription": "A masterpiece of Byzantine architecture, where Christian mosaics and Islamic calligraphy coexist in a symbol of Istanbul's layered history.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "athens-acropolis",
    "name": "Acropolis",
    "type": "monument",
    "location": {
      "lat": 37.9715,
      "lng": 23.7267,
      "city": "Athens",
      "country": "Greece"
    },
    "shortDescription": "The ancient citadel where the Parthenon stands, offering breathtaking views of Athens and a journey through classical Greek civilization.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "dublin-temple-bar",
    "name": "Temple Bar",
    "type": "other",
    "location": {
      "lat": 53.3454,
      "lng": -6.2645,
      "city": "Dublin",
      "country": "Ireland"
    },
    "shortDescription": "Dublin's cultural quarter, where cobblestone streets, traditional pubs, and live music capture the soul of Irish hospitality.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "washington-dc-national-mall",
    "name": "National Mall",
    "type": "park",
    "location": {
      "lat": 38.8895,
      "lng": -77.0353,
      "city": "Washington D.C.",
      "country": "United States"
    },
    "shortDescription": "America's front yard, where monuments, memorials, and museums line a grand green space connecting the Capitol to the Lincoln Memorial.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "boston-freedom-trail",
    "name": "Freedom Trail",
    "type": "other",
    "location": {
      "lat": 42.3601,
      "lng": -71.0589,
      "city": "Boston",
      "country": "United States"
    },
    "shortDescription": "A 2.5-mile red-brick path through historic Boston, connecting 16 sites that tell the story of America's revolutionary past.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "montreal-old-port",
    "name": "Old Port of Montreal",
    "type": "other",
    "location": {
      "lat": 45.5088,
      "lng": -73.5542,
      "city": "Montreal",
      "country": "Canada"
    },
    "shortDescription": "Montreal's historic waterfront, where cobblestone streets, European charm, and the St. Lawrence River create a vibrant cultural district.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-miguel-allende",
    "name": "San Miguel de Allende",
    "type": "other",
    "location": {
      "lat": 20.9149,
      "lng": -100.7446,
      "city": "San Miguel de Allende",
      "country": "Mexico"
    },
    "shortDescription": "A UNESCO World Heritage colonial town, where baroque architecture, art galleries, and mountain views create Mexico's most charming destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "playa-del-carmen",
    "name": "Playa del Carmen",
    "type": "beach",
    "location": {
      "lat": 20.6286,
      "lng": -87.0739,
      "city": "Playa del Carmen",
      "country": "Mexico"
    },
    "shortDescription": "A vibrant beach town where turquoise waters, white sand beaches, and a pedestrian-friendly atmosphere create the Riviera Maya's heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "panama-casco-viejo",
    "name": "Casco Viejo",
    "type": "monument",
    "location": {
      "lat": 8.9517,
      "lng": -79.535,
      "city": "Panama City",
      "country": "Panama"
    },
    "shortDescription": "Panama City's historic quarter, where Spanish colonial architecture, colorful balconies, and Caribbean vibes create a UNESCO World Heritage gem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "medellin-comuna-13",
    "name": "Comuna 13",
    "type": "other",
    "location": {
      "lat": 6.2442,
      "lng": -75.5812,
      "city": "Medellín",
      "country": "Colombia"
    },
    "shortDescription": "A transformed neighborhood where vibrant street art, outdoor escalators, and community resilience tell the story of Medellín's rebirth.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "quito-historic-center",
    "name": "Historic Center of Quito",
    "type": "monument",
    "location": {
      "lat": -0.2202,
      "lng": -78.5121,
      "city": "Quito",
      "country": "Ecuador"
    },
    "shortDescription": "The best-preserved historic center in Latin America, where colonial churches, plazas, and Andean architecture create a UNESCO World Heritage treasure.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "valparaiso-hills",
    "name": "Valparaíso Hills",
    "type": "viewpoint",
    "location": {
      "lat": -33.0472,
      "lng": -71.6127,
      "city": "Valparaíso",
      "country": "Chile"
    },
    "shortDescription": "A colorful port city built on hills, where street art, funiculars, and ocean views create Chile's most bohemian destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "florence-duomo",
    "name": "Florence Cathedral",
    "type": "monument",
    "location": {
      "lat": 43.7731,
      "lng": 11.256,
      "city": "Florence",
      "country": "Italy"
    },
    "shortDescription": "Brunelleschi's magnificent dome dominates Florence's skyline, where Renaissance architecture and artistic genius converge.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "milan-duomo",
    "name": "Milan Cathedral",
    "type": "monument",
    "location": {
      "lat": 45.4642,
      "lng": 9.1914,
      "city": "Milan",
      "country": "Italy"
    },
    "shortDescription": "Italy's largest Gothic cathedral, where thousands of spires, intricate facades, and rooftop views create Milan's spiritual heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "budapest-parliament",
    "name": "Hungarian Parliament",
    "type": "monument",
    "location": {
      "lat": 47.5071,
      "lng": 19.0458,
      "city": "Budapest",
      "country": "Hungary"
    },
    "shortDescription": "Budapest's neo-Gothic masterpiece on the Danube, where architecture, history, and river views create one of Europe's most stunning buildings.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "warsaw-old-town",
    "name": "Warsaw Old Town",
    "type": "monument",
    "location": {
      "lat": 52.2298,
      "lng": 21.0118,
      "city": "Warsaw",
      "country": "Poland"
    },
    "shortDescription": "A meticulously reconstructed medieval center, where colorful facades, cobblestone squares, and resilience tell Warsaw's story of rebirth.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "portland-powell-books",
    "name": "Powell's City of Books",
    "type": "other",
    "location": {
      "lat": 45.5231,
      "lng": -122.6765,
      "city": "Portland",
      "country": "United States"
    },
    "shortDescription": "The world's largest independent bookstore, where miles of shelves, rare editions, and literary culture create a bibliophile's paradise.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "austin-barton-springs",
    "name": "Barton Springs Pool",
    "type": "park",
    "location": {
      "lat": 30.2642,
      "lng": -97.7711,
      "city": "Austin",
      "country": "United States"
    },
    "shortDescription": "A natural spring-fed pool in the heart of Austin, where 68-degree water, limestone banks, and city life create a unique urban oasis.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-orleans-french-quarter",
    "name": "French Quarter",
    "type": "other",
    "location": {
      "lat": 29.9584,
      "lng": -90.0644,
      "city": "New Orleans",
      "country": "United States"
    },
    "shortDescription": "New Orleans' historic heart, where Creole architecture, jazz music, and vibrant street life create America's most unique neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "calgary-banff",
    "name": "Banff National Park",
    "type": "park",
    "location": {
      "lat": 51.1784,
      "lng": -115.5708,
      "city": "Banff",
      "country": "Canada"
    },
    "shortDescription": "Canada's first national park, where turquoise lakes, snow-capped peaks, and pristine wilderness create the Canadian Rockies' crown jewel.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "merida-centro-historico",
    "name": "Mérida Historic Center",
    "type": "monument",
    "location": {
      "lat": 20.9674,
      "lng": -89.5926,
      "city": "Mérida",
      "country": "Mexico"
    },
    "shortDescription": "Yucatán's white city, where colonial architecture, Mayan culture, and vibrant plazas create Mexico's safest and most charming capital.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cozumel-reef",
    "name": "Cozumel Reef",
    "type": "beach",
    "location": {
      "lat": 20.5083,
      "lng": -86.9458,
      "city": "Cozumel",
      "country": "Mexico"
    },
    "shortDescription": "The world's second-largest barrier reef, where crystal-clear waters, vibrant marine life, and diving adventures await in the Caribbean.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-juan-old-san-juan",
    "name": "Old San Juan",
    "type": "monument",
    "location": {
      "lat": 18.4655,
      "lng": -66.1057,
      "city": "San Juan",
      "country": "Puerto Rico"
    },
    "shortDescription": "A 500-year-old walled city, where colorful Spanish colonial buildings, cobblestone streets, and Caribbean charm create a UNESCO World Heritage gem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "bogota-monserrate",
    "name": "Monserrate",
    "type": "viewpoint",
    "location": {
      "lat": 4.6097,
      "lng": -74.0558,
      "city": "Bogotá",
      "country": "Colombia"
    },
    "shortDescription": "A mountain sanctuary overlooking Bogotá, where a white church, cable car ride, and panoramic city views create a spiritual and scenic escape.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cusco-sacred-valley",
    "name": "Sacred Valley",
    "type": "viewpoint",
    "location": {
      "lat": -13.3333,
      "lng": -72.0833,
      "city": "Cusco",
      "country": "Peru"
    },
    "shortDescription": "The Incas' agricultural heartland, where terraced mountains, ancient ruins, and Andean villages create a journey through Peru's living history.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "iguazu-falls",
    "name": "Iguazú Falls",
    "type": "viewpoint",
    "location": {
      "lat": -25.6953,
      "lng": -54.4367,
      "city": "Puerto Iguazú",
      "country": "Argentina"
    },
    "shortDescription": "One of the world's most spectacular waterfalls, where 275 cascades, misty rainforest, and thundering water create a natural wonder.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "patagonia-torres-del-paine",
    "name": "Torres del Paine",
    "type": "park",
    "location": {
      "lat": -50.9423,
      "lng": -73.4068,
      "city": "Torres del Paine",
      "country": "Chile"
    },
    "shortDescription": "Patagonia's crown jewel, where granite towers, turquoise lakes, and pristine wilderness create one of the world's most stunning national parks.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-vondelpark",
    "name": "Vondelpark",
    "type": "park",
    "location": {
      "lat": 52.3579,
      "lng": 4.8686,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Amsterdam's largest park, where ponds, open meadows, and cultural events create a peaceful escape in the city center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-notre-dame",
    "name": "Notre-Dame Cathedral",
    "type": "monument",
    "location": {
      "lat": 48.853,
      "lng": 2.3499,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "A Gothic masterpiece on the Île de la Cité, where flying buttresses, rose windows, and centuries of history create Paris's spiritual heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "seville-alcazar",
    "name": "Alcázar of Seville",
    "type": "monument",
    "location": {
      "lat": 37.3839,
      "lng": -5.9912,
      "city": "Seville",
      "country": "Spain"
    },
    "shortDescription": "A royal palace where Mudejar architecture, intricate tilework, and lush gardens create one of Spain's most stunning monuments.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "las-vegas-strip",
    "name": "Las Vegas Strip",
    "type": "other",
    "location": {
      "lat": 36.1147,
      "lng": -115.1728,
      "city": "Las Vegas",
      "country": "United States"
    },
    "shortDescription": "The world's most famous boulevard, where neon lights, themed resorts, and 24-hour energy create an unforgettable spectacle.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "denver-red-rocks",
    "name": "Red Rocks Amphitheatre",
    "type": "viewpoint",
    "location": {
      "lat": 39.6655,
      "lng": -105.2056,
      "city": "Denver",
      "country": "United States"
    },
    "shortDescription": "A natural amphitheater carved from red sandstone, where music, geology, and mountain views create one of the world's most unique venues.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "quebec-old-town",
    "name": "Old Quebec",
    "type": "monument",
    "location": {
      "lat": 46.8139,
      "lng": -71.208,
      "city": "Quebec City",
      "country": "Canada"
    },
    "shortDescription": "North America's only walled city, where cobblestone streets, French architecture, and European charm create a UNESCO World Heritage treasure.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "guanajuato-centro",
    "name": "Guanajuato Historic Center",
    "type": "monument",
    "location": {
      "lat": 21.019,
      "lng": -101.2574,
      "city": "Guanajuato",
      "country": "Mexico"
    },
    "shortDescription": "A colorful colonial city built in a ravine, where underground tunnels, steep alleys, and baroque architecture create Mexico's most unique UNESCO site.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-cristobal-chiapas",
    "name": "San Cristóbal de las Casas",
    "type": "other",
    "location": {
      "lat": 16.737,
      "lng": -92.6376,
      "city": "San Cristóbal de las Casas",
      "country": "Mexico"
    },
    "shortDescription": "A highland colonial town, where indigenous culture, colorful markets, and mountain air create Chiapas's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lake-atitlan",
    "name": "Lake Atitlán",
    "type": "viewpoint",
    "location": {
      "lat": 14.6906,
      "lng": -91.2025,
      "city": "Panajachel",
      "country": "Guatemala"
    },
    "shortDescription": "A volcanic lake surrounded by three volcanoes, where Mayan villages, clear waters, and mountain vistas create Central America's most beautiful setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "monteverde-cloud-forest",
    "name": "Monteverde Cloud Forest",
    "type": "park",
    "location": {
      "lat": 10.3,
      "lng": -84.8167,
      "city": "Monteverde",
      "country": "Costa Rica"
    },
    "shortDescription": "A misty cloud forest reserve, where hanging bridges, rare wildlife, and pristine nature create Costa Rica's most biodiverse ecosystem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "salvador-pelourinho",
    "name": "Pelourinho",
    "type": "monument",
    "location": {
      "lat": -12.9714,
      "lng": -38.5014,
      "city": "Salvador",
      "country": "Brazil"
    },
    "shortDescription": "Salvador's historic center, where colorful colonial buildings, Afro-Brazilian culture, and capoeira create Brazil's most vibrant neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "salar-de-uyuni",
    "name": "Salar de Uyuni",
    "type": "viewpoint",
    "location": {
      "lat": -20.1338,
      "lng": -67.4891,
      "city": "Uyuni",
      "country": "Bolivia"
    },
    "shortDescription": "The world's largest salt flat, where endless white horizons, mirror-like reflections, and otherworldly landscapes create a surreal experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "brussels-grand-place",
    "name": "Grand Place",
    "type": "monument",
    "location": {
      "lat": 50.8466,
      "lng": 4.3528,
      "city": "Brussels",
      "country": "Belgium"
    },
    "shortDescription": "Brussels' magnificent central square, where Gothic and Baroque architecture create one of Europe's most beautiful plazas.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "zurich-lake",
    "name": "Lake Zurich",
    "type": "viewpoint",
    "location": {
      "lat": 47.3769,
      "lng": 8.5417,
      "city": "Zurich",
      "country": "Switzerland"
    },
    "shortDescription": "Zurich's pristine lake, where crystal-clear waters, mountain views, and waterfront promenades create Switzerland's urban oasis.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "nashville-grand-ole-opry",
    "name": "Grand Ole Opry",
    "type": "other",
    "location": {
      "lat": 36.2081,
      "lng": -86.7822,
      "city": "Nashville",
      "country": "United States"
    },
    "shortDescription": "The home of country music, where legendary performances, musical history, and Southern hospitality create Nashville's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "philadelphia-independence-hall",
    "name": "Independence Hall",
    "type": "monument",
    "location": {
      "lat": 39.9489,
      "lng": -75.15,
      "city": "Philadelphia",
      "country": "United States"
    },
    "shortDescription": "Where the Declaration of Independence and Constitution were signed, creating the birthplace of American democracy.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "ottawa-parliament",
    "name": "Parliament Hill",
    "type": "monument",
    "location": {
      "lat": 45.4247,
      "lng": -75.695,
      "city": "Ottawa",
      "country": "Canada"
    },
    "shortDescription": "Canada's seat of government, where Gothic Revival architecture, the Peace Tower, and national ceremonies create Ottawa's iconic landmark.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "puebla-centro-historico",
    "name": "Puebla Historic Center",
    "type": "monument",
    "location": {
      "lat": 19.0414,
      "lng": -98.2063,
      "city": "Puebla",
      "country": "Mexico"
    },
    "shortDescription": "A UNESCO World Heritage city, where Talavera tiles, baroque churches, and colonial architecture create Mexico's most colorful historic center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "belize-barrier-reef",
    "name": "Belize Barrier Reef",
    "type": "beach",
    "location": {
      "lat": 17.1899,
      "lng": -87.9719,
      "city": "Belize City",
      "country": "Belize"
    },
    "shortDescription": "The largest barrier reef in the Northern Hemisphere, where crystal waters, marine biodiversity, and diving adventures await.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "tikal-national-park",
    "name": "Tikal National Park",
    "type": "monument",
    "location": {
      "lat": 17.222,
      "lng": -89.6237,
      "city": "Tikal",
      "country": "Guatemala"
    },
    "shortDescription": "One of the largest Mayan archaeological sites, where ancient pyramids rise from the jungle canopy in Guatemala's Petén region.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "galapagos-islands",
    "name": "Galápagos Islands",
    "type": "park",
    "location": {
      "lat": -0.7893,
      "lng": -91.0544,
      "city": "Puerto Ayora",
      "country": "Ecuador"
    },
    "shortDescription": "Darwin's living laboratory, where unique wildlife, volcanic landscapes, and pristine nature create one of the world's most extraordinary destinations.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "ushuaia-end-of-world",
    "name": "Ushuaia - End of the World",
    "type": "viewpoint",
    "location": {
      "lat": -54.8019,
      "lng": -68.303,
      "city": "Ushuaia",
      "country": "Argentina"
    },
    "shortDescription": "The world's southernmost city, where mountains, glaciers, and the Beagle Channel mark the gateway to Antarctica.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  }
]$$::jsonb
);

-- 1) Validacion rapida
with seed_items as (
  select jsonb_array_elements((select data from seed_payload)) as item
),
normalized as (
  select
    item->>'id' as id,
    item->>'name' as name,
    item->>'type' as type,
    (item->'location'->>'lat')::double precision as lat,
    (item->'location'->>'lng')::double precision as lng,
    item->'location'->>'city' as city,
    item->'location'->>'country' as country,
    item->>'shortDescription' as short_description,
    coalesce((item->>'hasGeneratedContent')::boolean, false) as has_generated_content,
    (item->>'createdAt')::timestamptz as created_at,
    (item->>'updatedAt')::timestamptz as updated_at,
    item as raw_payload
  from seed_items
),
validation as (
  select
    *,
    (id is null or id = '') as missing_id,
    (name is null or name = '') as missing_name,
    (type is null or type = '') as missing_type,
    (lat is null or lng is null) as missing_coords,
    (lat is not null and (lat < -90 or lat > 90)) as invalid_lat,
    (lng is not null and (lng < -180 or lng > 180)) as invalid_lng,
    (type is not null and type not in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other')) as invalid_type
  from normalized
)
select
  count(*) as total,
  count(*) filter (where missing_id) as missing_id,
  count(*) filter (where missing_name) as missing_name,
  count(*) filter (where missing_type) as missing_type,
  count(*) filter (where missing_coords) as missing_coords,
  count(*) filter (where invalid_lat) as invalid_lat,
  count(*) filter (where invalid_lng) as invalid_lng,
  count(*) filter (where invalid_type) as invalid_type
from validation;

-- 2) Insertar spots (solo validos)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
seed_items as (
  select jsonb_array_elements((select data from seed_payload)) as item
),
normalized as (
  select
    item->>'id' as id,
    item->>'name' as name,
    item->>'type' as type,
    (item->'location'->>'lat')::double precision as lat,
    (item->'location'->>'lng')::double precision as lng,
    item->'location'->>'city' as city,
    item->'location'->>'country' as country,
    item->>'shortDescription' as short_description,
    coalesce((item->>'hasGeneratedContent')::boolean, false) as has_generated_content,
    (item->>'createdAt')::timestamptz as created_at,
    (item->>'updatedAt')::timestamptz as updated_at,
    item as raw_payload
  from seed_items
),
valid as (
  select * from normalized
  where
    id is not null and id <> '' and
    name is not null and name <> '' and
    type is not null and type <> '' and
    lat is not null and lng is not null and
    lat between -90 and 90 and
    lng between -180 and 180 and
    type in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other')
)
insert into spots (
  id, name, type, location_lat, location_lng, location_city, location_country,
  short_description, has_generated_content, needs_review, source, created_at, updated_at,
  migration_batch_id
)
select
  id, name, type, lat, lng, city, country,
  short_description, has_generated_content, false, 'seed',
  coalesce(created_at, now()), coalesce(updated_at, now()),
  params.migration_batch_id
from valid, params
on conflict (id) do nothing;

-- 3) Crear SpotContribution tipo create
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
new_spots as (
  select s.id
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
)
insert into spot_contributions (
  spot_id, author_id, type, payload, status, created_at, applied_at, applied_by, migration_batch_id
)
select
  ns.id,
  null,
  'create',
  jsonb_build_object('spot_id', ns.id),
  'applied',
  now(),
  now(),
  null,
  params.migration_batch_id
from new_spots ns, params
where not exists (
  select 1 from spot_contributions sc
  where sc.spot_id = ns.id and sc.type = 'create'
);

-- 4) Crear SpotVersion v1 por spot
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
spot_base as (
  select s.*
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
),
contribs as (
  select sc.id as contribution_id, sc.spot_id
  from spot_contributions sc, params
  where sc.migration_batch_id = params.migration_batch_id
)
insert into spot_versions (
  spot_id, contribution_id, version, snapshot, created_at, created_by, migration_batch_id
)
select
  sb.id as spot_id,
  c.contribution_id,
  1 as version,
  jsonb_build_object(
    'id', sb.id,
    'name', sb.name,
    'type', sb.type,
    'location', jsonb_build_object('lat', sb.location_lat, 'lng', sb.location_lng, 'city', sb.location_city, 'country', sb.location_country),
    'shortDescription', sb.short_description,
    'hasGeneratedContent', sb.has_generated_content,
    'needsReview', sb.needs_review
  ) as snapshot,
  now(),
  null,
  params.migration_batch_id
from spot_base sb
left join contribs c on c.spot_id = sb.id
, params
where not exists (
  select 1 from spot_versions sv where sv.spot_id = sb.id and sv.version = 1
);
-- Carga directa de seeds como spots canonicos (sin tablas legacy)
-- Pega el JSON UNA SOLA VEZ en el bloque de seed_payload.
-- Nota: este script IGNORA image.* y solo usa campos canonicos.

-- 0) Crear payload temporal y pegar JSON una sola vez
create temp table if not exists seed_payload (data jsonb);
truncate table seed_payload;

insert into seed_payload (data)
values (
  '[
  {
    "id": "helsinki-senate-square",
    "name": "Senate Square",
    "type": "monument",
    "location": {
      "lat": 60.1699,
      "lng": 24.9384,
      "city": "Helsinki",
      "country": "Finland"
    },
    "shortDescription": "The heart of Helsinki, where neoclassical architecture meets the city's vibrant energy. A perfect starting point for exploring Finnish culture.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "helsinki-suomenlinna",
    "name": "Suomenlinna Fortress",
    "type": "monument",
    "location": {
      "lat": 60.147,
      "lng": 24.989,
      "city": "Helsinki",
      "country": "Finland"
    },
    "shortDescription": "A sea fortress spread across six islands, where history and nature create an unforgettable escape from the city.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oslo-opera-house",
    "name": "Oslo Opera House",
    "type": "monument",
    "location": {
      "lat": 59.9076,
      "lng": 10.7522,
      "city": "Oslo",
      "country": "Norway"
    },
    "shortDescription": "A stunning architectural masterpiece where you can walk on the roof, offering panoramic views of the fjord and city skyline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oslo-vigeland-park",
    "name": "Vigeland Sculpture Park",
    "type": "park",
    "location": {
      "lat": 59.9272,
      "lng": 10.7005,
      "city": "Oslo",
      "country": "Norway"
    },
    "shortDescription": "The world's largest sculpture park by a single artist, where over 200 bronze and granite figures explore the human experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-tower-bridge",
    "name": "Tower Bridge",
    "type": "monument",
    "location": {
      "lat": 51.5055,
      "lng": -0.0754,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "London's iconic Victorian bridge, where engineering meets elegance. Walk across for stunning Thames views and city panoramas.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-covent-garden",
    "name": "Covent Garden",
    "type": "market",
    "location": {
      "lat": 51.5125,
      "lng": -0.1236,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "A vibrant piazza where street performers, boutique shops, and historic architecture create London's most charming neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "london-hyde-park",
    "name": "Hyde Park",
    "type": "park",
    "location": {
      "lat": 51.5073,
      "lng": -0.1657,
      "city": "London",
      "country": "United Kingdom"
    },
    "shortDescription": "London's green heart, where Serpentine Lake, ancient trees, and open spaces offer a peaceful escape in the city center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "berlin-brandenburg-gate",
    "name": "Brandenburg Gate",
    "type": "monument",
    "location": {
      "lat": 52.5163,
      "lng": 13.3777,
      "city": "Berlin",
      "country": "Germany"
    },
    "shortDescription": "Berlin's most iconic symbol, where history and hope converge. A powerful reminder of division and unity.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "berlin-east-side-gallery",
    "name": "East Side Gallery",
    "type": "monument",
    "location": {
      "lat": 52.5054,
      "lng": 13.44,
      "city": "Berlin",
      "country": "Germany"
    },
    "shortDescription": "The longest remaining section of the Berlin Wall, transformed into an open-air gallery celebrating freedom and creativity.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-rijksmuseum",
    "name": "Rijksmuseum",
    "type": "museum",
    "location": {
      "lat": 52.36,
      "lng": 4.8852,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Home to Rembrandt's Night Watch and masterpieces of the Dutch Golden Age, where art and history come alive.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-jordaan",
    "name": "Jordaan District",
    "type": "other",
    "location": {
      "lat": 52.3779,
      "lng": 4.8764,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Amsterdam's most charming neighborhood, where narrow canals, hidden courtyards, and cozy cafés create an authentic Dutch experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-eiffel-tower",
    "name": "Eiffel Tower",
    "type": "monument",
    "location": {
      "lat": 48.8584,
      "lng": 2.2945,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The iron lady of Paris, where engineering marvel meets romantic icon. Ascend for breathtaking city views or admire from the Champ de Mars.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-montmartre",
    "name": "Montmartre",
    "type": "viewpoint",
    "location": {
      "lat": 48.8867,
      "lng": 2.3431,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The bohemian hilltop village where artists, cobblestone streets, and Sacré-Cœur create Paris's most romantic neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-louvre",
    "name": "Louvre Museum",
    "type": "museum",
    "location": {
      "lat": 48.8606,
      "lng": 2.3376,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "The world's largest art museum, where the Mona Lisa, Venus de Milo, and countless masterpieces await in a former royal palace.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "madrid-prado",
    "name": "Prado Museum",
    "type": "museum",
    "location": {
      "lat": 40.4138,
      "lng": -3.6921,
      "city": "Madrid",
      "country": "Spain"
    },
    "shortDescription": "Home to Velázquez, Goya, and El Greco, where Spanish art history unfolds in one of the world's greatest collections.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "barcelona-sagrada-familia",
    "name": "Sagrada Família",
    "type": "monument",
    "location": {
      "lat": 41.4036,
      "lng": 2.1744,
      "city": "Barcelona",
      "country": "Spain"
    },
    "shortDescription": "Gaudí's unfinished masterpiece, where nature-inspired architecture reaches toward the sky in a symphony of light and stone.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "barcelona-park-guell",
    "name": "Park Güell",
    "type": "park",
    "location": {
      "lat": 41.4145,
      "lng": 2.1527,
      "city": "Barcelona",
      "country": "Spain"
    },
    "shortDescription": "Gaudí's whimsical park, where colorful mosaics, organic forms, and panoramic city views create a magical escape.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-york-central-park",
    "name": "Central Park",
    "type": "park",
    "location": {
      "lat": 40.7829,
      "lng": -73.9654,
      "city": "New York",
      "country": "United States"
    },
    "shortDescription": "Manhattan's green oasis, where lakes, meadows, and winding paths offer a peaceful escape from the city's energy.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-york-brooklyn-bridge",
    "name": "Brooklyn Bridge",
    "type": "monument",
    "location": {
      "lat": 40.7061,
      "lng": -73.9969,
      "city": "New York",
      "country": "United States"
    },
    "shortDescription": "Walk across this iconic 19th-century bridge for stunning views of Manhattan's skyline and the East River.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-francisco-golden-gate",
    "name": "Golden Gate Bridge",
    "type": "monument",
    "location": {
      "lat": 37.8199,
      "lng": -122.4783,
      "city": "San Francisco",
      "country": "United States"
    },
    "shortDescription": "The iconic orange bridge spanning the bay, where fog, ocean, and city create one of the world's most photographed views.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "los-angeles-griffith-observatory",
    "name": "Griffith Observatory",
    "type": "viewpoint",
    "location": {
      "lat": 34.1183,
      "lng": -118.3003,
      "city": "Los Angeles",
      "country": "United States"
    },
    "shortDescription": "Perched above the city, where astronomy, architecture, and panoramic views of LA create an unforgettable experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "toronto-cn-tower",
    "name": "CN Tower",
    "type": "viewpoint",
    "location": {
      "lat": 43.6426,
      "lng": -79.3871,
      "city": "Toronto",
      "country": "Canada"
    },
    "shortDescription": "Toronto's iconic tower, where glass floors and 360-degree views offer a bird's-eye perspective of the city and lake.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "vancouver-stanley-park",
    "name": "Stanley Park",
    "type": "park",
    "location": {
      "lat": 49.3017,
      "lng": -123.1417,
      "city": "Vancouver",
      "country": "Canada"
    },
    "shortDescription": "A 1000-acre urban forest where ocean views, totem poles, and winding trails create Vancouver's natural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "mexico-city-zocalo",
    "name": "Zócalo",
    "type": "monument",
    "location": {
      "lat": 19.4326,
      "lng": -99.1332,
      "city": "Mexico City",
      "country": "Mexico"
    },
    "shortDescription": "The heart of Mexico City, where Aztec ruins, colonial cathedrals, and modern life converge in Latin America's largest square.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "mexico-city-frida-kahlo-museum",
    "name": "Frida Kahlo Museum",
    "type": "museum",
    "location": {
      "lat": 19.355,
      "lng": -99.1622,
      "city": "Mexico City",
      "country": "Mexico"
    },
    "shortDescription": "The Blue House where Frida Kahlo was born and died, now a museum celebrating her life, art, and indomitable spirit.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "tulum-ruins",
    "name": "Tulum Archaeological Site",
    "type": "monument",
    "location": {
      "lat": 20.215,
      "lng": -87.4292,
      "city": "Tulum",
      "country": "Mexico"
    },
    "shortDescription": "Ancient Mayan ruins perched on cliffs above the Caribbean, where history and turquoise waters create a breathtaking setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "chichen-itza",
    "name": "Chichén Itzá",
    "type": "monument",
    "location": {
      "lat": 20.6843,
      "lng": -88.5678,
      "city": "Yucatán",
      "country": "Mexico"
    },
    "shortDescription": "One of the New Seven Wonders, where the Pyramid of Kukulkan reveals the Maya's astronomical genius and architectural mastery.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "antigua-guatemala",
    "name": "Antigua Guatemala",
    "type": "other",
    "location": {
      "lat": 14.5586,
      "lng": -90.7333,
      "city": "Antigua",
      "country": "Guatemala"
    },
    "shortDescription": "A UNESCO World Heritage colonial city, where cobblestone streets, colorful facades, and volcano views create Central America's most charming town.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-jose-costa-rica",
    "name": "San José Central Market",
    "type": "market",
    "location": {
      "lat": 9.9333,
      "lng": -84.0833,
      "city": "San José",
      "country": "Costa Rica"
    },
    "shortDescription": "A vibrant market where local flavors, crafts, and the pulse of Costa Rican life create an authentic cultural experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lima-miraflores",
    "name": "Miraflores District",
    "type": "viewpoint",
    "location": {
      "lat": -12.1224,
      "lng": -77.0305,
      "city": "Lima",
      "country": "Peru"
    },
    "shortDescription": "Lima's coastal district, where cliffside parks, ocean views, and modern cafés create the city's most vibrant neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "machu-picchu",
    "name": "Machu Picchu",
    "type": "monument",
    "location": {
      "lat": -13.1631,
      "lng": -72.545,
      "city": "Cusco",
      "country": "Peru"
    },
    "shortDescription": "The lost city of the Incas, perched in the clouds, where ancient engineering and breathtaking mountain vistas create a once-in-a-lifetime experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rio-copacabana",
    "name": "Copacabana Beach",
    "type": "beach",
    "location": {
      "lat": -22.9711,
      "lng": -43.1822,
      "city": "Rio de Janeiro",
      "country": "Brazil"
    },
    "shortDescription": "Rio's iconic beach, where golden sand, azure waters, and the city's vibrant energy create the world's most famous coastline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rio-christ-redeemer",
    "name": "Christ the Redeemer",
    "type": "monument",
    "location": {
      "lat": -22.9519,
      "lng": -43.2105,
      "city": "Rio de Janeiro",
      "country": "Brazil"
    },
    "shortDescription": "The iconic statue atop Corcovado Mountain, where faith, engineering, and panoramic city views create Rio's most powerful symbol.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "buenos-aires-recoleta",
    "name": "Recoleta Cemetery",
    "type": "monument",
    "location": {
      "lat": -34.5875,
      "lng": -58.3933,
      "city": "Buenos Aires",
      "country": "Argentina"
    },
    "shortDescription": "An open-air museum of mausoleums, where art, architecture, and history create one of the world's most beautiful cemeteries.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "buenos-aires-san-telmo",
    "name": "San Telmo Market",
    "type": "market",
    "location": {
      "lat": -34.6208,
      "lng": -58.3731,
      "city": "Buenos Aires",
      "country": "Argentina"
    },
    "shortDescription": "A historic market where tango, antiques, and local flavors capture the soul of Buenos Aires.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rome-colosseum",
    "name": "Colosseum",
    "type": "monument",
    "location": {
      "lat": 41.8902,
      "lng": 12.4922,
      "city": "Rome",
      "country": "Italy"
    },
    "shortDescription": "The iconic amphitheater where gladiators once fought, now standing as a powerful symbol of ancient Rome's grandeur and engineering genius.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "rome-trevi-fountain",
    "name": "Trevi Fountain",
    "type": "monument",
    "location": {
      "lat": 41.9009,
      "lng": 12.4833,
      "city": "Rome",
      "country": "Italy"
    },
    "shortDescription": "Baroque masterpiece where Neptune's chariot emerges from water, and tossing a coin ensures your return to the Eternal City.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "venice-st-mark-square",
    "name": "St. Mark's Square",
    "type": "monument",
    "location": {
      "lat": 45.4342,
      "lng": 12.3388,
      "city": "Venice",
      "country": "Italy"
    },
    "shortDescription": "Venice's grand piazza, where Byzantine domes, Renaissance architecture, and the lagoon's magic create an unforgettable setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "prague-charles-bridge",
    "name": "Charles Bridge",
    "type": "monument",
    "location": {
      "lat": 50.0865,
      "lng": 14.4114,
      "city": "Prague",
      "country": "Czech Republic"
    },
    "shortDescription": "A 14th-century stone bridge adorned with baroque statues, where history, art, and the Vltava River create Prague's most romantic walk.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "vienna-schonbrunn",
    "name": "Schönbrunn Palace",
    "type": "monument",
    "location": {
      "lat": 48.1847,
      "lng": 16.3122,
      "city": "Vienna",
      "country": "Austria"
    },
    "shortDescription": "The former imperial summer residence, where baroque architecture, manicured gardens, and Habsburg history create Vienna's grandest palace.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "chicago-millennium-park",
    "name": "Millennium Park",
    "type": "park",
    "location": {
      "lat": 41.8825,
      "lng": -87.6228,
      "city": "Chicago",
      "country": "United States"
    },
    "shortDescription": "Chicago's modern park, where Cloud Gate's mirrored surface, public art, and skyline views create the city's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "miami-south-beach",
    "name": "South Beach",
    "type": "beach",
    "location": {
      "lat": 25.7907,
      "lng": -80.13,
      "city": "Miami",
      "country": "United States"
    },
    "shortDescription": "Art Deco architecture meets turquoise waters, where golden sand, vibrant energy, and ocean breezes create Miami's iconic coastline.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "seattle-space-needle",
    "name": "Space Needle",
    "type": "viewpoint",
    "location": {
      "lat": 47.6205,
      "lng": -122.3493,
      "city": "Seattle",
      "country": "United States"
    },
    "shortDescription": "Seattle's iconic tower, where rotating glass floors offer 360-degree views of the city, mountains, and Puget Sound.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "oaxaca-zocalo",
    "name": "Zócalo de Oaxaca",
    "type": "monument",
    "location": {
      "lat": 17.0606,
      "lng": -96.7253,
      "city": "Oaxaca",
      "country": "Mexico"
    },
    "shortDescription": "The heart of Oaxaca, where colonial architecture, vibrant markets, and indigenous culture converge in one of Mexico's most beautiful squares.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "guadalajara-tequila",
    "name": "Tequila Town",
    "type": "other",
    "location": {
      "lat": 20.88,
      "lng": -103.8367,
      "city": "Tequila",
      "country": "Mexico"
    },
    "shortDescription": "The birthplace of tequila, where blue agave fields, traditional distilleries, and Mexican heritage create an authentic cultural experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cartagena-old-town",
    "name": "Cartagena Old Town",
    "type": "monument",
    "location": {
      "lat": 10.391,
      "lng": -75.4794,
      "city": "Cartagena",
      "country": "Colombia"
    },
    "shortDescription": "A walled colonial city where colorful balconies, cobblestone streets, and Caribbean charm create Colombia's most romantic destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "santiago-cerro-san-cristobal",
    "name": "Cerro San Cristóbal",
    "type": "viewpoint",
    "location": {
      "lat": -33.425,
      "lng": -70.6378,
      "city": "Santiago",
      "country": "Chile"
    },
    "shortDescription": "Santiago's highest hill, where a funicular ride leads to panoramic city views, a giant statue of the Virgin Mary, and peaceful gardens.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "stockholm-gamla-stan",
    "name": "Gamla Stan",
    "type": "other",
    "location": {
      "lat": 59.3251,
      "lng": 18.0711,
      "city": "Stockholm",
      "country": "Sweden"
    },
    "shortDescription": "Stockholm's medieval old town, where narrow cobblestone streets, colorful buildings, and royal palaces create a fairy-tale setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "copenhagen-nyhavn",
    "name": "Nyhavn",
    "type": "other",
    "location": {
      "lat": 55.6794,
      "lng": 12.5906,
      "city": "Copenhagen",
      "country": "Denmark"
    },
    "shortDescription": "Copenhagen's iconic canal, where colorful 17th-century houses, historic ships, and waterfront cafés create the city's most picturesque scene.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lisbon-belem-tower",
    "name": "Belém Tower",
    "type": "monument",
    "location": {
      "lat": 38.6916,
      "lng": -9.216,
      "city": "Lisbon",
      "country": "Portugal"
    },
    "shortDescription": "A 16th-century fortress on the Tagus River, where Manueline architecture and maritime history mark Portugal's Age of Discovery.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "istanbul-hagia-sophia",
    "name": "Hagia Sophia",
    "type": "monument",
    "location": {
      "lat": 41.0086,
      "lng": 28.9802,
      "city": "Istanbul",
      "country": "Turkey"
    },
    "shortDescription": "A masterpiece of Byzantine architecture, where Christian mosaics and Islamic calligraphy coexist in a symbol of Istanbul's layered history.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "athens-acropolis",
    "name": "Acropolis",
    "type": "monument",
    "location": {
      "lat": 37.9715,
      "lng": 23.7267,
      "city": "Athens",
      "country": "Greece"
    },
    "shortDescription": "The ancient citadel where the Parthenon stands, offering breathtaking views of Athens and a journey through classical Greek civilization.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "dublin-temple-bar",
    "name": "Temple Bar",
    "type": "other",
    "location": {
      "lat": 53.3454,
      "lng": -6.2645,
      "city": "Dublin",
      "country": "Ireland"
    },
    "shortDescription": "Dublin's cultural quarter, where cobblestone streets, traditional pubs, and live music capture the soul of Irish hospitality.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "washington-dc-national-mall",
    "name": "National Mall",
    "type": "park",
    "location": {
      "lat": 38.8895,
      "lng": -77.0353,
      "city": "Washington D.C.",
      "country": "United States"
    },
    "shortDescription": "America's front yard, where monuments, memorials, and museums line a grand green space connecting the Capitol to the Lincoln Memorial.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "boston-freedom-trail",
    "name": "Freedom Trail",
    "type": "other",
    "location": {
      "lat": 42.3601,
      "lng": -71.0589,
      "city": "Boston",
      "country": "United States"
    },
    "shortDescription": "A 2.5-mile red-brick path through historic Boston, connecting 16 sites that tell the story of America's revolutionary past.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "montreal-old-port",
    "name": "Old Port of Montreal",
    "type": "other",
    "location": {
      "lat": 45.5088,
      "lng": -73.5542,
      "city": "Montreal",
      "country": "Canada"
    },
    "shortDescription": "Montreal's historic waterfront, where cobblestone streets, European charm, and the St. Lawrence River create a vibrant cultural district.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-miguel-allende",
    "name": "San Miguel de Allende",
    "type": "other",
    "location": {
      "lat": 20.9149,
      "lng": -100.7446,
      "city": "San Miguel de Allende",
      "country": "Mexico"
    },
    "shortDescription": "A UNESCO World Heritage colonial town, where baroque architecture, art galleries, and mountain views create Mexico's most charming destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "playa-del-carmen",
    "name": "Playa del Carmen",
    "type": "beach",
    "location": {
      "lat": 20.6286,
      "lng": -87.0739,
      "city": "Playa del Carmen",
      "country": "Mexico"
    },
    "shortDescription": "A vibrant beach town where turquoise waters, white sand beaches, and a pedestrian-friendly atmosphere create the Riviera Maya's heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "panama-casco-viejo",
    "name": "Casco Viejo",
    "type": "monument",
    "location": {
      "lat": 8.9517,
      "lng": -79.535,
      "city": "Panama City",
      "country": "Panama"
    },
    "shortDescription": "Panama City's historic quarter, where Spanish colonial architecture, colorful balconies, and Caribbean vibes create a UNESCO World Heritage gem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "medellin-comuna-13",
    "name": "Comuna 13",
    "type": "other",
    "location": {
      "lat": 6.2442,
      "lng": -75.5812,
      "city": "Medellín",
      "country": "Colombia"
    },
    "shortDescription": "A transformed neighborhood where vibrant street art, outdoor escalators, and community resilience tell the story of Medellín's rebirth.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "quito-historic-center",
    "name": "Historic Center of Quito",
    "type": "monument",
    "location": {
      "lat": -0.2202,
      "lng": -78.5121,
      "city": "Quito",
      "country": "Ecuador"
    },
    "shortDescription": "The best-preserved historic center in Latin America, where colonial churches, plazas, and Andean architecture create a UNESCO World Heritage treasure.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "valparaiso-hills",
    "name": "Valparaíso Hills",
    "type": "viewpoint",
    "location": {
      "lat": -33.0472,
      "lng": -71.6127,
      "city": "Valparaíso",
      "country": "Chile"
    },
    "shortDescription": "A colorful port city built on hills, where street art, funiculars, and ocean views create Chile's most bohemian destination.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "florence-duomo",
    "name": "Florence Cathedral",
    "type": "monument",
    "location": {
      "lat": 43.7731,
      "lng": 11.256,
      "city": "Florence",
      "country": "Italy"
    },
    "shortDescription": "Brunelleschi's magnificent dome dominates Florence's skyline, where Renaissance architecture and artistic genius converge.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "milan-duomo",
    "name": "Milan Cathedral",
    "type": "monument",
    "location": {
      "lat": 45.4642,
      "lng": 9.1914,
      "city": "Milan",
      "country": "Italy"
    },
    "shortDescription": "Italy's largest Gothic cathedral, where thousands of spires, intricate facades, and rooftop views create Milan's spiritual heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "budapest-parliament",
    "name": "Hungarian Parliament",
    "type": "monument",
    "location": {
      "lat": 47.5071,
      "lng": 19.0458,
      "city": "Budapest",
      "country": "Hungary"
    },
    "shortDescription": "Budapest's neo-Gothic masterpiece on the Danube, where architecture, history, and river views create one of Europe's most stunning buildings.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "warsaw-old-town",
    "name": "Warsaw Old Town",
    "type": "monument",
    "location": {
      "lat": 52.2298,
      "lng": 21.0118,
      "city": "Warsaw",
      "country": "Poland"
    },
    "shortDescription": "A meticulously reconstructed medieval center, where colorful facades, cobblestone squares, and resilience tell Warsaw's story of rebirth.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "portland-powell-books",
    "name": "Powell's City of Books",
    "type": "other",
    "location": {
      "lat": 45.5231,
      "lng": -122.6765,
      "city": "Portland",
      "country": "United States"
    },
    "shortDescription": "The world's largest independent bookstore, where miles of shelves, rare editions, and literary culture create a bibliophile's paradise.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "austin-barton-springs",
    "name": "Barton Springs Pool",
    "type": "park",
    "location": {
      "lat": 30.2642,
      "lng": -97.7711,
      "city": "Austin",
      "country": "United States"
    },
    "shortDescription": "A natural spring-fed pool in the heart of Austin, where 68-degree water, limestone banks, and city life create a unique urban oasis.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "new-orleans-french-quarter",
    "name": "French Quarter",
    "type": "other",
    "location": {
      "lat": 29.9584,
      "lng": -90.0644,
      "city": "New Orleans",
      "country": "United States"
    },
    "shortDescription": "New Orleans' historic heart, where Creole architecture, jazz music, and vibrant street life create America's most unique neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "calgary-banff",
    "name": "Banff National Park",
    "type": "park",
    "location": {
      "lat": 51.1784,
      "lng": -115.5708,
      "city": "Banff",
      "country": "Canada"
    },
    "shortDescription": "Canada's first national park, where turquoise lakes, snow-capped peaks, and pristine wilderness create the Canadian Rockies' crown jewel.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "merida-centro-historico",
    "name": "Mérida Historic Center",
    "type": "monument",
    "location": {
      "lat": 20.9674,
      "lng": -89.5926,
      "city": "Mérida",
      "country": "Mexico"
    },
    "shortDescription": "Yucatán's white city, where colonial architecture, Mayan culture, and vibrant plazas create Mexico's safest and most charming capital.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cozumel-reef",
    "name": "Cozumel Reef",
    "type": "beach",
    "location": {
      "lat": 20.5083,
      "lng": -86.9458,
      "city": "Cozumel",
      "country": "Mexico"
    },
    "shortDescription": "The world's second-largest barrier reef, where crystal-clear waters, vibrant marine life, and diving adventures await in the Caribbean.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-juan-old-san-juan",
    "name": "Old San Juan",
    "type": "monument",
    "location": {
      "lat": 18.4655,
      "lng": -66.1057,
      "city": "San Juan",
      "country": "Puerto Rico"
    },
    "shortDescription": "A 500-year-old walled city, where colorful Spanish colonial buildings, cobblestone streets, and Caribbean charm create a UNESCO World Heritage gem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "bogota-monserrate",
    "name": "Monserrate",
    "type": "viewpoint",
    "location": {
      "lat": 4.6097,
      "lng": -74.0558,
      "city": "Bogotá",
      "country": "Colombia"
    },
    "shortDescription": "A mountain sanctuary overlooking Bogotá, where a white church, cable car ride, and panoramic city views create a spiritual and scenic escape.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "cusco-sacred-valley",
    "name": "Sacred Valley",
    "type": "viewpoint",
    "location": {
      "lat": -13.3333,
      "lng": -72.0833,
      "city": "Cusco",
      "country": "Peru"
    },
    "shortDescription": "The Incas' agricultural heartland, where terraced mountains, ancient ruins, and Andean villages create a journey through Peru's living history.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "iguazu-falls",
    "name": "Iguazú Falls",
    "type": "viewpoint",
    "location": {
      "lat": -25.6953,
      "lng": -54.4367,
      "city": "Puerto Iguazú",
      "country": "Argentina"
    },
    "shortDescription": "One of the world's most spectacular waterfalls, where 275 cascades, misty rainforest, and thundering water create a natural wonder.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "patagonia-torres-del-paine",
    "name": "Torres del Paine",
    "type": "park",
    "location": {
      "lat": -50.9423,
      "lng": -73.4068,
      "city": "Torres del Paine",
      "country": "Chile"
    },
    "shortDescription": "Patagonia's crown jewel, where granite towers, turquoise lakes, and pristine wilderness create one of the world's most stunning national parks.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "amsterdam-vondelpark",
    "name": "Vondelpark",
    "type": "park",
    "location": {
      "lat": 52.3579,
      "lng": 4.8686,
      "city": "Amsterdam",
      "country": "Netherlands"
    },
    "shortDescription": "Amsterdam's largest park, where ponds, open meadows, and cultural events create a peaceful escape in the city center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "paris-notre-dame",
    "name": "Notre-Dame Cathedral",
    "type": "monument",
    "location": {
      "lat": 48.853,
      "lng": 2.3499,
      "city": "Paris",
      "country": "France"
    },
    "shortDescription": "A Gothic masterpiece on the Île de la Cité, where flying buttresses, rose windows, and centuries of history create Paris's spiritual heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "seville-alcazar",
    "name": "Alcázar of Seville",
    "type": "monument",
    "location": {
      "lat": 37.3839,
      "lng": -5.9912,
      "city": "Seville",
      "country": "Spain"
    },
    "shortDescription": "A royal palace where Mudejar architecture, intricate tilework, and lush gardens create one of Spain's most stunning monuments.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "las-vegas-strip",
    "name": "Las Vegas Strip",
    "type": "other",
    "location": {
      "lat": 36.1147,
      "lng": -115.1728,
      "city": "Las Vegas",
      "country": "United States"
    },
    "shortDescription": "The world's most famous boulevard, where neon lights, themed resorts, and 24-hour energy create an unforgettable spectacle.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "denver-red-rocks",
    "name": "Red Rocks Amphitheatre",
    "type": "viewpoint",
    "location": {
      "lat": 39.6655,
      "lng": -105.2056,
      "city": "Denver",
      "country": "United States"
    },
    "shortDescription": "A natural amphitheater carved from red sandstone, where music, geology, and mountain views create one of the world's most unique venues.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "quebec-old-town",
    "name": "Old Quebec",
    "type": "monument",
    "location": {
      "lat": 46.8139,
      "lng": -71.208,
      "city": "Quebec City",
      "country": "Canada"
    },
    "shortDescription": "North America's only walled city, where cobblestone streets, French architecture, and European charm create a UNESCO World Heritage treasure.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "guanajuato-centro",
    "name": "Guanajuato Historic Center",
    "type": "monument",
    "location": {
      "lat": 21.019,
      "lng": -101.2574,
      "city": "Guanajuato",
      "country": "Mexico"
    },
    "shortDescription": "A colorful colonial city built in a ravine, where underground tunnels, steep alleys, and baroque architecture create Mexico's most unique UNESCO site.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "san-cristobal-chiapas",
    "name": "San Cristóbal de las Casas",
    "type": "other",
    "location": {
      "lat": 16.737,
      "lng": -92.6376,
      "city": "San Cristóbal de las Casas",
      "country": "Mexico"
    },
    "shortDescription": "A highland colonial town, where indigenous culture, colorful markets, and mountain air create Chiapas's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "lake-atitlan",
    "name": "Lake Atitlán",
    "type": "viewpoint",
    "location": {
      "lat": 14.6906,
      "lng": -91.2025,
      "city": "Panajachel",
      "country": "Guatemala"
    },
    "shortDescription": "A volcanic lake surrounded by three volcanoes, where Mayan villages, clear waters, and mountain vistas create Central America's most beautiful setting.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "monteverde-cloud-forest",
    "name": "Monteverde Cloud Forest",
    "type": "park",
    "location": {
      "lat": 10.3,
      "lng": -84.8167,
      "city": "Monteverde",
      "country": "Costa Rica"
    },
    "shortDescription": "A misty cloud forest reserve, where hanging bridges, rare wildlife, and pristine nature create Costa Rica's most biodiverse ecosystem.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "salvador-pelourinho",
    "name": "Pelourinho",
    "type": "monument",
    "location": {
      "lat": -12.9714,
      "lng": -38.5014,
      "city": "Salvador",
      "country": "Brazil"
    },
    "shortDescription": "Salvador's historic center, where colorful colonial buildings, Afro-Brazilian culture, and capoeira create Brazil's most vibrant neighborhood.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "salar-de-uyuni",
    "name": "Salar de Uyuni",
    "type": "viewpoint",
    "location": {
      "lat": -20.1338,
      "lng": -67.4891,
      "city": "Uyuni",
      "country": "Bolivia"
    },
    "shortDescription": "The world's largest salt flat, where endless white horizons, mirror-like reflections, and otherworldly landscapes create a surreal experience.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "brussels-grand-place",
    "name": "Grand Place",
    "type": "monument",
    "location": {
      "lat": 50.8466,
      "lng": 4.3528,
      "city": "Brussels",
      "country": "Belgium"
    },
    "shortDescription": "Brussels' magnificent central square, where Gothic and Baroque architecture create one of Europe's most beautiful plazas.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "zurich-lake",
    "name": "Lake Zurich",
    "type": "viewpoint",
    "location": {
      "lat": 47.3769,
      "lng": 8.5417,
      "city": "Zurich",
      "country": "Switzerland"
    },
    "shortDescription": "Zurich's pristine lake, where crystal-clear waters, mountain views, and waterfront promenades create Switzerland's urban oasis.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "nashville-grand-ole-opry",
    "name": "Grand Ole Opry",
    "type": "other",
    "location": {
      "lat": 36.2081,
      "lng": -86.7822,
      "city": "Nashville",
      "country": "United States"
    },
    "shortDescription": "The home of country music, where legendary performances, musical history, and Southern hospitality create Nashville's cultural heart.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "philadelphia-independence-hall",
    "name": "Independence Hall",
    "type": "monument",
    "location": {
      "lat": 39.9489,
      "lng": -75.15,
      "city": "Philadelphia",
      "country": "United States"
    },
    "shortDescription": "Where the Declaration of Independence and Constitution were signed, creating the birthplace of American democracy.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "ottawa-parliament",
    "name": "Parliament Hill",
    "type": "monument",
    "location": {
      "lat": 45.4247,
      "lng": -75.695,
      "city": "Ottawa",
      "country": "Canada"
    },
    "shortDescription": "Canada's seat of government, where Gothic Revival architecture, the Peace Tower, and national ceremonies create Ottawa's iconic landmark.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "puebla-centro-historico",
    "name": "Puebla Historic Center",
    "type": "monument",
    "location": {
      "lat": 19.0414,
      "lng": -98.2063,
      "city": "Puebla",
      "country": "Mexico"
    },
    "shortDescription": "A UNESCO World Heritage city, where Talavera tiles, baroque churches, and colonial architecture create Mexico's most colorful historic center.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "belize-barrier-reef",
    "name": "Belize Barrier Reef",
    "type": "beach",
    "location": {
      "lat": 17.1899,
      "lng": -87.9719,
      "city": "Belize City",
      "country": "Belize"
    },
    "shortDescription": "The largest barrier reef in the Northern Hemisphere, where crystal waters, marine biodiversity, and diving adventures await.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "tikal-national-park",
    "name": "Tikal National Park",
    "type": "monument",
    "location": {
      "lat": 17.222,
      "lng": -89.6237,
      "city": "Tikal",
      "country": "Guatemala"
    },
    "shortDescription": "One of the largest Mayan archaeological sites, where ancient pyramids rise from the jungle canopy in Guatemala's Petén region.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "galapagos-islands",
    "name": "Galápagos Islands",
    "type": "park",
    "location": {
      "lat": -0.7893,
      "lng": -91.0544,
      "city": "Puerto Ayora",
      "country": "Ecuador"
    },
    "shortDescription": "Darwin's living laboratory, where unique wildlife, volcanic landscapes, and pristine nature create one of the world's most extraordinary destinations.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  },
  {
    "id": "ushuaia-end-of-world",
    "name": "Ushuaia - End of the World",
    "type": "viewpoint",
    "location": {
      "lat": -54.8019,
      "lng": -68.303,
      "city": "Ushuaia",
      "country": "Argentina"
    },
    "shortDescription": "The world's southernmost city, where mountains, glaciers, and the Beagle Channel mark the gateway to Antarctica.",
    "hasGeneratedContent": false,
    "createdAt": "2025-01-20T00:00:00.000Z",
    "updatedAt": "2025-01-20T00:00:00.000Z"
  }
]'::jsonb -- reemplaza con seedSpots.v1.2.json (JSON array completo)
);

-- 1) Validacion rapida
with seed_items as (
  select jsonb_array_elements((select data from seed_payload)) as item
),
normalized as (
  select
    item->>'id' as id,
    item->>'name' as name,
    item->>'type' as type,
    (item->'location'->>'lat')::double precision as lat,
    (item->'location'->>'lng')::double precision as lng,
    item->'location'->>'city' as city,
    item->'location'->>'country' as country,
    item->>'shortDescription' as short_description,
    coalesce((item->>'hasGeneratedContent')::boolean, false) as has_generated_content,
    (item->>'createdAt')::timestamptz as created_at,
    (item->>'updatedAt')::timestamptz as updated_at,
    item as raw_payload
  from seed_items
),
validation as (
  select
    *,
    (id is null or id = '') as missing_id,
    (name is null or name = '') as missing_name,
    (type is null or type = '') as missing_type,
    (lat is null or lng is null) as missing_coords,
    (lat is not null and (lat < -90 or lat > 90)) as invalid_lat,
    (lng is not null and (lng < -180 or lng > 180)) as invalid_lng,
    (type is not null and type not in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other')) as invalid_type
  from normalized
)
select
  count(*) as total,
  count(*) filter (where missing_id) as missing_id,
  count(*) filter (where missing_name) as missing_name,
  count(*) filter (where missing_type) as missing_type,
  count(*) filter (where missing_coords) as missing_coords,
  count(*) filter (where invalid_lat) as invalid_lat,
  count(*) filter (where invalid_lng) as invalid_lng,
  count(*) filter (where invalid_type) as invalid_type
from validation;

-- 2) Insertar spots (solo validos)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
seed_items as (
  select jsonb_array_elements((select data from seed_payload)) as item
),
normalized as (
  select
    item->>'id' as id,
    item->>'name' as name,
    item->>'type' as type,
    (item->'location'->>'lat')::double precision as lat,
    (item->'location'->>'lng')::double precision as lng,
    item->'location'->>'city' as city,
    item->'location'->>'country' as country,
    item->>'shortDescription' as short_description,
    coalesce((item->>'hasGeneratedContent')::boolean, false) as has_generated_content,
    (item->>'createdAt')::timestamptz as created_at,
    (item->>'updatedAt')::timestamptz as updated_at,
    item as raw_payload
  from seed_items
),
valid as (
  select * from normalized
  where
    id is not null and id <> '' and
    name is not null and name <> '' and
    type is not null and type <> '' and
    lat is not null and lng is not null and
    lat between -90 and 90 and
    lng between -180 and 180 and
    type in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other')
)
insert into spots (
  id, name, type, location_lat, location_lng, location_city, location_country,
  short_description, has_generated_content, needs_review, source, created_at, updated_at,
  migration_batch_id
)
select
  id, name, type, lat, lng, city, country,
  short_description, has_generated_content, false, 'seed',
  coalesce(created_at, now()), coalesce(updated_at, now()),
  params.migration_batch_id
from valid, params
on conflict (id) do nothing;

-- 3) Crear SpotContribution tipo create
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
new_spots as (
  select s.id
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
)
insert into spot_contributions (
  spot_id, author_id, type, payload, status, created_at, applied_at, applied_by, migration_batch_id
)
select
  ns.id,
  null,
  'create',
  jsonb_build_object('spot_id', ns.id),
  'applied',
  now(),
  now(),
  null,
  params.migration_batch_id
from new_spots ns, params
where not exists (
  select 1 from spot_contributions sc
  where sc.spot_id = ns.id and sc.type = 'create'
);

-- 4) Crear SpotVersion v1 por spot
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
spot_base as (
  select s.*
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
),
contribs as (
  select sc.id as contribution_id, sc.spot_id
  from spot_contributions sc, params
  where sc.migration_batch_id = params.migration_batch_id
)
insert into spot_versions (
  spot_id, contribution_id, version, snapshot, created_at, created_by, migration_batch_id
)
select
  sb.id as spot_id,
  c.contribution_id,
  1 as version,
  jsonb_build_object(
    'id', sb.id,
    'name', sb.name,
    'type', sb.type,
    'location', jsonb_build_object('lat', sb.location_lat, 'lng', sb.location_lng, 'city', sb.location_city, 'country', sb.location_country),
    'shortDescription', sb.short_description,
    'hasGeneratedContent', sb.has_generated_content,
    'needsReview', sb.needs_review
  ) as snapshot,
  now(),
  null,
  params.migration_batch_id
from spot_base sb
left join contribs c on c.spot_id = sb.id
, params
where not exists (
  select 1 from spot_versions sv where sv.spot_id = sb.id and sv.version = 1
);
