/**
 * Google Maps & Places Service
 * 
 * Handles searching for nearby hospitals, pharmacies, and healthcare facilities.
 */

import { GOOGLE_CONFIG } from './apiConfig';

/**
 * Search for nearby healthcare facilities
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} type - 'hospital', 'pharmacy', 'doctor'
 * @returns {Promise<Array>} List of facilities
 */
export const searchNearbyHealthcare = async (latitude, longitude, type = 'hospital') => {
    try {
        if (GOOGLE_CONFIG.MAPS_API_KEY === 'your-google-maps-api-key') {
            console.warn('Google Maps API Key not configured');
            return [];
        }

        const radius = 5000; // 5km
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_CONFIG.MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            return data.results.map(place => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                location: place.geometry.location,
                openNow: place.opening_hours?.open_now,
            }));
        }

        return [];
    } catch (error) {
        console.error('Maps Search Error:', error);
        return [];
    }
};

/**
 * Get details for a specific place
 * @param {string} placeId 
 */
export const getPlaceDetails = async (placeId) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,reviews&key=${GOOGLE_CONFIG.MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Place Details Error:', error);
        return null;
    }
};

export default {
    searchNearbyHealthcare,
    getPlaceDetails,
};
