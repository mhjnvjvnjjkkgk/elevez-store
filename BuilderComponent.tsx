// Builder.io Integration Component
// This allows visual editing of your React app

import React, { useEffect, useState } from 'react';

interface BuilderContent {
  data?: any;
  content?: any;
}

interface BuilderComponentProps {
  model?: string;
  content?: any;
}

export const BuilderComponent: React.FC<BuilderComponentProps> = ({ 
  model = 'page',
  content 
}) => {
  const [builderContent, setBuilderContent] = useState<BuilderContent | null>(content);
  const [isLoading, setIsLoading] = useState(!content);

  useEffect(() => {
    // Only fetch if no content provided
    if (content) {
      setIsLoading(false);
      return;
    }

    const apiKey = '273eceb4203548428b50f961521eccd0';
    const url = window.location.pathname;

    // Fetch content from Builder.io
    fetch(`https://cdn.builder.io/api/v3/content/${model}?apiKey=${apiKey}&url=${url}`)
      .then(res => res.json())
      .then(data => {
        setBuilderContent(data.results?.[0] || null);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Builder.io fetch error:', err);
        setIsLoading(false);
      });
  }, [model, content]);

  if (isLoading) {
    return null; // Don't show loading state, just render nothing
  }

  if (!builderContent) {
    return null; // No Builder.io content for this page
  }

  // Render Builder.io content
  return (
    <div 
      className="builder-content"
      dangerouslySetInnerHTML={{ 
        __html: builderContent.data?.html || '' 
      }}
    />
  );
};

// Hook to check if Builder.io content exists for current page
export const useBuilderContent = (model = 'page') => {
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = '273eceb4203548428b50f961521eccd0';
    const url = window.location.pathname;

    fetch(`https://cdn.builder.io/api/v3/content/${model}?apiKey=${apiKey}&url=${url}`)
      .then(res => res.json())
      .then(data => {
        setHasContent(!!data.results?.[0]);
        setIsLoading(false);
      })
      .catch(() => {
        setHasContent(false);
        setIsLoading(false);
      });
  }, [model]);

  return { hasContent, isLoading };
};

export default BuilderComponent;
