import { useEffect } from 'react';

interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
}

export const useSEO = ({ title, description, canonicalUrl, ogImage, ogType = 'website' }: SEOMetadata) => {
  useEffect(() => {
    // 1. Update document title
    document.title = `${title} | Elevez`;

    // 2. Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl || window.location.href);

    // 4. Update Open Graph Tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('og:url', canonicalUrl || window.location.href);
    updateOGTag('og:type', ogType);
    if (ogImage) {
      updateOGTag('og:image', ogImage);
    }
  }, [title, description, canonicalUrl, ogImage, ogType]);
};
