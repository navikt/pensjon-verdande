import { type LoaderFunctionArgs, useFetcher, useLoaderData, useNavigate, useSearchParams } from 'react-router';
import { type ActionFunctionArgs, redirect } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Button,
    DatePicker,
    RadioGroup,
    Radio,
    Checkbox,
    Select,
    Heading,
    VStack,
    HStack,
    Modal,
} from '@navikt/ds-react';
import 'chart.js/auto';
import { requireAccessToken } from '~/services/auth.server';
import { getBehandlingSerier, opprettBehandlingSerie, endrePlanlagtStartet } from '~/behandlingserie/behandlingserie.server';
import type { BehandlingSerieDTO, BehandlingInfoDTO } from '~/types';
import {
    addMonths,
    allWeekdaysInRange,
    buildHolidayData,
    buildValgteDatoer,
    firstBusinessDayOnOrAfter,
    firstWeekdayOnOrAfter,
    monthlyAnchoredStartDates,
    quarterlyStartDates,
    tertialStartDates,
    getWeekdayNumber,
    toYmd,
    buildDisabledDates,
} from './seriekalenderUtils';
import ValgteDatoerPreview from '~/behandlingserie/valgteDatoerPreview';
import PlanlagteDatoerPreview, { type PlannedItem } from '~/behandlingserie/planlagteDatoerPreview';

type RegelmessighetMode = 'range' | 'multiple';
type DateRange = { from?: Date; to?: Date };
type Selection = DateRange | Date[] | undefined;
type IntervalMode = '' | 'quarterly' | 'tertial';
type DayMode = 'fixed-weekday' | 'first-weekday';

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
        const ymd = String(formData.get('ymd') ?? '');
        const time = String(formData.get('time') ?? '');
        const isoLocalDatetimeString = `${ymd}T${time}:00`;
        await endrePlanlagtStartet(accessToken, behandlingId, isoLocalDatetimeString);
        return redirect(`/behandlingserie?behandlingType=${behandlingCode}`);
    }
    const behandlingCode = String(formData.get('behandlingCode') ?? '');
    const regelmessighet = String(formData.get('regelmessighet') ?? '');
    const startTid = String(formData.get('startTid') ?? '');
    const opprettetAv = String(formData.get('opprettetAv') ?? 'VERDANDE');
    const valgteDatoerRaw = String(formData.get('valgteDatoer') ?? '[]');
    const valgteDatoer = JSON.parse(valgteDatoerRaw) as string[];
    await opprettBehandlingSerie(
        accessToken,
        behandlingCode,
        regelmessighet,
        valgteDatoer,
        startTid,
        opprettetAv,
    );
    return redirect(`/behandlingserie?behandlingType=${behandlingCode}`);
};

function buildBookedFromSerier(serier: BehandlingSerieDTO[]) {
    const dates: Date[] = [];
    const ymdSet = new Set<string>();
    for (const serie of serier || []) {
        for (const b of (serie.behandlinger || []) as BehandlingInfoDTO[]) {
            if (!b?.planlagtStartet) continue;
            const dt = new Date(b.planlagtStartet);
            const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            dates.push(d);
            ymdSet.add(toYmd(d));
        }
    }
    return { dates, ymdSet };
}

function isDateRange(x: any): x is DateRange {
    return x && typeof x === 'object' && ('from' in x || 'to' in x);
}

