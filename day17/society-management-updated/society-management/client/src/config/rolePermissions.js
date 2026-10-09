export const ROLE_LABELS = {
  resident: "Resident",
  owner: "Property owner",
  committee: "Committee",
  security: "Security",
  manager: "Society manager",
};

export const ROLE_NAV = {
  dashboard: ["resident", "owner", "committee", "security", "manager"],
  complaints: ["resident", "owner", "committee", "manager"],
  visitors: ["resident", "owner", "security", "manager"],
  announcements: ["resident", "owner", "committee", "security", "manager"],
  payments: ["resident", "owner", "manager"],
  properties: ["resident", "owner", "committee", "security", "manager"],
  users: ["manager"],
};

export const hasRole = (role, allowedRoles) =>
  Boolean(role) && allowedRoles.includes(role);
