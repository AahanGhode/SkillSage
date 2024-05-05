import React, { useRef, useState } from "react";
import { cardsContainer } from "../pages/Dashboard"
import "./Topics.css";
import axios from "axios";
import { currentMenu } from "../pages/Dashboard";
import ReactDOM from 'react-dom';
import Cards from "./Cards";


const selectedTopicsList = []

const selectTopic = (e) => {
    const topic = e.target.textContent
    if (selectedTopicsList.includes(topic)) {
        e.target.style.borderTop = "none";
        e.target.style.borderBottom = "none";
        const index = selectedTopicsList.indexOf(topic)
        selectedTopicsList.splice(index, 1)
    }
    else {
        e.target.style.border = "2px solid #00BF71"
        if (topic.substring(0, 2) === '\n') {
            selectedTopicsList.push(topic.substring(0, 2));
        } else {
            selectedTopicsList.push(topic);
        }
    }
}

const generateCards = async (e) => {
    e.target.parentNode.parentNode.parentNode.style.display = 'none';
    cardsContainer.current.style.display = 'flex';
    
    const response = await axios.post(
        "http://localhost:3001/getflashcards",
        { topics: selectedTopicsList }
    );

    let flashcardsData = response.data;
    console.log(flashcardsData);

    // change flashcards data
    ReactDOM.render(<Cards flashcards={flashcardsData} />, cardsContainer.current);
}


const generateQuiz = async (e) => {
    e.target.parentNode.parentNode.parentNode.style.display = 'none';
    cardsContainer.current.style.display = 'flex';
    
    const response = await axios.post(
        "http://localhost:3001/getquiz",
        {
            topics: selectedTopicsList,
            numMcq: 8,
            numTF: 5,
            numSA: 3
        }
    );

    console.log(response.data);
}

const Topics = () => {
    const [topicsList, setTopicsList] = useState([])
    const submitTopic = (e) => {
        if (e.key !== "Enter") return
        const value = e.target.value.trim()
        if (!value) return

        setTopicsList([...topicsList, value])
        selectedTopicsList.push(e.target.value)
        e.target.style.border = "2px solid #00BF71"
        e.target.value = ''
        console.log(selectedTopicsList);
        
        setRefreshTextarea(Math.random())
        
    }

    const [refreshTextarea, setRefreshTextarea] = useState(0)

    return (<div>
        <div className='popupBg'>
            <h1 className="title">Topics</h1>
            <div className="topics-list">
                {topicsList.map((topic) => <div onClick={selectTopic}>{topic}</div>)}
            </div>
            <textarea key={refreshTextarea} onKeyPress={submitTopic} placeholder="Nuclear Decay"/>
            <button className="generateButton" onClick={((currentMenu === "flashcards") ? generateCards : generateQuiz)}>Generate</button>
        </div>
    </div>)
}

export default Topics