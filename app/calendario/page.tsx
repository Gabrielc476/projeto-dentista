'use client';

import { useCalendar } from '@/hooks/useCalendar';
import { CalendarHeader } from '@/components/molecules/CalendarHeader';
import { CalendarGrid } from '@/components/organisms/CalendarGrid';
import { LoadingState } from '@/components/molecules/LoadingState';

export default function CalendarioPage() {
    const {
        currentDate,
        calendarDays,
        loading,
        goToNextMonth,
        goToPreviousMonth,
        goToToday,
    } = useCalendar();

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-6">
            <CalendarHeader
                currentDate={currentDate}
                onNextMonth={goToNextMonth}
                onPreviousMonth={goToPreviousMonth}
                onToday={goToToday}
            />

            <CalendarGrid days={calendarDays} />
        </div>
    );
}
