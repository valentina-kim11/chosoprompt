import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Choso AI Vision | Tạo Mô Tả Hình Ảnh Bằng AI',
  description: 'Tạo prompt chi tiết, tối ưu cho AI từ hình ảnh của bạn sử dụng Google Gemini AI. Hoàn hảo cho việc tạo ảnh AI và quy trình sáng tạo.',
  keywords: 'mô tả ảnh AI, phân tích hình ảnh, AI prompt, chuyển ảnh thành text, Choso AI',
  openGraph: {
    title: 'Choso AI Vision - Tạo Mô Tả Hình Ảnh Bằng AI',
    description: 'Tạo prompt chi tiết, tối ưu cho AI từ hình ảnh của bạn sử dụng Google Gemini AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}