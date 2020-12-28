import { BehaviorSubject, combineLatest, defer, fromEvent, interval, merge, Observable, of, Subject, timer } from 'rxjs';
import { count, delay, distinctUntilChanged, filter, map, mapTo, pairwise, refCount, scan, shareReplay, startWith, switchMap, take, takeWhile, tap, withLatestFrom } from 'rxjs/operators';

console.clear();

const intFrom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const lanzamientoDado$ = interval(2000)
    .pipe(
        switchMap(() => defer(() => of(intFrom(1, 6)))),
        tap(_ => console.log(`lanzamiento actual: ${_}`)),
        shareReplay({ refCount: true })
    );

const contadorLanzamientos$ = lanzamientoDado$
    .pipe(scan((total, _) => total + 1, 0));

contadorLanzamientos$
    .subscribe(_ => console.log('número de lanzamientos:', _));

lanzamientoDado$
    .pipe(
        pairwise()
    )
    .subscribe(([anterior, actual]) => {
        if (anterior === actual)
            console.log(`%crepetición de lanzamiento: ${actual}`, 'background: #222222; color: #bada55')
    });

    type AccumuladorValores = {
        [key in string]?: number;
    }

const accumuladorValores$: Observable<AccumuladorValores> =
    lanzamientoDado$
        .pipe(
            scan((lanzamientos, lanzamientoActual) => {
                const contador = lanzamientos[lanzamientoActual] || 0;
                return { ...lanzamientos, [lanzamientoActual]: contador + 1 };
            }, {})
        );

accumuladorValores$
    .subscribe(_ => console.log('valores: ', _));


function ocurrencias([valores, lanzamientos]: [AccumuladorValores, number]): Array<any> {
return Object.entries(valores).map(([key, value]) => `${key}: ${((value / lanzamientos) * 100).toFixed(2)}%`);
}

accumuladorValores$.pipe(withLatestFrom(contadorLanzamientos$))
.subscribe(_ => console.log(ocurrencias(_).join('\n')));

