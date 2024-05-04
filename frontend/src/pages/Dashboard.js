import React from 'react';
import '../App.css';
import './Dashboard.css';
import FileUpload from '../components/FileUpload';
import logo from '../assets/logo.png';
import plus from '../assets/plus.svg'
import flashIcon from '../assets/flash.png'
import quizIcon from '../assets/quiz.png'
import chatIcon from '../assets/chat.png'
import guideIcon from '../assets/guide.png'

function Dashboard() {
  return (
    <div className='background'>
        <div className="menu">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="menu-upload menu-item">
            <img src={plus} alt="upload" />
            <h3 className="uploadText">Upload</h3>
          </div>

          <div className="flashcards">
            <img src={flashIcon} alt="flashcard" />
          </div>
          <div className="menu-item">
            <img src={flashIcon} alt="upload" />
            <h3 className="uploadText">Flashcards</h3>
          </div>

          <div className="quiz">
            <img src={quizIcon} alt="quiz" />
          </div>
          <div className="menu-item">
            <img src={plus} alt="upload" />
            <h3 className="uploadText">Quiz</h3>
          </div>

          <div className="chat">
            <img src={chatIcon} alt="chat" />
          </div>
          <div className="menu-item">
            <img src={plus} alt="upload" />
            <h3 className="uploadText">Chat</h3>
          </div>

          <div className="guide">
            <img src={guideIcon} alt="guide" />
          </div>
          <div className="menu-item">
            <img src={plus} alt="upload" />
            <h3 className="uploadText">Study Guide</h3>
          </div>
        </div>
        
        <div className='upload-btn-container'>
          <FileUpload />
          <div><h3 className='labels sizeLabel'>Max size: <h4 className='unlimited'>Unlimited</h4></h3></div>
          <div><h3 className='labels'>Supported files types