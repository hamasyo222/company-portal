import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { LearningProgress } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface LearningProgressChartProps {
  userProgress: LearningProgress[] | Record<string, LearningProgress[]>;
  timeRange?: 'week' | 'month' | 'year';
}

export const LearningProgressChart: React.FC<LearningProgressChartProps> = ({ 
  userProgress,
  timeRange = 'month'
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
        text: '学習進捗推移',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === '完了コース') {
              return `完了コース: ${context.parsed.y}`;
            } else {
              return `学習中コース: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '期間'
        }
      },
      y: {
        title: {
          display: true,
          text: 'コース数'
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    animation: {
      duration: 1000
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    }
  });

  useEffect(() => {
    prepareChartData();
  }, [userProgress, timeRange]);

  const prepareChartData = () => {
    // Handle both single user progress and multiple users progress
    const progressArray = Array.isArray(userProgress) ? userProgress : 
      Object.values(userProgress).flat();
    
    if (progressArray.length === 0) {
      setChartData({
        labels: getDefaultLabels(),
        datasets: [
          {
            label: '完了コース',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
          {
            label: '学習中コース',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(147, 197, 253, 0.8)',
          }
        ]
      });
      return;
    }

    const timeData = prepareTimeData(progressArray, timeRange);
    
    setChartData({
      labels: timeData.labels,
      datasets: [
        {
          label: '完了コース',
          data: timeData.data.map(period => period.completed),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: '学習中コース',
          data: timeData.data.map(period => period.inProgress),
          backgroundColor: 'rgba(147, 197, 253, 0.8)',
        }
      ]
    });
  };

  const getDefaultLabels = () => {
    switch (timeRange) {
      case 'week':
        return ['月', '火', '水', '木', '金', '土', '日'];
      case 'month':
        return ['第1週', '第2週', '第3週', '第4週'];
      case 'year':
        return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      default:
        return ['第1週', '第2週', '第3週', '第4週'];
    }
  };

  const prepareTimeData = (progress: LearningProgress[], timeRange: 'week' | 'month' | 'year') => {
    const now = new Date();
    let labels: string[] = [];
    let data: { period: string, completed: number, inProgress: number }[] = [];
    
    // Create date labels based on time range
    if (timeRange === 'week') {
      // Last 7 days
      labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('ja-JP', { weekday: 'short' });
      });
      
      // Initialize data for each day
      data = labels.map(day => ({ period: day, completed: 0, inProgress: 0 }));
      
      // Count completed and in-progress courses for each day
      progress.forEach(p => {
        if (!p.lastAccessedAt) return;
        
        const accessDate = new Date(p.lastAccessedAt);
        const dayIndex = 6 - Math.max(0, Math.min(6, Math.floor((now.getTime() - accessDate.getTime()) / (24 * 60 * 60 * 1000))));
        
        if (dayIndex >= 0 && dayIndex < 7) {
          if (p.status === 'completed') {
            data[dayIndex].completed += 1;
          } else if (p.status === 'in_progress') {
            data[dayIndex].inProgress += 1;
          }
        }
      });
    } else if (timeRange === 'month') {
      // Last 4 weeks
      labels = Array.from({ length: 4 }, (_, i) => `第${i + 1}週`);
      
      // Initialize data for each week
      data = labels.map(week => ({ period: week, completed: 0, inProgress: 0 }));
      
      // Count completed and in-progress courses for each week
      progress.forEach(p => {
        if (!p.lastAccessedAt) return;
        
        const accessDate = new Date(p.lastAccessedAt);
        const weekIndex = 3 - Math.max(0, Math.min(3, Math.floor((now.getTime() - accessDate.getTime()) / (7 * 24 * 60 * 60 * 1000))));
        
        if (weekIndex >= 0 && weekIndex < 4) {
          if (p.status === 'completed') {
            data[weekIndex].completed += 1;
          } else if (p.status === 'in_progress') {
            data[weekIndex].inProgress += 1;
          }
        }
      });
    } else if (timeRange === 'year') {
      // Last 12 months
      labels = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(now.getMonth() - (11 - i));
        return date.toLocaleDateString('ja-JP', { month: 'short' });
      });
      
      // Initialize data for each month
      data = labels.map(month => ({ period: month, completed: 0, inProgress: 0 }));
      
      // Count completed and in-progress courses for each month
      progress.forEach(p => {
        if (!p.lastAccessedAt) return;
        
        const accessDate = new Date(p.lastAccessedAt);
        const monthDiff = (now.getFullYear() - accessDate.getFullYear()) * 12 + now.getMonth() - accessDate.getMonth();
        const monthIndex = 11 - Math.max(0, Math.min(11, monthDiff));
        
        if (monthIndex >= 0 && monthIndex < 12) {
          if (p.status === 'completed') {
            data[monthIndex].completed += 1;
          } else if (p.status === 'in_progress') {
            data[monthIndex].inProgress += 1;
          }
        }
      });
    }
    
    return { labels, data };
  };

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};