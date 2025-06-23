import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { LearningLog } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DailyActivityChartProps {
  learningLogs: LearningLog[];
  date?: Date;
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ 
  learningLogs,
  date = new Date()
}) => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });
  
  const [options, setOptions] = useState<ChartOptions<'bar'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '時間帯別学習活動',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `活動数: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '時間帯'
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: '活動数'
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          display: true,
          color: 'rgba(243, 244, 246, 0.8)'
        }
      }
    },
    animation: {
      duration: 1000
    }
  });

  useEffect(() => {
    prepareChartData();
  }, [learningLogs, date]);

  const prepareChartData = () => {
    // Filter logs for the selected date
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const filteredLogs = learningLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= selectedDate && logDate < nextDay;
    });
    
    // Count logs by hour
    const hourlyActivity = Array(24).fill(0);
    
    filteredLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const hour = logDate.getHours();
      hourlyActivity[hour]++;
    });
    
    // Prepare chart data
    setChartData({
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: '学習活動',
          data: hourlyActivity,
          backgroundColor: (context: any) => {
            const hour = parseInt(context.chart.data.labels[context.dataIndex]);
            if (hour >= 5 && hour < 12) return 'rgba(59, 130, 246, 0.8)'; // Morning - blue
            if (hour >= 12 && hour < 18) return 'rgba(16, 185, 129, 0.8)'; // Afternoon - green
            return 'rgba(139, 92, 246, 0.8)'; // Evening/Night - purple
          },
          borderColor: (context: any) => {
            const hour = parseInt(context.chart.data.labels[context.dataIndex]);
            if (hour >= 5 && hour < 12) return 'rgba(59, 130, 246, 1)';
            if (hour >= 12 && hour < 18) return 'rgba(16, 185, 129, 1)';
            return 'rgba(139, 92, 246, 1)';
          },
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    });
    
    // Update chart title with selected date
    setOptions(prevOptions => ({
      ...prevOptions,
      plugins: {
        ...prevOptions.plugins,
        title: {
          ...prevOptions.plugins?.title,
          text: `${selectedDate.toLocaleDateString('ja-JP')}の学習活動`
        }
      }
    }));
  };

  // If no logs, show a message
  if (learningLogs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">この日の学習ログはありません</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};