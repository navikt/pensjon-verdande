export type DateRange = { from?: Date; to?: Date };

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function toYearMonthDay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(date: Date, months: number): Date {
    const year = date.getFullYear();
    const monthIndex = date.getMonth() + months;
    const targetYear = Math.floor(year + monthIndex / 12);
    const targetMonth = ((monthIndex % 12) + 12) % 12;
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const day = Math.min(date.getDate(), lastDayOfTargetMonth);
    return new Date(targetYear, targetMonth, day);
}

export function isWeekend(date: Date): boolean {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6;
}

function beregnPaaske(year: number): Date {
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

export function byggHelligdagsdata(includeNextYear: boolean) {
    const now = new Date();
    const yearsToInclude: number[] = [now.getFullYear()];
    if (includeNextYear) yearsToInclude.push(now.getFullYear() + 1);

    const rawHolidayDates: Date[] = [];
    for (const year of yearsToInclude) {
        const paaske = beregnPaaske(year);
        const skjaertorsdag = addDays(paaske, -3);
        const langfredag = addDays(paaske, -2);
        const forstePaaskedag = paaske;
        const andrePaaskedag = addDays(paaske, 1);
        const kristiHimmelfartsdag = addDays(paaske, 39);
        const forstePinsedag = addDays(paaske, 49);
        const andrePinsedag = addDays(paaske, 50);

        rawHolidayDates.push(
            new Date(year, 0, 1),
            skjaertorsdag,
            langfredag,
            forstePaaskedag,
            andrePaaskedag,
            new Date(year, 4, 1),
            new Date(year, 4, 17),
            kristiHimmelfartsdag,
            forstePinsedag,
            andrePinsedag,
            new Date(year, 11, 25),
            new Date(year, 11, 26)
        );
    }

    const holidayDates = rawHolidayDates.map(startOfDay);
    const yearMonthDaySet = new Set(holidayDates.map(toYearMonthDay));
    return { holidayDates, yearMonthDaySet };
}

export function firstBusinessDayOnOrAfter(anchorDate: Date): Date {
    let currentDate = startOfDay(anchorDate);
    while (isWeekend(currentDate)) currentDate = addDays(currentDate, 1);
    return currentDate;
}

export function firstWeekdayOnOrAfter(anchorDate: Date, weekdayNumber: number): Date {
    let currentDate = startOfDay(anchorDate);
    while (currentDate.getDay() !== weekdayNumber) currentDate = addDays(currentDate, 1);
    return currentDate;
}

export function allWeekdaysInRange(weekdayNumber: number, startDate: Date, endDate: Date): Date[] {
    const startTime = startOfDay(startDate).getTime();
    const endTime = startOfDay(endDate).getTime();
    const firstDelta = (weekdayNumber - new Date(startTime).getDay() + 7) % 7;
    const firstTime = startTime + firstDelta * MILLISECONDS_PER_DAY;
    const out: Date[] = [];
    for (let time = firstTime; time <= endTime; time += 7 * MILLISECONDS_PER_DAY) out.push(new Date(time));
    return out;
}

export function monthlyAnchoredStartDates(startDate: Date, monthInterval: number, horizonDate: Date): Date[] {
    if (!Number.isFinite(monthInterval) || monthInterval <= 0) return [];
    const startIndex = startDate.getFullYear() * 12 + startDate.getMonth();
    const endIndex = horizonDate.getFullYear() * 12 + horizonDate.getMonth();
    const out: Date[] = [];
    for (let index = startIndex; index <= endIndex; index += monthInterval) {
        const year = Math.floor(index / 12);
        const month = index % 12;
        out.push(new Date(year, month, 1));
    }
    return out;
}

export function quarterlyStartDates(startDate: Date, horizonDate: Date): Date[] {
    const startIndex = startDate.getFullYear() * 12;
    const endIndex = horizonDate.getFullYear() * 12 + horizonDate.getMonth();
    const out: Date[] = [];
    for (let index = startIndex; index <= endIndex; index += 3) {
        const year = Math.floor(index / 12);
        const month = index % 12;
        const date = new Date(year, month, 1);
        if (date >= new Date(startDate.getFullYear(), startDate.getMonth(), 1) && date <= horizonDate) out.push(date);
    }
    return out;
}

export function tertialStartDates(startDate: Date, horizonDate: Date): Date[] {
    const tertialMonths = [0, 4, 8];
    const out: Date[] = [];
    for (let year = startDate.getFullYear(); year <= horizonDate.getFullYear(); year++) {
        for (const month of tertialMonths) {
            const date = new Date(year, month, 1);
            if (date >= new Date(startDate.getFullYear(), startDate.getMonth(), 1) && date <= horizonDate) out.push(date);
        }
    }
    return out;
}

export function getWeekdayNumber(weekdayKey: string): number | undefined {
    const map: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    return map[weekdayKey];
}

function isDateRange(value: unknown): value is DateRange {
    if (!value || typeof value !== "object") return false;
    const obj = value as Record<string, unknown>;
    return "from" in obj || "to" in obj;
}

type ByggValgteDatoerOptions = {
    ekskluderHelg: boolean;
    ekskluderHelligdager: boolean;
    ekskluderSondag: boolean;
    endOfHorizon: Date;
    helligdagerYearMonthDaySet: Set<string>;
};

export function buildValgteDatoer(
    selection: DateRange | Date[] | undefined,
    mode: "range" | "multiple",
    options: ByggValgteDatoerOptions
): string[] {
    if (!selection) return [];
    const { ekskluderHelg, ekskluderHelligdager, ekskluderSondag, endOfHorizon, helligdagerYearMonthDaySet } = options;

    const collectedDates: Date[] = [];
    const horizonTime = startOfDay(endOfHorizon).getTime();

    const pushIfInHorizon = (date: Date) => {
        const time = startOfDay(date).getTime();
        if (time <= horizonTime) collectedDates.push(new Date(time));
    };

    if (mode === "multiple") {
        const dates = Array.isArray(selection) ? (selection as Date[]) : [];
        for (const date of dates) pushIfInHorizon(date);
    } else {
        if (!isDateRange(selection)) return [];
        const fromTime = selection.from ? startOfDay(selection.from).getTime() : undefined;
        const toTime = selection.to ? startOfDay(selection.to).getTime() : undefined;
        if (fromTime !== undefined && toTime !== undefined && fromTime <= toTime) {
            const endTime = Math.min(toTime, horizonTime);
            for (let time = fromTime; time <= endTime; time += MILLISECONDS_PER_DAY) pushIfInHorizon(new Date(time));
        }
    }

    const yearMonthDays = Array.from(new Set(collectedDates.map(toYearMonthDay))).sort();
    return yearMonthDays.filter((yearMonthDay) => {
        const parts = yearMonthDay.split("-");
        if (parts.length !== 3) return false;
        const [year, month, day] = parts.map(Number);
        if ([year, month, day].some((n) => Number.isNaN(n))) return false;
        const date = new Date(year, month - 1, day);
        if (ekskluderHelg && isWeekend(date)) return false;
        if (!ekskluderHelg && ekskluderSondag && date.getDay() === 0) return false;
        if (ekskluderHelligdager && helligdagerYearMonthDaySet.has(yearMonthDay)) return false;
        return true;
    });
}

type DeaktiverteDatoerOptions = {
    fromDate: Date;
    toDate: Date;
    bookedDates: Date[];
    helligdagsdatoer: Date[];
    ekskluderHelg: boolean;
    ekskluderHelligdager: boolean;
    ekskluderSondag: boolean;
};

export function buildDisabledDates({
                                       fromDate,
                                       toDate,
                                       bookedDates,
                                       helligdagsdatoer,
                                       ekskluderHelg,
                                       ekskluderHelligdager,
                                       ekskluderSondag,
                                   }: DeaktiverteDatoerOptions): Date[] {
    const disabledSet = new Set<number>();
    const addDisabled = (date: Date) => disabledSet.add(startOfDay(date).getTime());

    const startTime = startOfDay(fromDate).getTime();
    const endTime = startOfDay(toDate).getTime();
    for (let time = startTime; time <= endTime; time += MILLISECONDS_PER_DAY) {
        const date = new Date(time);
        if (ekskluderHelg && isWeekend(date)) addDisabled(date);
        else if (!ekskluderHelg && ekskluderSondag && date.getDay() === 0) addDisabled(date);
    }

    if (ekskluderHelligdager) for (const date of helligdagsdatoer) addDisabled(date);
    for (const date of bookedDates) addDisabled(date);

    return Array.from(disabledSet).map((time) => new Date(time)).sort((a, b) => a.getTime() - b.getTime());
}
