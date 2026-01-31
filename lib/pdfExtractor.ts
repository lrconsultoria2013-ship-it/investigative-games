import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker - use a more reliable CDN
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

/**
 * Extract text from a PDF file
 * @param file - PDF file to extract text from
 * @returns Extracted text content
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        console.log('Iniciando extração de texto do PDF...');
        const arrayBuffer = await file.arrayBuffer();

        console.log('PDF carregado, tamanho:', arrayBuffer.byteLength, 'bytes');

        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0 // Reduce console spam
        });

        const pdf = await loadingTask.promise;
        console.log('PDF processado, total de páginas:', pdf.numPages);

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            console.log(`Extraindo texto da página ${pageNum}/${pdf.numPages}...`);
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');

            if (pageText.trim()) {
                fullText += `\n\n--- Página ${pageNum} ---\n\n${pageText}`;
            }
        }

        console.log('Extração concluída. Total de caracteres:', fullText.length);
        return fullText.trim();
    } catch (error: any) {
        console.error('Erro detalhado ao extrair texto do PDF:', error);
        throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
    }
}

/**
 * Perform OCR on an image file
 * @param file - Image file to perform OCR on
 * @returns Extracted text from image
 */
export async function performOCR(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
        const worker = await createWorker('por', 1, {
            logger: (m) => {
                if (m.status === 'recognizing text' && onProgress) {
                    onProgress(Math.round(m.progress * 100));
                }
            }
        });

        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        return text.trim();
    } catch (error) {
        console.error('Erro ao realizar OCR:', error);
        throw new Error('Falha ao realizar OCR na imagem');
    }
}

/**
 * Convert PDF to images and perform OCR (for scanned PDFs)
 * @param file - PDF file to convert and OCR
 * @returns Extracted text from scanned PDF
 */
export async function extractTextFromScannedPDF(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);

            // Render page to canvas
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas
            }).promise;

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });

            // Create file from blob
            const imageFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });

            // Perform OCR on the image
            const pageProgress = (prog: number) => {
                if (onProgress) {
                    const totalProgress = ((pageNum - 1) / pdf.numPages) * 100 + (prog / pdf.numPages);
                    onProgress(Math.round(totalProgress));
                }
            };

            const pageText = await performOCR(imageFile, pageProgress);
            fullText += `\n\n--- Página ${pageNum} ---\n\n${pageText}`;
        }

        return fullText.trim();
    } catch (error) {
        console.error('Erro ao extrair texto de PDF escaneado:', error);
        throw new Error('Falha ao processar PDF escaneado');
    }
}

/**
 * Smart PDF text extraction - tries text extraction first, falls back to OCR if needed
 * @param file - PDF file to extract text from
 * @returns Extracted text
 */
export async function smartExtractPDF(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
        // Try normal text extraction first
        const text = await extractTextFromPDF(file);

        // If we got meaningful text (more than 50 characters), return it
        if (text.length > 50) {
            return text;
        }

        // Otherwise, it's probably a scanned PDF - use OCR
        console.log('PDF parece ser escaneado, usando OCR...');
        return await extractTextFromScannedPDF(file, onProgress);
    } catch (error) {
        console.error('Erro na extração inteligente:', error);
        throw error;
    }
}
