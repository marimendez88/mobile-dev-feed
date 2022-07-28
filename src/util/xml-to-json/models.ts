export interface SingleItemI {
  id: string;
  title: string;
  description: string;
  link: string;
  author: string;
  published: number;
  created: number;
  category: string[];
  content: string;
  enclosures: string[];
  [key: string]: string | number| string[] | undefined
}

export interface RSSFeedI {
  title: string;
  description: string;
  link: string;
  image: string;
  category: string;
  items: SingleItemI[];
  [key: string]: string | SingleItemI[] | undefined
}