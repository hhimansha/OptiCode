import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OpenRouter_Api_key
});

export const generateInterviewQuestions = async (req, res) => {
  try {
    const stream = await openrouter.chat.send({
      model: "deepseek/deepseek-r1-0528:free",
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer conducting a real-life React interview."
        },
        {
          role: "user",
          content: `
Based on the following content, generate interview questions WITH answers.

CONTENT:
Introduction to React
An introduction to the React view library
What is React?
React is a JavaScript library that aims to simplify development of visual interfaces.
Developed at Facebook and released to the world in 2013, it drives some of the most widely
used apps, powering Facebook and Instagram among countless other applications.
Its primary goal is to make it easy to reason about an interface and its state at any point in
time, by dividing the UI into a collection of components.
Why is React so popular?
React has taken the frontend web development world by storm. Why?
Less complex than the other alternatives
At the time when React was announced, Ember.js and Angular 1.x were the predominant
choices as a framework. Both these imposed so many conventions on the code that porting an
existing app was not convenient at all. React made a choice to be very easy to integrate into
an existing project, because that's how they had to do it at Facebook in order to introduce it to
the existing codebase. Also, those 2 frameworks brought too much to the table, while React
only chose to implement the View layer instead of the full MVC stack.
Perfect timing
At the time, Angular 2.x was announced by Google, along with the backwards incompatibility
and major changes it was going to bring. Moving from Angular 1 to 2 was like moving to a
different framework, so this, along with execution speed improvements that React promised,
made it something developers were eager to try.
Backed by Facebook
Being backed by Facebook obviously is going to benefit a project if it turns out to be
successful.
Introduction to React
7
Facebook currently has a strong interest in React, sees the value of it being Open Source, and
this is a huge plus for all the developers using it in their own projects.
Is React simple to learn?
Even though I said that React is simpler than alternative frameworks, diving into React is still
complicated, but mostly because of the corollary technologies that can be integrated with
React, like Redux and GraphQL.
React in itself has a very small API, and you basically need to understand 4 concepts to get
started:
Components
JSX
State
Props
All these (and more) are explained in this handbook.
Now, based on the above content, generate exactly 10 interview questions along with clear, correct answers.

REQUIREMENTS:
- Generate exactly 10 questions
- Include clear, correct answers
- Difficulty: medium (30–40 min interview)
- Real-life technical interview tone
- Return ONLY valid JSON
- No explanations outside JSON

FORMAT:
{
  "interviewQuestions": [
    { "question": "", "answer": "" }
  ]
}
`
        }
      ]
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk?.choices?.[0]?.delta?.content;
      if (content) fullResponse += content;
    }

    const cleanJson = fullResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(cleanJson);

    // ✅ SEND RESPONSE
    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate interview questions"
    });
  }
};
