// Pastikan baris import ini ADA di paling atas
import { AgronomisPaths, OwnerPaths, StaffPaths, PublicPaths } from '../routes/routePaths';

export function getDefaultRoleHomePath(role) {
  // Ubah role menjadi huruf kecil semua agar aman (Owner -> owner)
  const safeRole = role?.toLowerCase(); 

  switch (safeRole) {
    case 'owner':
      return OwnerPaths.dashboard;
    case 'agronomis':
      return AgronomisPaths.dashboard;
    case 'staff':
      return StaffPaths.dashboard;
    default:
      return PublicPaths.login;
  }
}