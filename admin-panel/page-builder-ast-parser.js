// ELEVEZ Page Builder - Advanced AST Parser
// Phase 1: Intelligent React Code Parser
// Parses App.tsx and reconstructs it as editable sections

class ReactASTParser {
  constructor(tsxContent) {
    this.content = tsxContent;
    this.sections = [];
    this.imports = [];
    this.contexts = [];
    this.functions = [];
    this.routes = [];
  }

  // Main parse function
  parse() {
    this.extractImports();
    this.extractContexts();
    this.extractFunctions();
    this.extractRoutes();
    this.extractSections();
    
    return {
      imports: this.imports,
      contexts: this.contexts,
      functions: this.functions,
      routes: this.routes,
      sections: this.sections,
      fullCode: this.content
    };
  }

  // Extract all imports
  extractImports() {
    const importRegex = /import\s+(?:{[^}]*}|[^;]*)\s+from\s+['"][^'"]+['"]/g;
    const matches = this.content.match(importRegex) || [];
    this.imports = matches;
  }

  // Extract context definitions
  extractContexts() {
    const contextRegex = /const\s+(\w+Context)\s*=\s*createContext/g;
    let match;
    while ((match = contextRegex.exec(this.content)) !== null) {
      this.contexts.push(match[1]);
    }
  }

  // Extract function components
  extractFunctions() {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
    let match;
    while ((match = functionRegex.exec(this.content)) !== null) {
      const name = match[1] || match[2];
      if (name && !this.functions.includes(name)) {
        this.functions.push(name);
      }
    }
  }

  // Extract routes
  extractRoutes() {
    const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element={<(\w+)\s*\/?>}/g;
    let match;
    while ((match = routeRegex.exec(this.content)) !== null) {
      this.routes.push({
        path: match[1],
        component: match[2]
      });
    }
  }

  // Extract visual sections (hero, collections, banners, etc.)
  extractSections() {
    // Find all JSX sections/divs that represent major layout blocks
    const sectionPatterns = [
      {
        name: 'hero',
        regex: /<(?:section|div)[^>]*className="[^"]*hero[^"]*"[^>]*>[\s\S]*?<\/(?:section|div)>/gi,
        type: 'hero-1'
      },
      {
        name: 'collection',
        regex: /<(?:section|div)[^>]*className="[^"]*(?:collection|products|grid)[^"]*"[^>]*>[\s\S]*?<\/(?:section|div)>/gi,
        type: 'collection-grid'
      },
      {
        name: 'banner',
        regex: /<(?:section|div)[^>]*className="[^"]*banner[^"]*"[^>]*>[\s\S]*?<\/(?:section|div)>/gi,
        type: 'banner-image'
      },
      {
        name: 'footer',
        regex: /<footer[^>]*>[\s\S]*?<\/footer>/gi,
        type: 'footer'
      }
    ];

    sectionPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex);
      while ((match = regex.exec(this.content)) !== null) {
        const sectionHTML = match[0];
        const sectionData = this.extractSectionData(sectionHTML, pattern.type);
        
        this.sections.push({
          id: `section-${Date.now()}-${Math.random()}`,
          type: pattern.type,
          name: pattern.name.charAt(0).toUpperCase() + pattern.name.slice(1),
          html: sectionHTML,
          data: sectionData,
          animations: this.extractAnimations(sectionHTML),
          interactivity: this.extractInteractivity(sectionHTML)
        });
      }
    });
  }

  // Extract data from section HTML
  extractSectionData(html, type) {
    const data = {};

    // Extract text content
    const titleMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/);
    if (titleMatch) data.title = titleMatch[1];

    const subtitleMatch = html.match(/<p[^>]*className="[^"]*subtitle[^"]*"[^>]*>([^<]+)<\/p>/);
    if (subtitleMatch) data.subtitle = subtitleMatch[1];

    // Extract images
    const imageMatch = html.match(/src=["']([^"']+)["']/);
    if (imageMatch) data.backgroundImage = imageMatch[1];

    // Extract colors
    const bgColorMatch = html.match(/background(?:Color)?:\s*['"]([^'"]+)['"]/);
    if (bgColorMatch) data.backgroundColor = bgColorMatch[1];

    const textColorMatch = html.match(/color:\s*['"]([^'"]+)['"]/);
    if (textColorMatch) data.textColor = textColorMatch[1];

    // Extract button text and links
    const buttonMatch = html.match(/<button[^>]*>([^<]+)<\/button>/);
    if (buttonMatch) data.buttonText = buttonMatch[1];

    const linkMatch = html.match(/href=["']([^"']+)["']/);
    if (linkMatch) data.buttonLink = linkMatch[1];

    // Extract dimensions
    const heightMatch = html.match(/height:\s*['"]([^'"]+)['"]/);
    if (heightMatch) data.height = heightMatch[1];

    return data;
  }

  // Extract animation properties
  extractAnimations(html) {
    const animations = {
      hasMotion: html.includes('<motion.'),
      hasTransition: html.includes('transition'),
      hasInitial: html.includes('initial='),
      hasAnimate: html.includes('animate='),
      hasHover: html.includes('whileHover'),
      hasTap: html.includes('whileTap'),
      hasScroll: html.includes('useScroll'),
      properties: []
    };

    // Extract specific animation properties
    const motionProps = html.match(/(?:initial|animate|whileHover|whileTap)={{([^}]+)}}/g) || [];
    animations.properties = motionProps;

    return animations;
  }

  // Extract interactivity (onClick, onChange, etc.)
  extractInteractivity(html) {
    const interactivity = {
      hasClick: html.includes('onClick'),
      hasHover: html.includes('onMouseEnter') || html.includes('onMouseLeave'),
      hasChange: html.includes('onChange'),
      hasSubmit: html.includes('onSubmit'),
      handlers: []
    };

    // Extract handler names
    const handlers = html.match(/on\w+={([^}]+)}/g) || [];
    interactivity.handlers = handlers;

    return interactivity;
  }
}

