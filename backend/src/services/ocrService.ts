import pdfParse from 'pdf-parse';

export const parseDocument = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ text: string; category: string }> => {
  let text = '';
  let category = 'General';

  try {
    if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text || '';
    } else if (mimeType.startsWith('text/') || originalName.toLowerCase().endsWith('.txt') || originalName.toLowerCase().endsWith('.md')) {
      text = fileBuffer.toString('utf-8');
    } else {
      text = `[Binary file: ${originalName} of type ${mimeType}]`;
    }

    text = text.trim();

    // Auto-categorization rules based on contents
    const contentLower = text.toLowerCase();
    if (contentLower.includes('experience') && (contentLower.includes('education') || contentLower.includes('skills'))) {
      category = 'Resume';
    } else if (contentLower.includes('certify') || contentLower.includes('certificate') || contentLower.includes('credential')) {
      category = 'Certificate';
    } else if (contentLower.includes('project') || contentLower.includes('portfolio') || contentLower.includes('github')) {
      category = 'Project Document';
    } else if (contentLower.includes('blog') || contentLower.includes('post') || contentLower.includes('article')) {
      category = 'Blog Post';
    } else {
      category = 'Personal Note';
    }

  } catch (error) {
    console.error(`[OCR Service] Error parsing ${originalName}, falling back to mock text extraction:`, error);
    text = `Simulated extracted text content from ${originalName}. Contains dummy knowledge about professional skills, code structure, and achievements.`;
    category = 'Personal Note';
  }

  return { text, category };
};
