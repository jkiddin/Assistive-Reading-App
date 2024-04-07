import PyPDF2
from openai import OpenAI
import os
from dotenv import load_dotenv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Preformatted, PageBreak, Paragraph, Spacer
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams, LTTextBox, LTTextLine, LTChar

# Load environment variapip install pdfminer.sixbles from .env file
load_dotenv()

# Access the GPT API key
# client = OpenAI(api_key="sk-youractualapikeyhere")
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def simplify_text(text):
    try:
        # Create a chat completion request
        chat_completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Adjust the model as needed
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": (f"Please rewrite the following text in simple language suitable "
                                f"for an eighth grader and format the text into well-structured paragraphs "
                                f"where you see fit:\n\n{text}")
                }
            ]
        )
        # Access the first choice and its message content directly using attributes
        simplified_text = chat_completion.choices[0].message.content.strip()

        return simplified_text
    except Exception as e:
        print(f"An error occurred: {e}")
        # Return the original text if the API call fails
        return text


def process_pdf(pdf_path):
    # Open the original PDF file with PyPDF2 to count the pages
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        number_of_pages = len(pdf_reader.pages)  # Get the total number of pages

    # Define styles
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']  # Use 'Normal' style for standard font

    # Output file path for the new PDF
    new_pdf_path = pdf_path.replace('.pdf', '_simplified.pdf')

    # Create a SimpleDocTemplate for the new PDF
    doc = SimpleDocTemplate(new_pdf_path, pagesize=letter)

    story = []  # List to hold the story contents, including Paragraphs and Spacers

    # Use PDFMiner to extract text page by page
    for page_number in range(number_of_pages):
        # Extract text for the specific page
        extracted_text = extract_text(pdf_path, page_numbers=[page_number])
        simplified_text = simplify_text(extracted_text)
        print(simplified_text)
        
        # Split text by double newlines which often mark paragraph breaks
        paragraphs = simplified_text.split('\n\n')

        for paragraph in paragraphs:
            # Create a Paragraph object with the extracted text
            para = Paragraph(paragraph.strip(), normal_style)
            story.append(para)
            # Add extra space to mark paragraph breaks
            story.append(Spacer(1, 12))

        # Add a PageBreak after each page of content
        story.append(PageBreak())

    # Build the PDF with the content in the story list
    doc.build(story)

    print(f"New PDF with original paragraph breaks and pages created at: {new_pdf_path}")
# Call the function with the path to your original PDF
# process_pdf('./database/AppTest.pdf')