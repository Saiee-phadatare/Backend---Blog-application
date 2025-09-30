const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.AI_API;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generate = async(prompt) =>{
    try{
        const result = await model.generateContent(prompt);
        //console.log(result.response.text());
        return result.response.text();
    }catch(err){
        console.log(err)
    }
}

const getai = async (req, res) => {
  try {
    const { question, type } = req.body; // type could be 'title', 'suggestion', 'content','correction' etc.
    
    if (!question || !type) {
      return res.status(400).json({ error: "Both question and type are required" });
    }

    let prompt;

    switch (type) {
        case "title":
            prompt = `Provide 5 blog titles for: "${question}"`;
            break;
        case "suggestion":
            prompt = `Provide 5 blog content suggestions for: "${question}"`;
            break;
        case "content":
            prompt = `Write a detailed blog about: "${question}"`;
            break;
        case "correction":
            prompt = `Correct the following sentence: "${question}"`;
            break;
        case "Other":
            prompt = `${question}`;
            break;
        default:
            return res.status(400).send({ error: "Invalid type provided" });
    }

    const result = await generate(prompt);
    res.json({ message:"true", result : result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Something went wrong" });
  }
};


module.exports = {
    getai
}
