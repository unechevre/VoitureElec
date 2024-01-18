export const getVehicleSuggestions = async ({ page, size = 10, search = '' }) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': '659fea30cff0bbbdf2fe22b5',
    'x-app-id': '659fea30cff0bbbdf2fe22b7',
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



/*

export async function getVehicleList({ page, size = 30, search }) {
    const vehicleListQuery = {
        query: `
          query {
            vehicleList(size: ${size}, page: ${page}), search: ${search} {
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
        variables: {}
      };
  
      try {
        const response = await fetch('https://api.chargetrip.io/graphql', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(vehicleListQuery),
        });
        const data = await response.json();
        vehicles.set(data.data?.vehicleList || []);
        console.log("hehooo");
      } catch (error) {
        console.error('Erreur lors de la requête à Chargetrip:', error);
      }
    }

*/