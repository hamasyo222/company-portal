import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LearningProgress } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LearningCalendarProps {
  userProgress: LearningProgress[];
  onDateSelect: (date: Date) => void;
}

export const LearningCalendar: React.FC<LearningCalendarProps> = ({ 
  userProgress,
  onDateSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{
    days: {date: Date, activity: number}[],
    activityByDay: number[]
  }>({
    days: [],
    activityByDay: []
  });

  useEffect(() => {
    generateCalendarData();
  }, [currentMonth, userProgress]);

  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get days in month
    const daysInMonth = getDaysInMonth(year, month);
    
    // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    const activityByDay = Array(7).fill(0); // Activity by day of week
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: new Date(year, month, -firstDayOfMonth + i + 1), activity: 0 });
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const activity = getActivityLevel(date);
      days.push({ date, activity });
      
      // Add to day of week activity
      activityByDay[date.getDay()] += activity;
    }
    
    setCalendarData({ days, activityByDay });
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Get activity level for a specific date
  const getActivityLevel = (date: Date): number => {
    // Filter progress entries for this date
    const dateString = date.toISOString().split('T')[0];
    
    const dayProgress = userProgress.filter(p => {
      if (!p.lastAccessedAt) return false;
      return p.lastAccessedAt.split('T')[0] === dateString;
    });
    
    // Calculate total time spent on this day
    const totalTimeSpent = dayProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    
    // Return activity level based on time spent
    if (totalTimeSpent === 0) return 0;
    if (totalTimeSpent < 1800) return 1; // Less than 30 minutes
    if (totalTimeSpent < 3600) return 2; // Less than 1 hour
    if (totalTimeSpent < 7200) return 3; // Less than 2 hours
    return 4; // 2+ hours
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  // Get activity color class
  const getActivityColorClass = (activity: number): string => {
    switch (activity) {
      case 1: return 'bg-green-100';
      case 2: return 'bg-green-200';
      case 3: return 'bg-green-300';
      case 4: return 'bg-green-400';
      default: return '';
    }
  };

  // Chart options for weekly activity
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `活動レベル: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            switch (value) {
              case 0: return '無し';
              case 1: return '少ない';
              case 2: return '普通';
              case 3: return '多い';
              case 4: return '非常に多い';
              default: return '';
            }
          }
        }
      }
    }
  };

  // Chart data for weekly activity
  const chartData = {
    labels: ['日', '月', '火', '水', '木', '金', '土'],
    datasets: [
      {
        label: '活動レベル',
        data: calendarData.activityByDay,
        borderColor: 'rgba(59, 130, 246, 1)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">学習カレンダー</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium">
            {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarData.days.map((day, index) => {
          const isToday = new Date().toDateString() === day.date.toDateString();
          const isSelected = selectedDate.toDateString() === day.date.toDateString();
          const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
          
          return (
            <div 
              key={index} 
              className={`h-10 border rounded-md flex items-center justify-center cursor-pointer
                ${isToday ? 'border-blue-500' : 'border-gray-200'}
                ${isSelected ? 'bg-blue-100' : ''}
                ${day.activity > 0 ? getActivityColorClass(day.activity) : ''}
                ${!isCurrentMonth ? 'opacity-30' : ''}
                hover:bg-gray-100
              `}
              onClick={() => handleDateClick(day.date)}
            >
              <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                {day.date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 h-32">
        <h4 className="text-sm font-medium text-gray-700 mb-2">曜日別活動レベル</h4>
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>少ない</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span>普通</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span>多い</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>非常に多い</span>
        </div>
      </div>
    </div>
  );
};