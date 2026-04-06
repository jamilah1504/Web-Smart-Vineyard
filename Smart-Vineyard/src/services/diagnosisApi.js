const BASE_URL = 'http://localhost:5000/api/diagnosis';

export async function getLatestDiagnosis(perangkat_id) {
  const res = await fetch(`${BASE_URL}/latest/${perangkat_id}`);
  return await res.json();
}

export async function getDiagnosisHistory(perangkat_id) {
  const res = await fetch(`${BASE_URL}/history/${perangkat_id}`);
  return await res.json();
}