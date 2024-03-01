export async function calculateSum(numbers) {
  try {
    const response = await fetch("http://localhost:3000/calculate-sum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch the data from SOAP service:", error);
    return null;
  }
}
