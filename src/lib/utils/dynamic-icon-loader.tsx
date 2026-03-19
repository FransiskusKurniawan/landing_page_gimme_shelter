'use client';

import * as React from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Dynamic Icon Loader Component
 * Loads any Lucide React icon dynamically by name (kebab-case)
 * Uses the dynamicIconImports from lucide-react for full icon library access
 * 
 * @example
 * <DynamicIcon name="layout-dashboard" className="h-4 w-4" />
 * <DynamicIcon name="users" className="h-6 w-6 text-blue-500" />
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size }) => {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<LucideProps> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIcon = async () => {
      try {
        setIsLoading(true);

        // Check if the icon exists in dynamicIconImports
        const iconImporter = dynamicIconImports[name as keyof typeof dynamicIconImports];

        if (!iconImporter) {
          console.warn(`Icon "${name}" not found in dynamicIconImports`);
          setIsLoading(false);
          return;
        }

        // Dynamically import the icon
        const iconModule = await iconImporter();
        setIconComponent(() => iconModule.default);
      } catch (err) {
        console.error(`Error loading icon "${name}":`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadIcon();
  }, [name]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={className || 'animate-pulse bg-muted rounded'}
        style={{
          width: size || 16,
          height: size || 16,
        }}
      />
    );
  }

  // Error state - fallback to a placeholder
  if (!IconComponent) {
    return (
      <div
        className={className || 'bg-muted-foreground/20 rounded flex items-center justify-center text-xs'}
        style={{
          width: size || 16,
          height: size || 16,
        }}
        title={`Icon "${name}" not found`}
      >
        ?
      </div>
    );
  }

  // Render the loaded icon
  return <IconComponent className={className} size={size} />;
};

/**
 * Get all available icon names from dynamicIconImports
 */
export const getAllIconNames = (): string[] => {
  return Object.keys(dynamicIconImports).sort((a, b) => a.localeCompare(b));
};

/**
 * Check if an icon name exists
 */
export const isValidIconName = (name: string): boolean => {
  return name in dynamicIconImports;
};

/**
 * Search icons by name
 */
export const searchIcons = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return getAllIconNames().filter(name => name.toLowerCase().includes(lowerQuery));
};

/**
 * Format icon name for display (kebab-case to Title Case)
 * @example formatIconName("layout-dashboard") // "Layout Dashboard"
 */
export const formatIconName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
