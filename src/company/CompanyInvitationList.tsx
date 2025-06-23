import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  acceptedAt?: string;
  expiresAt: string;
}

interface CompanyInvitationListProps {
  companyId: string;
}

export const CompanyInvitationList: React.FC<CompanyInvitationListProps> = ({
  companyId
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, [companyId]);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API
      // Mock data for now
      const mockInvitations: Invitation[] = [
        {
          id: 'inv-1',
          email: 'yamada@example.com',
          status: 'accepted',
          sentAt: '2024-06-15T10:30:00Z',
          acceptedAt: '2024-06-16T14:20:00Z',
          expiresAt: '2024-07-15T10:30:00Z'
        },
        {
          id: 'inv-2',
          email: 'tanaka@example.com',
          status: 'pending',
          sentAt: '2024-06-18T09:15:00Z',
          expiresAt: '2024-07-18T09:15:00Z'
        },
        {
          id: 'inv-3',
          email: 'suzuki@example.com',
          status: 'expired',
          sentAt: '2024-05-10T11:45:00Z',
          expiresAt: '2024-06-10T11:45:00Z'
        }
      ];
      
      setInvitations(mockInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('招待の読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // In a real implementation, this would call an API
      // For now, just update the local state
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? {
                ...inv,
                sentAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending'
              }
            : inv
        )
      );
      
      toast.success('招待を再送信しました');
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('招待の再送信中にエラーが発生しました');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      // In a real implementation, this would call an API
      // For now, just update the local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      toast.success('招待をキャンセルしました');
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error('招待のキャンセル中にエラーが発生しました');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            承認済み
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            保留中
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XMarkIcon className="h-3 w-3 mr-1" />
            期限切れ
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">招待履歴</h3>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          onClick={() => loadInvitations()}
        >
          更新
        </Button>
      </div>
      
      {invitations.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">招待がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            まだ招待を送信していません
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {invitations.map(invitation => (
              <li key={invitation.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-xs text-gray-500">
                        送信日: {formatDate(invitation.sentAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(invitation.status)}
                    {invitation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          再送信
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          キャンセル
                        </Button>
                      </>
                    )}
                    {invitation.status === 'expired' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendInvitation(invitation.id)}
                      >
                        再送信
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {invitation.status === 'accepted' ? (
                    <p>承認日: {formatDate(invitation.acceptedAt!)}</p>
                  ) : invitation.status === 'pending' ? (
                    <p>有効期限: {formatDate(invitation.expiresAt)}</p>
                  ) : (
                    <p>期限切れ: {formatDate(invitation.expiresAt)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};