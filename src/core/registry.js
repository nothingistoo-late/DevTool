import { JsonFormatterTool } from '../tools/json-formatter.js';
import { TextDiffTool } from '../tools/text-diff.js';
import { Base64Tool } from '../tools/base64-tool.js';

export const ToolRegistry = {
  tools: [
    JsonFormatterTool,
    TextDiffTool,
    Base64Tool
  ],

  getAll() {
    return this.tools;
  },

  getById(id) {
    return this.tools.find(t => t.id === id) || null;
  },

  getCategories() {
    const categories = new Map();
    for (const tool of this.tools) {
      const cat = tool.category || 'General';
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat).push(tool);
    }
    return Array.from(categories.entries()).map(([name, tools]) => ({ name, tools }));
  },

  search(query) {
    if (!query) return this.tools;
    const q = query.toLowerCase().trim();
    return this.tools.filter(tool => {
      const titleMatch = tool.title.toLowerCase().includes(q);
      const shortTitleMatch = tool.shortTitle.toLowerCase().includes(q);
      const descMatch = (tool.description || '').toLowerCase().includes(q);
      const tagMatch = (tool.tags || []).some(tag => tag.toLowerCase().includes(q));
      return titleMatch || shortTitleMatch || descMatch || tagMatch;
    });
  },

  // Helper to register new tools dynamically at runtime if desired
  register(newTool) {
    if (this.tools.some(t => t.id === newTool.id)) {
      console.warn(`Tool with ID '${newTool.id}' already exists.`);
      return;
    }
    this.tools.push(newTool);
  }
};
