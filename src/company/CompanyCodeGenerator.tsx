import React, { useState } from 'react';
import { 
  DocumentDuplicateIcon, 
  CheckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface CompanyCodeGeneratorProps {
  companyCode: string;
  companyName: string;
}

export const CompanyCodeGenerator: React.FC<CompanyCodeGeneratorProps> = ({
  companyCode,
  companyName
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(companyCode);
    setCopied(true);
    toast.success('企業コードをコピーしました');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const generateQRCode = () => {
    // In a real implementation, you would use a QR code library
    // For now, we'll just toggle the display
    setShowQR(!showQR);
  };

  const downloadInvitationPDF = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('ポップアップがブロックされました。ブラウザの設定を確認してください。');
        return;
      }
      
      // Create the HTML content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>企業コード招待状</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .code-box {
              background-color: #f0f0f0;
              padding: 15px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .instructions {
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-name">${companyName}</div>
              <div class="title">DX Seed Platform 招待状</div>
            </div>
            
            <p>この度は、DX Seed Platformをご利用いただき、誠にありがとうございます。</p>
            <p>以下の企業コードを使用して、従業員の方々がプラットフォームに登録できます。</p>
            
            <div class="code-box">${companyCode}</div>
            
            <div class="instructions">
              <h3>登録手順:</h3>
              <ol>
                <li>DX Seed Platform (https://dxseed.example.com) にアクセスします。</li>
                <li>「新規登録」ボタンをクリックします。</li>
                <li>必要な情報を入力し、ユーザー種別で「企業従業員」を選択します。</li>
                <li>上記の企業コードを入力します。</li>
                <li>登録を完了します。</li>
              </ol>
            </div>
            
            <p>ご不明な点がございましたら、サポートチーム (support@dxseed.example.com) までお問い合わせください。</p>
            
            <div class="footer">
              <p>DX Seed Platform</p>
              <p>本招待状は ${new Date().toLocaleDateString()} に生成されました</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">印刷する</button>
            <button onclick="window.close()">閉じる</button>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast.success('招待状を生成しました');
    } catch (error) {
      console.error('Invitation generation error:', error);
      toast.error('招待状の生成中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">企業コード</h3>
        <p className="text-sm text-blue-700 mb-4">
          このコードを従業員に共有して、アカウント登録時に使用してもらいます。
        </p>
        
        <div className="flex items-center">
          <div className="bg-white px-4 py-2 rounded-l-md border border-r-0 border-gray-300 font-mono text-lg font-medium flex-1">
            {companyCode}
          </div>
          <button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            {copied ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <DocumentDuplicateIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button
          variant="outline"
          className="flex-1"
          leftIcon={<QrCodeIcon className="h-4 w-4" />}
          onClick={generateQRCode}
        >
          QRコードを表示
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={downloadInvitationPDF}
        >
          招待状を生成
        </Button>
      </div>
      
      {showQR && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-2">
            <QrCodeIcon className="h-24 w-24 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            このQRコードをスキャンして企業コードを取得できます
          </p>
        </div>
      )}
    </div>
  );
};