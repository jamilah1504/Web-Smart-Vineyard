import { getAccessToken } from '../utils/authStorage';
const BASE_URL = 'http://localhost:5000/api/varietas';

export async function getAllVarietas() {
  const token = getAccessToken();
  const res = await fetch(BASE_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
}

export async function createVarietas(data) {
  const token = getAccessToken();
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function updateVarietas(id, data) {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function deleteVarietas(id) {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
}