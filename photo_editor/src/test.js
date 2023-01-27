// Function to get the pixel data for a given x, y coordinate
function getPixel(imageData, x, y) {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
      return [0, 0, 0, 0];
    }
    var index = (y * imageData.width + x) * 4;
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ];
  }
  
  // Function to set the pixel data for a given x, y coordinate
  function setPixel(imageData, x, y, pixel) {
    var index = (y * imageData.width + x) * 4;
    imageData.data[index] = pixel[0];
    imageData.data[index + 1] = pixel[1];
    imageData.data[index + 2] = pixel[2];
    imageData.data[index + 3] = pixel[3];
  }

  function detectFocus(imageData) {
    // Create a grayscale version of the image by extracting the intensity from each pixel
    const grayscale = imageData.data.map((_, i) => i % 4 === 3 ? 255 : (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
  
    // Create a 3x3 kernel for the Sobel operator
    const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const kernelY = [1, 2, 1, 0, 0, 0, -1, -2, -1];
  
    // Create an array to store the results of the Sobel operator
    const result = new Array(imageData.width * imageData.height).fill(0);
  
    // Iterate over each pixel in the image
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
            // Calculate the gradient in the x direction using the Sobel kernel
            let gx = 0;
            for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const pixel = grayscale[(y + ky) * imageData.width + (x + kx)];
                gx += pixel * kernelX[(ky + 1) * 3 + (kx + 1)];
            }
            }
    
            // Calculate the gradient in the y direction using the Sobel kernel
            let gy = 0;
            for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const pixel = grayscale[(y + ky) * imageData.width + (x + kx)];
                gy += pixel * kernelY[(ky + 1) * 3 + (kx + 1)];
            }
            }

            // Calculate the total gradient at this pixel
    result[y * imageData.width + x] = Math.sqrt(gx * gx + gy * gy);
            
        }
    }

    return result;
  }



function calcDistance (imageData, centerX, centerY, blurPix) {
    let distance = 0;
    for (let y = 0; y < imageData.height; y += blurPix) {
        for (let x = 0; x < imageData.width; x += blurPix) {
            distance = Math.sqrt((centerX - x)^2 + (centerY - y)^2)
        }
    }
    return distance;
}


