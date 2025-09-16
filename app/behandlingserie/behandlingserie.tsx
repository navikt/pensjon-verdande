import {type LoaderFunctionArgs, useFetcher, useLoaderData, useSearchParams} from 'react-router';
import {useState} from 'react';
import {
    Button,
    DatePicker,
    RadioGroup,
    Radio,
    Checkbox,
    Select,
    Table,
    Heading,
    VStack, HStack
} from '@navikt/ds-react';
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
    const formData = await request.formData();

    const behandlingCode = String(formData.get('behandlingCode') ?? '');
    const regelmessighet = String(formData.get('regelmessighet') ?? 'VILKÅRLIG');
    const startTid = String(formData.get('startTid') ?? '');
    const opprettetAv = String(formData.get('opprettetAv') ?? 'VERDANDE');

    const valgteDatoerRaw = String(formData.get('valgteDatoer') ?? '[]');
    const valgteDatoer = JSON.parse(valgteDatoerRaw) as string[]; // forventer ["2025-09-16", ...]

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
        const formData = new FormData();
        formData.set('behandlingCode', behandlingType ?? '');
        formData.set('regelmessighet', 'VILKÅRLIG');
        formData.set('valgteDatoer', JSON.stringify(selectionToDateStrings(selection)));
        formData.set('startTid', selectedTime);
        formData.set('opprettetAv', 'VERDANDE');

        fetcher.submit(formData, {method: 'post'});
    }

    return (
        <VStack gap={'6'}>
            <Heading size={'medium'} level={'1'}>Opprett behandling i serie</Heading>
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
                    <VStack>
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
                    </VStack>

                    <VStack>
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
                        <Checkbox
                            value="true"
                            checked={ekskluderHelg}
                            onChange={e => setEkskluderHelg(e.target.checked)}
                        >
                            Ekskluder helg
                        </Checkbox>

                    </VStack>
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
                    <HStack>
                        <Button
                            type="button"
                            onClick={sendBehandlingSerieTilAction}
                            loading={fetcher.state === 'submitting'}
                        >
                            Lagre serie
                        </Button>
                    </HStack>

                    <Heading size={'small'}>Lagrede serier for denne behandlingstypen</Heading>
                    <Table size="large" zebraStripes>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Behandling</Table.HeaderCell>
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
                </>
            )}
        </VStack>
    )
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