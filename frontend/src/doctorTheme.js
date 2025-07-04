/**
 * doctorTheme.js
 * ----------------------------------------------------
 * Single place to keep front-end constants:
 *   • API base-url
 *   • (optional) front-end feature flags later
 * ----------------------------------------------------
 * Change REACT_APP_API_URL in your .env file to switch
 * between local, staging, or production back-ends.
 */

export const API =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
