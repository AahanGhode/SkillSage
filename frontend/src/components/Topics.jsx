import React, { useRef, useState } from "react";
import "./Topics.css";

const topicsList = ['Kinematics', 'Forces', 'Energy']
const selectedTopicsList = []

const selectedTopics = (topic) => {
    selectedTopicsList.push(topic)
}

const Topics = () => {
    return (<div>
        <div className='popupBg'>
            <h1 className="title">Topics</h1>
            <div className="topics-list">
                {topicsList.map((topic) => <div>{topic}</div>)}
            </div>
        </div>
    </div>)
}

export default Topics