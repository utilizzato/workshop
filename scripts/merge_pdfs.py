#!/usr/bin/env python3

import os
import sys
import argparse
from PyPDF2 import PdfMerger

def merge_pdfs(folder_path, output_filename):
    if not os.path.isdir(folder_path):
        print(f"Error: '{folder_path}' is not a valid directory.")
        sys.exit(1)

    pdf_files = sorted([
        f for f in os.listdir(folder_path)
        if f.endswith('.pdf') and os.path.isfile(os.path.join(folder_path, f)) and f != output_filename
    ])

    if not pdf_files:
        print("No PDF files found in the specified folder.")
        sys.exit(1)

    merger = PdfMerger()
    for pdf_file in pdf_files:
        full_path = os.path.join(folder_path, pdf_file)
        print(f"Adding: {pdf_file}")
        merger.append(full_path)

    output_path = os.path.join(folder_path, output_filename)
    merger.write(output_path)
    merger.close()

    print(f"PDFs merged into: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Merge all PDFs in a folder into a single PDF.")
    parser.add_argument("folder", help="Path to the folder containing PDF files")
    parser.add_argument("-o", "--output", default="merged.pdf", help="Name of the output PDF file")

    args = parser.parse_args()
    merge_pdfs(args.folder, args.output)

if __name__ == "__main__":
    main()
