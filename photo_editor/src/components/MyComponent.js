
import React, { useRef, useState, useEffect } from 'react';

function MyComponent() {
    const myCanvas = useRef();
    const [upImage, setUpImage] = useState(null);

    useEffect(() => {
      const context = myCanvas.current.getContext("2d");
      const image = new Image();
      if (!upImage){
      image.src =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/1200px-Picture_icon_BLACK.svg.png";
      }
      else {
        image.src = URL.createObjectURL(upImage);
      }
        image.onload = () => {
        context.drawImage(image, 0, 0, 500, 500);
      };
    }, [upImage]);

    const handleChange = (event) => {
        setUpImage(event.target.files[0]);
    }
  
    return <div>
        <input type="file" onChange={handleChange} />
        <canvas ref={myCanvas} width={500} height={500} />
        </div>
        ;
}

export default MyComponent