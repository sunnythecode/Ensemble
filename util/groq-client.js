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
    const shoes = await getClothesTypeByUserId(userID, "shoes");


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

    const maxRankingPant = updatedPants.reduce((maxP, pant) => 
        pant.Ranking > maxP.Ranking ? pant : maxP
    );

    const updatedShoes = await Promise.all(
        shoes.map(async (shoe) => {
            const ranking = await getRankingSinglePiece(shoe, context);
            return { ...shoe, Ranking: ranking.Ranking, Message: ranking.Message };
        })
    );

    const maxRankingShoe = updatedShoes.reduce((max, shoeMax) => 
        shoeMax.Ranking > max.Ranking ? shoeMax : max
    );

    // console.log(maxRankingShirt.name);
    // console.log(maxRankingShirt.Message);

    // console.log(maxRankingPant.name);
    // console.log(maxRankingPant.Message);


    return {BestShirt: maxRankingShirt, BestPant: maxRankingPant, BestShoe: maxRankingShoe};

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
                        "text": `Rank this piece of clothing out of 10 (10 is the best choice, 1 is the worst choice) based on it being worn for the following context: ${contextString}. Enter your ranking on one line, in the format: \n \n Rank: {ranking}/10 \n {Explanation}`
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
        "model": "llama-3.2-90b-vision-preview",
        "temperature": 0.7,
        "max_tokens": 1024,
        "top_p": 0.6,
        "stream": false,
        "stop": null
    });

    const message = chatCompletion.choices[0].message.content;
    console.log(pieceElem.name);
    
    const rank = findFirstDigit(message);
    console.log(rank);
    console.log(message);
    return {Ranking: rank, Message: message}; 
}

//const k = getRankingOfClothes("67134047645b972a0f1ecdb5");
module.exports = { getRankingOfClothes };