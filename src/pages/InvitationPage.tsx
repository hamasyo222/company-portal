import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { EmployeeInviteForm } from '../../components/company/EmployeeInviteForm';
import { CompanyInvitationList } from '../../components/company/CompanyInvitationList';
import { CompanyCodeGenerator } from '../../components/company/CompanyCodeGenerator';

const InvitationPage: React.FC = () => {
  const { user } = useAuthStore();
  
  if (!user || !user.companyId || user.userType !== 'company_admin') {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">アクセス権限がありません</h3>
        <p className="mt-1 text-sm text-gray-500">
          この機能は企業管理者のみ利用可能です
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">従業員招待管理</h1>
        <p className="text-gray-600">従業員の招待と企業コードの管理</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">企業コード</h2>
        <CompanyCodeGenerator 
          companyCode={user.companyCode || 'CODE123'} 
          companyName={user.companyName || '企業名'}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">従業員を招待</h2>
        <EmployeeInviteForm 
          companyName={user.companyName || '企業名'} 
          companyCode={user.companyCode || 'CODE123'}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CompanyInvitationList companyId={user.companyId} />
      </div>
    </div>
  );
};

export default InvitationPage;