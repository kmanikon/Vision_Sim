# to setup venv:
# python3 -m venv venv
# source venv/bin/activate

from flask import Flask
from flask import request

from flask_cors import CORS, cross_origin

from PIL import Image, ImageFilter

import numpy as np

import cv2
import torch

import io
import os
import matplotlib
matplotlib.use('agg')

import matplotlib.pyplot as plt

import shutil
from werkzeug.utils import secure_filename

import base64
import imgkit

from flask import send_file
from flask import jsonify, make_response


app = Flask(__name__)
CORS(app)


# load / configure model here

#model_type = "DPT_Large"     # MiDaS v3 - Large     (highest accuracy, slowest inference speed)
#model_type = "DPT_Hybrid"   # MiDaS v3 - Hybrid    (medium accuracy, medium inference speed)
model_type = "MiDaS_small"  # MiDaS v2.1 - Small   (lowest accuracy, highest inference speed)

midas = torch.hub.load("intel-isl/MiDaS", model_type)

device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas.to(device)
midas.eval()

midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")

if model_type == "DPT_Large" or model_type == "DPT_Hybrid":
    transform = midas_transforms.dpt_transform
else:
    transform = midas_transforms.small_transform









# post -> take upload image, width, height, name
#         returns 10 images with increasing blur, success / fail

# get ->  return dummy values

@app.route("/image", methods=["GET", "POST"])

def process_image():

    # use this to index post body
    r = request.form

    # post:
    if request.method == 'POST':

        defImg = 0

        # image found:
        if 'image' != '':

            # image is sent unencoded, so encode to bytes and write to file
            b = bytes(r['image'].split(',')[1], 'utf-8')

            with open('./images/upImg.png', "wb") as fh:
                fh.write(base64.decodebytes(b))
            

        # no image found (default image)
        else:
            defImg = 1
            shutil.copyfile('./images/myopic.png','./images/upImg.png')

            print('./images/myopic.png')
            

        imo = cv2.imread('./images/upImg.png')

        #h, w, c = imo.shape

        width = int(r['width'])
        height = int(r['height'])

   


        # code to get grayscale image

        filename = './images/upImg.png'

        img = cv2.imread(filename)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        input_batch = transform(img).to(device)

        

        # generate a depth map:

        with torch.no_grad():
            prediction = midas(input_batch)

            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=img.shape[:2],
                mode="bicubic",
                align_corners=False,
            ).squeeze()

        output = prediction.cpu().numpy()


        shutil.copyfile('./images/upImg.png','./images/depthmap.png')


        # store depth map without x/y axis:

        fig = plt.imshow(output)
        plt.axis('off')
        plt.savefig('./images/depthmap.png', bbox_inches='tight', pad_inches = 0)
        
        



        # convert to grayscale (again)
        image = cv2.imread('./images/depthmap.png')
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        cv2.imwrite('./images/depthmap.png', gray_image)



        #width = image.shape[0]
        #height = image.shape[1]


        image = Image.open('./images/depthmap.png')
        resized = image.resize((width, height))
        resized.save('./images/depthmap.png')

        image = Image.open('./images/upImg.png')
        resized = image.resize((width, height))
        resized.save('./images/upImg.png')


        image = cv2.imread("./images/depthmap.png")

        print(image.shape[0])
        print(image.shape[1])




        # blur parts of image that are darker shades (lower num) 
        

        secImg = Image.open("./images/upImg.png")
        im = Image.open('./images/upImg.png')
        
        

        # 30 - 215
        # 0 = darkest, 255 = lightest

        br_lookup = {
                    0: 5,
                    1: 25,
                    2: 125,
                    3: 625,
                    4: 625,
                    5: 625,
                    6: 625,
                    7: 625,
                    8: 625,
                    9: 625,
                    10: 625
                }


        factor = 6.5
        numBlurs = 10
        steps = 10

        threshold = 150

        
        
        for inVal in range(1, (steps + 1)):

            # lower = more clear
            # higher = more blur
            
            generateBlur(width, height, br_lookup, inVal, factor, numBlurs, threshold)
            threshold += 5
        


        images = []


        # now create 10 copies of the original image and copy over blurred data
        for i in range(1, (steps + 1)):
            fname = "./images/blur/result" + str(i) + ".png"
            if os.path.isfile(fname):
                with open(fname, "rb") as img_file:
                    my_string = base64.b64encode(img_file.read()).decode("utf-8")
                    images.append(my_string)
        
        
        return ({"success": 1, "image": images})
        
    elif request.method == 'GET':
        return {'image': 'pp'}

    else:
        return {'image': 'dne'}


# function to take depth map from depthmap.png and 
# blur image stored in upImg.png

def generateBlur(width, height, br_lookup, inVal, factor, numBlurs, threshold):

    depth_map = Image.open('./images/depthmap.png')
    pixDepth = depth_map.load()

    image = cv2.imread("./images/upImg.png")
    result = image.copy()
    resultcpy = image.copy()

    scalar = inVal * inVal * factor

    depthPartition = int(256 // (numBlurs))

    blurArr = []

    v = 5

    br = 5

    for i in range(0, numBlurs):

        blur_amount = scalar * i / numBlurs

        # blur values above this value seems to affect color
        #if (blur_amount > 50):
        #    blur_amount = 50

        bval = cv2.GaussianBlur(resultcpy, (br, br), blur_amount)
        blurArr.append(bval)

        br += 4


    # Iterate over each pixel in the image
    for x in range(0, width): # width
        for y in range(0, height): #height
            depth = threshold - pixDepth[x, y]
            if depth < 0:
                depth = 0
            blur_amount = int(depth // depthPartition)

            if blur_amount >= numBlurs:
                blur_amount = numBlurs - 1

            # in case
            if (blur_amount >= numBlurs):
                blur_amount = numBlurs
            #print(blur_amount)

            lookup = blurArr[blur_amount]

            result[y, x] = lookup[y, x]


    fname = './images/blur/result' + str(inVal) + '.png'
    cv2.imwrite(fname, result)
    print(inVal)





# original plan was to blur individual sections and concatenate them for the final image

def cutSection(width, height, center_x, center_y, bitSize):

    # Open the image
    im = Image.open('./images/upImg.png')

    # Get the width and height of the image
    #wi, he = im.size

    # Set the center pixel coordinates
    #center_x = x
    #center_y = y

    # Set the size of the section to extract
    section_size = bitSize

    # Calculate the coordinates of the top-left corner of the section
    left = center_x - (section_size // 2)
    top = center_y - (section_size // 2)

    # Calculate the coordinates of the bottom-right corner of the section
    right = center_x + (section_size // 2)
    bottom = center_y + (section_size // 2)

    # Extract the section using the coordinates
    section = im.crop((left, top, right, bottom))

    # Save the section to a new image file
    section.save('./images/section.png')

    #return cv2.imread("./images/section.png")

    #return section

if __name__ == "__main__":
    app.run(debug=True)