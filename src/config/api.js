const DEFAULT_LOCAL_API = 'http://localhost:5004/api';

const DEFAULT_PROD_API = 'https://uttarsiri.com/api';



const envBaseUrl =

  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||

  process.env.REACT_APP_API_BASE_URL;



function isLocalHost() {

  if (typeof window === 'undefined') return false;

  const host = window.location.hostname;

  return host === 'localhost' || host === '127.0.0.1';

}



/**

 * Single source of truth for backend API base URL.

 */

export const API_BASE_URL =

  envBaseUrl ||

  (isLocalHost() ? DEFAULT_LOCAL_API : DEFAULT_PROD_API);



export const APP_NAME =

  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_NAME) ||

  process.env.REACT_APP_APP_NAME ||

  'Uttar Siri Vendor';



export const APP_ENV =

  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ENV) ||

  process.env.REACT_APP_APP_ENV ||

  process.env.NODE_ENV ||

  'development';



/** API host without `/api` suffix — used for `/public/uploads/...` media. */

export function getApiOrigin() {

  const base = API_BASE_URL.replace(/\/$/, '');

  if (base.startsWith('http://') || base.startsWith('https://')) {

    return base.replace(/\/api$/, '');

  }

  if (typeof window !== 'undefined') {

    return window.location.origin;

  }

  return '';

}



function normalizeMediaPath(path) {

  if (!path) return '';



  const trimmed = String(path).trim().replace(/\\/g, '/');

  if (!trimmed) return '';



  if (

    trimmed.startsWith('http://') ||

    trimmed.startsWith('https://') ||

    trimmed.startsWith('data:') ||

    trimmed.startsWith('blob:')

  ) {

    return trimmed;

  }



  let normalized = trimmed;

  if (!normalized.startsWith('/')) {

    if (normalized.startsWith('public/')) normalized = `/${normalized}`;

    else if (normalized.startsWith('uploads/')) normalized = `/public/${normalized}`;

    else normalized = `/${normalized}`;

  }



  if (normalized.startsWith('/uploads/')) {

    normalized = `/public${normalized}`;

  }



  return normalized;

}



/**

 * Resolve media/logo paths for <img src>.

 * Supports absolute URLs, backend `/public/...`, and frontend public assets.

 */

export function getMediaUrl(path, fallback = '') {

  const value = normalizeMediaPath(path || fallback);

  if (!value) return '';



  if (

    value.startsWith('http://') ||

    value.startsWith('https://') ||

    value.startsWith('data:') ||

    value.startsWith('blob:')

  ) {

    return value;

  }



  if (value.startsWith('/public/')) {

    if (typeof window !== 'undefined') {

      const apiOrigin = getApiOrigin();



      // Dev dashboard (5014) + API (5015): use same-origin path via Vite proxy.

      // Direct http://localhost:5015 URLs are blocked by Helmet CORP in the browser.

      if (import.meta.env?.DEV) {

        return value;

      }



      // Production behind the same reverse proxy as the API.

      if (apiOrigin === window.location.origin) {

        return value;

      }

    }



    return `${getApiOrigin()}${value}`;

  }



  return value;

}



/** Build a full API URL from a path, e.g. buildApiUrl('/users') */

export function buildApiUrl(path) {

  const base = API_BASE_URL.replace(/\/$/, '');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;

}


