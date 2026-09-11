declare global {
  interface Window { L?: any }
}

let pending: Promise<any> | null = null;

/**
 * Charge Leaflet (CSS + JS depuis le CDN) à la demande, une seule fois.
 * Évite de charger ~150 kB de JS sur toutes les pages qui n'ont pas de carte.
 */
export function loadLeaflet(): Promise<any> {
  if (window.L) return Promise.resolve(window.L);
  pending ??= new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => { pending = null; reject(new Error('Leaflet indisponible')); };
    document.head.appendChild(script);
  });
  return pending;
}
