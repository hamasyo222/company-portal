import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import { LearningProgress, LearningContent } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContentCompletionChartProps {
  userProgress: LearningProgress[];
  contents: LearningContent[];
}

export const ContentCompletionChart: React.FC<ContentCompletionChartProps> = ({ 
  userProgress,
  contents
}) => {
  const [overallData, setOverallData] = useState<any>({
    labels: [],
    datasets: []
  });
  
  const [typeData, setTypeData] = useState<any>({
    labels: [],
    datasets: []
  });
  
  const [overallOptions, setOverallOptions] = useState<ChartOptions<'doughnut'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'コース完了状況',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  });
  
  const [typeOptions, setTypeOptions] = useState<ChartOptions<'bar'>>({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'コンテンツタイプ別進捗',
        font: {
          size: 16
        }
      }
    },
    animation: {
      duration: 1000
    }
  });

  useEffect(() => {
    prepareChartData();
  }, [userProgress, contents]);

  const prepareChartData = () => {
    // Calculate overall completion stats
    const totalContents = contents.length;
    const completedContents = userProgress.filter(p => p.status === 'completed').length;
    const inProgressContents = userProgress.filter(p => p.status === 'in_progress').length;
    const notStartedContents = totalContents - completedContents - inProgressContents;
    
    setOverallData({
      labels: ['完了', '学習中', '未開始'],
      datasets: [
        {
          data: [completedContents, inProgressContents, notStartedContents],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)', // green-500
            'rgba(59, 130, 246, 0.8)', // blue-500
            'rgba(229, 231, 235, 0.8)', // gray-200
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(229, 231, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
    
    // Calculate completion by content type
    const contentTypeCompletion: Record<string, { total: number, completed: number, inProgress: number }> = {};
    
    // Initialize content type stats
    contents.forEach(content => {
      const contentType = content.contentType;
      if (!contentTypeCompletion[contentType]) {
        contentTypeCompletion[contentType] = { total: 0, completed: 0, inProgress: 0 };
      }
      contentTypeCompletion[contentType].total++;
    });
    
    // Update with progress data
    userProgress.forEach(p => {
      const content = contents.find(c => c.id === p.contentId);
      if (!content) return;
      
      const contentType = content.contentType;
      
      if (p.status === 'completed') {
        contentTypeCompletion[contentType].completed++;
      } else if (p.status === 'in_progress') {
        contentTypeCompletion[contentType].inProgress++;
      }
    });
    
    // Prepare data for content type chart
    const contentTypes = Object.keys(contentTypeCompletion);
    
    setTypeData({
      labels: contentTypes.map(type => getContentTypeLabel(type)),
      datasets: [
        {
          label: '完了',
          data: contentTypes.map(type => contentTypeCompletion[type].completed),
          backgroundColor: 'rgba(16, 185, 129, 0.8)', // green-500
        },
        {
          label: '学習中',
          data: contentTypes.map(type => contentTypeCompletion[type].inProgress),
          backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        },
        {
          label: '未開始',
          data: contentTypes.map(type => 
            contentTypeCompletion[type].total - 
            contentTypeCompletion[type].completed - 
            contentTypeCompletion[type].inProgress
          ),
          backgroundColor: 'rgba(229, 231, 235, 0.8)', // gray-200
        }
      ]
    });
  };

  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case 'video': return '動画コンテンツ';
      case 'text': return 'テキストコンテンツ';
      case 'quiz': return 'クイズ・テスト';
      case 'interactive': return 'インタラクティブ';
      default: return type;
    }
  };

  if (userProgress.length === 0 || contents.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center justify-center">
        <Doughnut data={overallData} options={overallOptions} />
      </div>
      <div className="flex items-center justify-center">
        <Pie data={typeData} options={typeOptions} />
      </div>
    </div>
  );
};