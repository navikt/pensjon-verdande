import { type LoaderFunctionArgs, useFetcher, useLoaderData, useNavigate, useSearchParams } from 'react-router';
import { type ActionFunctionArgs, redirect } from 'react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, RadioGroup, Radio, Checkbox, Select, Heading, VStack, HStack, Modal } from '@navikt/ds-react';
import 'chart.js/auto';
import { requireAccessToken } from '~/services/auth.server';
import { getBehandlingSerier, opprettBehandlingSerie, endrePlanlagtStartet } from '~/behandlingserie/behandlingserie.server';
import type { BehandlingSerieDTO, BehandlingInfoDTO } from '~/types';
import {
    addMonths,
    allWeekdaysInRange,
    byggHelligdagsdata,
    buildValgteDatoer,
    firstBusinessDayOnOrAfter,
    firstWeekdayOnOrAfter,
    monthlyAnchoredStartDates,
    quarterlyStartDates,
    tertialStartDates,
    getWeekdayNumber,
    toYearMonthDay,
    buildDisabledDates,
} from './seriekalenderUtils';
import type { DateRange } from './seriekalenderUtils';
import ValgteDatoerPreview from '~/behandlingserie/valgteDatoerPreview';
import PlanlagteDatoerPreview, { type PlannedItem } from '~/behandlingserie/planlagteDatoerPreview';

type RegelmessighetMode = 'range' | 'multiple';
type Selection = DateRange | Date[] | undefined;
type IntervalMode = '' | 'quarterly' | 'tertial';
type DayMode = 'fixed-weekday' | 'first-weekday';

type RulesValue = {
    regelmessighet: RegelmessighetMode;
    dayMode: DayMode;
    selectedUkedag: string;
    selectAntallMaaneder: string;
    intervalMode: IntervalMode;
};
type RulesPatch = Partial<RulesValue>;

type OptionsValue = {
    includeNextYear: boolean;
    ekskluderHelligdager: boolean;
    ekskluderHelg: boolean;
    ekskluderSondag: boolean;
};
type OptionsPatch = Partial<OptionsValue>;

const TIMES: string[] = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);
const BEHANDLING_TYPER = ['AvsluttSaker'];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { searchParams } = new URL(request.url);
    const behandlingType = searchParams.get('behandlingType') ?? '';
    const accessToken = await requireAccessToken(request);
    const behandlingSerier = await getBehandlingSerier(accessToken, behandlingType);
    return { behandlingSerier };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const accessToken = await requireAccessToken(request);
    const formData = await request.formData();
    const intent = String(formData.get('_intent') ?? '');
    if (intent === 'updatePlanlagtStartet') {
        const behandlingId = String(formData.get('behandlingId') ?? '');
        const behandlingCode = String(formData.get('behandlingCode') ?? '');
        const yearMonthDay = String(formData.get('ymd') ?? '');
        const timeOfDay = String(formData.get('time') ?? '');
        const isoLocalDatetimeString = `${yearMonthDay}T${timeOfDay}:00`;
        await endrePlanlagtStartet(accessToken, behandlingId, isoLocalDatetimeString);
        return redirect(`/behandlingserie?behandlingType=${behandlingCode}`);
    }
    const behandlingCode = String(formData.get('behandlingCode') ?? '');
    const regelmessighet = String(formData.get('regelmessighet') ?? '');
    const startTid = String(formData.get('startTid') ?? '');
    const opprettetAv = String(formData.get('opprettetAv') ?? 'VERDANDE');
    const valgteDatoerRaw = String(formData.get('valgteDatoer') ?? '[]');
    const valgteDatoer = JSON.parse(valgteDatoerRaw) as string[];
    await opprettBehandlingSerie(accessToken, behandlingCode, regelmessighet, valgteDatoer, startTid, opprettetAv);
    return redirect(`/behandlingserie?behandlingType=${behandlingCode}`);
};

