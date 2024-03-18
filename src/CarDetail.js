import { client } from "./lib/Env";
import { app } from "./lib/Env";
export const getVehicleDetails = async (vehicleId) => {
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": client, // Utilisez votre propre x-client-id
    "x-app-id": app, // Utilisez votre propre x-app-id
  };
console.log("client " + client);
  const vehicleDetailsQuery = {
    query: `
        query vehicle($vehicleId: ID!) {
          vehicle(id: $vehicleId) {
            naming {
              make
              model
              chargetrip_version
            }
            media {
              image {
                url
              }
              brand {
                thumbnail_url
              }
            }
            battery {
              usable_kwh
            }
            range {
              best {
                highway
                city
                combined
              }
              worst {
                highway
                city
                combined
              }
              chargetrip_range {
                best
                worst
              }
            }
            routing {
              fast_charging_support
            }
            connectors {
              standard
            }
            performance {
              acceleration
              top_speed
            }
          }
        }
      `,
    variables: { vehicleId },
  };

  try {
    const response = await fetch("https://api.chargetrip.io/graphql", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(vehicleDetailsQuery),
    });
    const data = await response.json();
    return data.data?.vehicle || null;
  } catch (error) {
    console.error(
      "Erreur lors de la requête à Chargetrip pour les détails du véhicule:",
      error
    );
    return null;
  }
};
