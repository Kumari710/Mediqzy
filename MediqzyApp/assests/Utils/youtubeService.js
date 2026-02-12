/**
 * YouTube Health Education Service
 * 
 * Fetches curated health and wellness content from YouTube.
 */

import { GOOGLE_CONFIG } from './apiConfig';

/**
 * Search for health-related videos
 * @param {string} query - Search term (e.g., 'daily yoga', 'heart healthy diet')
 * @returns {Promise<Array>} List of videos
 */
export const searchHealthVideos = async (query = 'health tips') => {
    try {
        if (GOOGLE_CONFIG.YOUTUBE_API_KEY === 'your-youtube-data-api-key') {
            console.warn('YouTube API Key not configured');
            // Return dummy data for UI testing if key is missing
            return [
                { id: '1', title: 'Daily Yoga for Beginners', thumbnail: 'https://i.ytimg.com/vi/v7AYKMP6rOE/hqdefault.jpg', videoId: 'v7AYKMP6rOE' },
                { id: '2', title: 'Top 10 Health Tips', thumbnail: 'https://i.ytimg.com/vi/Cg_GW7yHQ20/hqdefault.jpg', videoId: 'Cg_GW7yHQ20' },
            ];
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${GOOGLE_CONFIG.YOUTUBE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            return data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                videoId: item.id.videoId,
                publishedAt: item.snippet.publishedAt,
            }));
        }

        return [];
    } catch (error) {
        console.error('YouTube Search Error:', error);
        return [];
    }
};

export default {
    searchHealthVideos,
};
