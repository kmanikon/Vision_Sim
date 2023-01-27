import React, { useState, useEffect, useRef } from "react";
 
import { } from './components'

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//default image"
//import classroom from './images/classroom.jpg';
//import photo from './images/person.jpg';
import myopic from './images/myopic.png';


// starting images while loading model:
import r1 from './images/result1.png';
import r2 from './images/result2.png';
import r3 from './images/result3.png';
import r4 from './images/result4.png';
import r5 from './images/result5.png';
import r6 from './images/result6.png';
import r7 from './images/result7.png';
import r8 from './images/result8.png';
import r9 from './images/result9.png';
import r10 from './images/result10.png';

import axios from 'axios';

import { API } from './api.js';


// for slider
function valuetext(value) {
    return `${value}`;
  }

 
// make post request to upload new image
// get back processed images array (20)

async function sendit(url, h, result, width, height, setResp, setCanBlur){
    
    // form body
    const formData = new FormData();
    formData.append('image', result);
    formData.append('filename', 'image.png');
    formData.append('width', width);
    formData.append('height', height);
    
    
    console.log(formData)  
        

    // get post response (10 blurred images)
    fetch(url, {    
        method: 'POST',       
        //headers: h
        body: formData    
      })     
  
    .then(data => data.json()) 
    .then(data => {  
        // Do something with the data
        setResp(data) 
        //console.log(data);
        setCanBlur(true)   
      }) 
}


async function postImage(image, setResp, width, height, setFirst, setCanBlur){
     

    // currently down, but this would be my deployed backend url
    //const url = "https://visionsim-backend.onrender.com/image";

    // backend on localhost for testing and demos
    const url = "http://localhost:5000/image"

    // dummy url for testing purposes
    //const url = 'https://flask-demo-2puz.onrender.com/image'
     
    const h = {  
        'Content-Type': 'application/json',

    }; //headers 
   
    
    var reader = new FileReader(); 
   
    reader.onloadend = function() {
        //console.log('RESULT', reader.result)

        sendit(url, h, reader.result, width, height, setResp, setCanBlur)
          
    } 
    reader.readAsDataURL(image);
    
}




async function resizeAndDraw(image){

        var myCanvas = document.getElementById('Canvas');
        

        myCanvas.width = window.innerWidth;
        myCanvas.height = 600;

        var scale_factor = 1.0;

        
        while (myCanvas.height > 600){
            if (image.height > myCanvas.height){
                myCanvas.height = image.height;
            }
            
            if (image.width > myCanvas.width){
                myCanvas.width = image.width;
            }
        }

      
        image.onload = () => {



            console.log(image.width, image.height);

            var context = myCanvas.getContext('2d');


            // set size proportional to image (done already)
            //myCanvas.height = myCanvas.width * (image.height / image.width) * scale_factor;

            // step 1 - resize to canvas
            var oc = document.createElement('canvas'),
            octx = oc.getContext('2d');
    
            oc.width = image.width * scale_factor;
            oc.height = image.height * scale_factor;

            
            // step 2 - draw scaled image on test Canvas, then the element
            octx.drawImage(image, 0, 0, oc.width, oc.height);
            octx.drawImage(oc, 0, 0, oc.width * scale_factor, oc.height * scale_factor);


            context.drawImage(oc, 0, 0, oc.width * scale_factor, oc.height * scale_factor, 0, 0, myCanvas.width, myCanvas.height);
            
            const tempImg = oc;
            tempImg.width = myCanvas.width;
            tempImg.height = myCanvas.height;


            console.log('Canvas Dimensions: ' + myCanvas.width + ", " + myCanvas.height);
            console.log('do');


      };
      


}

async function resize(image) {
    await resizeAndDraw(image);
}



function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], {type: mimeString});

 
}