function blurPixels(x, y, radius) {

    var myCanvas = document.getElementById('Canvas');
    var context = myCanvas.getContext('2d');

    var imageData = context.getImageData(0, 0, myCanvas.width, myCanvas.height);
    // Create a new image data object with the same dimensions
    var newImageData = context.createImageData(imageData);


  
    // Iterate over each pixel in the new image data
    for (var y = 0; y < newImageData.height; y++) {
      for (var x = 0; x < newImageData.width; x++) {
        // Calculate the average color of the surrounding pixels within the specified radius using a convolution kernel
        var r = 0, g = 0, b = 0, count = 0;
        for (var dy = -radius; dy <= radius; dy++) {
          for (var dx = -radius; dx <= radius; dx++) {
            var pixel = getPixel(imageData, x + dx, y + dy);
            r += pixel[0];
            g += pixel[1];
            b += pixel[2];
            count++;
          }
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
  
        // Set the pixel data for the new image data
        setPixel(newImageData, x, y, [r, g, b, 255]);
      }
    }
  
    context.drawImage(newImageData, 0, 0);
    return newImageData;
  }

  

function getFocusCenter(){
    var myCanvas = document.getElementById('Canvas');
    var context = myCanvas.getContext('2d');

    //console.log(myCanvas.width);
    //console.log(myCanvas.height);



    //var img = document.getElementById("myimage");

    var myData = context.getImageData(0, 0, myCanvas.width, myCanvas.height);
    const result = detectFocus(myData);

    //console.log(result);

        

    // center of focus = max value
    let maxGradient = 0;
    let focusX = 0; 
    let focusY = 0;

    for (let y = 0; y < myData.height; y++) {
        for (let x = 0; x < myData.width; x++) {
            const gradient = result[y * myData.width + x];
            if (gradient > maxGradient) {
                maxGradient = gradient;
                focusX = x;
                focusY = y;
            }
        }
    }

    console.log("center:");
    console.log(focusX);
    console.log(focusY);

    return [focusX, focusY];

}

               
function blurImage(orig_image){
    
    /*
    let [focusX, focusY] = getFocusCenter();

    console.log(focusX);
    console.log(focusY);
    */



    //blurPixels(150,150, 15);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Load the image into the canvas
    
    const image = new Image();
    image.src = orig_image;//"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/1200px-Picture_icon_BLACK.svg.png";
    
    let imageData;
    image.onload = () => {
        //context.drawImage(image, 0, 0);
        

        
        // Get the image data from the canvas
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Loop through each pixel and apply the blur effect
        for (let i = 0; i < imageData.data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
        
            // Check if the pixel is within the region to be blurred
            if (x > 50 && x < 100 && y > 50 && y < 100) {
            // Average the red, green, and blue channels and apply the result to all channels
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const avg = (r + g + b) / 3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
            }
        }
        
        
        
        

        console.log("putting new data");    
        // Put the modified image data back onto the canvas
        context.putImageData(imageData, 0, 0);
        console.log("putting new data2");   

        //return orig_image;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    //console.log("putting new data3");
    return imageData;
    };




    function blur(canvas, imageObj, context, passes) {
        passes = passes || 4;

        
        const image = imageObj;
        
        	
        console.log('h');




        console.log('hp');
        /*
        var i, x, y;
        //passes = passes || 4;
        context.globalAlpha = 0.24;
        // Loop for each blur pass.
        for (i = 1; i <= passes; i++) {
          for (y = -1; y < 2; y++) {
            for (x = -1; x < 2; x++) {
                context.drawImage(imageObj, x, y);
            }
          }
        }
        context.globalAlpha = 1.0;
        */
        
        

        
        //context.drawImage(image, 0, 0);

    /*

    const cornerRadius = 50;
        
    // Get the image data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Loop through each pixel and apply the blur effect to certain pixels
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);

      // Check if the pixel is within the corner region to be blurred
      if (x < cornerRadius && y < cornerRadius || x > canvas.width - cornerRadius && y < cornerRadius || x < cornerRadius && y > canvas.height - cornerRadius || x > canvas.width - cornerRadius && y > canvas.height - cornerRadius) {
        // Average the red, green, and blue channels and apply the result to all channels
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const avg = (r + g + b) / 3;
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }

    }
    

*/


    // Set the blur value for the shadow
    //context.shadowBlur = 50;
    // Set the shadow color
    //context.shadowColor = 'transparent';

/*
    context.filter = 'none'; // remove filter
    context.fillStyle = 'rgba(255,255,255,0.2)';
    //context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
       */

    /*

    // higher value = more blur
    var spread = 6;

    //var rectX = 200;
    //var rectY = 400;
    var rectWidth = 25;
    var rectHeight = 25;

    let [centerX, centerY] = getFocusCenter();

    let distance = 0;


    let scale_factor = 3.0;

    console.log("blur dimensions:");
    console.log(canvas.width);
    console.log(canvas.height);


    
    for (let x = 0; x < canvas.width; x += rectWidth){
        for (let y = 0; y < canvas.height; y += rectHeight){
            distance = Math.sqrt((centerX - x)^2 + (centerY - y)^2);

            //console.log(distance);

            // distance ^ val / scalefactor
            spread = Math.pow(distance, 1) / 5;
            context.filter = 'blur('+ spread +'px)';
            context.drawImage(canvas,
                x, y, rectWidth, rectHeight,
                x, y, rectWidth, rectHeight
            );
        }
    }
    
    */
    
    


    //distance = Math.sqrt((centerX - x)^2 + (centerY - y)^2)
    /*
    context.drawImage(canvas,
        rectX, rectY, rectWidth, rectHeight,
        rectX, rectY, rectWidth, rectHeight
    );
    */




    console.log("HEY");
    }



    function graduallyBlurFromPoint(context, x, y, radius, iterations) {
        for (let i = 0; i < iterations; i++) {
          // Set the alpha value for the shadow
          context.globalAlpha = (iterations - i) / iterations;

          // Set the blur value for the shadow
          //context.shadowBlur = i + 1;
          context.blur = i + 1;

          // Set the shadow color
          context.shadowColor = 'black';
          // Draw a circle at the specified point
          
          context.beginPath();
          context.arc(x, y, radius, 0, 2 * Math.PI);
          context.closePath();
          //context.fill();
          
          
        }
      }




     /*
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


            

            const canvas = fx.canvas(); // real

            const texture = canvas.texture(myCanvas); // real


            canvas.draw(texture).lensBlur(val, 0.75, 0).update(); // real


            context.drawImage(canvas, 0, 0); // real



            console.log('Canvas Dimensions: ' + myCanvas.width + ", " + myCanvas.height);
            console.log('do');
            

      };
      */