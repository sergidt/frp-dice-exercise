import { defer, of } from 'rxjs';

console.clear();

// Generador aleatorio de un valor entre dos valores
const intFrom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Generador aleatorio de una cara del dado
const generaCaraDado$ = defer(() => of(intFrom(1, 6)));

/** RESOLUCIÓN DE LOS EJERCICIOS */


