import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UserPlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { CompanyCodeGenerator } from '../../components/company/CompanyCodeGenerator';
import { EmployeeInviteForm } from '../../components/company/EmployeeInviteForm';
import { CompanyInvitationList } from '../../components/company/CompanyInvitationList';
import InvitationPage from './InvitationPage';
import CompanyLearningProgressPage from './CompanyLearningProgressPage';

const CompanyDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'learning' | 'reports' | 'invite' | 'settings'>('overview');
  const [employees, setEmployees] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState<any>({});
  
  useEffect(() => {
    // Load employees
    loadEmployees();
    
    // Load learning stats
    loadLearningStats();
  }, []);
  
  const loadEmployees = async () => {
    // In a real implementation, this would call an API
    // Mock data for now
    setEmployees([
      {
        id: 'emp-1',
        name: '鈴木次郎',
        email: 'suzuki@example.com',
        role: 'company_employee',
        status: 'active',
        joinedAt: '2023-01-15',
        lastLogin: '2024-06-20',
        completedCourses: 3,
        inProgressCourses: 1
      },
      {
        id: 'emp-2',
        name: '田中三郎',
        email: 'tanaka@example.com',
        role: 'company_employee',
        status: 'active',
        joinedAt: '2023-02-01',
        lastLogin: '2024-06-19',
        completedCourses: 2,
        inProgressCourses: 2
      },
      {
        id: 'emp-3',
        name: '佐藤花子',
        email: 'sato@example.com',
        role: 'company_employee',
        status: 'inactive',
        joinedAt: '2023-03-15',
        lastLogin: '2024-05-10',
        completedCourses: 1,
        inProgressCourses: 0
      }
    ]);
  };
  
  const loadLearningStats = async () => {
    // In a real implementation, this would call an API
    // Mock data for now
    setLearningStats({
      totalCourses: 5,
      totalCompletions: 6,
      totalInProgress: 3,
      averageCompletionRate: 0.75,
      totalLearningHours: 42,
      topCourses: [
        { id: 'course-1', title: 'JavaScript基礎講座', completions: 2 },
        { id: 'course-2', title: 'Python データ分析入門', completions: 2 },
        { id: 'course-3', title: '日本語会話基礎', completions: 2 }
      ]
    });
  };
  
  const companyNavigation = [
    { id: 'overview', name: '概要', icon: BuildingOfficeIcon, path: '/company' },
    { id: 'employees', name: '従業員', icon: UserGroupIcon, path: '/company/employees' },
    { id: 'learning', name: '学習管理', icon: BookOpenIcon, path: '/company/learning' },
    { id: 'reports', name: 'レポート', icon: DocumentTextIcon, path: '/company/reports' },
    { id: 'invite', name: '招待', icon: UserPlusIcon, path: '/company/invite' },
    { id: 'settings', name: '設定', icon: Cog6ToothIcon, path: '/company/settings' }
  ];
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">従業員数</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">修了コース数</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats.totalCompletions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総学習時間</p>
              <p className="text-2xl font-bold text-gray-900">{learningStats.totalLearningHours}時間</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">修了率</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(learningStats.averageCompletionRate * 100)}%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company Code */}
      {user?.userType === 'company_admin' && user.companyCode && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">企業コード管理</h3>
          <CompanyCodeGenerator 
            companyCode={user.companyCode} 
            companyName={user.companyName || ''}
          />
        </div>
      )}
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full mt-2 bg-green-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">鈴木次郎さんが「JavaScript基礎講座」を修了しました</p>
              <p className="text-xs text-gray-500">2時間前</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">田中三郎さんが「Python データ分析入門」の学習を開始しました</p>
              <p className="text-xs text-gray-500">1日前</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 rounded-full mt-2 bg-purple-500"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">研修実施報告書が生成されました</p>
              <p className="text-xs text-gray-500">3日前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">従業員一覧</h3>
          <Button
            size="sm"
            leftIcon={<UserPlusIcon className="h-4 w-4" />}
            onClick={() => navigate('/company/invite')}
          >
            従業員を招待
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  従業員名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終ログイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修了コース
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status === 'active' ? 'アクティブ' : '非アクティブ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.joinedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.completedCourses}</div>
                    <div className="text-xs text-gray-500">{employee.inProgressCourses}コース学習中</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderLearning = () => (
    <CompanyLearningProgressPage />
  );
  
  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">学習状況</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">総コース数</h4>
            <p className="text-2xl font-bold text-blue-900">{learningStats.totalCourses}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">修了コース数</h4>
            <p className="text-2xl font-bold text-green-900">{learningStats.totalCompletions}</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">学習中コース数</h4>
            <p className="text-2xl font-bold text-yellow-900">{learningStats.totalInProgress}</p>
          </div>
        </div>
        
        <h4 className="font-medium text-gray-900 mb-2">人気コース</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  コース名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修了者数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修了率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {learningStats.topCourses?.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.completions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(course.completions / employees.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((course.completions / employees.length) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">企業設定</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              企業名
            </label>
            <input
              type="text"
              value={user?.companyName || ''}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              企業コード
            </label>
            <input
              type="text"
              value={user?.companyCode || ''}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              管理者メールアドレス
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline">
              企業情報を編集
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">従業員登録通知</p>
              <p className="text-sm text-gray-500">新しい従業員が登録したときに通知を受け取る</p>
            </div>
            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">コース修了通知</p>
              <p className="text-sm text-gray-500">従業員がコースを修了したときに通知を受け取る</p>
            </div>
            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">レポート生成通知</p>
              <p className="text-sm text-gray-500">新しいレポートが生成されたときに通知を受け取る</p>
            </div>
            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">企業ダッシュボード</h1>
        <p className="text-gray-600">{user?.companyName || '企業'} の管理ダッシュボード</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {companyNavigation.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Routes>
        <Route path="/" element={renderOverview()} />
        <Route path="/employees" element={renderEmployees()} />
        <Route path="/learning" element={renderLearning()} />
        <Route path="/reports" element={renderReports()} />
        <Route path="/invite" element={<InvitationPage />} />
        <Route path="/settings" element={renderSettings()} />
      </Routes>
    </div>
  );
};

export default CompanyDashboardPage;