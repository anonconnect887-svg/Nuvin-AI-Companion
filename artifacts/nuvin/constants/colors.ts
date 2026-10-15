/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const palette = {
  // Legacy aliases (kept for scaffold compatibility)
  text: '#F2F7FB',
  tint: '#48CAE4',
  background: '#0B132B',
  foreground: '#F2F7FB',
  card: '#17223C',
  cardForeground: '#F2F7FB',
  primary: '#48CAE4',
  primaryForeground: '#0B132B',
  secondary: '#202C48',
  secondaryForeground: '#ECF3F9',
  muted: '#202C48',
  mutedForeground: '#AAB7C9',
  accent: '#FFB703',
  accentForeground: '#0B132B',
  destructive: '#E63946',
  destructiveForeground: '#FFFFFF',
  border: '#34415A',
  input: '#34415A',
};

const colors = {
  light: palette,
  dark: palette,
  radius: 18,
};

export default colors;
