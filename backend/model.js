// model class
class Model {
    constructor () {
        dotenv.config()
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        })
        this.text = ''
        this.chunks = []
        this.dictionary = new Map()
        this.selectedTopics = []
    }

    async loadPdf(pdfPath) {
        let dataBuffer = fs.readFileSync(pdfPath);
        const text = await pdf(dataBuffer).then((data) => data.text);

        this.text = text
    }

    async splitTextIntoChunks() {
        const words = this.text.split(' ');
        const chunks = [];
        let currentChunk = '';
        let wordCount = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (wordCount + word.split(' ').length <= 500) {
            currentChunk += word + ' ';
            wordCount += word.split(' ').length;
            } else {
            chunks.push(currentChunk.trim());
            currentChunk = word + ' ';
            wordCount = word.split(' ').length;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        this.chunks = chunks
    }

    async getResponse(prompt) {
        const response = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompt
                }
            ],
            model: "llama3-70b-8192"
        }).then((response) => response.choices[0].message.content)
    
        return response
    }

    async setSelectedTopics(topics) {
        this.selectedTopics = topics
    }

    async processChunksToDictionary() {
        for (let i = 0; i < chunks.length; i++) {
            const relatedText = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: chunks[i] + `Would anything here be relevant for a test on the topic?
                            If there are no actual concepts being explained (such as general topics), say no.
                            Say no to anything that might look like the table of contents.
                            Respond with one word, yes or no.`
                    }
                ],
                model: "llama3-70b-8192"
            }).then((response) => response.choices[0].message.content)

            if (relatedText.toLowerCase() === 'yes') {
                /* do nothing */
            } else if (relatedText.toLowerCase() !== 'no') {
                console.log('Invalid response.')
                console.log('Message:', relatedText)
                continue
            } else {
                continue
            }

            // Ask about what topic the text is about
            const topic = await groq.chat.completions.create({
                messages: [
                {
                    role: "system",
                    content: `What topic is this text about? Answer with a term and nothing else.`
                }
            ],
                model: "llama3-70b-8192"
            }).then((response) => response.choices[0].message.content)

            if (!dictionary.has(topic)) {
                dictionary[topic] = [i];
            } else {
                dictionary[topic].push(i);
            }
        }

        this.dictionary = dictionary
    }

    async generateQuiz(numMCQ, numTF, numSA) {
        const topics = this.selectedTopics

        const quiz = [];

        for (let i = 0; i < numMCQ; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunkIndex = dictionary[topic][Math.floor(Math.random() * dictionary[topic].length)];

            const prompt = `Make a multiple choice question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunks[chunkIndex]}
            
                Format:
                Question: {question}
                A) {option1}
                B) {option2}
                C) {option3}
                D) {option4}
                Correct Answer: {answerletter}
                Explanation: {explanation}
            `;

            const response = await getResponse(prompt);
            quiz.push(response);
        }

        for (let i = 0; i < numTF; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunkIndex = dictionary[topic][Math.floor(Math.random() * dictionary[topic].length)];

            const prompt = `Make a true/false question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunks[chunkIndex]}
            
                Format:
                Question: {question}
                True/False: {truefalse - "true" or "false"}
                Explanation: {explanation}
            `;

            const response = await getResponse(prompt);
            quiz.push(response);
        }

        for (let i = 0; i < numSA; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunkIndex = dictionary[topic][Math.floor(Math.random() * dictionary[topic].length)];

            const prompt = `Make a short answer question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunks[chunkIndex]}
            
                Format:
                Question: {question}
                Answer: {answer}
                Explanation: {explanation}
            `;

            const response = await getResponse(prompt);
            quiz.push(response);
        }

        return quiz;
    }
}

export default Model