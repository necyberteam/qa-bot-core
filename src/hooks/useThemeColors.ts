import { useMemo, RefObject } from 'react';
import type { ThemeColors } from '../config';

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

/**
 * Custom hook to get theme colors from CSS variables
 */
const useThemeColors = (
  containerRef: RefObject<HTMLDivElement>, 
  themeConfig: ThemeConfig = {}
): ThemeColors => {
  const themeColors = useMemo(() => {
    // Get colors from CSS variables if available, fall back to defaults
    const getCSSVariable = (name: string, fallback?: string): string | undefined => {
      if (containerRef.current) {
        // First check the container itself
        const containerStyle = getComputedStyle(containerRef.current);
        const containerValue = containerStyle.getPropertyValue(name);
        if (containerValue && containerValue.trim() !== '') {
          return containerValue.trim();
        }

        // Then check parent
        if (containerRef.current.parentElement) {
          const parentStyle = getComputedStyle(containerRef.current.parentElement);
          const parentValue = parentStyle.getPropertyValue(name);
          if (parentValue && parentValue.trim() !== '') {
            return parentValue.trim();
          }
        }
      }
      return fallback;
    };

    return {
      primaryColor: getCSSVariable('--primary-color', themeConfig.primaryColor),
      secondaryColor: getCSSVariable('--secondary-color', themeConfig.secondaryColor),
      fontFamily: getCSSVariable('--font-family', themeConfig.fontFamily)
    };
  }, [containerRef, themeConfig]);

  return themeColors;
};

export default useThemeColors;