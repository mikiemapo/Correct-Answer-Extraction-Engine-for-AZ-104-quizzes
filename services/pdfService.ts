
declare const pdfjsLib: any;

/**
 * Enhanced PDF text extraction service.
 * Uses a baseline-grouping algorithm to reconstruct the text in the correct reading order,
 * which is critical for complex quiz result layouts that often include tables or columns.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  // Ensure the worker is properly loaded from the CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (items.length === 0) continue;

    // Group items by their vertical position (Y-coordinate)
    // We use a small threshold (5 units) to account for slight baseline offsets
    const lineThreshold = 5;
    const lines: { y: number; items: any[] }[] = [];

    items.forEach((item) => {
      if (!item.str || item.str.trim() === '') return;

      const y = item.transform[5]; // The 'f' value in the transform matrix is the Y-coordinate
      
      // Find an existing line group within the threshold
      let line = lines.find(l => Math.abs(l.y - y) < lineThreshold);
      
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push(item);
    });

    // Sort line groups from top to bottom (Y-coordinate descending)
    lines.sort((a, b) => b.y - a.y);

    let pageText = '';
    lines.forEach((line) => {
      // Sort items within each line from left to right (X-coordinate ascending)
      line.items.sort((a, b) => a.transform[4] - b.transform[4]);
      
      // Join items with a space, but handle cases where PDF already contains spaces
      const lineString = line.items.reduce((acc, item) => {
        const lastChar = acc[acc.length - 1];
        const nextStr = item.str;
        
        // Only add space if both parts exist and aren't already space-separated
        if (acc && lastChar !== ' ' && nextStr[0] !== ' ') {
          return acc + ' ' + nextStr;
        }
        return acc + nextStr;
      }, '');

      if (lineString.trim()) {
        pageText += lineString + '\n';
      }
    });

    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  // Final cleanup: remove excessive whitespace while preserving structure
  return fullText.replace(/[ \t]+/g, ' ').trim();
};
