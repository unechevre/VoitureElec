<script>
  import { onMount } from "svelte";
  import { getVehicleSuggestions } from "./CarListe";
  import { getVehicleDetails } from "./CarDetail.js";
  import { getBornesDeRecharge } from "./borne.js";
  import { getItineraireGoogleMaps } from "./calculItineraire.js";
  import { calculateSum } from "./serviceSoap.js";
  import Map from "./Map.svelte";
  import { writable } from "svelte/store";

  let bornes = [];
  let adresseDepart = writable("");
  let adresseArrivee = writable("");
  let itineraire;
  let directionsRenderer;
  const vehicleSearch = writable("");
  const suggestions = writable([]);
  const selectedVehicle = writable(null);
  let vehicleDetails = writable({});
  let BorneAutonomie;
  let tempsRecharge = [];
  let tempsTrajetTotal;
  let restemps;
  let tempsDeTrajet;
  let formattedTime;

  let mapInstance; // Variable pour stocker l'instance de la carte Google Maps

  let distanceTotaleParcourue = 0; // Variable pour stocker la distance totale parcourue

  function convertHoursToHoursMinutes(value) {
    const hours = Math.floor(value); // Obtient la partie entière pour les heures
    const minutes = Math.round((value - hours) * 60); // Multiplie la partie décimale par 60 pour obtenir les minutes

    // Retourne la chaîne formatée
    return `${hours}h ${minutes}m`;
  }

  async function performCalculation(tempsRecharge) {
    const tempsTrajetTotal = await calculateSum(tempsRecharge);
    return tempsTrajetTotal;
  }
  async function calculer() {
    try {
      const tempsTrajetTotal = await performCalculation(tempsRecharge);
      restemps = tempsTrajetTotal.CalculateSumResult / 60;
      console.log("temps", tempsTrajetTotal);
    } catch (error) {
      console.error("Erreur lors du calcul:", error);
    }
  }

  async function updateSuggestions(value) {
    vehicleSearch.set(value);
    const results = await getVehicleSuggestions({
      page: 1,
      size: 10,
      search: value,
    });
    suggestions.set(results);
  }

  function selectVehicle(vehicle) {
    vehicleSearch.set(
      vehicle.naming.make +
        " " +
        vehicle.naming.model +
        " " +
        vehicle.naming.chargetrip_version
    );
    selectedVehicle.set(vehicle);
    suggestions.set([]); // Fermer les suggestions
    getVehicleDetailsAsync(vehicle.id);
  }

  async function getVehicleDetailsAsync(vehicleId) {
    const details = await getVehicleDetails(vehicleId);
    if (details) {
      vehicleDetails.set(details); // Mettre à jour le store avec les détails du véhicule
    } else {
      vehicleDetails.set({}); // Réinitialiser le store si aucun détail n'est trouvé
    }
  }

  function trouverPointDeRecharge(distanceCible) {
    let distanceCumulative = 0;
    let pointDeRecharge = null;

    itineraire.legs[0].steps.forEach((etape) => {
      const distanceEtape = etape.distance.value;
      distanceCumulative += distanceEtape;

      if (distanceCumulative >= distanceCible && pointDeRecharge === null) {
        pointDeRecharge = {
          lat: etape.end_location.lat(),
          lng: etape.end_location.lng(),
        };
      }
    });

    return pointDeRecharge;
  }

  async function getCoordBornesDeRecharge(
    latitude,
    longitude,
    distance,
    limit
  ) {
    return new Promise((resolve, reject) => {
      getBornesDeRecharge(latitude, longitude, distance, limit)
        .then((rendu) => {
          if (rendu.length > 0) {
            const coords = {
              lat: rendu[0].ylatitude,
              lng: rendu[0].xlongitude,
              Puissance: rendu[0].puiss_max,
            };
            resolve([coords]);
          } else {
            resolve([]);
          }
        })
        .catch((error) => reject(error));
    });
  }

  async function calculerItineraire() {
    let depart, arrivee;
    adresseDepart.subscribe((value) => {
      depart = value;
    })();
    adresseArrivee.subscribe((value) => {
      arrivee = value;
    })();

    try {
      itineraire = await getItineraireGoogleMaps(depart, arrivee);
      tempsDeTrajet = itineraire.legs[0].duration.value;

      if (itineraire && mapInstance) {
        const directionsService = new google.maps.DirectionsService();
        directionsRenderer.setDirections({ routes: [] });
        directionsRenderer.setMap(mapInstance);
        directionsRenderer.setDirections({ routes: [] });
        const request = {
          origin: depart,
          destination: arrivee,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        };

        directionsService.route(request, async function (result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            const segments = result.routes[0].legs;
            let distanceParcourue = 0;
            let waypoints = [];

            var currentVehicleDetails;
            vehicleDetails.subscribe((value) => {
              currentVehicleDetails = value;
            });
            var autonomie =
              ((currentVehicleDetails.range.chargetrip_range.best +
                currentVehicleDetails.range.chargetrip_range.worst) /
                2) *
              1000; // autonomie max + autonomie min / 2 * 1000 pour avoir la moyenne en metres
            var temp;
            for (let i = 0; i < segments[0].steps.length; i++) {
              distanceParcourue =
                distanceParcourue + segments[0].steps[i].distance.value;

              if (i >= segments[0].steps.length - 1) {
                temp = distanceParcourue + segments[0].steps[i].distance.value;
              } else {
                temp =
                  distanceParcourue + segments[0].steps[i + 1].distance.value;
              }

              if (temp >= autonomie * 0.8) {
                var tempautonomie = autonomie - distanceParcourue;
                tempautonomie =
                  (tempautonomie / autonomie) *
                  currentVehicleDetails.battery.usable_kwh;
                tempautonomie =
                  currentVehicleDetails.battery.usable_kwh - tempautonomie;
                const rendu = await getCoordBornesDeRecharge(
                  segments[0].steps[i].end_location.lat(),
                  segments[0].steps[i].end_location.lng(),
                  10000,
                  1
                );
                if (rendu.length > 0) {
                  tempsRecharge.push((tempautonomie / rendu[0].Puissance) * 60);
                  console.log(rendu[0].lat, rendu[0].lng);
                  waypoints.push({
                    location: { lat: rendu[0].lat, lng: rendu[0].lng },
                    stopover: true,
                  });
                  // Ajouter la distance parcourue à partir de ce point de recharge
                  distanceParcourue = 0;
                }
              }
            }
            tempsRecharge.push(tempsDeTrajet / 60);
            await calculer();
            formattedTime = convertHoursToHoursMinutes(restemps);
            tempsRecharge = [];
            if (waypoints.length > 0) {
              const requestWithWaypoints = { ...request, waypoints };
              directionsService.route(
                requestWithWaypoints,
                function (waypointResult, waypointStatus) {
                  if (waypointStatus === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(waypointResult);
                  } else {
                    console.error(
                      "Erreur lors du calcul de l'itinéraire incluant les bornes de recharge : " +
                        waypointStatus
                    );
                  }
                }
              );
            } else {
              // Aucune borne de recharge trouvée dans les 20% de l'autonomie
              directionsRenderer.setDirections(result);
            }
          }

          // Ajouter les bornes de recharge au trajet
        });
      }
    } catch (error) {
      console.error("Erreur lors du calcul de l'itinéraire : ", error);
    }
  }

  onMount(async () => {
    try {
      bornes = await getBornesDeRecharge(45.8992348, 6.1288847, 5000, 5);
      console.log(bornes);
    } catch (error) {
      console.error(error);
    }

    let autocompleteDepart;
    let autocompleteArrivee;
    const google = window.google;

    const initAutocomplete = () => {
      autocompleteDepart = new google.maps.places.Autocomplete(
        document.getElementById("ville-depart")
      );
      autocompleteArrivee = new google.maps.places.Autocomplete(
        document.getElementById("ville-arrivee")
      );

      autocompleteDepart.addListener("place_changed", () => {
        const place = autocompleteDepart.getPlace();
        adresseDepart.set(place.formatted_address);
      });

      autocompleteArrivee.addListener("place_changed", () => {
        const place = autocompleteArrivee.getPlace();
        adresseArrivee.set(place.formatted_address);
      });
    };

    if (google) {
      initAutocomplete();

      // Créer une nouvelle instance de carte et stocker dans mapInstance
      mapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.8992348, lng: 6.1288847 }, // Remplacez ces coordonnées par celles de votre choix
        zoom: 12, // Niveau de zoom initial
      });
      if (!directionsRenderer) {
        directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(mapInstance);
      }
    } else {
      window.initMap = initAutocomplete;
    }
  });
