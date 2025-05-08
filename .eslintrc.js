export default {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "warn", // Downgrade to warning
    "react/no-unescaped-entities": "off", // Turn off entirely
    // Add other rules as needed
  },
};