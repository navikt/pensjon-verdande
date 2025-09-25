export type DateRange = { from?: Date; to?: Date };

const DAY = 24 * 60 * 60 * 1000;

export function toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function addMonths(d: Date, months: number): Date {
    return new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
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

    const dates = raw.map(startOfDay);
    const ymdSet = new Set(dates.map(toYmd));
    return { dates, ymdSet };
}

export function firstBusinessDayOnOrAfter(anchor: Date): Date {
    let d = startOfDay(anchor);
    while (isWeekend(d)) d = addDays(d, 1);
    return d;
}

export function firstWeekdayOnOrAfter(anchor: Date, weekday: number): Date {
    let d = startOfDay(anchor);
    while (d.getDay() !== weekday) d = addDays(d, 1);
    return d;
}

export function allWeekdaysInRange(weekday: number, start: Date, end: Date): Date[] {
    const s0 = startOfDay(start);
    const e0 = startOfDay(end);
    let first = s0;
    const delta = (weekday - s0.getDay() + 7) % 7;
    first = addDays(first, delta);
    const out: Date[] = [];
    for (let t = first.getTime(); t <= e0.getTime(); t += 7 * DAY) {
        out.push(new Date(t));
    }
    return out;
}

export function monthlyAnchoredStartDates(start: Date, months: number, horizon: Date): Date[] {
    if (!Number.isFinite(months) || months <= 0) return [];
    const base = new Date(start.getFullYear(), start.getMonth(), 1);
    const out: Date[] = [];
    for (let d = new Date(base); d.getTime() <= startOfDay(horizon).getTime(); d.setMonth(d.getMonth() + months)) {
        out.push(new Date(d));
    }
    return out;
}

export function quarterlyStartDates(start: Date, horizon: Date): Date[] {
    const out: Date[] = [];
    for (let d = new Date(start.getFullYear(), 0, 1); d.getTime() <= startOfDay(horizon).getTime(); d.setMonth(d.getMonth() + 3)) {
        out.push(new Date(d));
    }
    return out;
}

export function tertialStartDates(start: Date, horizon: Date): Date[] {
    const months = [0, 4, 8];
    const out: Date[] = [];
    for (let y = start.getFullYear(); y <= horizon.getFullYear(); y++) {
        for (const m of months) {
            const d = new Date(y, m, 1);
            if (d >= new Date(start.getFullYear(), start.getMonth(), 1) && d <= horizon) out.push(d);
        }
    }
    return out;
}

export function getWeekdayNumber(ukedag: string): number | null {
    const map: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return map[ukedag] ?? null;
}

function isDateRange(x: unknown): x is DateRange {
    if (!x || typeof x !== "object") return false;
    const obj = x as Record<string, unknown>;
    return "from" in obj || "to" in obj;
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
    mode: "range" | "multiple",
    opts: BuildValgteDatoerOpts
): string[] {
    if (!selection) return [];
    const { ekskluderHelg, ekskluderHelligdager, ekskluderSondag, endOfHorizon, holidayYmdSet } = opts;

    const list: Date[] = [];
    const pushIfInHorizon = (d: Date) => {
        const dd = startOfDay(d);
        if (dd.getTime() <= startOfDay(endOfHorizon).getTime()) list.push(dd);
    };

    if (mode === "multiple") {
        const arr = Array.isArray(selection) ? (selection as Date[]) : [];
        for (const d of arr) pushIfInHorizon(d);
    } else {
        if (!isDateRange(selection)) return [];
        const from = selection.from ? startOfDay(selection.from) : undefined;
        const to = selection.to ? startOfDay(selection.to) : undefined;
        if (from && to && from.getTime() <= to.getTime()) {
            const endT = Math.min(to.getTime(), startOfDay(endOfHorizon).getTime());
            for (let t = from.getTime(); t <= endT; t += DAY) {
                pushIfInHorizon(new Date(t));
            }
        }
    }

    const ymd = Array.from(new Set(list.map(toYmd))).sort();
    return ymd.filter((s) => {
        const [y, m, d] = s.split("-").map(Number);
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
                                       fromDate,
                                       toDate,
                                       bookedDates,
                                       holidayDates,
                                       ekskluderHelg,
                                       ekskluderHelligdager,
                                       ekskluderSondag,
                                   }: DisabledDatesOpts): Date[] {
    const set = new Set<number>();
    const add = (d: Date) => set.add(startOfDay(d).getTime());

    const startT = startOfDay(fromDate).getTime();
    const endT = startOfDay(toDate).getTime();
    for (let t = startT; t <= endT; t += DAY) {
        const d = new Date(t);
        if (ekskluderHelg && isWeekend(d)) add(d);
        else if (!ekskluderHelg && ekskluderSondag && d.getDay() === 0) add(d);
    }

    if (ekskluderHelligdager) for (const d of holidayDates) add(d);
    for (const d of bookedDates) add(d);

    return Array.from(set).map((t) => new Date(t)).sort((a, b) => a.getTime() - b.getTime());
}
