import { HStack, VStack, Heading } from '@navikt/ds-react';
import React from 'react';

export default function ValgteDatoerPreview({
                                                 ymdDates,
                                                 time,
                                             }: {
    ymdDates: string[];
    time?: string;
}) {
    if (!ymdDates.length) {
        return (
            <VStack
                gap="1"
                style={{
                    background: 'var(--a-surface-neutral-subtle, #f3f3f3)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                }}
            >
                <Heading size="xsmall" level="3">Valgte datoer</Heading>
                <span style={{ opacity: 0.7 }}>Ingen datoer valgt enda.</span>
            </VStack>
        );
    }

    const dayColors: Record<number, string> = {
        0: 'var(--a-surface-danger-subtle, #ffe6e6)',  // søndag
        1: 'var(--a-surface-success-subtle, #e6f4ea)', // mandag
        2: 'var(--a-surface-info-subtle, #e6f0ff)',    // tirsdag
        3: 'var(--a-surface-neutral-subtle, #f3f3f3)', // onsdag
        4: 'var(--a-surface-warning-subtle, #fff4e5)', // torsdag
        5: 'var(--a-surface-alt-1-subtle, #eaf7ff)',   // fredag
        6: 'var(--a-surface-alt-2-subtle, #f9e6ff)',   // lørdag
    };
    const weekdayLabels = ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'];

    const parseDate = (ymd: string) => {
        const [y, m, d] = ymd.split('-').map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
    };
    const fmtNO = (date: Date) =>
        new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

    const groups = ymdDates.reduce<Record<string, string[]>>((acc, ymd) => {
        const [y, m] = ymd.split('-');
        const key = `${y}-${m}`;
        (acc[key] ??= []).push(ymd);
        return acc;
    }, {});
    const orderedKeys = Object.keys(groups).sort();

    const monthLabel = (key: string) => {
        const [y, m] = key.split('-').map(Number);
        return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' })
            .format(new Date(y, (m ?? 1) - 1, 1));
    };

    return (
        <VStack
            gap="2"
            style={{
                background: 'var(--a-surface-neutral-subtle, #f3f3f3)',
                padding: '1rem',
                borderRadius: '0.5rem',
            }}
        >
            <HStack justify="space-between" align="center">
                <Heading size="xsmall" level="3">Valgte datoer</Heading>
                <span style={{ opacity: 0.7 }}>{ymdDates.length} stk</span>
            </HStack>

            <VStack gap="3">
                {orderedKeys.map(key => (
                    <VStack key={key} gap="1">
                        <strong style={{ textTransform: 'capitalize' }}>{monthLabel(key)}</strong>
                        <HStack gap="1" wrap>
                            {groups[key].map(ymd => {
                                const date = parseDate(ymd);
                                const weekday = date.getDay();

                                return (
                                    <div
                                        key={ymd}
                                        style={{
                                            background: dayColors[weekday],
                                            padding: '0.4rem 0.6rem',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '5rem',
                                            border: '1px solid transparent',
                                        }}
                                    >
                    <span
                        style={{
                            fontSize: '0.7rem',
                            opacity: 0.75,
                            textTransform: 'uppercase',
                        }}
                    >
                      {weekdayLabels[weekday]}
                    </span>
                                        <span
                                            style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                            }}
                                        >
                      {fmtNO(date)}
                    </span>
                                        {time && (
                                            <span
                                                style={{
                                                    fontSize: '0.75rem',
                                                    opacity: 0.9,
                                                    marginTop: '0.2rem',
                                                }}
                                            >
                        {time}
                      </span>
                                        )}
                                    </div>
                                );
                            })}
                        </HStack>
                    </VStack>
                ))}
            </VStack>
        </VStack>
    );
}
