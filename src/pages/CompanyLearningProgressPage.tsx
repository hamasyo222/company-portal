import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { useLMSStore } from '../../stores/lmsStore';
import { useAuthStore } from '../../stores/authStore';
import { LearningProgress, LearningContent, User } from '../../types';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { CompanyEmployeeProgressDetail } from './CompanyEmployeeProgressDetail';

const CompanyLearningProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { contents, fetchContents } = useLMSStore();
  const { user } = useAuthStore();
  
  const [employees, setEmployees] = useState<User[]>([]);
  const [employeeProgress, setEmployeeProgress] = useState<Record<string, LearningProgress[]>>({});
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'completedCourses' | 'inProgressCourses' | 'totalTime'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, progressFilter, sortField, sortDirection]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API to get employees for the company
      // For now, we'll use mock data
      const mockEmployees: User[] = [
        {
          id: 'emp-1',
          email: 'suzuki@example.com',
          firstName: '次郎',
          lastName: '鈴木',
          userType: 'company_employee',
          status: 'active',
          emailVerified: true,
          companyId: user?.companyId,
          companyName: user?.companyName,
          createdAt: '2023-01-15T00:00:00Z',
          lastLoginAt: '2024-06-20T00:00:00Z'
        },
        {
          id: 'emp-2',
          email: 'tanaka@example.com',
          firstName: '三郎',
          lastName: '田中',
          userType: 'company_employee',
          status: 'active',
          emailVerified: true,
          companyId: user?.companyId,
          companyName: user?.companyName,
          createdAt: '2023-02-01T00:00:00Z',
          lastLoginAt: '2024-06-19T00:00:00Z'
        },
        {
          id: 'emp-3',
          email: 'sato@example.com',
          firstName: '花子',
          lastName: '佐藤',
          userType: 'company_employee',
          status: 'inactive',
          emailVerified: true,
          companyId: user?.companyId,
          companyName: user?.companyName,
          createdAt: '2023-03-15T00:00:00Z',
          lastLoginAt: '2024-05-10T00:00:00Z'
        }
      ];
      
      setEmployees(mockEmployees);
      
      // Load progress for each employee
      const progressByEmployee: Record<string, LearningProgress[]> = {};
      
      // In a real implementation, this would call an API
      // For now, we'll generate mock data
      mockEmployees.forEach(employee => {
        // Generate random progress for each employee
        const employeeProgressData: LearningProgress[] = [];
        
        // For first employee, add completed JavaScript course
        if (employee.id === 'emp-1') {
          employeeProgressData.push({
            id: `progress-${employee.id}-1`,
            userId: employee.id,
            contentId: 'content-1',
            status: 'completed',
            progressPercentage: 100,
            startedAt: '2024-01-10T00:00:00Z',
            completedAt: '2024-01-15T00:00:00Z',
            lastAccessedAt: '2024-01-15T00:00:00Z',
            timeSpent: 36000, // 10 hours in seconds
            attempts: 1,
            bestScore: 95,
          });
          
          // Add in-progress Python course
          employeeProgressData.push({
            id: `progress-${employee.id}-2`,
            userId: employee.id,
            contentId: 'content-2',
            status: 'in_progress',
            progressPercentage: 60,
            startedAt: '2024-01-16T00:00:00Z',
            lastAccessedAt: '2024-01-20T00:00:00Z',
            timeSpent: 25200, // 7 hours in seconds
            attempts: 1,
          });
        }
        
        // For second employee, add in-progress Japanese course
        if (employee.id === 'emp-2') {
          employeeProgressData.push({
            id: `progress-${employee.id}-1`,
            userId: employee.id,
            contentId: 'content-5',
            status: 'in_progress',
            progressPercentage: 75,
            startedAt: '2024-01-05T00:00:00Z',
            lastAccessedAt: '2024-01-18T00:00:00Z',
            timeSpent: 28800, // 8 hours in seconds
            attempts: 1,
          });
        }
        
        // For third employee, add completed JavaScript course
        if (employee.id === 'emp-3') {
          employeeProgressData.push({
            id: `progress-${employee.id}-1`,
            userId: employee.id,
            contentId: 'content-1',
            status: 'completed',
            progressPercentage: 100,
            startedAt: '2024-01-05T00:00:00Z',
            completedAt: '2024-01-12T00:00:00Z',
            lastAccessedAt: '2024-01-12T00:00:00Z',
            timeSpent: 32400, // 9 hours in seconds
            attempts: 1,
            bestScore: 88,
          });
        }
        
        progressByEmployee[employee.id] = employeeProgressData;
      });
      
      setEmployeeProgress(progressByEmployee);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading employees:', error);
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(employee => 
        employee.email.toLowerCase().includes(query) ||
        employee.firstName.toLowerCase().includes(query) ||
        employee.lastName.toLowerCase().includes(query)
      );
    }
    
    // Progress filter
    if (progressFilter !== 'all') {
      filtered = filtered.filter(employee => {
        const progress = employeeProgress[employee.id] || [];
        
        if (progressFilter === 'completed') {
          return progress.some(p => p.status === 'completed');
        } else if (progressFilter === 'in_progress') {
          return progress.some(p => p.status === 'in_progress');
        } else if (progressFilter === 'not_started') {
          return progress.length === 0;
        }
        
        return true;
      });
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortField === 'name') {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      } else if (sortField === 'completedCourses') {
        const completedA = (employeeProgress[a.id] || []).filter(p => p.status === 'completed').length;
        const completedB = (employeeProgress[b.id] || []).filter(p => p.status === 'completed').length;
        return sortDirection === 'asc' ? completedA - completedB : completedB - completedA;
      } else if (sortField === 'inProgressCourses') {
        const inProgressA = (employeeProgress[a.id] || []).filter(p => p.status === 'in_progress').length;
        const inProgressB = (employeeProgress[b.id] || []).filter(p => p.status === 'in_progress').length;
        return sortDirection === 'asc' ? inProgressA - inProgressB : inProgressB - inProgressA;
      } else if (sortField === 'totalTime') {
        const timeA = (employeeProgress[a.id] || []).reduce((sum, p) => sum + p.timeSpent, 0);
        const timeB = (employeeProgress[b.id] || []).reduce((sum, p) => sum + p.timeSpent, 0);
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }
      
      return 0;
    });
    
    setFilteredEmployees(filtered);
  };

  const handleSort = (field: 'name' | 'completedCourses' | 'inProgressCourses' | 'totalTime') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleGenerateCompanyReport = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set font for Japanese support
      doc.setFont('helvetica');
      doc.setLanguage('ja');
      
      // Add title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('企業学習進捗レポート', 105, 20, { align: 'center' });
      
      // Add company info
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`会社名: ${user?.companyName || ''}`, 20, 40);
      doc.text(`報告日: ${new Date().toLocaleDateString('ja-JP')}`, 20, 50);
      
      // Add table header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('従業員名', 20, 70);
      doc.text('完了コース', 100, 70);
      doc.text('学習中コース', 130, 70);
      doc.text('総学習時間', 170, 70);
      
      // Draw header line
      doc.setLineWidth(0.5);
      doc.line(20, 72, 190, 72);
      
      // Add table content
      doc.setFont('helvetica', 'normal');
      let yPos = 80;
      
      filteredEmployees.forEach((employee, index) => {
        // Add new page if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          
          // Add table header on new page
          doc.setFont('helvetica', 'bold');
          doc.text('従業員名', 20, yPos);
          doc.text('完了コース', 100, yPos);
          doc.text('学習中コース', 130, yPos);
          doc.text('総学習時間', 170, yPos);
          
          // Draw header line
          doc.line(20, yPos + 2, 190, yPos + 2);
          yPos += 10;
          doc.setFont('helvetica', 'normal');
        }
        
        const progress = employeeProgress[employee.id] || [];
        const completedCourses = progress.filter(p => p.status === 'completed').length;
        const inProgressCourses = progress.filter(p => p.status === 'in_progress').length;
        const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime % 3600) / 60);
        
        doc.text(`${employee.lastName} ${employee.firstName}`, 20, yPos);
        doc.text(completedCourses.toString(), 100, yPos);
        doc.text(inProgressCourses.toString(), 130, yPos);
        doc.text(`${hours}時間${minutes}分`, 170, yPos);
        
        // Draw row separator
        if (index < filteredEmployees.length - 1) {
          doc.setLineWidth(0.1);
          doc.line(20, yPos + 2, 190, yPos + 2);
        }
        
        yPos += 10;
      });
      
      // Draw bottom line
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      
      // Add summary
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('サマリー', 20, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      
      const totalCompletedCourses = filteredEmployees.reduce((sum, employee) => {
        const progress = employeeProgress[employee.id] || [];
        return sum + progress.filter(p => p.status === 'completed').length;
      }, 0);
      
      const totalInProgressCourses = filteredEmployees.reduce((sum, employee) => {
        const progress = employeeProgress[employee.id] || [];
        return sum + progress.filter(p => p.status === 'in_progress').length;
      }, 0);
      
      const totalLearningTime = filteredEmployees.reduce((sum, employee) => {
        const progress = employeeProgress[employee.id] || [];
        return sum + progress.reduce((timeSum, p) => timeSum + p.timeSpent, 0);
      }, 0);
      
      const totalLearningHours = Math.floor(totalLearningTime / 3600);
      const totalLearningMinutes = Math.floor((totalLearningTime % 3600) / 60);
      
      doc.text(`総従業員数: ${filteredEmployees.length}`, 20, yPos);
      yPos += 8;
      doc.text(`総完了コース数: ${totalCompletedCourses}`, 20, yPos);
      yPos += 8;
      doc.text(`総学習中コース数: ${totalInProgressCourses}`, 20, yPos);
      yPos += 8;
      doc.text(`総学習時間: ${totalLearningHours}時間${totalLearningMinutes}分`, 20, yPos);
      
      // Save the PDF
      doc.save('企業学習進捗レポート.pdf');
      toast.success('レポートをダウンロードしました');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('レポートの生成中にエラーが発生しました');
    }
  };

  const handleViewEmployeeProgress = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleCloseEmployeeProgress = () => {
    setSelectedEmployeeId(null);
  };

  // If an employee is selected, show their detailed progress
  if (selectedEmployeeId) {
    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
    const employeeProgressData = employeeProgress[selectedEmployeeId] || [];
    
    if (!selectedEmployee) {
      return <div>従業員が見つかりません</div>;
    }
    
    return (
      <CompanyEmployeeProgressDetail 
        employee={selectedEmployee}
        employeeProgress={employeeProgressData}
        contents={contents}
        onBack={handleCloseEmployeeProgress}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">従業員学習進捗管理</h2>
          <p className="text-gray-600">従業員の学習進捗状況を確認・管理します</p>
        </div>
        <Button
          onClick={handleGenerateCompanyReport}
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
        >
          レポート出力
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="従業員を検索..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
            >
              <option value="all">全進捗状況</option>
              <option value="completed">完了あり</option>
              <option value="in_progress">学習中</option>
              <option value="not_started">未開始</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">従業員が見つかりません</h3>
            <p className="mt-1 text-sm text-gray-500">
              検索条件を変更してお試しください
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      従業員
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                          <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                          <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('completedCourses')}
                  >
                    <div className="flex items-center">
                      完了コース
                      {sortField === 'completedCourses' && (
                        sortDirection === 'asc' ? 
                          <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                          <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('inProgressCourses')}
                  >
                    <div className="flex items-center">
                      学習中コース
                      {sortField === 'inProgressCourses' && (
                        sortDirection === 'asc' ? 
                          <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                          <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalTime')}
                  >
                    <div className="flex items-center">
                      総学習時間
                      {sortField === 'totalTime' && (
                        sortDirection === 'asc' ? 
                          <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                          <ChevronDownIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const progress = employeeProgress[employee.id] || [];
                  const completedCourses = progress.filter(p => p.status === 'completed').length;
                  const inProgressCourses = progress.filter(p => p.status === 'in_progress').length;
                  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
                  const totalHours = Math.floor(totalTime / 3600);
                  const totalMinutes = Math.floor((totalTime % 3600) / 60);
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.lastName} {employee.firstName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CheckIcon className="h-5 w-5 text-green-500 mr-1" />
                          <span className="text-sm text-gray-900">{completedCourses}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-blue-500 mr-1" />
                          <span className="text-sm text-gray-900">{inProgressCourses}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {totalHours}時間{totalMinutes}分
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewEmployeeProgress(employee.id)}
                        >
                          詳細を表示
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyLearningProgressPage;