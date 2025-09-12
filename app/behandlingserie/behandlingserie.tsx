import { type LoaderFunctionArgs, useFetcher, useLoaderData, useSearchParams} from 'react-router';
import {useState} from 'react';
import {Button, DatePicker, RadioGroup, Radio, Checkbox, Select, Table, Heading, Skeleton} from '@navikt/ds-react';
import {type ActionFunctionArgs, redirect} from 'react-router';
import {requireAccessToken} from '~/services/auth.server';
import 'chart.js/auto';
import {getBehandlingSerier, opprettBehandlingSerie} from '~/behandlingserie/behandlingserie.server';
import type {BehandlingDto} from "~/types";

type Mode = 'single' | 'range' | 'multiple';
type DateRange = { from?: Date; to?: Date };
type Selection = Date | DateRange | Date[] | undefined;

export const loader = async ({request}: LoaderFunctionArgs) => {
    const {searchParams} = new URL(request.url);
    const behandlingType = searchParams.get('behandlingType') ?? '';

    const accessToken = await requireAccessToken(request);
    const behandlingSerier = await getBehandlingSerier(accessToken, behandlingType);

    return {behandlingSerier};
};

export const action = async ({request}: ActionFunctionArgs) => {
    const accessToken = await requireAccessToken(request);
    const data = await request.json();

    const valgteDatoer: string[] = Array.isArray(data.valgteDatoer)
        ? data.valgteDatoer.map((s: string) => s.split('T')[0])
        : [];

    const response = await opprettBehandlingSerie(
        accessToken,
        data.behandlingCode,
        data.regelmessighet,
        valgteDatoer,
        data.startTid,
        data.opprettetAv,
    );
    return redirect(`/behandlingserie?behandlingType=${data.behandlingCode}`);
};

export default function BehandlingOpprett_index() {
    const year = new Date().getFullYear();
    const defaultStartdato = new Date(`1 May ${year}`);
    const [selection, setSelection] = useState<Selection>(defaultStartdato);
    const [selectedTime, setSelectedTime] = useState('');
    const [hyppighet, setHyppighet] = useState<Mode>('single');
    const [ekskluderHelg, setEkskluderHelg] = useState<boolean | undefined>(true);
    const fetcher = useFetcher();

    const [searchParams, setSearchParams] = useSearchParams();
    const [behandlingType, setBehandlingType] = useState(searchParams.get('behandlingType') || '');
    const behandlingTyper = ['FinnSakerSomSkalAvsluttes', 'ReguleringUttrekk'];

    const handleBehandlingType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setBehandlingType(value);
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (value) params.set('behandlingType', value);
            else params.delete('behandlingType');
            return params;
        });
    };

    const {behandlingSerier} = useLoaderData<typeof loader>();

    function sendBehandlingSerieTilAction() {
        fetcher.submit(
            {
                behandlingCode: behandlingType ?? '',
                regelmessighet: 'daglig',
                valgteDatoer: selectionToDateStrings(selection),
                startTid: selectedTime,
                opprettetAv: 'VERDANDE'
            },
            {
                action: '',
                method: 'POST',
                encType: 'application/json',
            },
        );
    }

    return (
        <div>
            <h1>Opprett behandling i serie</h1>
            <Table size="small" style={{maxWidth: '1000px'}}>
                <Table.Body>
                    <Table.Row shadeOnHover={false}>
                        <Table.DataCell colSpan={1}>
                            <Select label="Velg behandling" onChange={handleBehandlingType}>
                                <option value="">Velg behandlingCode</option>
                                {behandlingTyper.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Select>
                        </Table.DataCell>
                    </Table.Row>
                    <Table.Row shadeOnHover={false}>
                        <Table.DataCell colSpan={2}>
                            <Checkbox
                                value="true"
                                checked={ekskluderHelg}
                                onChange={e => setEkskluderHelg(e.target.checked)}
                            >
                                Ekskluder helg
                            </Checkbox>
                        </Table.DataCell>
                    </Table.Row>
                    <Table.Row shadeOnHover={false}>
                        <Table.DataCell>
                            <RadioGroup
                                legend="Velg hyppighet"
                                value={hyppighet}
                                onChange={value => {
                                    const v = value as Mode;
                                    setHyppighet(v);
                                    if (v === 'single') setSelection(defaultStartdato);
                                    if (v === 'range') setSelection(undefined);
                                    if (v === 'multiple') setSelection([]);
                                }}
                            >
                                <Radio value="range">Hver ukedag fra og til</Radio>
                                <Radio value="multiple">Velg diverse datoer</Radio>
                            </RadioGroup>
                        </Table.DataCell>
                        <Table.DataCell>
                            <DatePicker.Standalone
                                key={hyppighet}
                                mode={hyppighet}
                                min={1}
                                max={100}
                                fromDate={new Date()}
                                dropdownCaption
                                showWeekNumber
                                disableWeekends={ekskluderHelg}
                                onSelect={(value: any) => setSelection(value as Selection)}
                            />
                        </Table.DataCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.DataCell colSpan={1}>
                            <Select
                                label="Velg når på døgnet behandlingen skal kjøres"
                                value={selectedTime}
                                onChange={e => setSelectedTime(e.target.value)}
                            >
                                <option value="">Select time</option>
                                {times.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </Select>
                        </Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <p>
                <Button
                    type="button"
                    onClick={sendBehandlingSerieTilAction}
                    loading={fetcher.state === 'submitting'}
                >
                    Lagre serie
                </Button>
            </p>

            <h2>Lagrede serier for denne behandlingstypen</h2>
            <Table size="large" zebraStripes>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Behandling</Table.HeaderCell>
                        <Table.HeaderCell>SerieId</Table.HeaderCell>
                        <Table.HeaderCell>Planlagt startet</Table.HeaderCell>
                        <Table.HeaderCell>Endre planlagt startet</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                {behandlingSerier.length > 0 && (
                    <Table.Body>
                        {behandlingSerier.map((
                            {
                                type,
                                behandlingSerieId,
                                planlagtStartet,
                            }: BehandlingDto,
                            i: number
                        ) => (
                            <Table.Row key={behandlingSerieId || i} shadeOnHover={false}>
                                <Table.HeaderCell scope="row">{type}</Table.HeaderCell>
                                <Table.DataCell>{behandlingSerieId}</Table.DataCell>
                                <Table.DataCell>{planlagtStartet}</Table.DataCell>
                                <Table.DataCell>
                                    <Button variant="primary">
                                        Endre planlagt startet
                                    </Button>
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                )}
            </Table>
        </div>
    );
}

function formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
}
function selectionToDateStrings(selection: Selection): string[] {
    if (!selection) return [];
    if (selection instanceof Date) return [formatDate(selection)];
    if (Array.isArray(selection)) {
        return selection
            .filter(Boolean)
            .map(v => (v instanceof Date ? v : new Date(v)))
            .map(formatDate);
    }
    if (typeof selection === 'object' && 'from' in selection) {
        const {from, to} = selection as DateRange;
        if (from && to) {
            const out: string[] = [];
            const cur = new Date(from);
            while (cur <= to) {
                out.push(formatDate(cur));
                cur.setDate(cur.getDate() + 1);
            }
            return out;
        }
        if (from) return [formatDate(from)];
        return [];
    }
    return [];
}

const times: string[] = [];
for (let minutes = 0; minutes < 24 * 60; minutes += 60) {
    const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    times.push(`${hrs}:${mins}`);
}