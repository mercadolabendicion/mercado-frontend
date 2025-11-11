import { Injectable } from '@angular/core';

/**
 * Servicio para manejar operaciones de LocalStorage de forma segura
 * Proporciona manejo de errores y validación para prevenir fallos
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  /**
   * Guarda un item en localStorage de forma segura
   * 
   * @param key - Clave para almacenar el item
   * @param value - Valor a almacenar (será convertido a JSON)
   * @returns true si se guardó exitosamente, false si hubo error
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error al guardar en localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Obtiene un item de localStorage de forma segura
   * 
   * @param key - Clave del item a obtener
   * @returns El valor parseado o null si no existe o hay error
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error al leer de localStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Obtiene un item de localStorage o retorna un valor por defecto
   * 
   * @param key - Clave del item a obtener
   * @param defaultValue - Valor por defecto si no existe o hay error
   * @returns El valor parseado o el valor por defecto
   */
  getItemOrDefault<T>(key: string, defaultValue: T): T {
    const item = this.getItem<T>(key);
    return item !== null ? item : defaultValue;
  }

  /**
   * Elimina un item de localStorage
   * 
   * @param key - Clave del item a eliminar
   * @returns true si se eliminó exitosamente
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar de localStorage [${key}]:`, error);
      return false;
    }
  }

  /**
   * Limpia todo el localStorage
   * 
   * @returns true si se limpió exitosamente
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
      return false;
    }
  }

  /**
   * Verifica si una clave existe en localStorage
   * 
   * @param key - Clave a verificar
   * @returns true si la clave existe
   */
  hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error al verificar localStorage [${key}]:`, error);
      return false;
    }
  }
}
