/**
 * Filtra un arreglo de objetos por un rango de fecha y hora
 * @param data - Array de objetos con propiedades de fecha
 * @param fecha - Fecha a filtrar (sin hora)
 * @param horaInicio - Hora inicio en formato HH:mm
 * @param horaFin - Hora fin en formato HH:mm
 * @param dateField - Nombre del campo de fecha en los objetos (por defecto 'fecha_creacion')
 * @returns Array filtrado
 */
export function filterByDateRange<T extends Record<string, any>>(
  data: T[],
  fecha: Date | null | undefined,
  horaInicio: string,
  horaFin: string,
  dateField: string = 'fecha_creacion'
): T[] {
  if (!fecha) {
    return data;
  }

  // Convertir hora inicio y fin a minutos desde medianoche
  const [startHour, startMin] = horaInicio.split(':').map(Number);
  const [endHour, endMin] = horaFin.split(':').map(Number);
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  // Normalizar la fecha seleccionada a medianoche
  const selectedDate = new Date(fecha);
  selectedDate.setHours(0, 0, 0, 0);

  return data.filter((item) => {
    const itemDate = item[dateField];
    if (!itemDate) return false;

    // Convertir el campo de fecha a objeto Date
    const objDate = new Date(itemDate);
    
    // Comparar solo la parte de fecha (sin hora)
    const objDateNormalized = new Date(objDate);
    objDateNormalized.setHours(0, 0, 0, 0);

    if (objDateNormalized.getTime() !== selectedDate.getTime()) {
      return false;
    }

    // Extraer hora y minutos del objeto
    const itemTotalMin = objDate.getHours() * 60 + objDate.getMinutes();

    // Verificar que esté dentro del rango de horas
    return itemTotalMin >= startTotalMin && itemTotalMin <= endTotalMin;
  });
}

/**
 * Convierte un tiempo en string (HH:mm) a minutos desde medianoche
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hour, min] = timeStr.split(':').map(Number);
  return hour * 60 + min;
}

/**
 * Convierte minutos desde medianoche a string (HH:mm)
 */
export function minutesToTimeString(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
