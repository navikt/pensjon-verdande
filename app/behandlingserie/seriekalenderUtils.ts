
export function toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function addMonths(d: Date, months: number): Date {
    const out = new Date(d);
    out.setMonth(out.getMonth() + months);
    return new Date(out.getFullYear(), out.getMonth(), out.getDate());
}

export function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

export function isWeekend(d: Date): boolean {
    const day = d.getDay();
    return day === 0 || day === 6;
}

/* ============== Helligdager (NO, enkel modell) ============== */
/** Returnerer alle (anslåtte) helligdager for inneværende år (+ ev. neste år) som Date[] og Set<YYYY-MM-DD> */
export function buildHolidayData(includeNextYear: boolean) {
    const now = new Date();
    const years = [now.getFullYear(), includeNextYear ? now.getFullYear() + 1 : undefined].filter(
        Boolean,
    ) as number[];

    const dates: Date[] = [];
    for (const y of years) {
        // Minimum sett: 1. nyttårsdag, skjærtorsdag, langfredag, 1. påskedag, 2. påskedag,
        // arbeidets dag, Kristi himmelfartsdag, 1./2. pinsedag, 1./17. mai, 1./2. juledag
        // (Påskeberegning)
        const easter = computeEaster(y); // søndag
        const skjærtorsdag = addDays(easter, -3);
        const langfredag = addDays(easter, -2);
        const andrePåskedag = addDays(easter, 1);
        const kristiHimmelfart = addDays(easter, 39);
        const pinseaften = addDays(easter, 48);
        const førstePinsedag = addDays(easter, 49);
        const andrePinsedag = addDays(easter, 50);

        dates.push(
            new Date(y, 0, 1), // 1. nyttårsdag
            skjærtorsdag,
            langfredag,
            easter,
            andrePåskedag,
            new Date(y, 4, 1), // 1. mai
            new Date(y, 4, 17), // 17. mai
            kristiHimmelfart,
            førstePinsedag,
            andrePinsedag,
            new Date(y, 11, 25), // 1. juledag
            new Date(y, 11, 26), // 2. juledag
        );
    }

    // normaliser til startOfDay og bygg set
    const norm = dates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    const ymdSet = new Set(norm.map(toYmd));
    return { dates: norm, ymdSet };
}

function addDays(d: Date, days: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return new Date(out.getFullYear(), out.getMonth(), out.getDate());
}

// Gauss (påske) – returnerer 1. påskedag (søndag)
function computeEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Mar, 4=Apr
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

/* ============== Ukedager / serielogikk ============== */

export function getWeekdayNumber(weekday: string): number | undefined {
    const map: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
    };
    return map[weekday.toLowerCase()];
}

/** Alle forekomster av gitt ukedag i [from, to] (inkluderende), klippet på dag-nivå */
export function allWeekdaysInRange(weekday: number, from: Date, to: Date): Date[] {
    const start = startOfDay(from);
    const end = startOfDay(to);
    const out: Date[] = [];

    // Finn første forekomst av ukedagen
    const cur = new Date(start);
    while (cur.getDay() !== weekday) cur.setDate(cur.getDate() + 1);

    while (cur <= end) {
        out.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
        cur.setDate(cur.getDate() + 7);
    }
    return out;
}

/** Første ukedag >= anchor (0=søn..6=lør) */
export function firstWeekdayOnOrAfter(anchor: Date, weekday: number): Date {
    const d = startOfDay(anchor);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    return d;
}

/** Første virkedag (man–fre, og ikke helligdag) >= anchor */
export function firstBusinessDayOnOrAfter(anchor: Date, holidaySet?: Set<string>): Date {
    const d = startOfDay(anchor);
    while (true) {
        const isHol = holidaySet?.has(toYmd(d));
        if (!isWeekend(d) && !isHol) return d;
        d.setDate(d.getDate() + 1);
    }
}

/** For "første virkedag i n måneder": for hver måned fra start (inkl.) i `months`, returner 1. i måneden */
export function monthlyAnchoredStartDates(start: Date, months: number, horizon: Date): Date[] {
    const base = new Date(start.getFullYear(), start.getMonth(), 1); // månedens 1.
    const out: Date[] = [];
    for (let i = 0; i < months; i++) {
        const d = addMonths(base, i);
        if (d > horizon) break;
        out.push(d);
    }
    return out;
}

/** Alle anker-måneder mellom start og slutt (inkludert), gitt som 0-baserte månedsindekser. */
function anchoredMonthsBetween(start: Date, end: Date, anchorMonths: number[]): Date[] {
    const res: Date[] = [];
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    for (let y = startMonth.getFullYear(); y <= endMonth.getFullYear(); y++) {
        for (const m of anchorMonths) {
            const d = new Date(y, m, 1);
            if (d < startMonth) continue;
            if (d > endMonth) break;
            res.push(d);
        }
    }
    return res;
}

/** Kvartal: jan, apr, jul, okt */
export function quarterlyStartDates(start: Date, end: Date): Date[] {
    return anchoredMonthsBetween(start, end, [0, 3, 6, 9]);
}

/** Tertial: jan, mai, sep */
export function tertialStartDates(start: Date, end: Date): Date[] {
    return anchoredMonthsBetween(start, end, [0, 4, 8]);
}

/* ============== Bygg visnings/lagrings-lister ============== */

/**
 * Bygger ymd-liste fra UI-selection:
 * - range: alle dager i intervallet (ev. ekskluder helg + helligdager)
 * - multiple: tolkes som Date[] direkte
 */
export function buildValgteDatoer(
    selection: { from?: Date; to?: Date } | Date[] | undefined,
    mode: 'range' | 'multiple',
    ekskluderHelg: boolean,
    horizon: Date,
    holidaySet?: Set<string>,
    ekskluderHelligdager?: boolean,
): string[] {
    if (!selection) return [];

    const dates: Date[] = [];

    if (mode === 'multiple') {
        const arr = Array.isArray(selection) ? selection : [];
        for (const d of arr) {
            if (!d) continue;
            const dd = startOfDay(d);
            if (dd > horizon) continue;
            dates.push(dd);
        }
    } else {
        // range
        if (!('from' in selection)) return [];
        const from = selection.from ? startOfDay(selection.from) : undefined;
        const to = selection.to ? startOfDay(selection.to) : undefined;
        if (!from || !to || from > to) return [];

        const cur = new Date(from);
        const end = to > horizon ? startOfDay(horizon) : to;
        while (cur <= end) {
            const isHol = holidaySet?.has(toYmd(cur));
            if (
                (!ekskluderHelg || !isWeekend(cur)) &&
                (!ekskluderHelligdager || !isHol)
            ) {
                dates.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
            }
            cur.setDate(cur.getDate() + 1);
        }
    }

    // sorter og returner som ymd
    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates.map(toYmd);
}
