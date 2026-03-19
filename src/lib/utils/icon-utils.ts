import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const getIconByName = (iconName: string): LucideIcon => {
  // Convert kebab-case to PascalCase (e.g., "file-text" -> "FileText")
  const iconKey = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Get the icon from lucide-react, default to FileText if not found
  const Icon = (Icons as any)[iconKey] || Icons.FileText;
  
  return Icon as LucideIcon;
};
