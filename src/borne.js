export async function getBornesDeRecharge(latitude, longitude, distance, nombreDeBornes) {
    const url = `https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve&q=&rows=${nombreDeBornes}&geofilter.distance=${latitude},${longitude},${distance}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data.records.map(record => record.fields); // ou retourner data.records pour plus de détails
    } catch (error) {
      console.error('Erreur lors de la requête à l\'API ODRÉ:', error);
    }
  }
  