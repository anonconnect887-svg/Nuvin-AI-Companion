import { Svg, Circle, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

export function NuvinMark({ size = 34 }: { size?: number }) {
  const colors = useColors();

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Nuvin">
      <Circle cx="24" cy="24" r="23" fill={colors.card} />
      <Path
        d="M11 27.5c0-8.8 5.8-15.5 13-15.5 4.2 0 7.7 2.1 10 5.6"
        fill="none"
        stroke={colors.primary}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Path
        d="M37 20.5c0 8.8-5.8 15.5-13 15.5-4.2 0-7.7-2.1-10-5.6"
        fill="none"
        stroke={colors.accent}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <Circle cx="35" cy="15" r="2.2" fill={colors.primary} />
      <Circle cx="13" cy="33" r="2.2" fill={colors.accent} />
    </Svg>
  );
}