function buildBookedFromSerier(serier: BehandlingSerieDTO[]) {
    const bookedDates: Date[] = [];
    const yearMonthDaySet = new Set<string>();
    for (const serie of serier || []) {
        for (const behandling of (serie.behandlinger || []) as BehandlingInfoDTO[]) {
            if (!behandling?.planlagtStartet) continue;
            const dateTime = new Date(behandling.planlagtStartet);
            const dateOnly = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
            bookedDates.push(dateOnly);
            yearMonthDaySet.add(toYearMonthDay(dateOnly));
        }
    }
    return { bookedDates, yearMonthDaySet };
}

function isDateRange(value: any): value is DateRange {
    return value && typeof value === 'object' && ('from' in value || 'to' in value);
}

function SeriesHeader({
                          behandlingType,
                          onChange,
                      }: {
    behandlingType: string;
    onChange: (value: string) => void;
}) {
    return (
        <HStack>
            <Select label="Velg behandling" value={behandlingType} onChange={(e) => onChange(e.target.value)}>
                <option value="">Velg behandlingCode</option>
                {BEHANDLING_TYPER.map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </Select>
        </HStack>
    );
}

function RuleControls({
                          value,
                          onChange,
                      }: {
    value: RulesValue;
    onChange: (patch: RulesPatch) => void;
}) {
    return (
        <VStack>
            <RadioGroup
                legend="Velg regelmessighet"
                value={value.regelmessighet}
                onChange={(v) => onChange({ regelmessighet: v as RegelmessighetMode })}
            >
                <Radio value="range">Velg en range fra og til</Radio>
                <Radio value="multiple">Velg diverse datoer</Radio>
            </RadioGroup>

            {value.regelmessighet === 'multiple' && (
                <HStack wrap gap="4">
                    <Select
                        label="Dagvalg"
                        value={value.dayMode}
                        onChange={(e) => {
                            const next = e.target.value as DayMode;
                            onChange({
                                dayMode: next,
                                selectedUkedag: next === 'first-weekday' ? '' : value.selectedUkedag,
                            });
                        }}
                    >
                        <option value="fixed-weekday">Fast ukedag</option>
                        <option value="first-weekday">Første virkedag i periode</option>
                    </Select>

                    <Select
                        label="Velg fast ukedag"
                        value={value.selectedUkedag}
                        onChange={(event) => onChange({ selectedUkedag: event.target.value })}
                        disabled={value.dayMode === 'first-weekday'}
                    >
                        <option value="">Velg ukedag</option>
                        <option value="monday">Mandager</option>
                        <option value="tuesday">Tirsdager</option>
                        <option value="wednesday">Onsdager</option>
                        <option value="thursday">Torsdager</option>
                        <option value="friday">Fredager</option>
                    </Select>

                    <Select
                        label="i antall måneder"
                        value={value.selectAntallMaaneder}
                        onChange={(event) => onChange({ selectAntallMaaneder: event.target.value })}
                        disabled={value.intervalMode !== ''}
                    >
                        <option value="">Velg</option>
                        <option value="1">1 måned</option>
                        <option value="3">3 måneder</option>
                        <option value="6">6 måneder</option>
                        <option value="12">12 måneder</option>
                    </Select>

                    <Select
                        label="Intervall"
                        value={value.intervalMode}
                        onChange={(e) => onChange({ intervalMode: e.target.value as IntervalMode })}
                    >
                        <option value="">Ingen</option>
                        <option value="quarterly">Hvert kvartal</option>
                        <option value="tertial">Hvert tertial</option>
                    </Select>
                </HStack>
            )}
        </VStack>
    );
}

function OptionsRow({
                        value,
                        onChange,
                        visible,
                    }: {
    value: OptionsValue;
    onChange: (patch: OptionsPatch) => void;
    visible: boolean;
}) {
    if (!visible) return null;
    return (
        <HStack gap="6">
            <Checkbox checked={value.includeNextYear} onChange={(e) => onChange({ includeNextYear: e.target.checked })}>
                Inkluder neste år
            </Checkbox>
            <Checkbox checked={value.ekskluderHelligdager} onChange={(e) => onChange({ ekskluderHelligdager: e.target.checked })}>
                Ekskluder helligdager
            </Checkbox>
            <Checkbox checked={!!value.ekskluderHelg} onChange={(e) => onChange({ ekskluderHelg: e.target.checked })}>
                Ekskluder helg
            </Checkbox>
            <Checkbox checked={value.ekskluderSondag} onChange={(e) => onChange({ ekskluderSondag: e.target.checked })}>
                Ekskluder søndager
            </Checkbox>
        </HStack>
    );
}

function CalendarSection({
                             regelmessighet,
                             selectedForPicker,
                             now,
                             endOfHorizon,
                             ekskluderHelg,
                             disabledDates,
                             onSelect,
                             onClear,
                             canClear,
                         }: {
    regelmessighet: RegelmessighetMode;
    selectedForPicker: any;
    now: Date;
    endOfHorizon: Date;
    ekskluderHelg: boolean;
    disabledDates: Date[];
    onSelect: (v: Selection) => void;
    onClear: () => void;
    canClear: boolean;
}) {
    return (
        <VStack>
            <DatePicker.Standalone
                key={regelmessighet + String(endOfHorizon.getFullYear())}
                mode={regelmessighet}
                selected={selectedForPicker}
                fromDate={now}
                toDate={endOfHorizon}
                dropdownCaption
                showWeekNumber
                disableWeekends={ekskluderHelg}
                disabled={disabledDates}
                onSelect={(v: any) => onSelect(v as Selection)}
            />
            <Button variant="secondary" size="small" onClick={onClear} disabled={!canClear} style={{ alignSelf: 'flex-start' }}>
                Avvelg alle datoer
            </Button>
        </VStack>
    );
}

function EditDialog({
                        open,
                        onClose,
                        item,
                        endOfHorizon,
                        ekskluderHelg,
                        disabledDates,
                        onSave,
                    }: {
    open: boolean;
    onClose: () => void;
    item: PlannedItem | null;
    endOfHorizon: Date;
    ekskluderHelg: boolean;
    disabledDates: Date[];
    onSave: (yearMonthDay: string, timeOfDay: string) => void;
}) {
    const [editDate, setEditDate] = useState<Date | undefined>();
    const [editTime, setEditTime] = useState<string>('');
    const [editInput, setEditInput] = useState('');

    useEffect(() => {
        if (!item) return;
        const [year, month, day] = item.yearMonthDay.split('-').map(Number);
        const date = new Date(year, (month ?? 1) - 1, day ?? 1);
        setEditDate(date);
        setEditTime(item.time ?? '10:00');
    }, [item]);

    useEffect(() => {
        setEditInput(editDate ? new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(editDate) : '');
    }, [editDate]);

    function parseNoDate(value: string): Date | undefined {
        const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (!match) return undefined;
        const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
        return date;
    }

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="edit-planlagt-modal">
            <Modal.Header>
                <Heading size="small" level="2" id="edit-planlagt-modal">
                    {(() => {
                        if (!item) return 'Endre planlagt kjøring';
                        const [year, month, day] = item.yearMonthDay.split('-').map(Number);
                        const originalDate = new Date(year, (month ?? 1) - 1, day ?? 1);
                        const dateStr = new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(originalDate);
                        const timeStr = item.time ? ` kl ${item.time}` : '';
                        return `Planlagt kjøring ${dateStr}${timeStr}`;
                    })()}
                </Heading>
            </Modal.Header>

            <Modal.Body>
                <VStack gap="4">
                    <HStack gap="4" wrap>
                        <DatePicker
                            mode="single"
                            selected={editDate}
                            fromDate={new Date()}
                            toDate={endOfHorizon}
                            disableWeekends={ekskluderHelg}
                            disabled={disabledDates}
                            onSelect={(date) => setEditDate(date as Date | undefined)}
                        >
                            <DatePicker.Input
                                label="Ny dato"
                                placeholder="dd.mm.åååå"
                                value={editInput}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setEditInput(v);
                                    setEditDate(parseNoDate(v));
                                }}
                            />
                        </DatePicker>

                        <Select label="Tid" value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                            {TIMES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {item?.behandlingId} {item?.behandlingCode ? `• ${item?.behandlingCode}` : ''} {item?.serieId ? ` • Serie ${item.serieId}` : ''}
                    </div>
                </VStack>
            </Modal.Body>

            <Modal.Footer>
                <HStack gap="2">
                    <Button onClick={() => editDate && editTime && onSave(toYearMonthDay(editDate), editTime)} disabled={!editDate || !editTime}>
                        Lagre dato
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Lukk
                    </Button>
                </HStack>
            </Modal.Footer>
        </Modal>
    );
}

