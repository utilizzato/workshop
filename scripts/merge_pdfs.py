from PyPDF2 import PdfReader, PdfWriter

import os
import re

# Function to extract prefix and numeric part from filename
def extract_info(filename):
    match = re.match(r'([a-zA-Z_]+)(\d+)\.pdf', filename)
    if match:
        prefix = match.group(1)
        number = int(match.group(2))
        ret = (prefix, number)
    else:
        assert 0

    print(f"walk: {filename} {ret}")
    return ret

pdf_files = []
rootdir = os.getcwd()

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        filepath = os.path.join(subdir, file)
        if filepath.endswith(".pdf") and not filepath.endswith("ooo.pdf"):
            pdf_files.append(filepath)

# Sort the list of PDF files based on prefix and numeric part
pdf_files.sort(key=lambda x: extract_info(os.path.basename(x)))

# Now pdf_files should be sorted as desired
print(pdf_files)

def pdf_cat(input_files, output_stream):
    input_streams = []
    try:
        for input_file in input_files:
            input_streams.append(open(input_file, 'rb'))
        writer = PdfWriter()
        for reader in map(PdfReader, input_streams):
            for n in range(len(reader.pages)):
                writer.add_page(reader.pages[n])
        writer.write(output_stream)
    finally:
        for f in input_streams:
            f.close()
        output_stream.close()

pdf_cat(pdf_files, open("ooo.pdf", "w+b"))
