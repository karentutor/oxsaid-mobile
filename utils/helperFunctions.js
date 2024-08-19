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
