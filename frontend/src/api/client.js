const API_URL = "http://192.168.1.55:8080"

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