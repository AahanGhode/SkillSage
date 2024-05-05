import React, { useState, useEffect } from 'react';
import './Cards.css';

const Cards = ({ flashcards }) => {
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    if (!flashcards.length) {
        console.log("No flashcards available");
    }

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.keyCode === 37) { // Left arrow key
                setCurrentFlashcardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
                setShowAnswer(false);
            } else if (event.keyCode === 39) { // Right arrow key
                setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
                setShowAnswer(false);
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    });

    const toggleAnswer = (e) => {
        setShowAnswer(!showAnswer);
    };

    return (
        <div className="flashcard" onClick={toggleAnswer}>
            <h2>{flashcards.length > 0 ? (showAnswer ? flashcards[currentFlashcardIndex].answer : flashcards[currentFlashcardIndex].question) : "No flashcards available"}</h2>
        </div>
    );
};

export default Cards;
