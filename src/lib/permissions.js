/**
 * Innmotek Admin CMS - RBAC Permission Helper
 * 
 * Checks user permissions array against required permission strings (e.g. 'product-create', 'product-delete').
 */

import { getCurrentUser } from './auth';

/**
 * Check if the currently authenticated user has a specific permission.
 * 
 * @param {string|string[]} requiredPermission - Required permission key or array of keys
 * @param {object|null} userOverride - Optional user object to test against
 * @returns {boolean} True if user is super admin or possesses the permission
 */
export function hasPermission(requiredPermission, userOverride = null) {
  const user = userOverride || getCurrentUser();
  if (!user) return false;

  // Super Admin bypass
  if (user.role && user.role.toLowerCase() === 'super admin') {
    return true;
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(p => permissions.includes(p));
  }

  return permissions.includes(requiredPermission);
}

/**
 * Hook or helper for multiple common content permissions.
 */
export function getContentPermissions(moduleKey, userOverride = null) {
  return {
    canList: hasPermission(`${moduleKey}-list`, userOverride),
    canCreate: hasPermission(`${moduleKey}-create`, userOverride),
    canEdit: hasPermission(`${moduleKey}-edit`, userOverride),
    canDelete: hasPermission(`${moduleKey}-delete`, userOverride),
  };
}
