import { defer, interval, Observable, of } from 'rxjs';
import { first, map, pairwise, scan, shareReplay, skipWhile, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

console.clear();

// Generador aleatorio de un valor entre dos valores
const intFrom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Generador aleatorio de una cara del dado
const generaCaraDado$ = defer(() => of(intFrom(1, 6)));

/** RESOLUCIÓN DE LOS EJERCICIOS */
/**
 * Generar un stream que, cada 2 segundos, simule un lanzamiento de un dado
 */

const lanzamientoDado$ = interval(2000)
    .pipe(
        switchMap(() => generaCaraDado$),
        tap(_ => console.log(`lanzamiento actual: ${ _ }`)),
        shareReplay()
    );

/**
 * Contar los lanzamientos que vamos haciendo
 */

const contadorDeLanzamientos$: Observable<number> = lanzamientoDado$
    .pipe(
        scan(acc => acc + 1, 0)
    );

contadorDeLanzamientos$
    .subscribe(_ => console.log(`número de lanzamientos: ${ _ }`));

/**
 * Sacar un mensaje por consola cada vez que un valor se repita en tiradas consecutivas
 */
/*
lanzamientoDado$
    .pipe(
        pairwise()
    )
    .subscribe(([anterior, actual]) => {
        if (anterior === actual)
            console.log('Se ha repetido el valor: ', actual);
    });
*/
/**
 * Calcular cuantas veces sale cada cara del dado
 */

type AcumuladorDeValores = {
    [key in string]?: number;
};

const acumuladorDeValores$: Observable<AcumuladorDeValores> = lanzamientoDado$
    .pipe(
        scan((lanzamientos, lanzamientoActual) => {
            const contador = lanzamientos[lanzamientoActual] || 0;
            return {
                ...lanzamientos,
                [lanzamientoActual]: contador + 1
            };
        }, {})
    );
/*
acumuladorDeValores$.subscribe(_ => console.log('valores: ', _));
*/
/**
 * Probabilidad de ocurrencia
 * */

function ocurrencias([valores, lanzamientos]: [AcumuladorDeValores, number]): Array<any> {
    return Object.entries(valores)
                 .map(([numero, vecesQueHaSalido]: [string, number]) => `${ numero }: ${ ((vecesQueHaSalido / lanzamientos) * 100).toFixed(2) } %`);
}
/*
acumuladorDeValores$
    .pipe(
        withLatestFrom(contadorDeLanzamientos$)
    )
    .subscribe(_ => console.log(ocurrencias(_).join('\n')));
*/
/**
 * ¿Salen más valores pares o impares?
 */

/*
acumuladorDeValores$
    .pipe(
        scan((acumuladorDeValores: AcumuladorDeValores, valorActual: AcumuladorDeValores) => {
            const entries: Array<[string, number]> = Object.entries(valorActual);
            const evenNumber: Array<[string, number]> = entries.filter(([key]) => +key % 2 === 0);
            const oddNumber: Array<[string, number]> = entries.filter(([key]) => +key % 2 !== 0);
            return {
                even: evenNumber.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0),
                odd: oddNumber.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0)
            };
        }, {})
    )
    .subscribe(_ => console.log('pares e impares', _));
 */

/*
acumuladorDeValores$
    .pipe(
        map((acc: AcumuladorDeValores) => {
            const entries: Array<[string, number]> = Object.entries(acc);
            const evenNumber: Array<[string, number]> = entries.filter(([key]) => +key % 2 === 0);
            const oddNumber: Array<[string, number]> = entries.filter(([key]) => +key % 2 !== 0);
            return [evenNumber, oddNumber];
        }),
        map(([pares, impares]: [Array<[string, number]>, Array<[string, number]>]) => ({
                even: pares.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0),
                odd: impares.map(([, value]) => value).reduce((acc, cur) => acc + cur, 0)
            })
        )
    )
    .subscribe(_ => console.log('pares e impares', _));
*/

/**
 *  Tirar 10 veces los dados y mirar si hemos conseguido una puntuación superior a 50 puntos
 */
/*
lanzamientoDado$
    .pipe(
        scan(
            (acumulado, lanzamiento) => ({
                contadorDeLanzamientos: acumulado['contadorDeLanzamientos'] + 1,
                total: acumulado['total'] + lanzamiento
            }),
            {
                contadorDeLanzamientos: 0, total: 0
            }
        ),
        first(({contadorDeLanzamientos}) => contadorDeLanzamientos < 10),
    )
    .subscribe(_ => console.log('Puntuación después de 10 lanzamientos', _));
*/
/**
 *  ¿Cuántas tiradas necesitamos para superar los 100 puntos?
 */

const lanzarHastaSuperarNPuntos = (puntos: number) => (source$: Observable<number>) => {
    return   source$
        .pipe(
            scan(
                (acumulado, lanzamiento) => ({
                    contadorDeLanzamientos: acumulado['contadorDeLanzamientos'] + 1,
                    total: acumulado['total'] + lanzamiento
                }),
                {
                    contadorDeLanzamientos: 0, total: 0
                }
            ),
            tap(console.log),
            first(({total}) => total >= puntos),
            map(({contadorDeLanzamientos}) => contadorDeLanzamientos)
        );

};


lanzamientoDado$
    .pipe(
        lanzarHastaSuperarNPuntos(100)
    )
    .subscribe(_ => console.log('Número de lanzamientos para superar los 100', _));
