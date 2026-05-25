export const PROMPT_INVOICE_OCR = `
    Analyze the provided document(s) and extract all invoice numbers found. Return results in a strict JSON Array format where:
    1. Each object contains:
    - "invoiceNumber": The extracted number (or empty string if none found)
    2. Multiple invoice numbers from the same file should appear as separate objects
    3. Format must be directly parsable by JSON.parse()
    4. Don't need prefixes like: INV-, FA-, BL-, InvoiceNo, BillNo, No. Only get number.

    STRICT REQUIREMENTS:
    - Output ONLY this format:
    [
        {"invoiceNumber": "INV-123"},
        {"invoiceNumber": "INV-00123"},
        {"invoiceNumber": "INV-456"},
        {"invoiceNumber": "INV-789"},
        {"invoiceNumber": "INV-other"},
    ]
    - Don't recognize keywords inside the document as invoice numbers, e.g., "Remarks".
    - Never include markdown (\`\`\`json), comments, or explanations
    - For uncertain matches, don't return this item object
    - Include ALL detected numbers (even duplicates)

    Invoice patterns to detect:
    - Prefixes: INV-, FA-, BL-, InvoiceNo, BillNo, No
    - Formats: Alphanumeric (INV2024-001), numeric-only (10004567)
    - Locations: Header, footer, near "Invoice" labels
`;
