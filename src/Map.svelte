



<!-- <script>
    import { onMount } from 'svelte';
  
    let container;
    let map;
    let zoom = 12;
    let center = { lat: 45.641446, lng: 5.869055 };
  
    onMount(() => {
      if (window.google && window.google.maps) {
        map = new google.maps.Map(container, {
          zoom: zoom,
          center: center,
          // styles: mapStyles // optional
        });
      } else {
        console.error("Google Maps API not loaded");
      }
    });
  </script>
  
  <style>
    .full-screen {
      width: 100%;
      height: 100%;
    }
  </style>
  
  <div class="full-screen" bind:this={container}></div>
   -->
   <script>
    //import mapStyles from './map-styles'; // optional
 
 
   let container;
   let map;
   let zoom = 8;
     let center = {lat: -34.397, lng: 150.644};
     
     import { onMount } from 'svelte';
     
   onMount(async () => {
     map = new google.maps.Map(container, {
             zoom,
       center,
       //styles: mapStyles // optional
     });
   });
 </script>
 
 <style>
 .full-screen {
     width: 100vw;
     height: 100vh;
 }
 </style>
 
 <div class="full-screen" bind:this={container}></div>