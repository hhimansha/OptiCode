import { OpenRouter } from "@openrouter/sdk";
import InterviewQuestion from '../../models/IT22639226/InterviewQuestion.js'; // import schema

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

export const generateInterviewQuestions = async (req, res) => {
  try {
    const stream = await openrouter.chat.send({
      model: "deepseek/deepseek-r1-0528:free",
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer who generates simple coding interview questions with answers."
        },
        {
          role: "user",
          content: `
Write a program which will find all numbers divisible by 7 but not by 5 between 2000 and 3200.  
Assume the user has written the following code:

CONTENT:
result = []

for i in range(2000, 3201):
    if i % 7 == 0 and i % 5 != 0:
        result.append(str(i))

print(",".join(result))

Please generate **exactly 5 simple questions** about this code, each with its answer, and respond **ONLY in valid JSON array format**.
`
        }
      ]
    });

    // Collect streamed content
    let fullResponse = "";
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) fullResponse += delta;
    }

    const cleanJson = fullResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    let questionsArray = [];
    try {
      questionsArray = JSON.parse(cleanJson);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return res.status(500).json({
        message: "Failed to parse AI response as JSON",
        rawResponse: cleanJson
      });
    }

    // Save to MongoDB
    const savedQuestions = await InterviewQuestion.create({
       user: req.userId, // comes from userAuth middleware
      questions: questionsArray
    });

    res.status(200).json(savedQuestions);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate interview questions",
      error: error.message
    });
  }
};
