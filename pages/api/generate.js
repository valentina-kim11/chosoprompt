const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API Tạo Mô Tả Hình Ảnh AI - POST hình ảnh đến /api/generate'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Google AI API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(500).json({
        error: 'Khóa API Google AI chưa được cấu hình. Vui lòng thêm GOOGLE_AI_API_KEY vào biến môi trường.'
      });
    }

    const { image, mimeType } = req.body;
    
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Không có dữ liệu hình ảnh được cung cấp' });
    }

    // Validate mime type
    if (!mimeType.startsWith('image/')) {
      return res.status(400).json({ error: 'Loại tệp không hợp lệ. Vui lòng tải lên hình ảnh.' });
    }

    // Prepare the prompt for Gemini Vision
    const analysisPrompt = `Analyze this image in detail and provide four different outputs:

1. DETAILED_DESCRIPTION: A comprehensive, detailed description of the image including:
   - Main subjects and their positioning
   - Colors, lighting, and atmosphere
   - Style, composition, and artistic elements
   - Background and environment details
   - Emotions or mood conveyed
   - Any text or symbols visible

2. VIETNAMESE_DESCRIPTION: A comprehensive, detailed description of the image in Vietnamese with proper diacritics (có dấu), including:
   - Mô tả chi tiết các đối tượng chính và vị trí của chúng
   - Màu sắc, ánh sáng và bầu không khí
   - Phong cách, bố cục và các yếu tố nghệ thuật
   - Chi tiết về nền và môi trường
   - Cảm xúc hoặc tâm trạng được truyền tải
   - Bất kỳ văn bản hoặc ký hiệu nào có thể nhìn thấy

3. AI_OPTIMIZED_PROMPT: A concise, optimized prompt for AI image generation that captures the essence of the image. Format it for tools like DALL-E, Midjourney, or Stable Diffusion. Include:
   - Key visual elements
   - Style descriptors
   - Quality and technical terms
   - Mood and atmosphere

4. KEYWORDS: A comma-separated list of relevant keywords and tags that describe the image, including:
   - Subject matter
   - Style keywords
   - Color palette
   - Mood/emotion tags
   - Technical/quality terms

Please format your response exactly as follows:
DETAILED_DESCRIPTION: [detailed description here]

VIETNAMESE_DESCRIPTION: [mô tả chi tiết bằng tiếng Việt có dấu ở đây]

AI_OPTIMIZED_PROMPT: [optimized prompt here]

KEYWORDS: [comma-separated keywords here]`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the image data for Gemini
    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType,
      },
    };

    // Call Google Gemini API
    const result = await model.generateContent([analysisPrompt, imagePart]);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Google AI API');
    }

    // Parse the response
    const sections = content.split('\n\n');
    let detailed = '';
    let vietnameseDescription = '';
    let optimized = '';
    let keywords = '';

    sections.forEach(section => {
      if (section.startsWith('DETAILED_DESCRIPTION:')) {
        detailed = section.replace('DETAILED_DESCRIPTION:', '').trim();
      } else if (section.startsWith('VIETNAMESE_DESCRIPTION:')) {
        vietnameseDescription = section.replace('VIETNAMESE_DESCRIPTION:', '').trim();
      } else if (section.startsWith('AI_OPTIMIZED_PROMPT:')) {
        optimized = section.replace('AI_OPTIMIZED_PROMPT:', '').trim();
      } else if (section.startsWith('KEYWORDS:')) {
        keywords = section.replace('KEYWORDS:', '').trim();
      }
    });

    // Fallback parsing if the format is different
    if (!detailed || !vietnameseDescription || !optimized || !keywords) {
      const lines = content.split('\n').filter(line => line.trim());
      detailed = lines.find(line => line.includes('DETAILED_DESCRIPTION'))?.split(':').slice(1).join(':').trim() || content;
      vietnameseDescription = lines.find(line => line.includes('VIETNAMESE_DESCRIPTION'))?.split(':').slice(1).join(':').trim() || 'Không thể tạo mô tả tiếng Việt';
      optimized = lines.find(line => line.includes('AI_OPTIMIZED_PROMPT'))?.split(':').slice(1).join(':').trim() || content;
      keywords = lines.find(line => line.includes('KEYWORDS'))?.split(':').slice(1).join(':').trim() || 'image, photo, visual';
    }

    return res.status(200).json({
      detailed: detailed || 'Không thể tạo mô tả chi tiết',
      vietnameseDescription: vietnameseDescription || 'Không thể tạo mô tả tiếng Việt',
      optimized: optimized || 'Không thể tạo prompt tối ưu',
      keywords: keywords || 'image, photo, visual',
    });

  } catch (error) {
    console.error('Error generating prompts:', error);
    
    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('Invalid API key')) {
        return res.status(401).json({ error: 'Khóa API Google AI không hợp lệ. Vui lòng kiểm tra cấu hình của bạn.' });
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return res.status(429).json({ error: 'Hạn ngạch API Google AI đã vượt quá. Vui lòng kiểm tra giới hạn sử dụng.' });
      }
      if (error.message.includes('SAFETY')) {
        return res.status(400).json({ error: 'Nội dung hình ảnh bị đánh dấu bởi bộ lọc an toàn. Vui lòng thử hình ảnh khác.' });
      }
    }

    return res.status(500).json({ error: 'Không thể tạo prompt. Vui lòng thử lại.' });
  }
}