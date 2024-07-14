### 3D renderer

<br/>

`%define "load" "hardcode"`

3d renderer where you "can" upload obj files and load them into view, and move around.

the 3d renderer is made from scratch using only the canvas' triangle drawing/filling functions.

i've implemented projection, lighting, rendering obj files (the ones from blender), a moving and rotating camera,
clipping for triangles that are outside the fov/screen or just too close that they get out of hand.

<br/>

### player movement

you can move to the sides using the arrow keys,
rotate using `a`, `d` and go forwards, backwards with `w`, `s`.

<br/>

### compiling

the source files such as the html file you see in the images and the source code lie on `src/`. <br/>
to compile the project, run the `tsc` command in the terminal while in the projects' root folder. <br/>
you will see the compiled `main.ts` file in `dst/` directory, which is `main.js`. <br/> <br/> 
from there you will need to host an http server because my code apparently violates some CORS policy. <br/>
e.g. `python -m http.server`, and then goto `localhost:8000` on your browser or wherever it's hosted. <br/> 
more specifically, goto `localhost:8000/src/main.html`. 

<br/>
<br/>

![image](https://github.com/user-attachments/assets/127db743-b622-4931-9259-37a37132891c)

![image](https://github.com/user-attachments/assets/8c2e6f79-8bdf-4eb0-bfca-a3f577033e24)

<img width="613" alt="image" src="https://github.com/user-attachments/assets/e37d12a8-07b8-4a45-9c0a-3fa6b5367bc6">