export default function BehandlingOpprett_index() {
    const now = new Date();
    const [includeNextYear, setIncludeNextYear] = useState(false);
    const endOfHorizon = useMemo(() => {
        const now = new Date();
        const endYear = now.getFullYear() + (includeNextYear ? 1 : 0);
        return new Date(endYear, 11, 31);
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

    const fetcher = useFetcher();
    const [searchParams, setSearchParams] = useSearchParams();
    const [behandlingType, setBehandlingType] = useState(searchParams.get('behandlingType') || '');
    const behandlingTyper = ['AvsluttSaker'];

    const { behandlingSerier } = useLoaderData<{ behandlingSerier: BehandlingSerieDTO[] }>();
    const holidayData = useMemo(() => buildHolidayData(includeNextYear), [includeNextYear]);
    const bookedData = useMemo(() => buildBookedFromSerier(behandlingSerier || []), [behandlingSerier]);

    useEffect(() => {
        if (regelmessighet !== 'multiple') return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dates: Date[] = [];
        if (dayMode === 'first-weekday') {
            if (intervalMode === 'quarterly') {
                dates = quarterlyStartDates(today, endOfHorizon).map(s => firstBusinessDayOnOrAfter(s));
            } else if (intervalMode === 'tertial') {
                dates = tertialStartDates(today, endOfHorizon).map(s => firstBusinessDayOnOrAfter(s));
            } else if (selectAntallMaaneder) {
                const months = parseInt(selectAntallMaaneder, 10);
                if (months > 0) {
                    const starts = monthlyAnchoredStartDates(today, months, endOfHorizon);
                    dates = starts.map(s => firstBusinessDayOnOrAfter(s));
                }
            }
        } else {
            if (!selectedUkedag) return;
            const weekdayNum = getWeekdayNumber(selectedUkedag);
            if (weekdayNum == null) return;
            if (intervalMode === 'quarterly') {
                dates = quarterlyStartDates(today, endOfHorizon).map(s => firstWeekdayOnOrAfter(s, weekdayNum));
            } else if (intervalMode === 'tertial') {
                dates = tertialStartDates(today, endOfHorizon).map(s => firstWeekdayOnOrAfter(s, weekdayNum));
            } else if (selectAntallMaaneder) {
                const months = parseInt(selectAntallMaaneder, 10);
                if (months > 0) {
                    const end = addMonths(today, months);
                    const clippedEnd = end > endOfHorizon ? endOfHorizon : end;
                    dates = allWeekdaysInRange(weekdayNum, today, clippedEnd);
                }
            }
        }
        const finalDates =
            dayMode === 'fixed-weekday' && !intervalMode && ekskluderHelg
                ? dates.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
                : dates;
        setSelection(finalDates);
    }, [regelmessighet, dayMode, selectedUkedag, selectAntallMaaneder, intervalMode, ekskluderHelg, endOfHorizon]);

    function handleBehandlingType(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        setBehandlingType(value);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (value) params.set('behandlingType', value);
            else params.delete('behandlingType');
            return params;
        });
    }

    const selectedForPicker = useMemo(() => {
        if (regelmessighet === 'multiple') {
            return Array.isArray(selection) ? selection : [];
        }
        return isDateRange(selection) ? selection : undefined;
    }, [regelmessighet, selection]);

    const previewDatoer = useMemo(() => {
        const base = buildValgteDatoer(
            selection as any,
            regelmessighet as any,
            {
                ekskluderHelg,
                ekskluderHelligdager,
                ekskluderSondag,
                endOfHorizon,
                holidayYmdSet: holidayData.ymdSet,
            }
        );
        return base.filter(ymd => !bookedData.ymdSet.has(ymd));
    }, [selection, regelmessighet, ekskluderHelg, endOfHorizon, holidayData.ymdSet, ekskluderHelligdager, bookedData.ymdSet, ekskluderSondag]);

    const canSave = Boolean(behandlingType && selectedTime && previewDatoer.length > 0);

    function sendBehandlingSerieTilAction() {
        const formData = new FormData();
        formData.set('behandlingCode', behandlingType ?? '');
        formData.set('regelmessighet', regelmessighet);
        formData.set('valgteDatoer', JSON.stringify(previewDatoer));
        formData.set('startTid', selectedTime);
        formData.set('opprettetAv', 'VERDANDE');
        fetcher.submit(formData, { method: 'post' });
    }

    const handleClearAll = () => {
        if (regelmessighet === 'multiple') setSelection([]);
        else setSelection(undefined);
    };

    const disabledDatesForCalendar = useMemo(() => {
        return buildDisabledDates({
            fromDate: now,
            toDate: endOfHorizon,
            bookedDates: bookedData.dates,
            holidayDates: holidayData.dates,
            ekskluderHelg,
            ekskluderHelligdager,
            ekskluderSondag,
        });
    }, [now, endOfHorizon, bookedData.dates, holidayData.dates, ekskluderHelg, ekskluderHelligdager, ekskluderSondag]);

    const plannedItems: PlannedItem[] = useMemo(() => {
        const items: PlannedItem[] = [];
        for (const serie of (behandlingSerier ?? [])) {
            for (const b of (serie.behandlinger ?? [])) {
                if (!b?.planlagtStartet) continue;
                const d = new Date(b.planlagtStartet);
                const ymd = toYmd(d);
                const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                items.push({
                    id: b.behandlingId?.toString() ?? `${ymd}-${time}`,
                    ymd,
                    time,
                    status: b.status,
                    behandlingId: b.behandlingId?.toString(),
                    behandlingCode: b.behandlingCode,
                    serieId: serie.behandlingSerieId,
                });
            }
        }
        return items.sort((a, b) => (a.ymd + (a.time ?? '')) < (b.ymd + (b.time ?? '')) ? -1 : 1);
    }, [behandlingSerier]);

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<PlannedItem | null>(null);
    const [editDate, setEditDate] = useState<Date | undefined>();
    const [editTime, setEditTime] = useState<string>('');
    const [editInput, setEditInput] = useState('');

    useEffect(() => {
        setEditInput(editDate ? new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(editDate) : '');
    }, [editDate]);

    function parseNoDate(s: string): Date | undefined {
        const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (!m) return undefined;
        const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
        const d = new Date(yyyy, mm - 1, dd);
        if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return undefined;
        return d;
    }

    function handleOpenEdit(item: PlannedItem) {
        setEditing(item);
        const [y, m, d] = item.ymd.split('-').map(Number);
        setEditDate(new Date(y, (m ?? 1) - 1, d ?? 1));
        setEditTime(item.time ?? '10:00');
        setEditOpen(true);
    }

    function handleCloseEdit() {
        setEditOpen(false);
        setEditing(null);
    }

    function handleSaveEdit() {
        if (!editing || !editDate || !editTime) return;
        const formData = new FormData();
        formData.set('_intent', 'updatePlanlagtStartet');
        formData.set('behandlingId', editing.behandlingId ?? '');
        formData.set('behandlingCode', editing.behandlingCode ?? '');
        formData.set('ymd', toYmd(editDate));
        formData.set('time', editTime);
        fetcher.submit(formData, { method: 'post' });
        setEditOpen(false);
    }

    const navigate = useNavigate();

    function handleOpen() {
        if (editing?.behandlingId) {
            navigate(`/behandling/${editing.behandlingId}`);
        }
    }

    return (
        <VStack gap="6">
            <Heading size="medium" level="1">Behandlingserie</Heading>

            <HStack>
                <Select label="Velg behandling" value={behandlingType} onChange={handleBehandlingType}>
                    <option value="">Velg behandlingCode</option>
                    {behandlingTyper.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
            </HStack>

            {behandlingType !== '' && (
                <>
                    <Heading size="medium" level="1">Eksisterende planlagte behandlinger</Heading>
                    <PlanlagteDatoerPreview
                        items={plannedItems}
                        onClickItem={handleOpenEdit}
                    />

                    <Heading size="medium" level="1">Opprett ny serie</Heading>
                    <HStack>
                        <Select
                            label="Velg når på døgnet behandlingen skal kjøres"
                            value={selectedTime}
                            onChange={e => setSelectedTime(e.target.value)}
                        >
                            <option value="">Velg tid</option>
                            {times.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </Select>
                    </HStack>

                    <VStack>
                        <RadioGroup
                            legend="Velg regelmessighet"
                            value={regelmessighet}
                            onChange={v => {
                                const mode = v as RegelmessighetMode;
                                setRegelmessighet(mode);
                                if (mode === 'multiple') setSelection([]);
                                else setSelection(undefined);
                            }}
                        >
                            <Radio value="range">Velg en range fra og til</Radio>
                            <Radio value="multiple">Velg diverse datoer</Radio>
                        </RadioGroup>

                        {regelmessighet === 'multiple' && (
                            <HStack wrap gap="4">
                                <Select
                                    label="Dagvalg"
                                    value={dayMode}
                                    onChange={e => {
                                        const v = e.target.value as DayMode;
                                        setDayMode(v);
                                        if (v === 'first-weekday') setSelectedUkedag('');
                                    }}
                                >
                                    <option value="fixed-weekday">Fast ukedag</option>
                                    <option value="first-weekday">Første virkedag i periode</option>
                                </Select>

                                <Select
                                    label="Velg fast ukedag"
                                    value={selectedUkedag}
                                    onChange={event => setSelectedUkedag(event.target.value)}
                                    disabled={dayMode === 'first-weekday'}
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
                                    value={selectAntallMaaneder}
                                    onChange={event => setSelectAntallMaaneder(event.target.value)}
                                    disabled={intervalMode !== ''}
                                >
                                    <option value="">Velg</option>
                                    <option value="1">1 måned</option>
                                    <option value="3">3 måneder</option>
                                    <option value="6">6 måneder</option>
                                    <option value="12">12 måneder</option>
                                </Select>

                                <Select
                                    label="Intervall"
                                    value={intervalMode}
                                    onChange={e => setIntervalMode(e.target.value as IntervalMode)}
                                >
                                    <option value="">Ingen</option>
                                    <option value="quarterly">Hvert kvartal</option>
                                    <option value="tertial">Hvert tertial</option>
                                </Select>
                            </HStack>
                        )}

                        {(regelmessighet === 'range' || regelmessighet === 'multiple') && (
                            <HStack gap="6">
                                <Checkbox checked={includeNextYear} onChange={e => setIncludeNextYear(e.target.checked)}>
                                    Inkluder neste år
                                </Checkbox>
                                <Checkbox checked={ekskluderHelligdager} onChange={e => setEkskluderHelligdager(e.target.checked)}>
                                    Ekskluder helligdager
                                </Checkbox>
                                <Checkbox checked={!!ekskluderHelg} onChange={e => setEkskluderHelg(e.target.checked)}>
                                    Ekskluder helg
                                </Checkbox>
                                <Checkbox checked={ekskluderSondag} onChange={e => setEkskluderSondag(e.target.checked)}>
                                    Ekskluder søndager
                                </Checkbox>
                            </HStack>
                        )}
                    </VStack>

                    <VStack>
                        <DatePicker.Standalone
                            key={regelmessighet + String(includeNextYear)}
                            mode={regelmessighet}
                            selected={selectedForPicker as any}
                            fromDate={now}
                            toDate={endOfHorizon}
                            dropdownCaption
                            showWeekNumber
                            disableWeekends={ekskluderHelg}
                            disabled={disabledDatesForCalendar}
                            onSelect={(v: any) => setSelection(v as Selection)}
                        />
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={handleClearAll}
                            disabled={
                                (regelmessighet === 'multiple' && Array.isArray(selection) && selection.length === 0) ||
                                (regelmessighet === 'range' && !isDateRange(selection))
                            }
                            style={{ alignSelf: 'flex-start' }}
                        >
                            Avvelg alle datoer
                        </Button>
                    </VStack>

                    <ValgteDatoerPreview ymdDates={previewDatoer} time={selectedTime} />

                    <HStack>
                        <Button
                            type="button"
                            onClick={sendBehandlingSerieTilAction}
                            loading={fetcher.state === 'submitting'}
                            disabled={!canSave}
                        >
                            Lagre serie
                        </Button>
                    </HStack>

                    <Modal open={editOpen} onClose={handleCloseEdit} aria-labelledby="edit-planlagt-modal">
                        <Modal.Header>
                            <Heading size="small" level="2" id="edit-planlagt-modal">
                                {(() => {
                                    if (!editing) return 'Endre planlagt kjøring';
                                    const [y, m, d] = editing.ymd.split('-').map(Number);
                                    const origDate = new Date(y, (m ?? 1) - 1, d ?? 1);
                                    const dateStr = new Intl.DateTimeFormat('no-NO', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    }).format(origDate);
                                    const timeStr = editing.time ? ` kl ${editing.time}` : '';
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
                                        disabled={disabledDatesForCalendar}
                                        onSelect={(d) => setEditDate(d as Date | undefined)}
                                    >
                                        <DatePicker.Input
                                            label="Ny dato"
                                            placeholder="dd.mm.åååå"
                                            value={editInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setEditInput(v);
                                                const parsed = parseNoDate(v);
                                                setEditDate(parsed);
                                            }}
                                        />
                                    </DatePicker>

                                    <Select
                                        label="Tid"
                                        value={editTime}
                                        onChange={(e) => setEditTime(e.target.value)}
                                    >
                                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                </HStack>

                                <div style={{ fontSize: 12, opacity: 0.7 }}>
                                    Behandling: {editing?.behandlingId} {editing?.behandlingCode ? `• ${editing?.behandlingCode}` : ''}
                                    {editing?.serieId ? ` • Serie ${editing.serieId}` : ''}
                                </div>
                            </VStack>
                        </Modal.Body>

                        <Modal.Footer>
                            <HStack gap="2">
                                <Button onClick={handleSaveEdit} disabled={!editDate || !editTime}>Lagre dato</Button>
                                <Button variant="secondary" onClick={handleOpen}>
                                    Åpne behandling
                                </Button>
                            </HStack>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </VStack>
    );
}

const times: string[] = [];
for (let minutes = 0; minutes < 24 * 60; minutes += 60) {
    const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    times.push(`${hrs}:${mins}`);
}
