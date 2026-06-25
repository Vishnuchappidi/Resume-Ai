package com.resumeanalyzer.util;

import com.resumeanalyzer.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Component
@Slf4j
public class PdfExtractor {

    private static final String PDF_CONTENT_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final int MIN_TEXT_LENGTH = 100;

    public String extractText(MultipartFile file) {
        validateFile(file);

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            if (document.isEncrypted()) {
                throw new BadRequestException(
                        "The uploaded PDF is password-protected. Please upload an unencrypted PDF.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                throw new BadRequestException(
                        "Could not extract sufficient text from the PDF. " +
                        "Please ensure the PDF is not image-based (scanned). " +
                        "Text-based PDFs work best.");
            }

            String cleanedText = cleanText(text);
            log.info("Successfully extracted {} characters from PDF: {}",
                    cleanedText.length(), file.getOriginalFilename());
            return cleanedText;

        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            log.error("Error reading PDF file: {}", e.getMessage());
            throw new BadRequestException("Failed to read the PDF file. Please ensure it is a valid PDF.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF file to upload.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        if (contentType == null || !contentType.equals(PDF_CONTENT_TYPE)) {
            if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
                throw new BadRequestException("Only PDF files are supported. Please upload a .pdf file.");
            }
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException(
                    "File size exceeds the 10MB limit. Please upload a smaller PDF.");
        }
    }

    private String cleanText(String text) {
        return text
                .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", " ")
                .replaceAll("\\s{3,}", "\n\n")
                .replaceAll("[ \\t]{2,}", " ")
                .trim();
    }
}
