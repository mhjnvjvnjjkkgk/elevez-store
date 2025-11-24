// AI Description Generator - Prompt Configuration
// Edit this file to customize how the AI generates product descriptions
// The prompt below will be used to generate product descriptions from images

const AI_PROMPT_CONFIG = {
  // EDIT THIS PROMPT TO CHANGE HOW DESCRIPTIONS ARE GENERATED
  // This is the main instruction sent to the AI
  systemPrompt: `You are a creative storyteller for ELEVEZ, a premium streetwear brand with a lore-driven narrative.

TASK: Analyze the product image and create a mystical, lore-based product description.

OUTPUT FORMAT:
**TITLE:** [Create a mysterious, lore-inspired title that hints at the product's story]

**LORE:** [Write 2-3 sentences that tell the story behind the design. Make it feel like the design is more than just fabric - it's a piece of a larger narrative. Describe what you see in the image and weave it into an urban legend or street culture mythology.]

REQUIREMENTS:
- Analyze the visual design, colors, patterns, and style in the image
- Create a narrative that makes the product feel legendary
- Use bold, confident, street-smart language
- Appeal to young fashion-forward customers (18-35)
- Make it feel authentic and urban
- Keep LORE section to 2-3 sentences max

BRAND VOICE: Bold, authentic, mysterious, quality-focused, modern street culture

Now analyze the image and create the lore:`,

  // Product context - information about the product
  productContext: `Product: {productName} ({type})
Category: {category}
Price: ₹{price}

Image Analysis:`,

  // Fallback templates (used when AI is unavailable)
  fallbackTemplates: [
    'Premium {type} with personality-driven design. Engineered for durability and style in the urban environment.',
    'Elevate your {category} wardrobe with this {type}. Perfect blend of comfort, quality, and street-ready aesthetics.',
    'High-quality {type} designed for the modern trendsetter. Features premium materials and attention to detail.',
    'Stand out with this {type}. Crafted for those who demand both style and substance in their {category} wear.',
    'Essential {type} for your collection. Combines contemporary design with lasting quality and comfort.',
    'Bold {type} that makes a statement. Premium fabric meets cutting-edge street style.',
    'Redefine your style with this {type}. Where comfort meets contemporary {category} fashion.',
    'Signature {type} from ELEVEZ. Designed for those who live and breathe street culture.'
  ],

  // API Configuration
  apiConfig: {
    // Using Replicate API (free tier available, better instruction following)
    primaryAPI: 'replicate',
    
    // Model for vision + text (Claude 3.5 Sonnet can see images and follow instructions)
    model: 'claude-3-5-sonnet-20241022',
    
    // Generation parameters
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.9
  }
};

// Export for use in admin.js
window.AI_PROMPT_CONFIG = AI_PROMPT_CONFIG;
