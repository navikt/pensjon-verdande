
export type DateRange = { from?: Date; to?: Date };

export function toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d: Date, days: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + days);
    return new Date(out.getFullYear(), out.getMonth(), out.getDate());
}

export function addMonths(d: Date, months: number): Date {
    const out = new Date(d);
    out.setMonth(out.getMonth() + months);
    return new Date(out.getFullYear(), out.getMonth(), out.getDate());
}

export function isWeekend(d: Date): boolean {
    const day = d.getDay();
    return day === 0 || day === 6;
}

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
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

export function buildHolidayData(includeNextYear: boolean) {
    const now = new Date();
    const years: number[] = [now.getFullYear()];
    if (includeNextYear) years.push(now.getFullYear() + 1);

    const raw: Date[] = [];
    for (const y of years) {
        const easter = computeEaster(y);
        const maundyThu = addDays(easter, -3);
        const goodFri = addDays(easter, -2);
        const easterMon = addDays(easter, 1);
        const ascension = addDays(easter, 39);
        const whitSun = addDays(easter, 49);
        const whitMon = addDays(easter, 50);

        raw.push(
            new Date(y, 0, 1),
            maundyThu,
            goodFri,
            easter,
            easterMon,
            new Date(y, 4, 1),
            new Date(y, 4, 17),
            ascension,
            whitSun,
            whitMon,
            new Date(y, 11, 25),
            new Date(y, 11, 26)
        );
    }

    const dates = raw.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    const ymdSet = new Set(dates.map(toYmd));
    return { dates, ymdSet };
}

export function firstBusinessDayOnOrAfter(anchor: Date): Date {
    const d = startOfDay(anchor);
    while (isWeekend(d)) d.setDate(d.getDate() + 1);
    return d;
}

export function firstWeekdayOnOrAfter(anchor: Date, weekday: number): Date {
    const d = startOfDay(anchor);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    return d;
}

export function allWeekdaysInRange(weekday: number, start: Date, end: Date): Date[] {
    const out: Date[] = [];
    const s0 = startOfDay(start);
    const e0 = startOfDay(end);
    const cur = new Date(s0);
    while (cur.getDay() !== weekday) cur.setDate(cur.getDate() + 1);
    for (let d = new Date(cur); d <= e0; d.setDate(d.getDate() + 7)) {
        out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return out;
}

export function monthlyAnchoredStartDates(start: Date, months: number, horizon: Date): Date[] {
    const base = new Date(start.getFullYear(), start.getMonth(), 1);
    const out: Date[] = [];
    let d = new Date(base);
    while (d <= horizon) {
        out.push(new Date(d));
        d.setMonth(d.getMonth() + months);
    }
    return out;
}

export function quarterlyStartDates(start: Date, horizon: Date): Date[] {
    const dates: Date[] = [];
    let d = new Date(start.getFullYear(), 0, 1);
    while (d <= horizon) {
        dates.push(new Date(d));
        d.setMonth(d.getMonth() + 3);
    }
    return dates;
}

export function tertialStartDates(start: Date, horizon: Date): Date[] {
    const months = [0, 4, 8];
    const dates: Date[] = [];
    for (let y = start.getFullYear(); y <= horizon.getFullYear(); y++) {
        for (const m of months) {
            const d = new Date(y, m, 1);
            if (d >= new Date(start.getFullYear(), start.getMonth(), 1) && d <= horizon) {
                dates.push(d);
            }
        }
    }
    return dates;
}

export function getWeekdayNumber(ukedag: string): number | null {
    const map: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    return map[ukedag] ?? null;
}

function isDateRange(x: unknown): x is DateRange {
    if (!x || typeof x !== 'object') return false;
    const obj = x as Record<string, unknown>;
    return ('from' in obj) || ('to' in obj);
}

type BuildValgteDatoerOpts = {
    ekskluderHelg: boolean;
    ekskluderHelligdager: boolean;
    ekskluderSondag: boolean;
    endOfHorizon: Date;
    holidayYmdSet: Set<string>;
};

export function buildValgteDatoer(
    selection: DateRange | Date[] | undefined,
    mode: 'range' | 'multiple',
    opts: BuildValgteDatoerOpts
): string[] {
    if (!selection) return [];
    const { ekskluderHelg, ekskluderHelligdager, ekskluderSondag, endOfHorizon, holidayYmdSet } = opts;
    const list: Date[] = [];

    const pushIfInHorizon = (d: Date) => {
        const dd = startOfDay(d);
        if (dd <= endOfHorizon) list.push(dd);
    };

    if (mode === 'multiple') {
        const arr = Array.isArray(selection) ? selection as Date[] : [];
        for (const d of arr) pushIfInHorizon(d);
    } else {
        if (!isDateRange(selection)) return [];
        const from = selection.from ? startOfDay(selection.from) : undefined;
        const to = selection.to ? startOfDay(selection.to) : undefined;
        if (from && to && from <= to) {
            for (let d = new Date(from); d <= to && d <= endOfHorizon; d.setDate(d.getDate() + 1)) {
                pushIfInHorizon(d);
            }
        }
    }

    const ymd = Array.from(new Set(list.map(toYmd))).sort();
    return ymd.filter(s => {
        const [y, m, d] = s.split('-').map(Number);
        const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
        if (ekskluderHelg && isWeekend(dt)) return false;
        if (!ekskluderHelg && ekskluderSondag && dt.getDay() === 0) return false;
        if (ekskluderHelligdager && holidayYmdSet.has(s)) return false;
        return true;
    });
}

type DisabledDatesOpts = {
    fromDate: Date;
    toDate: Date;
    bookedDates: Date[];
    holidayDates: Date[];
    ekskluderHelg: boolean;
    ekskluderHelligdager: boolean;
    ekskluderSondag: boolean;
};

export function buildDisabledDates({
                                       fromDate, toDate, bookedDates, holidayDates, ekskluderHelg, ekskluderHelligdager, ekskluderSondag
                                   }: DisabledDatesOpts): Date[] {
    const set = new Set<number>();
    const add = (d: Date) => set.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());

    for (let d = startOfDay(fromDate); d <= startOfDay(toDate); d.setDate(d.getDate() + 1)) {
        if (ekskluderHelg && isWeekend(d)) add(d);
        else if (!ekskluderHelg && ekskluderSondag && d.getDay() === 0) add(d);
    }

    if (ekskluderHelligdager) {
        for (const d of holidayDates) add(d);
    }

    for (const d of bookedDates) add(d);

    return Array.from(set).map(t => new Date(t)).sort((a, b) => a.getTime() - b.getTime());
}
