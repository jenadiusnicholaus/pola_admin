export default {
  presets: {
    light: {
      // Pola Brand Colors - Amber & Dark
      primary: '#F59E0B', // Amber-500 (Main brand color)
      secondary: '#1F2937', // Dark Gray-800 (Professional dark)

      // Backgrounds
      backgroundPrimary: '#FAFAFA', // Off-white for main background
      backgroundSecondary: '#FFFFFF', // Pure white for cards
      backgroundElement: '#FFFFFF', // White for elevated elements
      backgroundBorder: '#E5E7EB', // Gray-200 for borders

      // Card Backgrounds
      backgroundCardPrimary: '#FFFFFF',
      backgroundCardSecondary: '#FEF3C7', // Amber-100 for secondary cards

      // Text Colors
      textPrimary: '#1F2937', // Gray-800 (Almost black)
      textSecondary: '#6B7280', // Gray-500
      textInverted: '#FFFFFF', // White text

      // Semantic Colors
      success: '#10B981', // Green-500
      info: '#3B82F6', // Blue-500
      danger: '#EF4444', // Red-500
      warning: '#F59E0B', // Amber-500 (matches primary)

      // Shadows
      shadow: 'rgba(0, 0, 0, 0.08)',

      // Focus
      focus: '#FCD34D', // Amber-300 for focus states
    },
    dark: {
      // Pola Brand Colors (Dark Mode) - Amber & Dark
      primary: '#FBB03B', // Brighter amber for dark mode
      secondary: '#4B5563', // Medium Gray-600 (lighter for dark mode)

      // Backgrounds
      backgroundPrimary: '#111827', // Gray-900
      backgroundSecondary: '#1F2937', // Gray-800
      backgroundElement: '#1F2937', // Gray-800
      backgroundBorder: '#374151', // Gray-700

      // Card Backgrounds
      backgroundCardPrimary: '#1F2937', // Gray-800
      backgroundCardSecondary: '#292524', // Amber-tinted dark

      // Text Colors
      textPrimary: '#F9FAFB', // Gray-50 (Almost white)
      textSecondary: '#D1D5DB', // Gray-300
      textInverted: '#1F2937', // Dark text for light backgrounds

      // Semantic Colors (Adjusted for dark mode)
      success: '#34D399', // Green-400
      info: '#60A5FA', // Blue-400
      danger: '#F87171', // Red-400
      warning: '#FBBF24', // Amber-400

      // Shadows
      shadow: 'rgba(0, 0, 0, 0.3)',

      // Focus
      focus: '#FCD34D', // Amber-300 for focus states
    },
  },

  // Custom color variables for Pola brand
  colors: {
    // Amber Palette (Primary)
    amber50: '#FFFBEB',
    amber100: '#FEF3C7',
    amber200: '#FDE68A',
    amber300: '#FCD34D',
    amber400: '#FBBF24',
    amber500: '#F59E0B',
    amber600: '#D97706',
    amber700: '#B45309',
    amber800: '#92400E',
    amber900: '#78350F',

    // Light Blue Palette (Secondary)
    lightBlue50: '#F0F9FF',
    lightBlue100: '#E0F2FE',
    lightBlue200: '#BAE6FD',
    lightBlue300: '#7DD3FC',
    lightBlue400: '#60A5FA',
    lightBlue500: '#3B82F6',
    lightBlue600: '#2563EB',
    lightBlue700: '#1D4ED8',
    lightBlue800: '#1E40AF',
    lightBlue900: '#1E3A8A',

    // Black & White
    black: '#000000',
    white: '#FFFFFF',

    // Gray Scale (for neutral elements)
    gray50: '#FAFAFA',
    gray100: '#F4F4F5',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
}
