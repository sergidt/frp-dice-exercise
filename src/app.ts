import { defer, interval, Observable, of } from 'rxjs';
import { pairwise, scan, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';

console.clear();

// Generador aleatorio de un valor entre dos valores
const intFrom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Generador aleatorio de una cara del dado
const generaCaraDado$ = defer(() => of(intFrom(1, 6)));

/** Generar un stream que, cada 2 segundos, simule un lanzamiento de un dado **/
const lanzamientoDado$ = interval(2000)
    .pipe(
        switchMap(() => generaCaraDado$),
        tap(_ => console.log(`lanzamiento actual: ${ _ }`)),
        shareReplay({ refCount: true })
    );

/** Contar los lanzamientos que vamos haciendo **/

const contadorLanzamientos$ = lanzamientoDado$.pipe(scan((total, _) => total + 1, 0));

contadorLanzamientos$.subscribe(_ => console.log('número de lanzamientos:', _));

/** Sacar un mensaje por consola cada vez que un valor se repita en tiradas consecutivas **/

lanzamientoDado$
    .pipe(pairwise())
    .subscribe(([anterior, actual]) => {
        if (anterior === actual)
            console.log(`%crepetición de lanzamiento: ${ actual }`, 'background: #222222; color: #bada55');
    });

/** Calcular cuantas veces sale cada cara del dado **/

type AccumuladorValores = {
    [key in string]?: number;
}

const accumuladorValores$: Observable<AccumuladorValores> = lanzamientoDado$
    .pipe(
        scan((lanzamientos, lanzamientoActual) => {
            const contador = lanzamientos[lanzamientoActual] || 0;
            return { ...lanzamientos, [lanzamientoActual]: contador + 1 };
        }, {})
    );

accumuladorValores$.subscribe(_ => console.log('valores: ', _));

/** Calcular la probabilidad de ocurrencia **/

function ocurrencias([valores, lanzamientos]: [AccumuladorValores, number]): Array<any> {
    return Object.entries(valores)
                 .map(([key, value]) => `${ key }: ${ ((value / lanzamientos) * 100).toFixed(2) }%`);
}

accumuladorValores$
    .pipe(withLatestFrom(contadorLanzamientos$))
    .subscribe(_ => console.log(ocurrencias(_).join('\n')));

/** ¿Salen más valores pares o impares? **/

accumuladorValores$
    .pipe(
        scan((acc: AccumuladorValores, cur: AccumuladorValores) => {
            const entries: Array<[string, number]> = Object.entries(cur);
            const evenNumbers: Array<[string, number]> = entries.filter(([key]) => +key % 2 === 0);
            const oddNumbers: Array<[string, number]> = entries.filter(([key]) => +key % 2 !== 0);
            return {
                even: evenNumbers.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0),
                odd: oddNumbers.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0)
            };
        }, {})
    )
    .subscribe(console.log);
