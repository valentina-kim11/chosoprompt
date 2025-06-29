'use client';

import React, { useState } from 'react';
import { ImageUploadZone } from '@/components/image-upload-zone';
import { PromptDisplay } from '@/components/prompt-display';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedPrompt {
  detailed: string;
  vietnameseDescription: string;
  optimized: string;
  keywords: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setGeneratedPrompts(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setGeneratedPrompts(null);
  };

  const generatePrompts = async () => {
    if (!selectedImage) {
      toast.error('Vui lòng chọn hình ảnh trước');
      return;
    }

    // Check file size again before processing (after compression should be <1MB)
    if (selectedImage.size > 2 * 1024 * 1024) {
      toast.error('Ảnh vẫn quá lớn sau khi nén. Vui lòng chọn ảnh khác.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Convert file to base64 for serverless function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64);
        };
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(selectedImage);
      const base64Image = await base64Promise;

      // Double check base64 size (should be < 1.5MB after base64 encoding)
      const estimatedSize = (base64Image.length * 3) / 4; // Estimate original size from base64
      if (estimatedSize > 1.5 * 1024 * 1024) {
        toast.error('Ảnh vẫn quá lớn. Vui lòng thử ảnh có độ phân giải thấp hơn.');
        return;
      }
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: selectedImage.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể tạo prompt');
      }

      const data = await response.json();
      setGeneratedPrompts(data);
      toast.success('Tạo prompt thành công!');
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tạo prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    generatePrompts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Choso AI Vision
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Chuyển Đổi Hình Ảnh Thành
            <br />
            Prompt AI Hoàn Hảo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tải lên bất kỳ hình ảnh nào và nhận được các prompt chi tiết, tối ưu cho AI. 
            Hoàn hảo cho việc tạo ảnh AI, quy trình sáng tạo và tạo nội dung.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Tải Lên Hình Ảnh</span>
                </CardTitle>
                <CardDescription>
                  Chọn một hình ảnh để phân tích và tạo prompt chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadZone
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onClearImage={handleClearImage}
                  disabled={isGenerating}
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            {selectedImage && (
              <div className="flex space-x-3">
                <Button
                  onClick={generatePrompts}
                  disabled={isGenerating}
                  size="lg"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Đang Phân Tích Hình Ảnh...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Tạo Prompt
                    </>
                  )}
                </Button>
                
                {generatedPrompts && (
                  <Button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    size="lg"
                    variant="outline"
                    className="h-12"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {generatedPrompts ? (
              <>
                <PromptDisplay
                  prompt={generatedPrompts.detailed}
                  title="Mô Tả Chi Tiết"
                />
                <PromptDisplay
                  prompt={generatedPrompts.vietnameseDescription}
                  title="Mô Tả Chi Tiết (Tiếng Việt)"
                />
                <PromptDisplay
                  prompt={generatedPrompts.optimized}
                  title="Prompt Tối Ưu Cho AI"
                />
                <PromptDisplay
                  prompt={generatedPrompts.keywords}
                  title="Từ Khóa & Thẻ Tag"
                />
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Sẵn Sàng Tạo Prompt</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Tải lên hình ảnh và nhấp "Tạo Prompt" để xem phân tích AI chi tiết và prompt được tối ưu hóa.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Phân Tích Google Gemini AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Công nghệ AI thị giác tiên tiến của Google Gemini phân tích mọi chi tiết trong hình ảnh với độ chính xác cao và miễn phí.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Prompt Được Tối Ưu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Các prompt được tạo ra được tối ưu hóa cho các công cụ tạo ảnh AI như DALL-E, Midjourney và Stable Diffusion.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Nhiều Định Dạng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nhận mô tả chi tiết, prompt được tối ưu và thẻ từ khóa, tất cả được định dạng cho các trường hợp sử dụng khác nhau.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>Được tài trợ bởi Choso.io • Miễn phí cho ae MMO Việt Nam</p>
          <p className="mt-2 font-semibold text-primary">Choso AI Vision - Công cụ chuyển đổi hình ảnh thành prompt AI hàng đầu</p>
          <p className="mt-2 text-xs">Phát triển bởi <span className="font-medium text-blue-600">Cường UG</span></p>
        </div>
      </footer>
    </div>
  );
}