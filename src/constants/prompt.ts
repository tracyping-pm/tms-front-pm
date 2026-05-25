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

export const PROMPT_ID_OCR = `
    Analyze the provided JSON input and strictly follow these rules:
    1. Identify either "Philippine Identification Card" (PH) or "Identification Number" (TH) as the key
    2. Extract the corresponding value as a continuous string
    3. Return ONLY the raw ID string without any labels, explanations or formatting

    Input examples:
    - For PH: {"Philippine Identification Card": "5726-8948-1843-8642"} → Output: "5726-8948-1843-8642"
    - For TH: {"Identification Number": "3320400337012"} → Output: "3320400337012"

    Processing steps:
    1. Detect country by key presence
    2. Sanitize value: Keep original digits
    3. Output raw string

    Current input: {input}

    ONLY respond with the sanitized ID string, nothing else.
`;

export const PROMPT_LICENSE_OCR = `
    Perform strict license number extraction from JSON input with these rules:
    1. Identify the country by key:
    - PH: Key is "License No." (e.g. "H02-03-000412")
    - TH: Key is "No." (e.g. "SSK/00185/2021" or "62008915")
    2. Extract the corresponding value as a continuous string
    3. Return ONLY the raw ID string without any labels, explanations or formatting

    Input examples:
    - For PH: {"License No.": "H02-03-000412"} → Output: "H02-03-000412"
    - For TH: {"No.": "SSK/00185/2021"} → Output: "SSK/00185/2021"
    - For TH: {"No.": "62008915"} → Output: "62008915"

     Processing steps:
    1. Detect country by key presence
    2. Sanitize value: Keep original digits
    3. Output raw string

    Current input: {input}

    ONLY respond with the sanitized license string. nothing else.
`;
