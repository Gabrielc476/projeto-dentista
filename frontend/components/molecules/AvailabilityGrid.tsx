'use client';

import { ClinicRental, ShiftType, SHIFT_NAMES, WEEKDAY_NAMES } from '@/types';
import { forwardRef } from 'react';

interface WeekData {
    startDate: Date;
    endDate: Date;
    dates: Date[];
}

interface AvailabilityGridProps {
    rentals: ClinicRental[];
    currentWeek: WeekData;
    nextWeek: WeekData;
}

const SHIFTS: { key: ShiftType; label: string; time: string }[] = [
    { key: 'morning', label: 'Manhã', time: '08:00 às 12:00' },
    { key: 'afternoon', label: 'Tarde', time: '14:00 às 18:00' },
    { key: 'evening', label: 'Noite', time: '18:00 às 22:00' },
];

const WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6]; // Domingo a Sábado

function formatDateRange(start: Date, end: Date): string {
    const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function getWeekDates(startOfWeek: Date): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
    }
    return dates;
}

export function getWeeksData(): { currentWeek: WeekData; nextWeek: WeekData } {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get start of current week (Sunday)
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - dayOfWeek);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    // Get end of current week (Saturday)
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);

    // Get start of next week
    const startOfNextWeek = new Date(startOfCurrentWeek);
    startOfNextWeek.setDate(startOfCurrentWeek.getDate() + 7);

    // Get end of next week
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    return {
        currentWeek: {
            startDate: startOfCurrentWeek,
            endDate: endOfCurrentWeek,
            dates: getWeekDates(startOfCurrentWeek),
        },
        nextWeek: {
            startDate: startOfNextWeek,
            endDate: endOfNextWeek,
            dates: getWeekDates(startOfNextWeek),
        },
    };
}

function isSlotReserved(
    rentals: ClinicRental[],
    date: Date,
    shift: ShiftType
): { reserved: boolean; type?: 'fixed' | 'temporary' } {
    // Format target date to YYYY-MM-DD using local time
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const rental = rentals.find(r => {
        let rentalDateStr: string;

        if (r.date instanceof Date) {
            // Date object - use local time
            rentalDateStr = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}-${String(r.date.getDate()).padStart(2, '0')}`;
        } else if (typeof r.date === 'string') {
            // String - could be ISO or YYYY-MM-DD
            if (r.date.includes('T')) {
                // ISO string - parse and use local date
                const d = new Date(r.date);
                rentalDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            } else {
                // Already in YYYY-MM-DD format
                rentalDateStr = r.date;
            }
        } else {
            return false;
        }

        return rentalDateStr === dateStr && r.shift === shift;
    });

    if (rental) {
        return { reserved: true, type: rental.doctorType || 'temporary' };
    }
    return { reserved: false };
}

interface WeekTableProps {
    title: string;
    week: WeekData;
    rentals: ClinicRental[];
}

function WeekTable({ title, week, rentals }: WeekTableProps) {
    return (
        <div style={{ marginBottom: '24px' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
            }}>
                <thead>
                    <tr>
                        <th colSpan={8} style={{
                            backgroundColor: '#b8c6db',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            border: '1px solid #999',
                        }}>
                            {title} ({formatDateRange(week.startDate, week.endDate)})
                        </th>
                    </tr>
                    <tr style={{ backgroundColor: '#e8eef5' }}>
                        <th style={{ padding: '8px', border: '1px solid #999', width: '80px' }}></th>
                        {WEEKDAY_ORDER.map(dayIndex => (
                            <th key={dayIndex} style={{
                                padding: '8px',
                                border: '1px solid #999',
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}>
                                {WEEKDAY_NAMES[dayIndex as keyof typeof WEEKDAY_NAMES]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {SHIFTS.map(shift => (
                        <tr key={shift.key}>
                            <td style={{
                                padding: '8px',
                                border: '1px solid #999',
                                fontWeight: 'bold',
                                backgroundColor: '#f5f5f5',
                            }}>
                                {shift.label}<br />
                                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>
                                    ({shift.time})
                                </span>
                            </td>
                            {week.dates.map((date, index) => {
                                const slot = isSlotReserved(rentals, date, shift.key);
                                return (
                                    <td key={index} style={{
                                        padding: '8px',
                                        border: '1px solid #999',
                                        textAlign: 'center',
                                        color: slot.reserved ? (slot.type === 'fixed' ? '#c00' : '#d90') : '#080',
                                        fontWeight: 'bold',
                                    }}>
                                        {slot.reserved ? 'Reservado' : 'Disponível'}
                                        {slot.reserved && (
                                            <div style={{ fontSize: '10px', fontWeight: 'normal' }}>
                                                ({slot.type === 'fixed' ? 'Fixo' : 'Avulso'})
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export const AvailabilityGrid = forwardRef<HTMLDivElement, AvailabilityGridProps>(
    function AvailabilityGrid({ rentals, currentWeek, nextWeek }, ref) {
        return (
            <div
                ref={ref}
                style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    color: 'black',
                    fontFamily: 'Arial, sans-serif',
                    maxWidth: '800px',
                }}
            >
                {/* Header */}
                <div style={{ marginBottom: '16px' }}>
                    <h1 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '8px',
                    }}>
                        Disponibilidade de Locação – Salas Odontológicas
                    </h1>
                    <p style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>Semana:</strong> {formatDateRange(currentWeek.startDate, currentWeek.endDate)}
                    </p>
                    <p style={{ fontSize: '12px' }}>
                        <strong>Semana seguinte:</strong> {formatDateRange(nextWeek.startDate, nextWeek.endDate)}
                    </p>
                </div>

                {/* Current Week Table */}
                <WeekTable
                    title="Semana Atual"
                    week={currentWeek}
                    rentals={rentals}
                />

                {/* Next Week Table */}
                <WeekTable
                    title="Próxima Semana"
                    week={nextWeek}
                    rentals={rentals}
                />

                {/* Footer Note */}
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderTop: '1px solid #999',
                    fontSize: '11px',
                }}>
                    <p>
                        <strong style={{ color: '#c00' }}>Importante:</strong> a disponibilidade apresentada é válida no momento do envio e pode sofrer
                        alterações de acordo com novas reservas. Para garantir o turno desejado, recomendamos a
                        reserva o quanto antes. Caso não haja confirmação ou reserva imediata, será necessário
                        consultar novamente a disponibilidade, pois os horários podem ser alterados.
                    </p>
                </div>
            </div>
        );
    }
);
