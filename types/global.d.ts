/// <reference types="expo/types" />

// Excluir tipos de Node.js para evitar conflictos en proyectos React Native/Expo
// Los tipos de Node.js no son necesarios en proyectos móviles

// Mapbox Search Box types (web-only)
declare global {
  interface Window {
    mapboxsearch?: {
      MapboxSearchBox: new (options?: {
        accessToken?: string;
        options?: {
          proximity?: [number, number];
          country?: string;
          language?: string;
        };
      }) => {
        accessToken: string;
        options?: {
          proximity?: [number, number];
          country?: string;
          language?: string;
        };
      };
    };
  }
}

// Custom element types for Mapbox Search Box
declare namespace JSX {
  interface IntrinsicElements {
    'mapbox-search-box': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'access-token'?: string;
        'options'?: string;
      },
      HTMLElement
    >;
  }
}

