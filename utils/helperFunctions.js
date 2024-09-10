export const getDisplayNames = (firstName, lastName) => {
  if (!firstName || !lastName) return;
  // make the first letter of the first name uppercase
  const firstNameCapitalized =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);
  // make the first letter of the last name uppercase
  const lastNameCapitalized =
    lastName.charAt(0).toUpperCase() + lastName.slice(1);
  // return the first and last name
  return `${firstNameCapitalized} ${lastNameCapitalized}`;
};

// Generate unique keys using business._id if available or a combination of fields
export const generateUniqueKey = (business) => {
  // Use safe fallback values to ensure keys are always unique and defined
  const businessId = business?._id || "no-id";
  const address = business?.businessDetail?.address || "no-address";
  const city = business?.businessDetail?.city || "no-city";

  // Append a random number and timestamp to ensure uniqueness even for similar businesses
  return `${businessId}-${address}-${city}-${Date.now()}-${Math.random()}`;
};
