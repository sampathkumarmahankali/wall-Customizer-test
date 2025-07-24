import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE = `${API_URL}/shared`;

export async function getAllSharedSessions() {
  const token = getToken();
  const res = await fetch(`${API_BASE}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch shared sessions');
  return res.json();
}

export async function getSharedSession(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch shared session');
  return res.json();
}

export async function createSharedSession(data: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create shared session');
  return res.json();
}

export async function updateSharedSession(id: number, data: any) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update shared session');
  return res.json();
}

export async function deleteSharedSession(id: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete shared session');
  return res.json();
} 