<script>
    import { onMount } from 'svelte';
  
    let stations = [];
  
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': '659fea30cff0bbbdf2fe22b5',
      'x-app-id': '659fea30cff0bbbdf2fe22b7',
    };
  
    async function getChargingStations({ page, size = 10 }) {
      const stationListQuery = {
        query: `
          query {
            stationList(size: ${size}, page: ${page}) {
              id
              name
              address
              coordinates {
                latitude
                longitude
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
          body: JSON.stringify(stationListQuery),
        });
        const data = await response.json();
        stations = data.data?.stationList || [];
      } catch (error) {
        console.error('Erreur lors de la requête à Chargetrip:', error);
      }
    }
  
    onMount(() => {
      getChargingStations({ page: 1, size: 2 });
    });
  </script>
  
  {#if stations.length > 0}
    <ul>
      {#each stations as station}
        <li>{station.name} - {station.address} (Latitude: {station.coordinates.latitude}, Longitude: {station.coordinates.longitude})</li>
      {/each}
    </ul>
  {:else}
    <p>Aucune station de recharge trouvée.</p>
  {/if}
  
  






<!-- <script>
    import { onMount } from 'svelte';
    
    const headers = {
        'Content-Type': 'application/json',
        'x-client-id': '659fea30cff0bbbdf2fe22b5',
        'x-app-id': '659fea30cff0bbbdf2fe22b7',
    };

    const getChargingStations = ({ page, size = 10, search = '' }) => {
        const stationListQuery = {
            query: `
                query {
                    stationList(size: ${size}, page: ${page}) {
                        id
                        name
                        address
                        coordinates {
                            latitude
                            longitude
                        }
                    }
                }
            `,
            variables: {}
        };

        fetch('https://api.chargetrip.io/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(stationListQuery),
        })
        .then(response => response.json())
        .then(data => {
            displayChargingStations(data.data?.stationList);
        })
        .catch(error => console.error('Erreur lors de la requête à Chargetrip:', error));
    };

    function displayChargingStations(stations) {
            const chargingStationsDiv = document.getElementById('charging-stations');

            if (stations && stations.length > 0) {
                const stationsList = '<ul>' +
                    stations.map(station => {
                        const { id, name, address, coordinates } = station;
                        return `<li>${name} - ${address} (Latitude: ${coordinates.latitude}, Longitude: ${coordinates.longitude})</li>`;
                    }).join('') +
                '</ul>';

                chargingStationsDiv.innerHTML = stationsList;
            } else {
                chargingStationsDiv.innerHTML = '<p>Aucune station de recharge trouvée.</p>';
            }
        }

        // Exemple d'utilisation
        onMount(() => {
    getChargingStations({ page: 1, size: 10 });
  });
    </script>

<div id="charging-stations"></div> -->