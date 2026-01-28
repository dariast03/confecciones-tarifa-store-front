/**
 * Mapa de nombres de colores a códigos hexadecimales
 */
export const COLOR_MAP: Record<string, string> = {
  Rojo: '#DC2626',
  Verde: '#6e6a51', // Verde medio oscuro
  Amarillo: '#EAB308',
  Negro: '#000000',
  Blanco: '#FFFFFF',
  Beige: '#D4B896',
  Guindo: '#a74464', // Vino/Burgundy
  Azul: '#1E3A8A', // Azul oscuro
};

/**
 * Obtiene el código hexadecimal de un color por su nombre
 * @param colorName - Nombre del color
 * @returns Código hexadecimal o un color por defecto si no se encuentra
 */
export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName] || '#9CA3AF'; // Gris por defecto
}

/**
 * Verifica si un nombre de color existe en el mapa
 * @param colorName - Nombre del color
 * @returns true si existe, false en caso contrario
 */
export function isValidColor(colorName: string): boolean {
  return colorName in COLOR_MAP;
}
