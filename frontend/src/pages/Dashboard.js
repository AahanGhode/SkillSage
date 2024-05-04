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
import Topics from '../components/Topics'

function Dashboard() {
  const uploadContainer = React.useRef(null)
  const topicsContainer = React.useRef(null)

  const showUpload = () => {
    uploadContainer.current.style.display = 'flex'
    topicsContainer.current.style.display = 'none'
  }

  const showTopics = () => {
    uploadContainer.current.style.display = 'none'
    topicsContainer.current.style.display = 'flex'
  }

  return (
    <div className='background'>
        <div className="menu">
          <div className="logo">
            <img src={logo} alt="logo" />
            <h4 className='slogan'>AI Powered Study Tool.</h4>
          </div>
          <div className="menu-upload menu-item" onClick={showUpload}>
            <img src={plus} alt="upload" />
            <h3 className="uploadText">Upload</h3>
          </div>
    
          <div className="menu-item flashcards" onClick={showTopics}>
            <img src={flashIcon} alt="flashcards" />
            <h3 className="uploadText">Flashcards</h3>
          </div>

          <div className="menu-item quiz" onClick={showTopics}>
            <img src={quizIcon} alt="quiz" />
            <h3 className="uploadText">Quiz</h3>
          </div>

          <div className="menu-item chat">
            <img src={chatIcon} alt="chat" />
            <h3 className="uploadText">Chat</h3>
          </div>

          <div className="menu-item guide" onClick={showTopics}>
            <img src={guideIcon} alt="guide" />
            <h3 className="uploadText">Study Guide</h3>
          </div>
        </div>
        
        <div className='upload-btn-container' ref={uploadContainer}>
          <FileUpload />
          <div><h3 className='labels sizeLabel'>Max size: <h4 className='unlimited'>Unlimited</h4></h3></div>
          <div><h3 className='labels'>Supported files types: <h4 className='fileTypes'>JPG, PNG, PDF, DOCX, PPTX</h4></h3></div>
        </div>

        <div className='topics-container' ref={topicsContainer}>
          <Topics />
        </div> 
    </div>
  )
}

export default Dashboard