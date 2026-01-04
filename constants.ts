import { Category } from './types';

export const TOOLS_DATA: Category[] = [
  {
    id: 'image',
    title: 'Image Tools',
    description: 'Edit, convert, and manage your images.',
    iconClass: 'fas fa-image',
    tools: [
      { id: 'img-conv', name: 'Image Converter', description: 'Convert images between JPG, PNG, WEBP, and more.', iconClass: 'fas fa-exchange-alt' },
      { id: 'img-comp', name: 'Image Compressor', description: 'Reduce image file size without losing quality.', iconClass: 'fas fa-compress-arrows-alt' },
      { id: 'img-res', name: 'Image Resizer', description: 'Resize images to specific dimensions easily.', iconClass: 'fas fa-expand' },
      { id: 'img-crop', name: 'Image Cropper', description: 'Crop specific areas of your photos.', iconClass: 'fas fa-crop' },
      { id: 'img-ocr', name: 'Image to Text (OCR)', description: 'Extract text from images using AI.', iconClass: 'fas fa-font' },
      { id: 'img-rot', name: 'Image Rotator/Flipper', description: 'Rotate or flip images vertically and horizontally.', iconClass: 'fas fa-sync' },
    ]
  },
  {
    id: 'document',
    title: 'Document Tools',
    description: 'Manage PDFs and Documents efficiently.',
    iconClass: 'fas fa-file-pdf',
    tools: [
      { id: 'doc-p2w', name: 'PDF to Word', description: 'Convert PDF files to editable Word documents.', iconClass: 'fas fa-file-word' },
      { id: 'doc-w2p', name: 'Word to PDF', description: 'Convert DOC/DOCX files to PDF format.', iconClass: 'fas fa-file-pdf' },
      { id: 'doc-comp', name: 'PDF Compressor', description: 'Shrink PDF file sizes for easy sharing.', iconClass: 'fas fa-compress' },
      { id: 'doc-mrg', name: 'PDF Merger & Splitter', description: 'Combine multiple PDFs or split one into pages.', iconClass: 'fas fa-object-group' },
      { id: 'doc-lock', name: 'PDF Lock/Unlock', description: 'Add or remove password protection from PDFs.', iconClass: 'fas fa-lock' },
      { id: 'doc-sign', name: 'eSign PDF', description: 'Add your digital signature to documents.', iconClass: 'fas fa-signature' },
    ]
  },
  {
    id: 'calculator',
    title: 'Calculator Tools',
    description: 'Quick computations for math, finance, and health.',
    iconClass: 'fas fa-calculator',
    tools: [
      { id: 'calc-sci', name: 'Scientific Calculator', description: 'Advanced math functions and operations.', iconClass: 'fas fa-flask' },
      { id: 'calc-age', name: 'Age Calculator', description: 'Calculate exact age in years, months, and days.', iconClass: 'fas fa-birthday-cake' },
      { id: 'calc-bmi', name: 'BMI Calculator', description: 'Check your Body Mass Index quickly.', iconClass: 'fas fa-weight' },
      { id: 'calc-emi', name: 'Loan EMI Calculator', description: 'Estimate monthly loan payments.', iconClass: 'fas fa-home' },
      { id: 'calc-gst', name: 'GST Calculator', description: 'Calculate Goods and Services Tax.', iconClass: 'fas fa-percent' },
      { id: 'calc-curr', name: 'Currency Converter', description: 'Live exchange rates for global currencies.', iconClass: 'fas fa-coins' },
    ]
  },
  {
    id: 'text',
    title: 'Text Tools',
    description: 'Manipulate and analyze text strings.',
    iconClass: 'fas fa-align-left',
    tools: [
      { id: 'txt-case', name: 'Text Case Converter', description: 'Upper, lower, title, and sentence case.', iconClass: 'fas fa-text-height' },
      { id: 'txt-count', name: 'Word & Char Counter', description: 'Count words, characters, and sentences.', iconClass: 'fas fa-list-ol' },
      { id: 'txt-dup', name: 'Remove Duplicate Lines', description: 'Clean up lists by removing repeats.', iconClass: 'fas fa-remove-format' },
      { id: 'txt-sort', name: 'Text Sorter', description: 'Sort text alphabetically or numerically.', iconClass: 'fas fa-sort-alpha-down' },
      { id: 'txt-enc', name: 'Text Encryptor', description: 'Encrypt and decrypt text securely.', iconClass: 'fas fa-user-secret' },
    ]
  },
  {
    id: 'web',
    title: 'Web & Dev Tools',
    description: 'Essential utilities for developers.',
    iconClass: 'fas fa-code',
    tools: [
      { id: 'web-html', name: 'Markdown/Code to HTML', description: 'Convert Markdown or Code snippets to clean HTML.', iconClass: 'fab fa-html5' },
      { id: 'web-min', name: 'HTML/CSS/JS Minifier', description: 'Minify code to improve load speeds.', iconClass: 'fas fa-file-code' },
      { id: 'web-json', name: 'JSON Formatter', description: 'Validate and prettify JSON data.', iconClass: 'fas fa-brackets-curly' },
      { id: 'web-b64', name: 'Base64 Encode/Decode', description: 'Convert data to Base64 format.', iconClass: 'fas fa-database' },
      { id: 'web-url', name: 'URL Encoder/Decoder', description: 'Encode special characters in URLs.', iconClass: 'fas fa-link' },
    ]
  },
  {
    id: 'color',
    title: 'Color Tools',
    description: 'Generators and converters for designers.',
    iconClass: 'fas fa-palette',
    tools: [
      { id: 'col-pick', name: 'Color Picker from Image', description: 'Get the HEX code from any image.', iconClass: 'fas fa-eye-dropper' },
      { id: 'col-hex', name: 'HEX to RGB Converter', description: 'Convert color formats instantly.', iconClass: 'fas fa-swatchbook' },
      { id: 'col-cont', name: 'Contrast Checker', description: 'Ensure web accessibility compliance.', iconClass: 'fas fa-adjust' },
      { id: 'col-grad', name: 'Gradient Generator', description: 'Create CSS backgrounds effortlessly.', iconClass: 'fas fa-rainbow' },
    ]
  },
  {
    id: 'seo',
    title: 'SEO & Marketing',
    description: 'Optimize content for search engines.',
    iconClass: 'fas fa-search-dollar',
    tools: [
      { id: 'seo-kw', name: 'Keyword Density', description: 'Check how often keywords appear.', iconClass: 'fas fa-key' },
      { id: 'seo-meta', name: 'Meta Tag Analyzer', description: 'Analyze page meta titles and descriptions.', iconClass: 'fas fa-tags' },
    ]
  },
  {
    id: 'utility',
    title: 'Utility Tools',
    description: 'Everyday helper tools.',
    iconClass: 'fas fa-cogs',
    tools: [
      { id: 'util-qr', name: 'QR Code Generator', description: 'Create QR codes for links and text.', iconClass: 'fas fa-qrcode' },
      { id: 'util-bar', name: 'Barcode Generator', description: 'Generate barcodes for products.', iconClass: 'fas fa-barcode' },
      { id: 'util-uuid', name: 'UUID Generator', description: 'Generate unique identifiers (v4.', iconClass: 'fas fa-fingerprint' },
      { id: 'util-unit', name: 'Unit Converter', description: 'Length, weight, temperature, and more.', iconClass: 'fas fa-balance-scale' },
      { id: 'util-rand', name: 'Random Generator', description: 'Generate random numbers or passwords.', iconClass: 'fas fa-dice' },
    ]
  },
];