import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import pdf from 'pdf-parse';
import fs from 'fs';
// model class
export class Model {
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
        for (let i = 0; i < this.chunks.length; i++) {
            const relatedText = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: this.chunks[i] + `Would anything here be relevant for studying about the topic?
                            If there are no actual concepts being explained, say no.
                            Say no to anything that might look like the table of contents, or any information that doesn't. pertain to things that might be in a text book (instructions, introductions, conclusions, index, etc.)
                            Respond with one word, yes or no with no punctuation.`
                    }
                ],
                model: "llama3-70b-8192"
            }).then((response) => response.choices[0].message.content)

            if (relatedText.toLowerCase().trim() === 'yes') {
                /* do nothing */
            } else if (relatedText.toLowerCase().trim() !== 'no') {
                console.log('Invalid response.')
                continue
            } else {
                continue
            }

            // Ask about what topic the text is about
            const topic = await this.groq.chat.completions.create({
                messages: [
                {
                    role: "system",
                    content: `What topic(s) is this text about? Don't answer with "History" or "Physics" or general terms like this. Instead, answer things that could be the name of their own unit, like "Vectors" or "Kinematics" or "Quadratics" or "Truman Doctrine". If there are multiple terms in the text, separate the terms by commas. Also, don't answer with anything other than the topics(s). ${this.chunks[i]}`
                }
            ],
                model: "llama3-70b-8192"
            }).then((response) => response.choices[0].message.content)

            const topicSplit = topic.split(',').map((topic) => topic.trim())

            for (let topic of topicSplit) {
                topic = topic.toLowerCase().normalize();
                if (!this.dictionary.has(topic)) {
                    this.dictionary[topic] = [i];
                } else {
                    this.dictionary[topic].push(i);
                }
            }
        }
    }

    async generateQuiz(numMCQ, numTF, numSA) {
        const topics = this.selectedTopics
        // const dictionary = this.dictionary
        const chunks = this.chunks

        console.log(topics)
        console.log(chunks.length)

        const quiz = [];

        for (let i = 0; i < numMCQ; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunk = chunks[Math.floor(Math.random() * chunks.length)];

            const prompt = `Make a multiple choice question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunk}
            
                Format:
                Question: {question}
                A) {option1}
                B) {option2}
                C) {option3}
                D) {option4}
                Correct Answer: {answerletter}
                Explanation: {explanation}
            `;
            const response = await this.getResponse(prompt);

            // split by line
            // if line starts with Question:, get text after colon
            // if line starts with A), get text after colon
            // if line starts with B), get text after colon
            // if line starts with C), get text after colon
            // if line starts with D), get text after colon
            // if line starts with Correct Answer:, get text after colon
            // if line starts with Explanation:, get text after colon

            const lines = response.split('\n');
            const type = 'mcq';
            let question = '';
            let option1 = '';
            let option2 = '';
            let option3 = '';
            let option4 = '';
            let answer = '';
            let explanation = '';

            for (let line of lines) {
                if (line.startsWith('Question:')) {
                    question = line.substring(9).trim();
                } else if (line.startsWith('A)')) {
                    option1 = line.substring(3).trim();
                } else if (line.startsWith('B)')) {
                    option2 = line.substring(3).trim();
                } else if (line.startsWith('C)')) {
                    option3 = line.substring(3).trim();
                } else if (line.startsWith('D)')) {
                    option4 = line.substring(3).trim();
                } else if (line.startsWith('Correct Answer:')) {
                    answer = line.substring(15).trim();
                } else if (line.startsWith('Explanation:')) {
                    explanation = line.substring(12).trim();
                }
            }

            quiz.push({type, question, option1, option2, option3, option4, answer, explanation});
        }

        for (let i = 0; i < numTF; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunk = chunks[Math.floor(Math.random() * chunks.length)];

            const prompt = `Make a true/false question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunk}
            
                Format:
                Question: {question}
                True/False: {truefalse - "true" or "false"}
                Explanation: {explanation}
            `;

            const response = await this.getResponse(prompt);

            const lines = response.split('\n');
            const type = 'tf';
            let question = '';
            let truefalse = '';
            let explanation = '';

            for (let line of lines) {
                if (line.startsWith('Question:')) {
                    question = line.substring(9).trim();
                } else if (line.startsWith('True/False:')) {
                    truefalse = line.substring(11).trim();
                } else if (line.startsWith('Explanation:')) {
                    explanation = line.substring(12).trim();
                }
            }

            quiz.push({type, question, truefalse, explanation});
        }

        for (let i = 0; i < numSA; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const chunk = chunks[Math.floor(Math.random() * chunks.length)];

            const prompt = `Make a short answer question based on this text. It must relate to ${topic}
                Put it in the format of the following, and nothing else.
                Text: 
                ${chunk}
            
                Format:
                Question: {question}
                Answer: {answer}
                Explanation: {explanation}
            `;

            const response = await this.getResponse(prompt);

            const lines = response.split('\n');
            const type = 'sa';
            let question = '';
            let answer = '';
            let explanation = '';

            for (let line of lines) {
                if (line.startsWith('Question:')) {
                    question = line.substring(9).trim();
                } else if (line.startsWith('Answer:')) {
                    answer = line.substring(7).trim();
                } else if (line.startsWith('Explanation:')) {
                    explanation = line.substring(12).trim();
                }
            }

            quiz.push({type, question, answer, explanation});
        }

        return quiz;
    }

    async generateFlashcards() {
        const topics = this.selectedTopics
        // const dictionary = this.dictionary
        const chunks = this.chunks

        console.log(topics)
        console.log(chunks)

        const flashcards = [];

        for (let topic of topics) {
            for (let chunk of chunks) {
                const prompt = `Make a flashcard based on this text. Choose either question, formula, term, or definition. It must relate the topic: ${topic}. If it doesn't, say "no" and nothing else.
                    Put it in the format of the following. Make the front of the card the question or a term, and the back the answer or the definition.
                    Do not add "Here is a flashcard based on the text:" or anything like that. Just the question and answer, or "no" if it doesn't relate to any topic.


                    Text: 
                    ${chunk}
                
                    Format:
                    Front: {front}
                    Back: {back}
                `;

                const response = await this.getResponse(prompt);

                if (response.toLowerCase().trim() === 'no') {
                    continue;
                }


                // parse response, split by \n, if line starts with Front: or Back:, get the text after the colon

                const lines = response.split('\n');
                let question = '';
                let answer = '';
                for (let line of lines) {
                    if (line.startsWith('Front:')) {
                        question = line.substring(6).trim();
                    } else if (line.startsWith('Back:')) {
                        answer = line.substring(5).trim();
                    }
                }

                flashcards.push( {question: "Q: ".concat(question), answer: "A: ".concat(answer)} );
            }
        }

        console.log(flashcards)

        return flashcards;
    }
}