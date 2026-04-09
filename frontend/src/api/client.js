const API_URL = "https://hackathon-s7n0.onrender.com"

export async function getDashboard() {
  const res = await fetch(`${API_URL}/dashboard`);
  return res.json();
}

export async function addMaterial(data) {
  const res = await fetch(`${API_URL}/materials/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function useMaterial(data) {
  const res = await fetch(`${API_URL}/materials/use`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}