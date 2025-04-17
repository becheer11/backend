const { Ollama } = require('ollama');

const ollama = new Ollama({
  host: 'http://localhost:11434'
});

async function askLLM(prompt) {
  try {
    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
      options: {
        temperature: 0.7,
        num_predict: 50
      }
    });

    const text = response.message?.content?.trim() || '';
    const scoreMatch = text.match(/\d+(\.\d+)?/);
    return scoreMatch ? parseFloat(scoreMatch[0]) : 0;
  } catch (err) {
    console.error("Ollama Error:", err.message);
    return 0;
  }
}

function createPrompt(type, text) {
  const instructions = {
    content: "Rate creativity (0-20). Reply ONLY with the number:",
    expertise: "Rate expertise (0-15). Reply ONLY with the number:",
    influence: "Rate influence (0-15). Reply ONLY with the number:",
    branding: "Rate professionalism (0-10). Reply ONLY with the number:"
  };
  return `${instructions[type]}\n${text.slice(0, 1500)}`;
}

async function evaluateQualitativeCriteria(profileData) {
  if (!profileData) return defaultScores();

  try {
    const inputs = {
      content: profileData.recent_posts?.map(p => p.caption || "").join("\n"),
      expertise: `${profileData.bio}\n${profileData.recent_posts?.map(p => p.caption).join("\n")}`,
      branding: `${profileData.bio}\n${profileData.recent_posts?.map(p => p.caption).join("\n")}`
    };

    const [content, expertise, branding] = await Promise.all([
      askLLM(createPrompt('content', inputs.content)),
      askLLM(createPrompt('expertise', inputs.expertise)),
      askLLM(createPrompt('branding', inputs.branding))
    ]);

    return {
      content: Math.min(content, 20),
      expertise: Math.min(expertise, 15),
      influence: Math.min((content + expertise) / 2, 15), // Simplified
      professionalism: Math.min(branding, 10),
      total: Math.min(content + expertise + branding + ((content + expertise) / 2), 60)
    };
  } catch (error) {
    console.error("Evaluation failed:", error);
    return defaultScores();
  }
}

function defaultScores() {
  return {
    content: 0,
    expertise: 0,
    influence: 0,
    professionalism: 0,
    total: 0
  };
}

module.exports = {
  evaluateQualitativeCriteria
};