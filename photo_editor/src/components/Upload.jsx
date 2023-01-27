import React, { useState } from 'react';

import classroom from '../images/classroom.jpg';




const Upload = () => {
  const [file, setFile] = useState(classroom);
    function handleChange(e) {
        console.log(e.target.files);
        setFile(URL.createObjectURL(e.target.files[0]));
    }
    
    //const myImageStyle = { width: '500px', height: '600px' };


  return (
    <div>
      
      <div >
        
      <img src={file} className="image_format"/>
      </div>

      <label for="images" class="drop-container">
        <span class="drop-title">Drop files here</span>
        or
        <input type="file" id="images" accept="image/*" onChange={handleChange} required/>
      </label>

    </div>
  )
}

export default Upload

/*
const [file, setFile] = useState(classroom);
    function handleChange(e) {
        console.log(e.target.files);
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    <img src={file} className="image_format"/>
<div className="center">
          Upload Image
          
        </div>
        <input type="file" onChange={handleChange} />
        */