import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { LearningProgress, LearningContent, User } from '../../types';
import { LearningProgressChart } from '../../components/dashboard/LearningProgressChart';
import { ContentCompletionChart } from '../../components/dashboard/ContentCompletionChart';
import { LearningTimeDistribution } from '../../components/dashboard/LearningTimeDistribution';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface CompanyEmployeeProgressDetailProps {
  employee: User;
  employeeProgress: LearningProgress[];
  contents: LearningContent[];
  onBack: () => void;
}

export const CompanyEmployeeProgressDetail: React.FC<CompanyEmployeeProgressDetailProps> = ({
  employee,
  employeeProgress,
  contents,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'analytics'>('overview');
  
  const completedCourses = employeeProgress.filter(p => p.status === 'completed');
  const inProgressCourses = employeeProgress.filter(p => p.status === 'in_progress');
  const totalStudyTime = employeeProgress.reduce((total, p) => total + p.timeSpent, 0);
  const studyHours = Math.floor(totalStudyTime / 3600);
  const studyMinutes = Math.floor((totalStudyTime % 3600) / 60);
  
  const averageScore = completedCourses.length > 0 
    ? Math.round(completedCourses.reduce((sum, p) => sum + (p.bestScore || 0), 0) / completedCourses.length) 
    : 0;

  const handleGenerateReport = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set font for Japanese support
      doc.setFont('helvetica');
      doc.setLanguage('ja');
      
      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('学習進捗レポート', 105, 20, { align: 'center' });
      
      // Add user info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`従業員: ${employee.lastName} ${employee.firstName}`, 20, 40);
      doc.text(`メール: ${employee.email}`, 20, 50);
      doc.text(`レポート生成日: ${new Date().toLocaleDateString('ja-JP')}`, 20, 70);
      
      // Add summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('学習サマリー', 20, 90);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`完了コース数: ${completedCourses.length}`, 20, 100);
      doc.text(`学習中コース数: ${inProgressCourses.length}`, 20, 110);
      doc.text(`総学習時間: ${studyHours}時間${studyMinutes}分`, 20, 120);
      doc.text(`平均スコア: ${averageScore}`, 20, 130);
      
      // Add course details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('コース詳細', 20, 150);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('コース名', 20, 160);
      doc.text('ステータス', 100, 160);
      doc.text('進捗', 140, 160);
      doc.text('学習時間', 170, 160);
      
      // Draw header line
      doc.setLineWidth(0.5);
      doc.line(20, 162, 190, 162);
      
      let yPos = 170;
      employeeProgress.forEach((progress, index) => {
        const content = contents.find(c => c.id === progress.contentId);
        if (!content) return;
        
        // Add new page if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          
          // Add header
          doc.setFont('helvetica', 'bold');
          doc.text('コース名', 20, yPos);
          doc.text('ステータス', 100, yPos);
          doc.text('進捗', 140, yPos);
          doc.text('学習時間', 170, yPos);
          
          // Draw header line
          doc.line(20, yPos + 2, 190, yPos + 2);
          yPos += 10;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.text(content.title.substring(0, 40), 20, yPos);
        doc.text(progress.status === 'completed' ? '完了' : 
                progress.status === 'in_progress' ? '学習中' : '未開始', 100, yPos);
        doc.text(`${progress.progressPercentage}%`, 140, yPos);
        
        const hours = Math.floor(progress.timeSpent / 3600);
        const minutes = Math.floor((progress.timeSpent % 3600) / 60);
        doc.text(`${hours}時間${minutes}分`, 170, yPos);
        
        yPos += 10;
      });
      
      // Save the PDF
      doc.save(`学習進捗レポート_${employee.lastName}${employee.firstName}.pdf`);
      toast.success('レポートをダウンロードしました');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('レポートの生成中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {employee.lastName} {employee.firstName}の学習進捗
            </h2>
            <p className="text-sm text-gray-500">
              {employee.email}
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerateReport}
          leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
        >
          レポート出力
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            コース一覧
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            分析
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">完了コース</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">学習中コース</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressCourses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総学習時間</p>
                  <p className="text-2xl font-bold text-gray-900">{studyHours}時間{studyMinutes}分</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均スコア</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">学習進捗推移</h3>
            <div className="h-64">
              <LearningProgressChart userProgress={employeeProgress} />
            </div>
          </div>

          {/* Content Completion */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">コンテンツ完了状況</h3>
            <div className="h-64">
              <ContentCompletionChart 
                userProgress={employeeProgress}
                contents={contents}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">コース進捗一覧</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コース名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      開始日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終アクセス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      学習時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      スコア
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeProgress.map(progress => {
                    const content = contents.find(c => c.id === progress.contentId);
                    if (!content) return null;
                    
                    return (
                      <tr key={progress.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            progress.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            progress.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {progress.status === 'completed' ? '完了' : 
                             progress.status === 'in_progress' ? '学習中' : '未開始'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  progress.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress.progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{progress.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.startedAt ? new Date(progress.startedAt).toLocaleDateString('ja-JP') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.lastAccessedAt ? new Date(progress.lastAccessedAt).toLocaleDateString('ja-JP') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(progress.timeSpent / 3600)}時間
                          {Math.floor((progress.timeSpent % 3600) / 60)}分
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.bestScore || '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {employeeProgress.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        学習履歴がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Time Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">時間帯別学習分布</h3>
            <div className="h-64">
              <LearningTimeDistribution userProgress={employeeProgress} />
            </div>
          </div>
          
          {/* Learning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">学習効率</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">平均セッション時間</span>
                    <span className="text-sm font-medium text-gray-900">45分</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">学習頻度</span>
                    <span className="text-sm font-medium text-gray-900">週3回</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">集中度</span>
                    <span className="text-sm font-medium text-gray-900">高い</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">学習スタイル</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">好みの学習時間帯</span>
                  <span className="text-sm font-medium text-gray-900">夕方</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">好みのコンテンツタイプ</span>
                  <span className="text-sm font-medium text-gray-900">動画</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均完了率</span>
                  <span className="text-sm font-medium text-gray-900">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">学習の一貫性</span>
                  <span className="text-sm font-medium text-gray-900">中程度</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">レコメンデーション</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  より短いセッションで頻度を増やすと効果的です
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  「Python データ分析入門」の続きを学習しましょう
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  次のステップとして「機械学習アルゴリズム基礎」がおすすめです
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};