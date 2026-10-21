export interface ExtractedAsset {
  type: 'image' | 'svg' | 'stylesheet' | 'script' | 'font';
  url: string;
  alt?: string;
}

export interface PageSection {
  id: string;
  name: string;
  tag: string;
  htmlSnippet: string;
  reactCode: string;
  elementCount: number;
}

export interface ClonedSiteData {
  url: string;
  title: string;
  metaDescription: string;
  favicon: string;
  colors: string[];
  fonts: string[];
  sections: PageSection[];
  assets: ExtractedAsset[];
  fullReactComponent: string;
  nextjsPageCode: string;
  tailwindConfigSnippet: string;
  stats: {
    totalElements: number;
    totalImages: number;
    totalLinks: number;
    totalSections: number;
    estimatedReadTime: string;
  };
}

export interface PresetSite {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  html: string;
}
