import { useEffect } from 'react';

const MAP_CSS = `
.leaflet-pane { z-index: 1 !important; }
.leaflet-top, .leaflet-bottom { z-index: 1 !important; }
.leaflet-overlay-pane { z-index: 2 !important; }
.leaflet-marker-pane { z-index: 3 !important; }
.leaflet-tooltip-pane { z-index: 4 !important; }
.leaflet-popup-pane { z-index: 5 !important; }
.leaflet-control { z-index: 6 !important; }
`;

export default function useInjectMapStyles() {
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(MAP_CSS));
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}