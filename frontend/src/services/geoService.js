import axios from 'axios';

GEOAPIFY_API_KEY = process.env.REAT_APP_GEOAPIFY_API_KEY;

// buscar ciudades por nombre (autocompletar)
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