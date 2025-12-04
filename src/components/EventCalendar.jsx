import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function EventCalendar({ events = [], onDateClick, currentEventId = null, singleMonth = false, compact = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  // Get event dates as a map for quick lookup
  const getEventDatesMap = () => {
    const map = {};
    events.forEach(event => {
      if (event.date) {
        // Handle ISO format (YYYY-MM-DD)
        const dateKey = event.date.split('T')[0];
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(event);
      }
    });
    return map;
  };

  const eventDatesMap = getEventDatesMap();

  // Get the date of the current event being viewed (if any)
  const currentEventDate = currentEventId
    ? events.find(e => String(e.id) === String(currentEventId))?.date?.split('T')[0]
    : null;

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={compact ? "h-7" : "h-8"} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const hasEvents = eventDatesMap[dateKey] && eventDatesMap[dateKey].length > 0;
      const eventsOnDay = eventDatesMap[dateKey] || [];
      const isToday = isCurrentMonth && today.getDate() === day;
      const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isCurrentEvent = dateKey === currentEventDate;

      days.push(
        <div
          key={day}
          className="relative"
          onMouseEnter={() => hasEvents && setHoveredDate(dateKey)}
          onMouseLeave={() => setHoveredDate(null)}
          onClick={() => hasEvents && onDateClick && onDateClick(eventsOnDay)}
        >
          <div
            className={`
              ${compact ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'} flex items-center justify-center rounded-full mx-auto
              ${isCurrentEvent ? 'bg-[#009900] text-white font-bold ring-2 ring-[#D0ED00] ring-offset-1 cursor-pointer' : ''}
              ${hasEvents && !isCurrentEvent ? 'bg-[#D0ED00] text-black font-bold cursor-pointer hover:bg-[#bfd400]' : ''}
              ${isToday && !hasEvents && !isCurrentEvent ? 'ring-2 ring-[#009900] ring-offset-1' : ''}
              ${isPast && !hasEvents && !isCurrentEvent ? 'text-gray-400' : !hasEvents && !isCurrentEvent ? 'text-gray-700' : ''}
            `}
          >
            {day}
          </div>

          {/* Tooltip for events on hover */}
          {hoveredDate === dateKey && eventsOnDay.length > 0 && (
            <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
              <div className="space-y-1">
                {eventsOnDay.map((event, idx) => (
                  <div key={idx} className="truncate max-w-[200px]">
                    {event.title}
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mb-4 last:mb-0">
        <div className={`text-center font-semibold text-gray-900 ${compact ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>
          {monthName}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-gray-500 mb-1 text-xs">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  // Show current month and next month
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${compact ? 'p-3' : 'p-4'} border border-gray-200`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
        </button>
        <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-gray-900`}>Upcoming Events</h3>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
        </button>
      </div>

      {renderMonth(currentDate)}
      {!singleMonth && renderMonth(nextMonthDate)}

      <div className={`${compact ? 'mt-2 pt-2 space-y-1' : 'mt-3 pt-3 space-y-2'} border-t border-gray-200`}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-[#D0ED00]" />
          <span>Events scheduled</span>
        </div>
        {currentEventId && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-full bg-[#009900] ring-2 ring-[#D0ED00] ring-offset-1" />
            <span>This event</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCalendar;
