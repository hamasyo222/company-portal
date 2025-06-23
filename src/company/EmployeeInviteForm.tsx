import React, { useState } from 'react';
import { 
  UserPlusIcon,
  EnvelopeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface EmployeeInviteFormProps {
  companyName: string;
  companyCode: string;
}

export const EmployeeInviteForm: React.FC<EmployeeInviteFormProps> = ({
  companyName,
  companyCode
}) => {
  const [emails, setEmails] = useState<string>('');
  const [message, setMessage] = useState<string>(
    `${companyName}のDX Seed Platformへの招待

こんにちは、

${companyName}のDX Seed Platformへの招待をお送りします。
以下の企業コードを使用して、プラットフォームに登録してください。

企業コード: ${companyCode}

登録手順:
1. DX Seed Platform (https://dxseed.example.com) にアクセスします。
2. 「新規登録」ボタンをクリックします。
3. 必要な情報を入力し、ユーザー種別で「企業従業員」を選択します。
4. 上記の企業コードを入力します。
5. 登録を完了します。

ご不明な点がございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。
`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSendInvites = async () => {
    if (!emails.trim()) {
      toast.error('メールアドレスを入力してください');
      return;
    }
    
    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);
    if (emailList.length === 0) {
      toast.error('有効なメールアドレスを入力してください');
      return;
    }
    
    // Validate email format
    const invalidEmails = emailList.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      toast.error(`無効なメールアドレスがあります: ${invalidEmails.join(', ')}`);
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real implementation, this would call an API to send emails
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${emailList.length}人の従業員に招待を送信しました`);
      setEmails('');
    } catch (error) {
      console.error('Error sending invites:', error);
      toast.error('招待の送信中にエラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(email);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">従業員を招待</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス (複数の場合はカンマ区切り)
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="例: yamada@example.com, tanaka@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              複数のメールアドレスを入力する場合は、カンマで区切ってください
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              招待メッセージ
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSendInvites}
              loading={isSending}
              leftIcon={<UserPlusIcon className="h-4 w-4" />}
            >
              {isSending ? '送信中...' : '招待を送信'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <UsersIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">一括招待</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          CSVファイルをアップロードして、複数の従業員を一度に招待することもできます。
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => {
                // In a real implementation, this would download a CSV template
                toast.success('CSVテンプレートをダウンロードしました');
              }}
            >
              CSVテンプレートをダウンロード
            </Button>
          </div>
          
          <div>
            <Button
              variant="outline"
              onClick={() => {
                // In a real implementation, this would open a file picker
                toast.info('この機能は現在開発中です');
              }}
            >
              CSVをアップロード
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};