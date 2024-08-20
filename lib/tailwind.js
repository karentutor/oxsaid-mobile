// lib/tailwind.js
import { create } from "twrnc";

// Create the customized version of twrnc
const tw = create(require("../tailwind.config")); // Adjust the path if necessary

// Export the customized Tailwind function
export default tw;
