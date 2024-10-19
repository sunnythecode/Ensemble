const Groq = require("groq-sdk"); // Use require to import the Groq SDK
const { getShirtsByUserId } = require('../util/mongodb-client');

const groq = new Groq({ apiKey: "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" }); // Initialize Groq with your API key

async function sendChat() {
    const base64Outputs = await getShirtsByUserId("67134047645b972a0f1ecdb5");
    const base64URL = base64Outputs[0].base64Image;
    console.log(base64Outputs[0]._id);
    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Rank this piece of clothing out of 10 based on it being worn for the following context: The clothing is to be worn at a formal dinner. Enter your ranking on one line, in the format: \n \n Rank: {ranking}/10 \n {Explanation}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base64URL
                        }
                    }
                ]
            },
            {
                "role": "assistant",
                "content": ""
            }
        ],
        "model": "llama-3.2-11b-vision-preview",
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": false,
        "stop": null
    });

    console.log(chatCompletion.choices[0].message.content);
}

sendChat();