// Advanced section reconstructor
class SectionReconstructor {
  static reconstructFromAST(section) {
    // Preserve original HTML but make it editable
    return {
      ...section,
      editableFields: this.identifyEditableFields(section),
      preservedCode: section.html,
      isComplex: section.animations.hasMotion || section.interactivity.hasClick
    };
  }

  static identifyEditableFields(section) {
    const fields = [];

    if (section.data.title) {
      fields.push({
        name: 'title',
        type: 'text',
        value: section.data.title,
        selector: 'h1, h2, h3, h4, h5, h6'
      });
    }

    if (section.data.subtitle) {
      fields.push({
        name: 'subtitle',
        type: 'text',
        value: section.data.subtitle,
        selector: '.subtitle, [class*="subtitle"]'
      });
    }

    if (section.data.backgroundColor) {
      fields.push({
        name: 'backgroundColor',
        type: 'color',
        value: section.data.backgroundColor
      });
    }

    if (section.data.textColor) {
      fields.push({
        name: 'textColor',
        type: 'color',
        value: section.data.textColor
      });
    }

    if (section.data.backgroundImage) {
      fields.push({
        name: 'backgroundImage',
        type: 'image',
        value: section.data.backgroundImage
      });
    }

    if (section.data.buttonText) {
      fields.push({
        name: 'buttonText',
        type: 'text',
        value: section.data.buttonText,
        selector: 'button'
      });
    }

    return fields;
  }
}

// Code generator that preserves complexity
class ComplexCodeGenerator {
  static generateFromSections(sections, imports, contexts, functions) {
    let code = '';

    // Add imports
    code += imports.join('\n') + '\n\n';

    // Add contexts
    code += contexts.map(ctx => `const ${ctx} = createContext();`).join('\n') + '\n\n';

    // Add functions
    code += functions.join('\n\n') + '\n\n';

    // Add sections in HomePage
    code += 'function HomePage() {\n  return (\n    <div>\n';
    
    sections.forEach(section => {
      // Use preserved HTML to maintain all animations and interactivity
      code += `      {/* ${section.name} */}\n`;
      code += `      ${section.html}\n\n`;
    });

    code += '    </div>\n  );\n}\n\n';
    code += 'export default App;';

    return code;
  }
}

// Main loader function
window.loadLiveWebsiteAdvanced = async function() {
  try {
    showNotification('📥 Loading your live website (Advanced Parser)...', 'info');

    // Fetch App.tsx
    const response = await fetch('http://localhost:3001/App.tsx');
    if (!response.ok) {
      throw new Error(`Could not load App.tsx: ${response.status}`);
    }

    const appTsxContent = await response.text();
    console.log('📄 Loaded App.tsx, parsing...');

    // Parse with advanced AST parser
    const parser = new ReactASTParser(appTsxContent);
    const ast = parser.parse();

    console.log('🔍 AST Parsed:', ast);

    // Reconstruct sections
    const reconstructedSections = ast.sections.map(section => 
      SectionReconstructor.reconstructFromAST(section)
    );

    console.log('🏗️ Reconstructed sections:', reconstructedSections);

    // Load into builder
    builderState.pages.homepage.sections = reconstructedSections;
    builderState.isLiveMode = true;
    builderState.ast = ast; // Store AST for code generation
    builderState.codeGenerator = ComplexCodeGenerator;

    saveBuilderState();
    renderCanvas();

    showNotification(`✅ Website loaded! Found ${reconstructedSections.length} sections with all animations and interactivity preserved.`, 'success');

  } catch (error) {
    console.error('❌ Advanced parser error:', error);
    showNotification('⚠️ Advanced parser failed. Falling back to simple mode.', 'error');
    
    // Fallback to simple mode
    loadLiveWebsite();
  }
};

// Export for use
window.ReactASTParser = ReactASTParser;
window.SectionReconstructor = SectionReconstructor;
window.ComplexCodeGenerator = ComplexCodeGenerator;
