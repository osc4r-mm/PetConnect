import axios from 'axios';

const GEOAPIFY_API_KEY = 'TU_API_KEY_AQUI';

export const searchCities = async (query) => {
  if (!query) return [];

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&type=city&lang=es&apiKey=${GEOAPIFY_API_KEY}`;

  const response = await axios.get(url);
  return response.data.features.map(feature => ({
    name: feature.properties.city || feature.properties.name,
    country: feature.properties.country,
    lat: feature.properties.lat,
    lon: feature.properties.lon,
  }));
};
