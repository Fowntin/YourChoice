/**
 * Ghana Validation & Localization Utility
 * Handles National Communications Authority (NCA) Ghana phone numbers,
 * Mobile Money (MoMo) network detection, and GhanaPost GPS digital addresses.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GhanaValidation = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Ghana's 16 official administrative regions
  const GHANA_REGIONS = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Volta',
    'Northern',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
    'Oti',
    'Savannah',
    'North East',
    'Western North'
  ];

  // NCA Ghana telecom network prefix mappings
  const NETWORK_PREFIXES = {
    MTN: ['024', '054', '055', '059', '025', '053'],
    Telecel: ['020', '050'], // formerly Vodafone Ghana
    AT: ['026', '027', '056', '057'] // formerly AirtelTigo
  };

  /**
   * Normalizes a phone string into a clean numeric string with leading zero
   * or international + prefix.
   */
  function normalizePhoneInput(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '');
    
    // Replace leading 00233 or 233 with +233
    if (cleaned.startsWith('00233')) {
      cleaned = '+233' + cleaned.substring(5);
    } else if (cleaned.startsWith('233') && !cleaned.startsWith('+')) {
      cleaned = '+233' + cleaned.substring(3);
    }
    return cleaned;
  }

  /**
   * Identifies Ghana telecom network from local 3-digit prefix (e.g. '024').
   */
  function getNetworkFromPrefix(prefix3) {
    for (const [network, prefixes] of Object.entries(NETWORK_PREFIXES)) {
      if (prefixes.includes(prefix3)) {
        return network;
      }
    }
    return null;
  }

  /**
   * Validates and parses a phone number for the Ghanaian market.
   * Supports local 10-digit format (024XXXXXXX) and international format (+23324XXXXXXX),
   * plus standard international formats for diaspora gift buyers.
   */
  function parseGhanaPhone(input) {
    const cleaned = normalizePhoneInput(input);
    if (!cleaned) {
      return {
        isValid: false,
        isGhana: false,
        network: null,
        formatted: '',
        error: 'Phone number is required.'
      };
    }

    // Check if it is a local 10-digit Ghana number (e.g. 0241234567)
    if (/^0[25]\d{8}$/.test(cleaned)) {
      const prefix = cleaned.substring(0, 3);
      const network = getNetworkFromPrefix(prefix);
      if (!network) {
        return {
          isValid: false,
          isGhana: true,
          network: null,
          formatted: cleaned,
          error: `Prefix '${prefix}' is not a recognized Ghana mobile network (MTN, Telecel, AT).`
        };
      }
      return {
        isValid: true,
        isGhana: true,
        network,
        localFormat: cleaned,
        internationalFormat: '+233' + cleaned.substring(1),
        formatted: `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`,
        error: null
      };
    }

    // Check if it is an international format Ghana number (+233241234567)
    if (/^\+233[25]\d{8}$/.test(cleaned)) {
      const localPrefix = '0' + cleaned.substring(4, 6);
      const network = getNetworkFromPrefix(localPrefix);
      if (!network) {
        return {
          isValid: false,
          isGhana: true,
          network: null,
          formatted: cleaned,
          error: `Prefix '${localPrefix}' is not a recognized Ghana mobile network (MTN, Telecel, AT).`
        };
      }
      const local10 = '0' + cleaned.substring(4);
      return {
        isValid: true,
        isGhana: true,
        network,
        localFormat: local10,
        internationalFormat: cleaned,
        formatted: `+233 ${cleaned.substring(4, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`,
        error: null
      };
    }

    // General international phone fallback (e.g. diaspora customer placing delivery for family in Ghana)
    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
      return {
        isValid: true,
        isGhana: false,
        network: 'International',
        localFormat: cleaned,
        internationalFormat: cleaned,
        formatted: cleaned,
        error: null
      };
    }

    // If it starts with 0 but has wrong digit count
    if (cleaned.startsWith('0')) {
      if (cleaned.length < 10) {
        return {
          isValid: false,
          isGhana: true,
          network: null,
          formatted: cleaned,
          error: `Ghanaian phone numbers must be 10 digits (currently ${cleaned.length} digits).`
        };
      }
      if (cleaned.length > 10) {
        return {
          isValid: false,
          isGhana: true,
          network: null,
          formatted: cleaned,
          error: `Ghanaian phone number is too long (${cleaned.length} digits). Expected 10 digits.`
        };
      }
      return {
        isValid: false,
        isGhana: true,
        network: null,
        formatted: cleaned,
        error: 'Ghana mobile numbers must begin with 02 or 05.'
      };
    }

    return {
      isValid: false,
      isGhana: false,
      network: null,
      formatted: cleaned,
      error: 'Please enter a valid Ghana phone number (e.g. 024 123 4567 or +233 24 123 4567).'
    };
  }

  /**
   * Validates GhanaPost GPS Digital Address.
   * Format: 2 uppercase letters, hyphen, 3 to 4 digits, hyphen, 4 digits (e.g. GA-183-9024 or AK-039-2311).
   * Optional field, but if provided, must strictly match standard GhanaPost format.
   */
  function validateGhanaPostGPS(input) {
    if (!input || typeof input !== 'string' || !input.trim()) {
      return { isValid: true, isEmpty: true, formatted: '', error: null };
    }
    const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
    const gpsRegex = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
    
    // Also support user typing without hyphens e.g. GA1839024 or GA0392311
    if (!gpsRegex.test(cleaned)) {
      const matchNoHyphen = cleaned.match(/^([A-Z]{2})(\d{3,4})(\d{4})$/);
      if (matchNoHyphen) {
        const formatted = `${matchNoHyphen[1]}-${matchNoHyphen[2]}-${matchNoHyphen[3]}`;
        return { isValid: true, isEmpty: false, formatted, error: null };
      }
      return {
        isValid: false,
        isEmpty: false,
        formatted: cleaned,
        error: 'GhanaPost GPS must follow the format XX-XXX-XXXX (e.g. GA-183-9024 or AK-039-2311).'
      };
    }

    return { isValid: true, isEmpty: false, formatted: cleaned, error: null };
  }

  /**
   * Validates structured delivery address for Ghanaian delivery dispatch.
   */
  function validateGhanaAddress(fields) {
    const { region, town, landmark, gps } = fields || {};
    const errors = {};

    if (!region || typeof region !== 'string' || !GHANA_REGIONS.includes(region.trim())) {
      errors.region = 'Please select a valid Ghana administrative region.';
    }

    if (!town || typeof town !== 'string' || town.trim().length < 2) {
      errors.town = 'Town, city, or suburb is required (e.g. East Legon, Kumasi Central).';
    } else if (town.trim().length > 80) {
      errors.town = 'Town or city name must be 80 characters or fewer.';
    }

    if (!landmark || typeof landmark !== 'string' || landmark.trim().length < 4) {
      errors.landmark = 'Street name and nearest landmark are required for delivery riders (e.g. Opposite Shell station).';
    } else if (landmark.trim().length > 180) {
      errors.landmark = 'Landmark description must be 180 characters or fewer.';
    }

    const gpsValidation = validateGhanaPostGPS(gps);
    if (!gpsValidation.isValid) {
      errors.gps = gpsValidation.error;
    }

    const isValid = Object.keys(errors).length === 0;
    const cleanRegion = (region || '').trim();
    const cleanTown = (town || '').trim();
    const cleanLandmark = (landmark || '').trim();
    const cleanGps = gpsValidation.formatted || '';

    // Create a consolidated address string for legacy and order receipt displays
    let formattedAddress = '';
    if (cleanTown && cleanLandmark && cleanRegion) {
      formattedAddress = `${cleanTown}, ${cleanLandmark}`;
      if (cleanGps) {
        formattedAddress += ` (GPS: ${cleanGps})`;
      }
      formattedAddress += `, ${cleanRegion}, Ghana`;
    }

    return {
      isValid,
      errors,
      values: {
        region: cleanRegion,
        town: cleanTown,
        landmark: cleanLandmark,
        gps: cleanGps,
        formattedAddress
      }
    };
  }

  return {
    GHANA_REGIONS,
    NETWORK_PREFIXES,
    normalizePhoneInput,
    parseGhanaPhone,
    validateGhanaPostGPS,
    validateGhanaAddress
  };
}));