</script>

<svelte:head>
  <script
    defer
    async
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAkmNJfC0T5rHryGBtpbNFGCxalxK9OAC0&libraries=places&callback=initMap"
  ></script>
</svelte:head>

<div class="container">
  <div class="left-panel">
    <input
      type="text"
      bind:value={$vehicleSearch}
      placeholder="Véhicule"
      on:input={(e) => updateSuggestions(e.target.value)}
    />

    {#if $vehicleSearch && $suggestions.length > 0}
      <ul class="vehicle-dropdown">
        {#each $suggestions as vehicle}
          <li on:click={() => selectVehicle(vehicle)}>
            {vehicle.naming.make}
            {vehicle.naming.model}
            {vehicle.naming.chargetrip_version}
            <img src={vehicle.media.image.thumbnail_url} />
          </li>
        {/each}
      </ul>
    {/if}
    <input type="text" placeholder="Ville de départ" id="ville-depart" />
    <input type="text" placeholder="Ville d'arrivée" id="ville-arrivee" />
    <button on:click={calculerItineraire}>Calculer Itinéraire</button>

    <div class="temps-de-trajet">Temps de trajet: {formattedTime}</div>
  </div>
  <div class="right-panel">
    <div id="map" style="width: 100%; height: 100%;"></div>
  </div>
</div>

<style>
  :global(body) {
    padding: 0;
    margin: 0;
    font-family: sans-serif;
  }

  #ScrollPic {
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
