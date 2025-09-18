import { Fragment, useMemo, useState } from 'react';
import { Table, Button, Link, HStack, VStack } from '@navikt/ds-react';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import type {BehandlingSerieDTO} from "~/types";

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

export function BehandlingerGruppertTabell({
                                               behandlingSerier,
                                               onEndrePlanlagtStartet,
                                               onFjernFraSerie,
                                           }: Props) {
    const [open, setOpen] = useState<Record<string, boolean>>({});

    const rows = useMemo(() => {
        return [...(behandlingSerier ?? [])]
            .sort((a, b) => {
                const aTime = a.startDato ? new Date(a.startDato).getTime() : 0;
                const bTime = b.startDato ? new Date(b.startDato).getTime() : 0;
                return aTime - bTime;
            })
            .map(s => {
                const behandlingerSorted = [...(s.behandlinger ?? [])].sort((a, b) => {
                    const aTime = a.planlagtStartet ? new Date(a.planlagtStartet).getTime() : 0;
                    const bTime = b.planlagtStartet ? new Date(b.planlagtStartet).getTime() : 0;
                    return aTime - bTime;
                });
                return {
                    serieId: s.behandlingSerieId,
                    startDato: s.startDato,
                    sluttDato: s.sluttDato,
                    behandlingCode: s.behandlingCode,
                    behandlinger: behandlingerSorted,
                };
            });
    }, [behandlingSerier]);

    const toggle = (id?: string) => {
        if (!id) return;
        setOpen(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!rows.length) {
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

    return (
        <Table size="large" zebraStripes>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>Behandlingstype</Table.HeaderCell>
                    <Table.HeaderCell>Serie</Table.HeaderCell>
                    <Table.HeaderCell>Start dato</Table.HeaderCell>
                    <Table.HeaderCell>Slutt dato</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {rows.map((s, idx) => {
                    const isOpen = !!open[s.serieId ?? ''];
                    const band = idx % 2 === 1;
                    const hue = hashHue(s.serieId ?? '');

                    return (
                        <Fragment key={s.serieId ?? `serie-${idx}`}>
                            {/* Hovedrad */}
                            <Table.Row
                                shadeOnHover={false}
                                style={{ background: band ? 'var(--a-bg-subtle, #f7f7f7)' : undefined }}
                            >
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

                                <Table.HeaderCell scope="row">
                                    <strong>{s.behandlingCode ?? '—'}</strong>
                                </Table.HeaderCell>

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
                                    <Table.DataCell id={`serie-${s.serieId}-panel`} colSpan={5}>
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
                                                        <span>{behandling.status}</span>
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
            </Table.Body>
        </Table>
    );
}