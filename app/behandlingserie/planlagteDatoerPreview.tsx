import { VStack, Heading, HStack } from '@navikt/ds-react';
import React from 'react';
import styles from './css/previewBubbles.module.css';

export type PlannedItem = {
    id: string;
    ymd: string;                // YYYY-MM-DD
    time?: string;              // HH:mm
    status?: string;
    behandlingId?: string;
    behandlingCode?: string;
    serieId?: string;
};

type Props = {
    title?: string;
    items: PlannedItem[];
    onClickItem?: (item: PlannedItem) => void;
};

function shortSerieId(id?: string) {
    if (!id) return '';
    return `••••-${id.slice(-4)}`;
}

function weekdayFromYmd(ymd: string): number {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
}
function dayLabel(weekday: number) {
    return ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'][weekday] ?? '';
}

export default function PlanlagteDatoerPreview({ title, items, onClickItem }: Props) {
    if (!items || items.length === 0) {
        return (
            <VStack gap="2">
                {title && <Heading size="xsmall">{title}</Heading>}
                <span style={{ opacity: 0.7 }}>Ingen planlagte kjøringer.</span>
            </VStack>
        );
    }

    // grupper per måned (YYYY-MM)
    const groups = items.reduce<Record<string, PlannedItem[]>>((acc, it) => {
        const key = it.ymd.slice(0, 7);
        (acc[key] ??= []).push(it);
        return acc;
    }, {});
    const keys = Object.keys(groups).sort();

    const monthLabel = (ym: string) => {
        const [y, m] = ym.split('-').map(Number);
        return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' })
            .format(new Date(y, (m ?? 1) - 1, 1));
    };

    return (
        <VStack gap="2"
                style={{
                    background: 'var(--a-surface-neutral-subtle, #f3f3f3)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                }}>
            {title && <Heading size="medium">{title}</Heading>}
            {keys.map(key => {
                const list = groups[key].slice().sort((a, b) => (a.ymd + (a.time ?? '')) < (b.ymd + (b.time ?? '')) ? -1 : 1);
                return (
                    <VStack key={key} gap="1">
                        <strong style={{ textTransform: 'capitalize' }}>{monthLabel(key)}</strong>
                        <div className={styles.previewContainer}>
                            {list.map(item => {
                                const w = weekdayFromYmd(item.ymd);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onClickItem?.(item)}
                                        className={`${styles.previewBubble} ${styles['day-' + w]}`}
                                        title={`Behandling ${item.behandlingId ?? ''}${item.status ? ` • ${item.status}` : ''}`}
                                    >
                                        <span className={styles.dayLabel}>{dayLabel(w)}</span>
                                        <span className={styles.dateLabel}>{item.ymd}</span>
                                        {item.time && <span className={styles.timeLabel}>{item.time}</span>}
                                        {item.serieId && <span className={styles.serieTag}>{shortSerieId(item.serieId)}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </VStack>
                );
            })}
        </VStack>
    );
}
