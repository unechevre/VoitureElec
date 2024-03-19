import { client } from "./lib/Env";
import { app } from "./lib/Env";
export const getVehicleSuggestions = async ({ page, size = 10, search = '' }) => {
  const headers = {
    'Content-Type': 'application/json',
    "x-client-id": client, // Utilisez votre propre x-client-id
    "x-app-id": app,  
  };

  const vehicleListQuery = {
    query: `
      query vehicleList($page: Int, $size: Int, $search: String) {
        vehicleList(page: $page, size: $size, search: $search) {
          id
          naming {
            make
            model
            chargetrip_version
          }
          media {
            image {
              thumbnail_url
            }
          }
        }
      }
    `,
    variables: { page, size, search }
  };

  try {
    const response = await fetch('https://api.chargetrip.io/graphql', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(vehicleListQuery),
    });
    const data = await response.json();
    return data.data?.vehicleList || [];
  } catch (error) {
    console.error('Erreur lors de la requête à Chargetrip:', error);
    return [];
  }
};