export default function BehandlingOpprett_index() {
    const now = new Date();
    const [includeNextYear, setIncludeNextYear] = useState(false);
    const endOfHorizon = useMemo(() => {
        const year = new Date().getFullYear() + (includeNextYear ? 1 : 0);
        return new Date(year, 11, 31);
    }, [includeNextYear]);

    const [regelmessighet, setRegelmessighet] = useState<RegelmessighetMode>('range');
    const [selection, setSelection] = useState<Selection>(undefined);
    const [selectedTime, setSelectedTime] = useState('');
    const [dayMode, setDayMode] = useState<DayMode>('fixed-weekday');
    const [selectedUkedag, setSelectedUkedag] = useState('');
    const [selectAntallMaaneder, setSelectAntallMaaneder] = useState('');
    const [intervalMode, setIntervalMode] = useState<IntervalMode>('');
    const [ekskluderHelg, setEkskluderHelg] = useState(true);
    const [ekskluderHelligdager, setEkskluderHelligdager] = useState(true);
    const [ekskluderSondag, setEkskluderSondag] = useState(true);

    const createFetcher = useFetcher();
    const [searchParams, setSearchParams] = useSearchParams();
    const [behandlingType, setBehandlingType] = useState(searchParams.get('behandlingType') || '');
    const { behandlingSerier } = useLoaderData<{ behandlingSerier: BehandlingSerieDTO[] }>();

    const helligdagsdata = useMemo(() => byggHelligdagsdata(includeNextYear), [includeNextYear]);
    const bookedData = useMemo(() => buildBookedFromSerier(behandlingSerier || []), [behandlingSerier]);

    useEffect(() => {
        if (regelmessighet !== 'multiple') return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let generatedDates: Date[] = [];
        if (dayMode === 'first-weekday') {
            if (intervalMode === 'quarterly') {
                generatedDates = quarterlyStartDates(today, endOfHorizon).map((start) => firstBusinessDayOnOrAfter(start));
            } else if (intervalMode === 'tertial') {
                generatedDates = tertialStartDates(today, endOfHorizon).map((start) => firstBusinessDayOnOrAfter(start));
            } else if (selectAntallMaaneder) {
                const months = parseInt(selectAntallMaaneder, 10);
                if (months > 0) {
                    const starts = monthlyAnchoredStartDates(today, months, endOfHorizon);
                    generatedDates = starts.map((start) => firstBusinessDayOnOrAfter(start));
                }
            }
        } else {
            if (!selectedUkedag) return;
            const weekdayNumber = getWeekdayNumber(selectedUkedag);
            if (weekdayNumber == null) return;
            if (intervalMode === 'quarterly') {
                generatedDates = quarterlyStartDates(today, endOfHorizon).map((start) => firstWeekdayOnOrAfter(start, weekdayNumber));
            } else if (intervalMode === 'tertial') {
                generatedDates = tertialStartDates(today, endOfHorizon).map((start) => firstWeekdayOnOrAfter(start, weekdayNumber));
            } else if (selectAntallMaaneder) {
                const months = parseInt(selectAntallMaaneder, 10);
                if (months > 0) {
                    const end = addMonths(today, months);
                    const clippedEnd = end > endOfHorizon ? endOfHorizon : end;
                    generatedDates = allWeekdaysInRange(weekdayNumber, today, clippedEnd);
                }
            }
        }
        const finalDates =
            dayMode === 'fixed-weekday' && !intervalMode && ekskluderHelg
                ? generatedDates.filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
                : generatedDates;
        setSelection(finalDates);
    }, [regelmessighet, dayMode, selectedUkedag, selectAntallMaaneder, intervalMode, ekskluderHelg, endOfHorizon]);

    const handleBehandlingType = useCallback(
        (value: string) => {
            setBehandlingType(value);
            setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                if (value) params.set('behandlingType', value);
                else params.delete('behandlingType');
                return params;
            });
        },
        [setSearchParams]
    );

    const selectedForPicker = useMemo(() => {
        if (regelmessighet === 'multiple') return Array.isArray(selection) ? selection : [];
        return isDateRange(selection) ? selection : undefined;
    }, [regelmessighet, selection]);

    const previewDatoer = useMemo(() => {
        const base = buildValgteDatoer(selection as any, regelmessighet as any, {
            ekskluderHelg,
            ekskluderHelligdager,
            ekskluderSondag,
            endOfHorizon,
            helligdagerYearMonthDaySet: helligdagsdata.yearMonthDaySet,
        });
        return base.filter((yearMonthDay) => !bookedData.yearMonthDaySet.has(yearMonthDay));
    }, [selection, regelmessighet, ekskluderHelg, endOfHorizon, helligdagsdata.yearMonthDaySet, ekskluderHelligdager, bookedData.yearMonthDaySet, ekskluderSondag]);

    const canSave = Boolean(behandlingType && selectedTime && previewDatoer.length > 0);

    const sendBehandlingSerieTilAction = useCallback(() => {
        const formData = new FormData();
        formData.set('behandlingCode', behandlingType ?? '');
        formData.set('regelmessighet', regelmessighet);
        formData.set('valgteDatoer', JSON.stringify(previewDatoer));
        formData.set('startTid', selectedTime);
        formData.set('opprettetAv', 'VERDANDE');
        createFetcher.submit(formData, { method: 'post' });
    }, [behandlingType, regelmessighet, previewDatoer, selectedTime, createFetcher]);

    const handleClearAll = useCallback(() => {
        if (regelmessighet === 'multiple') setSelection([]);
        else setSelection(undefined);
    }, [regelmessighet]);

    const disabledDatesForCalendar = useMemo(
        () =>
            buildDisabledDates({
                fromDate: now,
                toDate: endOfHorizon,
                bookedDates: bookedData.bookedDates,
                helligdagsdatoer: helligdagsdata.holidayDates,
                ekskluderHelg,
                ekskluderHelligdager,
                ekskluderSondag,
            }),
        [now, endOfHorizon, bookedData.bookedDates, helligdagsdata.holidayDates, ekskluderHelg, ekskluderHelligdager, ekskluderSondag]
    );

    const plannedItems: PlannedItem[] = useMemo(() => {
        const items: PlannedItem[] = [];
        for (const serie of behandlingSerier ?? []) {
            for (const behandling of serie.behandlinger ?? []) {
                if (!behandling?.planlagtStartet) continue;
                const dateTime = new Date(behandling.planlagtStartet);
                const yearMonthDay = toYearMonthDay(dateTime);
                const time = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`;
                items.push({
                    id: behandling.behandlingId?.toString() ?? `${yearMonthDay}-${time}`,
                    yearMonthDay,
                    time,
                    status: behandling.status,
                    behandlingId: behandling.behandlingId?.toString(),
                    behandlingCode: behandling.behandlingCode,
                    serieId: serie.behandlingSerieId,
                });
            }
        }
        return items.sort((a, b) => (a.yearMonthDay + (a.time ?? '')) < (b.yearMonthDay + (b.time ?? '')) ? -1 : 1);
    }, [behandlingSerier]);

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<PlannedItem | null>(null);
    const updateFetcher = useFetcher();
    const navigate = useNavigate();

    const openEdit = useCallback((item: PlannedItem) => {
        setEditing(item);
        setEditOpen(true);
    }, []);

    const saveEdit = useCallback(
        (yearMonthDay: string, timeOfDay: string) => {
            if (!editing) return;
            const formData = new FormData();
            formData.set('_intent', 'updatePlanlagtStartet');
            formData.set('behandlingId', editing.behandlingId ?? '');
            formData.set('behandlingCode', editing.behandlingCode ?? '');
            formData.set('ymd', yearMonthDay);
            formData.set('time', timeOfDay);
            updateFetcher.submit(formData, { method: 'post' });
            setEditOpen(false);
        },
        [editing, updateFetcher]
    );

    const openBehandling = useCallback(() => {
        if (editing?.behandlingId) navigate(`/behandling/${editing.behandlingId}`);
    }, [editing, navigate]);

    return (
        <VStack gap="6">
            <Heading size="medium" level="1">Behandlingserie</Heading>

            <SeriesHeader behandlingType={behandlingType} onChange={handleBehandlingType} />

            {behandlingType !== '' && (
                <>
                    <Heading size="medium" level="1">Eksisterende planlagte behandlinger</Heading>
                    <PlanlagteDatoerPreview items={plannedItems} onClickItem={openEdit} />

                    <Heading size="medium" level="1">Opprett ny serie</Heading>

                    <HStack>
                        <Select label="Velg når på døgnet behandlingen skal kjøres" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                            <option value="">Velg tid</option>
                            {TIMES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    <RuleControls
                        value={{ regelmessighet, dayMode, selectedUkedag, selectAntallMaaneder, intervalMode }}
                        onChange={(patch) => {
                            if (patch.regelmessighet !== undefined) {
                                setRegelmessighet(patch.regelmessighet);
                                setSelection(patch.regelmessighet === 'multiple' ? [] : undefined);
                            }
                            if (patch.dayMode !== undefined) setDayMode(patch.dayMode);
                            if (patch.selectedUkedag !== undefined) setSelectedUkedag(patch.selectedUkedag);
                            if (patch.selectAntallMaaneder !== undefined) setSelectAntallMaaneder(patch.selectAntallMaaneder);
                            if (patch.intervalMode !== undefined) setIntervalMode(patch.intervalMode);
                        }}
                    />

                    <OptionsRow
                        value={{ includeNextYear, ekskluderHelligdager, ekskluderHelg, ekskluderSondag }}
                        onChange={(patch) => {
                            if (patch.includeNextYear !== undefined) setIncludeNextYear(patch.includeNextYear);
                            if (patch.ekskluderHelligdager !== undefined) setEkskluderHelligdager(patch.ekskluderHelligdager);
                            if (patch.ekskluderHelg !== undefined) setEkskluderHelg(patch.ekskluderHelg);
                            if (patch.ekskluderSondag !== undefined) setEkskluderSondag(patch.ekskluderSondag);
                        }}
                        visible={regelmessighet === 'range' || regelmessighet === 'multiple'}
                    />

                    <CalendarSection
                        regelmessighet={regelmessighet}
                        selectedForPicker={selectedForPicker as any}
                        now={now}
                        endOfHorizon={endOfHorizon}
                        ekskluderHelg={ekskluderHelg}
                        disabledDates={disabledDatesForCalendar}
                        onSelect={setSelection}
                        onClear={handleClearAll}
                        canClear={
                            (regelmessighet === 'multiple' && Array.isArray(selection) && selection.length > 0) ||
                            (regelmessighet === 'range' && isDateRange(selection))
                        }
                    />

                    <ValgteDatoerPreview yearMonthDayDates={previewDatoer} time={selectedTime} />

                    <HStack>
                        <Button type="button" onClick={sendBehandlingSerieTilAction} loading={createFetcher.state === 'submitting'} disabled={!canSave}>
                            Lagre serie
                        </Button>
                    </HStack>

                    <EditDialog
                        open={editOpen}
                        onClose={() => setEditOpen(false)}
                        item={editing}
                        endOfHorizon={endOfHorizon}
                        ekskluderHelg={ekskluderHelg}
                        disabledDates={disabledDatesForCalendar}
                        onSave={saveEdit}
                    />

                    {editing?.behandlingId && (
                        <Button variant="secondary" onClick={openBehandling}>
                            Åpne behandling
                        </Button>
                    )}
                </>
            )}
        </VStack>
    );
}
