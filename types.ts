export interface Tool {
  id: string;
  name: string;
  description: string;
  iconClass: string;
  link?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  iconClass: string;
  tools: Tool[];
}