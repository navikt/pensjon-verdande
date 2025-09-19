import { Fragment, useMemo, useState } from 'react';
import { Table, Button, Link, HStack, VStack } from '@navikt/ds-react';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import type { BehandlingSerieDTO } from '~/types';

type Props = {
    behandlingSerier: BehandlingSerieDTO[];
    onEndrePlanlagtStartet?: (behandlingId: string) => void;
    onFjernFraSerie?: (behandlingId: string) => void;
};

function shortSerieId(id?: string) {
    if (!id) return '••••';
    return `••••-${id.slice(-4)}`;
}

function hashHue(input: string) {
    let h = 0;
    for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
    return Math.abs(h) % 360;
}

function monthKey(dateStr?: string) {
    if (!dateStr) return 'unknown';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
}

function monthLabelFromKey(key: string) {
    if (key === 'unknown') return 'Ukjent måned';
    const [y, m] = key.split('-').map(Number);
    const d = new Date(y, (m ?? 1) - 1, 1);
    return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' }).format(d);
}

export function BehandlingerGruppertTabell({
                                               behandlingSerier,
                                               onEndrePlanlagtStartet,
                                               onFjernFraSerie,
                                           }: Props) {
    const [open, setOpen] = useState<Record<string, boolean>>({});

    // 1) Normaliser + sorter serier (startDato), 2) sorter behandlinger (planlagtStartet), 3) grupper per måned
    const groups = useMemo(() => {
        const normalized = [...(behandlingSerier ?? [])]
            .sort((a, b) => {
                const aTime = a.startDato ? new Date(a.startDato).getTime() : 0;
                const bTime = b.startDato ? new Date(b.startDato).getTime() : 0;
                return aTime - bTime;
            })
            .map(bSerie => {
                const behandlingerSorted = [...(bSerie.behandlinger ?? [])].sort((a, b) => {
                    const aTime = a.planlagtStartet ? new Date(a.planlagtStartet).getTime() : 0;
                    const bTime = b.planlagtStartet ? new Date(b.planlagtStartet).getTime() : 0;
                    return aTime - bTime;
                });
                return {
                    serieId: bSerie.behandlingSerieId,
                    startDato: bSerie.startDato,
                    sluttDato: bSerie.sluttDato,
                    behandlingCode: bSerie.behandlingCode,
                    behandlinger: behandlingerSorted,
                    _monthKey: monthKey(bSerie.startDato?.toString()),
                };
            });

        const map = new Map<string, typeof normalized>();
        for (const r of normalized) {
            const key = r._monthKey;
            const arr = map.get(key) ?? [];
            arr.push(r);
            map.set(key, arr);
        }

        const keys = [...map.keys()].sort((a, b) => {
            if (a === 'unknown' && b === 'unknown') return 0;
            if (a === 'unknown') return 1;
            if (b === 'unknown') return -1;
            return a.localeCompare(b);
        });

        return keys.map(k => {
            const rows = map.get(k)!;
            const totalBehandlinger = rows.reduce((sum, r) => sum + (r.behandlinger?.length ?? 0), 0);
            const serieIds = rows.map(r => r.serieId).filter(Boolean) as string[];
            return { key: k, label: monthLabelFromKey(k), rows, totalBehandlinger, serieIds };
        });
    }, [behandlingSerier]);

    const toggle = (id?: string) => {
        if (!id) return;
        setOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openAllInMonth = (serieIds: string[]) =>
        setOpen(prev => {
            const next = { ...prev };
            for (const id of serieIds) next[id] = true;
            return next;
        });

    const closeAllInMonth = (serieIds: string[]) =>
        setOpen(prev => {
            const next = { ...prev };
            for (const id of serieIds) next[id] = false;
            return next;
        });

    if (!groups.length) {
        return (
            <Table size="large">
                <Table.Body>
                    <Table.Row>
                        <Table.DataCell>Ingen serier funnet</Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }

    // Kolonner: [toggle] [Serie] [Start dato] [Slutt dato] = 4
    const COLS = 4;

    return (
        <Table size="large" zebraStripes>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>Serie</Table.HeaderCell>
                    <Table.HeaderCell>Start dato</Table.HeaderCell>
                    <Table.HeaderCell>Slutt dato</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {groups.map(group => (
                    <Fragment key={group.key}>
                        {/* Måned-headerrad m/ åpne/lukk alle + antall */}
                        <Table.Row style={{ background: 'var(--a-surface-subtle, #f2f2f2)' }}>
                            <Table.DataCell colSpan={COLS}>
                                <HStack justify="space-between" align="center">
                                    <strong>{group.label}</strong>
                                    <HStack gap="2" align="center">
                                        <span style={{ opacity: 0.8 }}>{group.totalBehandlinger} behandlinger</span>
                                        <Button
                                            size="xsmall"
                                            variant="secondary"
                                            onClick={() => openAllInMonth(group.serieIds)}
                                        >
                                            Åpne alle
                                        </Button>
                                        <Button
                                            size="xsmall"
                                            variant="secondary"
                                            onClick={() => closeAllInMonth(group.serieIds)}
                                        >
                                            Lukk alle
                                        </Button>
                                    </HStack>
                                </HStack>
                            </Table.DataCell>
                        </Table.Row>

                        {group.rows.map((s, idx) => {
                            const isOpen = open[s.serieId ?? ''];
                            const hue = hashHue(s.serieId ?? '');

                            return (
                                <Fragment key={s.serieId ?? `serie-${group.key}-${idx}`}>
                                    {/* Hovedrad for serie */}
                                    <Table.Row shadeOnHover={false}>
                                        <Table.DataCell>
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                aria-expanded={isOpen}
                                                aria-controls={`serie-${s.serieId}-panel`}
                                                onClick={() => toggle(s.serieId)}
                                                icon={isOpen ? <ChevronDownIcon aria-hidden /> : <ChevronRightIcon aria-hidden />}
                                            />
                                        </Table.DataCell>

                                        <Table.DataCell>
                                            <HStack gap="2" align="center">
                        <span
                            aria-hidden
                            style={{
                                display: 'inline-block',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: `hsl(${hue} 70% 45%)`,
                            }}
                        />
                                                <span title={s.serieId ?? ''}>{shortSerieId(s.serieId)}</span>
                                            </HStack>
                                        </Table.DataCell>

                                        <Table.DataCell>{s.startDato ?? '—'}</Table.DataCell>
                                        <Table.DataCell>{s.sluttDato ?? '—'}</Table.DataCell>
                                    </Table.Row>

                                    {/* Dropdown med behandlinger */}
                                    {isOpen && (
                                        <Table.Row>
                                            <Table.DataCell id={`serie-${s.serieId}-panel`} colSpan={COLS}>
                                                {s.behandlinger.length === 0 ? (
                                                    <div style={{ padding: '0.5rem 0' }}>Ingen behandlinger i denne serien.</div>
                                                ) : (
                                                    <VStack gap="2">
                                                        <HStack justify="space-between" style={{ fontSize: 12, opacity: 0.8 }}>
                                                            <span>Planlagt startet</span>
                                                            <span>Behandling-ID</span>
                                                            <span>Handlinger</span>
                                                        </HStack>
                                                        {s.behandlinger.map(behandling => (
                                                            <HStack key={behandling.behandlingId} justify="space-between" align="center" wrap={false}>
                                                                <span>{behandling.planlagtStartet}</span>
                                                                <Link href={`/behandling/${behandling.behandlingId}`}>{behandling.behandlingId}</Link>
                                                                <HStack gap="2">
                                                                    <Button
                                                                        size="xsmall"
                                                                        variant="secondary"
                                                                        onClick={() => onEndrePlanlagtStartet?.(behandling.behandlingId.toString())}
                                                                    >
                                                                        Endre tidspunkt
                                                                    </Button>
                                                                    <Button
                                                                        size="xsmall"
                                                                        variant="danger"
                                                                        onClick={() => onFjernFraSerie?.(behandling.behandlingId.toString())}
                                                                    >
                                                                        Fjern fra serie
                                                                    </Button>
                                                                </HStack>
                                                            </HStack>
                                                        ))}
                                                    </VStack>
                                                )}
                                            </Table.DataCell>
                                        </Table.Row>
                                    )}
                                </Fragment>
                            );
                        })}
                    </Fragment>
                ))}
            </Table.Body>
        </Table>
    );
}