function App(props) {

    const [upImage, setUpImage] = useState();
    const [OGImage, setOGImage] = useState();
    const [loadingimg, setLoading] = useState(false);
    const [first, setFirst] = useState(true);
    const [canBlur, setCanBlur] = useState(true);
    //const [firsttime, setFirst] = useState(true);

    const [resp, setResp] = useState();

    const [imgArr, setImgArr] = useState([]);

    const [val, setVal] = useState(0);

    const val2 = 0;




    useEffect(() => {    
    
        var image = new Image();
        if (!upImage){
            image.src = myopic;
            setOGImage(image.src);
            resizeAndDraw(image);
        }
        else {
            image.src = URL.createObjectURL(upImage);
            setFirst(false)
 
            setCanBlur(false)
            setOGImage(image.src);

        }
        

        var myCanvas = document.getElementById('Canvas');


        const w = myCanvas.width;
        const h = myCanvas.height;



        setImgArr(postImage(upImage, setResp, w, h, setFirst, setCanBlur));
        
        


        console.log('upload finished')
        if (resp){
            console.log('resp is good')
            console.log(resp)
        } else {
            console.log('resp is null')
        }

        // if canBlur == false, then put up loading sign
        
      
    }, [upImage]); // upImage


    
    useEffect(() => {
        //console.log('first? ' + first);

        
        //if (canBlur == true){
            
            console.log('resp:')
            console.log(resp)
            //resizeAndDraw(classroom);
            if (resp){
                //console.log(resp['image'][0])

                var myCanvas = document.getElementById('Canvas');
                var context = myCanvas.getContext('2d');

                var imageData = resp['image'][val]

                var img = new Image();

                //console.log(imageData)

                img.onload = function() {
                    context.drawImage(img, 0, 0, myCanvas.width, myCanvas.height);
                    console.log('drawing blur step')
                };
                img.src = "data:image/png;base64," + imageData
    

                console.log('blurred');
            }


            else {
                var myCanvas = document.getElementById('Canvas');
                var context = myCanvas.getContext('2d');

                var img = new Image();
                //img.width = myCanvas.width
                //img.height = myCanvas.height


                img.onload = function() {
                    //img.width = myCanvas.width
                    //img.height = myCanvas.height
                    context.drawImage(img, 0, 0, myCanvas.width, myCanvas.height);
                    console.log('drawing blur step')
                };
                switch(val){
                    case 1:
                        img.src = r1
                    break;
                    case 2:
                        img.src = r2
                    break;
                    case 3:
                        img.src = r3
                    break;
                    case 4:
                        img.src = r4
                    break;
                    case 5:
                        img.src = r5
                    break;
                    case 6:
                        img.src = r6
                    break;
                    case 7:
                        img.src = r7
                    break;
                    case 8:
                        img.src = r8
                    break;
                    case 9:
                        img.src = r9
                    break;
                    case 10:
                        img.src = r10
                    break;

                    default:
                        img.src = myopic

                }

                console.log('blurred no resp');
            }
        //}


    }, [val, canBlur]) // val
    
    

    const handleChange = (event) => {
        //event.preventDefault();
        setUpImage(event.target.files[0]);

        //postImage(upImage, setResp)
        //setImgArr(postImage(upImage, setResp));
    }


    const updateRange = (e, data) => {
        setVal(data);
        console.log(data);
    };

    const sightValues = [
        {
            value: 0,
            label: '0'
        },
        {
            value: 1,
            label: '-1'
        },
        {
            value: 2,
            label: '-2'
        },
        {
            value: 3,
            label: '-3'
        },
        {
            value: 4,
            label: '-4'
        },
        {
            value: 5,
            label: '-5'
        },
        {
            value: 6,
            label: '-6'
        },
        {
            value: 7,
            label: '-7'
        },
        {
            value: 8,
            label: '-8'
        },
        {
            value: 9,
            label: '-9'
        },
        {
            value: 10,
            label: '-10'
        }
    ]

    
    return (

        <div className="App">

            <div className="resize_img">
                <canvas id="Canvas" />
            </div>     

        <Box sx={{ width: 400 }} className="center">
            <Slider 
                defaultValue={5}
                getAriaValueText={valuetext}
                step={1}
                marks={sightValues}
                min={0}
                max={10}
                onChange={updateRange}
                value={val}
            />
        </Box> 
      
        <div className="drop-title">

            {loadText(canBlur)}
        </div>

        <label for="images" className="drop-container">
                <span className="drop-title">Drop files here</span>
                or
                <input type="file" id="images" accept="image/*" onChange={handleChange} required/>
            </label>        
        </div>
      );
    

}
  

function loadText (canBlur) {
    if (!canBlur){
        return <div>Loading...</div>
    }

}


export default App;
