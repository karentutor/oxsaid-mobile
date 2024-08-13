// tailwind.js
import { create } from 'twrnc';

// Create the tw instance
const tw = create({
  theme: {
    extend: {
      colors: {
        // Define your color palette
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(0, 25%, 3%)',
        card: 'hsl(0, 0%, 100%)',
        'card-foreground': 'hsl(0, 25%, 3%)',
        primary: 'hsl(239, 40%, 26%)',
        'primary-foreground': 'hsl(0, 0%, 100%)',
        secondary: 'hsl(143, 22%, 72%)',
        'secondary-foreground': 'hsl(0, 25%, 3%)',
        muted: 'hsl(0, 0%, 20%)',
        'muted-foreground': 'hsl(0, 25%, 70%)',
        accent: 'hsl(187, 79%, 29%)',
        'accent-foreground': 'hsl(0, 0%, 100%)',
        destructive: 'hsl(0, 85%, 60%)',
        'destructive-foreground': 'hsl(0, 25%, 3%)',
        border: 'hsl(0, 0%, 90%)',
        input: 'hsl(0, 0%, 20%)',
        ring: 'hsl(187, 79%, 40%)',
        // Add more colors as needed
      },
      borderRadius: {
        DEFAULT: '0.5rem', // Default border radius
      },
      backgroundImage: {
        pattern:
          "url('data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='8' height='8' fill='none' stroke='rgb(0 0 0 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e')",
      },
      fontFamily: {
        rubik: ['Rubik-Regular', 'sans-serif'], // Define your Rubik font
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable base styles
  },
});

// Export the tw instance
export default tw;

