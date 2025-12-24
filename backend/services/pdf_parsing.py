from pypdf import PdfReader
from typing import List, Dict

class PdfService:
    def parse_pdf(self, file_path: str) -> List[Dict[str, str]]:
        """
        Parses a PDF file and returns a list of pages with their text.
        Returns: [{"page": 1, "text": "..."}]
        """
        reader = PdfReader(file_path)
        pages_content = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            item = {
                "page": i + 1,
                "text": text,
                # Simple cleanup
                "text_clean": " ".join(text.split()) if text else ""
            }
            pages_content.append(item)
            
        return pages_content

pdf_service = PdfService()
