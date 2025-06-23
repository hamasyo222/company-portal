import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LearningProgress } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface LearningTimeDistributionProps {
  userProgress: LearningProgress[];
  timeRange?: 'week' | 'month' | 'year';
}

export const LearningTimeDistribution: React.FC<LearningTimeDistributionProps> = ({ 
  userProgress,
  timeRange = 'week'
}) => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });
  
  const [options, setOptions] = useState<ChartOptions<'line'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '時間帯別学習分布',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `学習時間: ${context.parsed.y.toFixed(1)}時間`;
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
          display: true,
          color: 'rgba(243, 244, 246, 0.8)'
        }
      },
      y: {
        title: {
          display: true,
          text: '学習時間 (時間)'
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(243, 244, 246, 0.8)'
        }
      }
    },
    animation: {
      duration: 1000
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  });

  useEffect(() => {
    prepareChartData();
  }, [userProgress, timeRange]);

  const prepareChartData = () => {
    if (userProgress.length === 0) {
      setChartData({
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: '学習時間',
            data: Array(24).fill(0),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
          }
        ]
      });
      return;
    }

    // Calculate time spent by hour of day
    const hourlyDistribution = calculateTimeDistribution(userProgress);
    
    // Create background colors for time periods
    const backgroundColors = createBackgroundColors();
    
    setChartData({
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: '学習時間',
          data: hourlyDistribution,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          pointBackgroundColor: hourlyDistribution.map((value, index) => 
            value > 0 ? 'rgba(59, 130, 246, 1)' : 'rgba(229, 231, 235, 1)'
          )
        }
      ]
    });
    
    // Update options to include time period backgrounds
    setOptions(prevOptions => ({
      ...prevOptions,
      plugins: {
        ...prevOptions.plugins,
        tooltip: {
          ...prevOptions.plugins?.tooltip,
          callbacks: {
            label: function(context) {
              return `学習時間: ${context.parsed.y.toFixed(1)}時間`;
            },
            afterBody: function(context) {
              const hour = parseInt(context[0].label);
              if (hour >= 5 && hour < 12) return ['時間帯: 朝'];
              if (hour >= 12 && hour < 17) return ['時間帯: 昼'];
              if (hour >= 17 && hour < 21) return ['時間帯: 夕方'];
              return ['時間帯: 夜間'];
            }
          }
        }
      }
    }));
  };

  const calculateTimeDistribution = (progress: LearningProgress[]) => {
    // Calculate time spent by hour of day
    const hourlyDistribution = Array(24).fill(0);
    
    progress.forEach(p => {
      if (!p.lastAccessedAt) return;
      
      // In a real implementation, you would use actual learning logs with timestamps
      // For now, we'll use the last accessed time as a proxy
      const accessDate = new Date(p.lastAccessedAt);
      const hour = accessDate.getHours();
      
      // Add time spent to this hour
      // For simplicity, we'll distribute the time evenly across a 2-hour window
      const timeToDistribute = p.timeSpent / 7200; // Normalize to hours and distribute over 2 hours
      
      hourlyDistribution[hour] += timeToDistribute;
      hourlyDistribution[(hour + 1) % 24] += timeToDistribute / 2; // Half as much in the next hour
    });
    
    return hourlyDistribution;
  };

  const createBackgroundColors = () => {
    // Create background colors for different time periods
    return {
      earlyMorning: {
        start: 5,
        end: 9,
        color: 'rgba(249, 115, 22, 0.1)' // orange-500
      },
      daytime: {
        start: 9,
        end: 17,
        color: 'rgba(16, 185, 129, 0.1)' // emerald-500
      },
      evening: {
        start: 17,
        end: 21,
        color: 'rgba(139, 92, 246, 0.1)' // violet-500
      },
      night: {
        start: 21,
        end: 5,
        color: 'rgba(30, 58, 138, 0.1)' // indigo-900
      }
    };
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
};