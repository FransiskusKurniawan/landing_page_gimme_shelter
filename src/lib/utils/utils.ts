import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the full image URL from a relative path
 * @param relativePath - The relative path from the API (e.g., "uploads/profiles/image.png")
 * @returns The full image URL or empty string if no path provided
 */
export function getImageUrl(relativePath?: string | null): string {
  if (!relativePath) return '';
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'http://localhost:8080';
  
  // Remove leading slash from relativePath if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Ensure imageBaseUrl doesn't end with slash
  const cleanBaseUrl = imageBaseUrl.endsWith('/') ? imageBaseUrl.slice(0, -1) : imageBaseUrl;
  
  return `${cleanBaseUrl}/${cleanPath}`;
}
