export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Metadata {
  author: string;
  creationdate: string;
  creator: string;
  file_path: string;
  format: string;
  keywords: string;
  moddate: string;
  page: number;
  producer: string;
  source: string;
  subject: string;
  title: string;
  total_pages: number;
  trapped: string;
}

export interface Document {
  metadata: Metadata;
  page_content: string;
}

export interface ApiResponse {
  documents: Document[];
  markdown: string;
  content: string;
}
