const { GoogleGenAI } = require('@google/genai');
const {
  categorizeLocally,
  estimateLocally,
  suggestSubtasksLocally,
  parseLocally,
  parseAiJson,
} = require('../utils/aiFallbacks');

async function tryGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text;
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return null;
  }
}

// @desc    Suggest effort and due date for a task
const suggestEstimate = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const prompt = `You are an agile project manager. Estimate effort and due date for this task.
Today: ${new Date().toISOString().split('T')[0]}
Priority: ${priority || 'medium'}
Title: ${title}
Description: ${description || 'None'}

Return ONLY valid JSON:
{"effort":"Small (1-2 hours)|Medium (1 day)|Large (2-3 days)|Epic (1+ week)","suggestedDueDate":"YYYY-MM-DD","reason":"brief explanation"}`;

    const text = await tryGemini(prompt);
    if (text) {
      try {
        return res.status(200).json(parseAiJson(text));
      } catch {
        // fall through to local
      }
    }

    res.status(200).json(estimateLocally(title, description, priority));
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(200).json(estimateLocally(req.body.title, req.body.description, req.body.priority));
  }
};

// @desc    Suggest subtasks
const suggestSubtasks = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const prompt = `Suggest 4-8 logical subtasks for:
Title: ${title}
Description: ${description || 'None'}

Return ONLY valid JSON: {"subtasks":["subtask 1","subtask 2"]}`;

    const text = await tryGemini(prompt);
    if (text) {
      try {
        const parsed = parseAiJson(text);
        if (parsed.subtasks?.length) return res.status(200).json(parsed);
      } catch {
        // fall through
      }
    }

    res.status(200).json({ subtasks: suggestSubtasksLocally(title, description) });
  } catch (error) {
    res.status(200).json({ subtasks: suggestSubtasksLocally(req.body.title, req.body.description) });
  }
};

// @desc    Categorize task
const categorizeTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const prompt = `Categorize this task into 1-2 categories from: Development, Design, Marketing, HR, QA, Planning, DevOps, General.
Title: ${title}
Description: ${description || 'None'}

Return ONLY valid JSON: {"tags":["Category1"]}`;

    const text = await tryGemini(prompt);
    if (text) {
      try {
        const parsed = parseAiJson(text);
        if (parsed.tags?.length) return res.status(200).json(parsed);
      } catch {
        // fall through
      }
    }

    res.status(200).json({ tags: categorizeLocally(title, description) });
  } catch (error) {
    res.status(200).json({ tags: categorizeLocally(req.body.title, req.body.description) });
  }
};

// @desc    Parse natural language
const parseNaturalLanguage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Input text is required' });

    const prompt = `Extract task data from: "${text}"
Today: ${new Date().toISOString().split('T')[0]}

Return ONLY valid JSON: {"title":"string","dueDate":"YYYY-MM-DD or null","priority":"low|medium|high"}`;

    const aiText = await tryGemini(prompt);
    if (aiText) {
      try {
        return res.status(200).json(parseAiJson(aiText));
      } catch {
        // fall through
      }
    }

    res.status(200).json(parseLocally(text));
  } catch (error) {
    res.status(200).json(parseLocally(req.body.text));
  }
};

module.exports = {
  suggestEstimate,
  suggestSubtasks,
  categorizeTask,
  parseNaturalLanguage,
};
