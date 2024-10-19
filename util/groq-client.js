const Groq = require("groq-sdk"); // Use require to import the Groq SDK
const { getClothesTypeByUserId } = require('../util/mongodb-client');

const groq = new Groq({ apiKey: "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" }); // Initialize Groq with your API key

function findFirstDigit(str) {
    const match = str.match(/\d/); // \d matches a single digit
    return match ? match[0] : null; // Return the matched digit or null if not found
}

async function getRankingOfClothes(userID, context) {
    const shirts = await getClothesTypeByUserId(userID, "shirt");
    const pants = await getClothesTypeByUserId(userID, "pant");


    const updatedShirts = await Promise.all(
        shirts.map(async (shirt) => {
            const ranking = await getRankingSinglePiece(shirt, context);
            return { ...shirt, Ranking: ranking.Ranking, Message: ranking.Message };
        })
    );

    const maxRankingShirt = updatedShirts.reduce((max, shirt) => 
        shirt.Ranking > max.Ranking ? shirt : max
    );

    const updatedPants = await Promise.all(
        pants.map(async (pant) => {
            const ranking = await getRankingSinglePiece(pant, context);
            return { ...pant, Ranking: ranking.Ranking, Message: ranking.Message };
        })
    );

    const maxRankingPant = updatedPants.reduce((max, pant) => 
        pant.Ranking > max.Ranking ? pant : max
    );

    console.log(maxRankingShirt.name);
    console.log(maxRankingShirt.Message);

    console.log(maxRankingPant.name);
    console.log(maxRankingPant.Message);


    return {BestShirt: maxRankingShirt, BestPant: maxRankingPant};

}
async function getRankingSinglePiece(pieceElem, contextString) {
    const base64URL = pieceElem.base64Image;
    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": `Rank this piece of clothing out of 10 based on it being worn for the following context: ${contextString}. Enter your ranking on one line, in the format: \n \n Rank: {ranking}/10 \n {Explanation}`
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

    const message = chatCompletion.choices[0].message.content;
    const rank = findFirstDigit(message);
    return {Ranking: rank, Message: message}; 
}

//const k = getRankingOfClothes("67134047645b972a0f1ecdb5");
module.exports = { getRankingOfClothes };