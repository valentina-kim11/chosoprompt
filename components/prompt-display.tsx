'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface PromptDisplayProps {
  prompt: string;
  title?: string;
}

export function PromptDisplay({ prompt, title = 'Prompt Đã Tạo' }: PromptDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('Đã sao chép prompt vào clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Không thể sao chép prompt');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button
          onClick={copyToClipboard}
          size="sm"
          variant="outline"
          className="h-8 px-3"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Đã sao chép!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Sao chép
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full rounded-md border p-4">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {prompt}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}