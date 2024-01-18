<script>
    import { onMount } from 'svelte';
    import { getVehicleSuggestions } from './CarListe';
  import Map from './Map.svelte';
  import Car from './carList.svelte';
  import { writable } from 'svelte/store';
  import { vehicles } from './store';
  export let ready = true; // Ensure this is set to true when the map should be displayed





  const vehicleSearch = writable('');
  const suggestions = writable([]);
  const selectedVehicle = writable(null);

  async function updateSuggestions(value) {
    vehicleSearch.set(value);
    const results = await getVehicleSuggestions({ page: 1, size: 10, search: value });
    suggestions.set(results);
  }

  function selectVehicle(vehicle) {
    vehicleSearch.set(vehicle.naming.make + ' ' + vehicle.naming.model + ' ' +   vehicle.naming.chargetrip_version);
    selectedVehicle.set(vehicle);
    suggestions.set([]); // Fermer les suggestions
  }



  let tempsDeTrajet;




</script>
<svelte:head>
	<script defer async
	src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkmNJfC0T5rHryGBtpbNFGCxalxK9OAC0&callback=initMap">
	</script>
</svelte:head>

<div class="container">
  <div class="left-panel">
    <input type="text" bind:value="{$vehicleSearch}" placeholder="Véhicule" on:input="{e => updateSuggestions(e.target.value)}">
    
    {#if $vehicleSearch && $suggestions.length > 0}
      <ul class="vehicle-dropdown">
        {#each $suggestions as vehicle}
          <li on:click={() => selectVehicle(vehicle)}>
            {vehicle.naming.make} {vehicle.naming.model} {vehicle.naming.chargetrip_version} <img src={vehicle.media.image.thumbnail_url}/>
          </li>
        {/each}
      </ul>
    {/if}
    <input type="text" placeholder="Ville de départ">
    <input type="text" placeholder="Ville d'arrivée">
    <div class="temps-de-trajet">Temps de trajet: {tempsDeTrajet}</div>
  </div>
  <div class="right-panel">
    { #if ready }
      <Map></Map>
    { /if }
  </div>
</div>

<style>
  :global(body) {
    padding: 0;
    margin: 0;
    font-family: sans-serif;
  }

  #ScrollPic{
    width: 100px; 
  }
  
  .container {
    display: flex;
    height: 100vh;
  }

  .left-panel {
    position: relative;
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .right-panel {
    flex: 2;
    overflow: hidden; /* Add this to ensure the map is contained within the panel */
  }

  input {
    margin-bottom: 10px;
    padding: 8px;
    width: 260px;
  }

  .temps-de-trajet {
    margin-top: 20px;
  }

  .vehicle-dropdown {
    list-style: none;
    padding-left: 0px;
    position: absolute; /* Modifiez le positionnement ici */
  top: 38%; /* La positionne juste en dessous du champ de saisie */
  left: 1;
  width: 280px; /* Ajustez la largeur si nécessaire */
  max-height: 200px;
  overflow-y: scroll;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  }

  .vehicle-dropdown li {
    padding: 10px;
    cursor: pointer;
  }

  .vehicle-dropdown li:hover {
    background-color: #f0f0f0;
  }
</style>
