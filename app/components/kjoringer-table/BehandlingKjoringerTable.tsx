import type {BehandlingDto, BehandlingKjoringDTO, HalLink} from "~/types";
import {useSort} from "~/hooks/useSort";
import React from "react";
import {CopyButton, Table, Tooltip} from "@navikt/ds-react";
import { Link } from "react-router";
import {formatIsoTimestamp} from "~/common/date";
import {formatNumber} from "~/common/number";
import {ExternalLinkIcon} from "@navikt/aksel-icons";

type Props = {
    behandling: BehandlingDto
    visBehandlingId?: boolean
    visAktivitetId?: boolean
}

function tidsbruk(it: BehandlingKjoringDTO) {
    const startet = new Date(it.startet)
    const avsluttet = new Date(it.avsluttet)
    return formatNumber(avsluttet.getTime() - startet.getTime()) + " ms"
}

export function BehandlingKjoringerTable(props: Props) {
    const { sortKey, onSort, sortFunc, sortDecending } =
        useSort<BehandlingKjoringDTO>('startet')

    const sortedKjoringer: BehandlingKjoringDTO[] = React.useMemo(() => {
        return props.behandling.behandlingKjoringer.sort(sortFunc)
    }, [props.behandling.behandlingKjoringer, sortFunc])

    function finnAktivitet(aktivitetId: number | null) {
        if (aktivitetId) {
            return props.behandling.aktiviteter.find((it) => it.aktivitetId == aktivitetId)
        } else {
            return undefined;
        }
    }

    function correlationID(it: BehandlingKjoringDTO) {
        if (it._links && it._links['kibana']) {
            return <a
                href={(it._links['kibana'] as HalLink).href}
                target="_blank"
                rel="noopener noreferrer"
            >
                {it.correlationId}
                <ExternalLinkIcon/>
            </a>

        } else {
            return <>
                {it.correlationId}</>;
        }
    }

    return (
        <Table
            size={'medium'}
            onSortChange={onSort}
            sort={{
                direction: sortDecending ? 'descending' : 'ascending',
                orderBy: sortKey as string,
            }}
            zebraStripes
        >
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell />

                    { props.visBehandlingId ?
                    <Table.ColumnHeader sortable sortKey="behandlingId">
                        BehandlingId
                    </Table.ColumnHeader>
                    : <></>
                    }
                    <Table.ColumnHeader>
                        Aktivitet
                    </Table.ColumnHeader>
                    { props.visAktivitetId ?
                    <Table.ColumnHeader sortable sortKey="aktivitetId">
                        AktivitetId
                    </Table.ColumnHeader>
                    : <></>
                    }
                    <Table.ColumnHeader sortable sortKey="startet">
                        Startet
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey="avsluttet">
                        Avsluttet
                    </Table.ColumnHeader>
                    <Table.ColumnHeader align={'right'}>
                        Tidsbruk
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey="correlationId">
                        CorrelationId
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey="feilmelding">
                        Feilmelding
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>
                        Kopier stack trace
                    </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {sortedKjoringer?.map((it: BehandlingKjoringDTO) => {
                    return (
                        <Table.ExpandableRow
                            key={it.behandlingKjoringId}
                            content={<pre>{it.stackTrace}</pre>}

                        >
                            {props.visBehandlingId ?
                                <Table.DataCell>
                                    <Link
                                        to={`/behandling/${it.behandlingId}`}
                                    >
                                        {it.behandlingId}
                                    </Link>
                                </Table.DataCell>
                                : <></>
                            }
                            <Table.DataCell>
                                <Link
                                    to={`/behandling/${it.behandlingId}/aktivitet/${it.aktivitetId}`}
                                >
                                    {finnAktivitet(it.aktivitetId)?.type}
                                </Link>
                            </Table.DataCell>
                            {props.visAktivitetId ?
                                <Table.DataCell>
                                    <Link
                                        to={`/behandling/${it.behandlingId}/aktivitet/${it.aktivitetId}`}
                                    >
                                        {it.aktivitetId}
                                    </Link>
                                </Table.DataCell>
                                : <></>
                            }
                            <Table.DataCell>
                                {formatIsoTimestamp(it.startet)}
                            </Table.DataCell>
                            <Table.DataCell>
                                {formatIsoTimestamp(it.avsluttet)}
                            </Table.DataCell>
                            <Table.DataCell align={'right'}>
                                {
                                    tidsbruk(it)
                                }
                            </Table.DataCell>
                            <Table.DataCell>
                                {correlationID(it)}
                            </Table.DataCell>
                            <Table.DataCell>
                                {it.feilmelding}
                            </Table.DataCell>
                            <Table.DataCell>
                                {it.stackTrace ?
                                    <Tooltip content={`Kopier stack trace`}>
                                        <CopyButton copyText={it.stackTrace} size={'xsmall'}/>
                                    </Tooltip>
                                    : <></>
                                }
                            </Table.DataCell>
                        </Table.ExpandableRow>
                    )
                })}
            </Table.Body>
        </Table>
    )}
