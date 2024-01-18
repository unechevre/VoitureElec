<script>
  import { onMount } from 'svelte';
  import { vehicles } from './store';


  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': '659fea30cff0bbbdf2fe22b5',
    'x-app-id': '659fea30cff0bbbdf2fe22b7',
  };

  async function getVehicleList({ page, size = 30 }) {
    const vehicleListQuery = {
      query: `
        query {
          vehicleList(size: ${size}, page: ${page}) {
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
    } catch (error) {
      console.error('Erreur lors de la requête à Chargetrip:', error);
    }
  }

  onMount(() => {
    console.log("coucou");
    getVehicleList({ page: 1, size: 30 });
  });
</script>

<!-- {#if $vehicles.length > 0}
  <ul>
    {#each $vehicles as vehicle}
      <li>
        {vehicle.naming.make} {vehicle.naming.model} - Version: {vehicle.naming.chargetrip_version}
        {#if vehicle.media.image}
          <img src={vehicle.media.image.thumbnail_url} alt={`${vehicle.naming.make} ${vehicle.naming.model}`} />
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p>Aucun véhicule trouvé.</p>
{/if} -->
