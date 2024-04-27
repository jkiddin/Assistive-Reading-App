import PyPDF2
from openai import OpenAI
import os
from dotenv import load_dotenv
from reportlab.lib.pagesizes import letter
import io
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, PageBreak, Paragraph, Spacer
from pdfminer.high_level import extract_text
from collections import defaultdict

# Load environment variables
load_dotenv()
simplified_cache = defaultdict(lambda: defaultdict(dict)) # this will hold simplified text so api calls don't have to be repeated

# Access the GPT API key
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def simplify_text(text):
    try:
        # Create a chat completion request
        chat_completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # model
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant trained to translate complex texts into simpler language "
                        "without reducing the amount of text. Your goal is to rephrase the text using simpler words "
                        "and sentence structures while keeping the length and overall structure similar to the original. "
                        "Use only keyboard characters so no special symbols such as bullet points or icons "
                        "This should make the content understandable for an eighth-grade reading level without summarizing "
                        "or omitting any details."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Please rephrase the following text into simpler language appropriate for an eighth grader. "
                        f"Keep the total number of words and the paragraph structure as close as possible to the original. "
                        f"Your task is not to summarize but to translate each sentence to be easier to understand, "
                        f"while maintaining the original text's integrity:\n\n{text}"
                    )
                }
            ]
        )

        # Access the first choice and its message content
        simplified_text = chat_completion.choices[0].message.content.strip()

        return simplified_text
    except Exception as e:
        print(f"An error occurred: {e}")
        # Return the original text if the API call fails
        return text


def simplify_pdf(pdf_path, title):
    # Open the original PDF file with PyPDF2 to count the pages
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        number_of_pages = len(pdf_reader.pages)  # Get the total number of pages

    # Define styles
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']  

    # Output file path for the new PDF
    new_pdf_path = pdf_path.replace('.pdf', '_simplified.pdf')

    # Create a SimpleDocTemplate for the new PDF / Store the fileName_simplified.pdf in the database table
    doc = SimpleDocTemplate(new_pdf_path, pagesize=letter)

    story = []  # List to hold the story contents, including Paragraphs and Spacers
   
    # Use PDFMiner
    for page_number in range(number_of_pages):
        # Extract text for the specific page
        if page_number not in simplified_cache[title]:
            extracted_text = extract_text(pdf_path, page_numbers=[page_number])
            simplified_text = simplify_text(extracted_text)
        else:
            simplified_text = simplified_cache[title][page_number]
        print(simplified_text)
        
        # Split text by double newlines
        paragraphs = simplified_text.split('\n\n')

        for paragraph in paragraphs:
            # Create a Paragraph object
            para = Paragraph(paragraph.strip(), normal_style)
            story.append(para)
            # Add extra space to mark paragraph breaks
            story.append(Spacer(1, 12))

        # Add a PageBreak after each page
        story.append(PageBreak())

    # Build PDF with content in the story list
    doc.build(story)

    print(f"New PDF with original paragraph breaks and pages created at: {new_pdf_path}")
