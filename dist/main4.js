"use strict";
// class vec3d {
//     public v: [number, number, number, number]
//     constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
//         this.v = [x,y,z,w]
//     }
//     add_vector (u: vec3d) {
//         return new vec3d(this.v[0]+u.v[0], this.v[1]+u.v[1], this.v[2]+u.v[2], this.v[3]+u.v[3]);
//     }
//     sub_vector (u: vec3d) {
//         return new vec3d(this.v[0]-u.v[0], this.v[1]-u.v[1], this.v[2]-u.v[2]);
//     }
//     normalize () {
//         let l = Math.sqrt(this.v[0]*this.v[0] + this.v[1]*this.v[1] + this.v[2]*this.v[2]);
//         if (l == 0) { l=1; }
//         return new vec3d(this.v[0]/l, this.v[1]/l, this.v[2]/l);
//     }
//     dot_product(u: vec3d) {
//         return this.v[0]*u.v[0] + this.v[1]*u.v[1] + this.v[2]*u.v[2] + this.v[3]*u.v[3];
//     }
//     cross_product(u: vec3d) {
//         let res = new vec3d();
//         res.v[0] = this.v[1] * u.v[2] - this.v[2] * u.v[1];
//         res.v[1] = this.v[2] * u.v[0] - this.v[0] * u.v[2];
//         res.v[2] = this.v[0] * u.v[1] - this.v[1] * u.v[0];
//         return res;
//     }
//     mult_vector(u: vec3d) {
//         return new vec3d(this.v[0] * u.v[0], this.v[1] * u.v[1], this.v[2] * u.v[2], this.v[3] * u.v[3]);
//     }
// }
// class triangle3d {
//     public p: [vec3d, vec3d, vec3d];
//     constructor(a: vec3d, b: vec3d, c: vec3d) {
//         this.p = [a, b, c];
//     }
// }
// class mesh {
//     public tris: triangle3d[];
//     constructor(tris: triangle3d[]) {
//         this.tris = tris;
//     }
//     setCubeMesh() {
//         this.tris = [
//             new triangle3d(new vec3d(0, 0, 0), new vec3d(0, 1, 0), new vec3d(1, 1, 0)),
//             new triangle3d(new vec3d(0, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 0, 0)),
//             new triangle3d(new vec3d(1, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 1, 1)),
//             new triangle3d(new vec3d(1, 0, 0), new vec3d(1, 1, 1), new vec3d(1, 0, 1)),
//             new triangle3d(new vec3d(0, 1, 0), new vec3d(0, 1, 1), new vec3d(1, 1, 1)),
//             new triangle3d(new vec3d(0, 1, 0), new vec3d(1, 1, 1), new vec3d(1, 1, 0)),
//             new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 0, 0), new vec3d(1, 0, 0)),
//             new triangle3d(new vec3d(0, 0, 1), new vec3d(1, 0, 0), new vec3d(1, 0, 1)),
//             new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 1, 0)),
//             new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 1, 0), new vec3d(0, 0, 0)),
//             new triangle3d(new vec3d(1, 0, 1), new vec3d(1, 1, 1), new vec3d(0, 1, 1)),
//             new triangle3d(new vec3d(1, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 0, 1)),
//         ];
//     }
//     async setMeshFromFile(file: string) {
//         try {
//             const response = await fetch(file);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             const data = await response.text();
//             // console.log(data);
//             const lines = data.split('\n');
//             const vertices: vec3d[] = [];
//             this.tris = [];
//             for (let line of lines) {
//                 if (line.startsWith('v ')) {
//                     const coords = line.split(' ');
//                     const x = parseFloat(coords[1]);
//                     const y = parseFloat(coords[2]);
//                     const z = parseFloat(coords[3]);
//                     vertices.push(new vec3d(x, y, z));
//                 } else if (line.startsWith('f ')) {
//                     const polys = line.split(' ');
//                     const v1 = vertices[parseInt(polys[1].split('/')[0]) - 1];
//                     const v2 = vertices[parseInt(polys[2].split('/')[0]) - 1];
//                     const v3 = vertices[parseInt(polys[3].split('/')[0]) - 1];
//                     this.tris.push(new triangle3d(v1, v2, v3));
//                 }
//             }
//             // console.log(this.tris);
//             // You can parse the .obj file data here and set it to this.tris
//         } catch (error) {
//             console.error('Failed to fetch file:', error);
//         }
//     }
// }
// class mat4x4 {
//     public mat: number[][];
//     constructor() {
//         this.mat = [];
//         for (let i = 0; i < 4; i++) {
//             this.mat[i] = [];
//             for (let j = 0; j < 4; j++) {
//                 this.mat[i][j] = 0;
//             }
//         }
//     }
//     vec_matrix_multiply(x: vec3d , dest: vec3d) {
//         let s1 = this.mat[0][0] * x.v[0] + this.mat[1][0] * x.v[1] + this.mat[2][0] * x.v[2] + this.mat[3][0] * x.v[3];
//         let s2 = this.mat[0][1] * x.v[0] + this.mat[1][1] * x.v[1] + this.mat[2][1] * x.v[2] + this.mat[3][1] * x.v[3];
//         let s3 = this.mat[0][2] * x.v[0] + this.mat[1][2] * x.v[1] + this.mat[2][2] * x.v[2] + this.mat[3][2] * x.v[3];
//         let s4 = this.mat[0][3] * x.v[0] + this.mat[1][3] * x.v[1] + this.mat[2][3] * x.v[2] + this.mat[3][3] * x.v[3];
//         dest.v[0] = s1; dest.v[1] = s2; dest.v[2] = s3; dest.v[3] = s4; 
//         // console.log(s1);
//         // console.log(s2);
//         // console.log(s3);
//         // console.log(s4);
//         // if (s4 != 0) {
//         //     dest.v[0] /= s4; dest.v[1] /= s4; dest.v[2] /= s4; dest.v[3] /= s4;
//         // }
//     }
//     mat_multiply(other: mat4x4) {
//         let result = new mat4x4();
//         for (let i=0; i < 4; i++) {
//             for (let j=0; j < 4; j++) {
//                 let sum = 0;
//                 for (let k=0; k < 4; k++) {
//                     // ik kj
//                     sum += this.mat[i][k] * other.mat[k][j];
//                 }
//                 result.mat[i][j] = sum;
//             }
//         }
//         return result;
//     }
// }
// function mat_identity() {
//     let ident = new mat4x4();
//     ident.mat[0][0] = 1;
//     ident.mat[1][1] = 1;
//     ident.mat[2][2] = 1;
//     ident.mat[3][3] = 1;
//     return ident;
// }
// function mat_make_projection(theta: number, a: number, z_near: number, z_far: number) {
//     let proj_mat = new mat4x4();
//     proj_mat.mat[0][0] = a * theta;
//     proj_mat.mat[1][1] = theta;
//     proj_mat.mat[2][2] = z_far / (z_far - z_near);
//     proj_mat.mat[3][2] = (-z_far * z_near) / (z_far - z_near);
//     proj_mat.mat[2][3] = 1;
//     proj_mat.mat[3][3] = 0;
//     return proj_mat;
// }
// function mat_make_rotX (theta: number) {
//     let rot_mat = new mat4x4();
//     rot_mat.mat = [
//         [1, 0, 0, 0],
//         [0, Math.cos(theta), Math.sin(theta), 0],
//         [0, -Math.sin(theta), Math.cos(theta), 0],
//         [0, 0, 0, 1],
//     ];
//     return rot_mat;
// }
// function mat_make_rotY (theta: number) {
//     let rot_mat = new mat4x4();
//     rot_mat.mat = [
//         [Math.cos(theta), 0, -Math.sin(theta), 0],
//         [0, 1, 0, 0],
//         [Math.sin(theta), 0, Math.cos(theta), 0],
//         [0, 0, 0, 1],
//     ];
//     return rot_mat;
// }
// function mat_make_rotZ (theta: number) {
//     let rot_mat = new mat4x4();
//     rot_mat.mat = [
//         [Math.cos(theta), Math.sin(theta), 0, 0],
//         [-Math.sin(theta), Math.cos(theta), 0, 0],
//         [0, 0, 1, 0],
//         [0, 0, 0, 1],
//     ];
//     return rot_mat;
// }
// function mat_make_trans (x: number, y: number, z: number) {
//     let trans_matrix = new mat4x4();
//     trans_matrix.mat = [
//         [1,0,0, x],
//         [0,1,0, y],
//         [0,0,1, z],
//         [0,0,0,1]
//     ]
//     return trans_matrix;
// }
// class Scene {
//     public canvas: HTMLCanvasElement;
//     private ctx: CanvasRenderingContext2D;
//     private meshCub = new mesh([new triangle3d(new vec3d(), new vec3d(), new vec3d())]);;
//     private vCamera: vec3d;
//     private vLight: vec3d = new vec3d();
//     private mat: mat4x4 = new mat4x4();
//     private Znear = 0.1;
//     private Zfar = 100;
//     private Fov = 90;
//     private AspectRatio: number = 0;
//     private FovRad: number = 0;
//     private fTheta: number;
//     private fps: number = 0;
//     private fpsCap: number = 1;
//     private capChanged: boolean = false;
//     private interval: number = 0;
//     private distance: number = 10;
//     private lastTime: number;
//     constructor() {
//         this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
//         this.ctx = this.canvas.getContext("2d")!;
//         this.meshCub.setMeshFromFile("../ship.obj");
//         this.AspectRatio = this.canvas.height / this.canvas.width;
//         this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
//         document.getElementById('Fov')!.addEventListener('input', (event) => {
//             const target = event.target as HTMLInputElement;
//             this.Fov = parseFloat(target.value);
//             document.getElementById('FovValue')!.innerText = target.value;
//             this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
//         });
//         document.getElementById('Distance')!.addEventListener('input', (event) => {
//             const target = event.target as HTMLInputElement;
//             this.distance = parseFloat(target.value);
//             document.getElementById('DistanceValue')!.innerText = target.value;
//             // console.log("kaka");
//         });
//         document.getElementById('fpsCap')!.addEventListener('input', (event) => {
//             const target = event.target as HTMLInputElement;
//             this.fpsCap = Math.max(parseFloat(target.value), 1);
//             this.capChanged = true;
//             document.getElementById('fpsCapValue')!.innerText = target.value;
//         })
//         this.lastTime = new Date().getTime();
//         this.fTheta = 0;
//         this.vCamera = new vec3d();
//         this.render = this.render.bind(this);
//     }
//     draw2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number) {
//         this.ctx.beginPath();
//         this.ctx.moveTo(a1, a2);
//         this.ctx.lineTo(b1, b2);
//         this.ctx.lineTo(c1, c2);
//         this.ctx.closePath();
//         this.ctx.stroke();
//     }
//     draw2d_vector(c1: number, c2: number, x: number, y: number) {
//         this.ctx.beginPath();
//         this.ctx.moveTo(c1, c2);
//         this.ctx.lineTo(x, y);
//         this.ctx.stroke();
//     }
//     fill2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number, color: number) {
//         // we want to color in a grey scale, color is from 0 to 255
//         this.ctx.fillStyle = "rgb(" + color + " " + color + " " + color + ")"
//         this.ctx.beginPath();
//         this.ctx.moveTo(a1, a2);
//         this.ctx.lineTo(b1, b2);
//         this.ctx.lineTo(c1, c2);
//         this.ctx.closePath();
//         this.ctx.fill();
//     }
//     render() {
//         this.ctx.fillStyle = "rgb(104, 109, 118)";
//         this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//         let currentTime = new Date().getTime();
//         let elapsed_time = (currentTime - this.lastTime) / 1000;
//         this.fps = 1/elapsed_time;
//         this.interval = 1000 / this.fpsCap;
//         // fps
//         let fpsElement = document.getElementById('fps-counter');
//         fpsElement!.innerText = `FPS: ${this.fps.toFixed(2)}`;
//         this.lastTime = currentTime;
//         this.fTheta += elapsed_time;
//         let trisToRaster: triangle3d[] = [];
//         let rot_mat = mat_make_rotZ(this.fTheta);
//         rot_mat = rot_mat.mat_multiply(mat_make_rotX(this.fTheta*0.5));
//         rot_mat = rot_mat.mat_multiply(mat_make_rotY(this.fTheta));
//         // let proj_mat = mat_make_trans(0, 0, this.distance);
//         // proj_mat = proj_mat.mat_multiply(mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar));
//        let proj_mat = mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar);
//         this.meshCub.tris.forEach((tri: triangle3d) => {
//             let triRotated = new triangle3d(new vec3d(), new vec3d(), new vec3d());
//             rot_mat.vec_matrix_multiply(tri.p[0], triRotated.p[0]);
//             rot_mat.vec_matrix_multiply(tri.p[1], triRotated.p[1]);
//             rot_mat.vec_matrix_multiply(tri.p[2], triRotated.p[2]);
//             trisToRaster.push(triRotated);
//         });
//         trisToRaster.sort((tri1, tri2) => {
//             let z1 = (tri1.p[0].v[2] + tri1.p[1].v[2] + tri1.p[2].v[2]) / 3;
//             let z2 = (tri2.p[0].v[2] + tri2.p[1].v[2] + tri2.p[2].v[2]) / 3;
//             return (z1 > z2) ? -1 : 1;
//         })
//         this.meshCub.tris.forEach((tri) => {
//             let triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d());
//             let triTranslated = new triangle3d(new vec3d(), new vec3d(), new vec3d());
//             let triRotatedZ = new triangle3d(new vec3d(), new vec3d(), new vec3d());
//             let triRotatedZX = new triangle3d(new vec3d(), new vec3d(), new vec3d());
//             // Rotate in Z-Axis
//             rot_mat.vec_matrix_multiply(tri.p[0], triRotatedZ.p[0]);
//             rot_mat.vec_matrix_multiply(tri.p[1], triRotatedZ.p[1]);
//             rot_mat.vec_matrix_multiply(tri.p[2], triRotatedZ.p[2]);
//             // Rotate in X-Axis
//             // this.rotMatX.vec_matrix_multiply(triRotatedZ.p[0], triRotatedZX.p[0]);
//             // this.rotMatX.vec_matrix_multiply(triRotatedZ.p[1], triRotatedZX.p[1]);
//             // this.rotMatX.vec_matrix_multiply(triRotatedZ.p[2], triRotatedZX.p[2]);
//             // Translate the triangle in Z direction (for viewing purposes)
//             triTranslated.p[0] = triRotatedZX.p[0];
//             triTranslated.p[0].v[2] += 3.0;
//             triTranslated.p[1] = triRotatedZX.p[1];
//             triTranslated.p[1].v[2] += 3.0;
//             triTranslated.p[2] = triRotatedZX.p[2];
//             triTranslated.p[2].v[2] += 3.0;
//             // Project triangles from 3D to 2D
//             this.mat.vec_matrix_multiply(triTranslated.p[0], triProjected.p[0]);
//             this.mat.vec_matrix_multiply(triTranslated.p[1], triProjected.p[1]);
//             this.mat.vec_matrix_multiply(triTranslated.p[2], triProjected.p[2]);
//             // Normalize the coordinates
//             for (let i = 0; i < 3; i++) {
//                 triProjected.p[i].v[0] /= triProjected.p[i].v[3];
//                 triProjected.p[i].v[1] /= triProjected.p[i].v[3];
//                 triProjected.p[i].v[2] /= triProjected.p[i].v[3];
//             }
//             // Calculate normal of the triangle
//             let line1 = new vec3d(
//                 triProjected.p[1].v[0] - triProjected.p[0].v[0],
//                 triProjected.p[1].v[1] - triProjected.p[0].v[1],
//                 triProjected.p[1].v[2] - triProjected.p[0].v[2]
//             );
//             let line2 = new vec3d(
//                 triProjected.p[2].v[0] - triProjected.p[0].v[0],
//                 triProjected.p[2].v[1] - triProjected.p[0].v[1],
//                 triProjected.p[2].v[2] - triProjected.p[0].v[2]
//             );
//             let normal = new vec3d(
//                 line1.v[1] * line2.v[2] - line1.v[2] * line2.v[1],
//                 line1.v[2] * line2.v[0] - line1.v[0] * line2.v[2],
//                 line1.v[0] * line2.v[1] - line1.v[1] * line2.v[0]
//             );
//             // Normalize the normal
//             let l = Math.sqrt(normal.v[0]**2 + normal.v[1]**2 + normal.v[2]**2);
//             normal.v[0] /= l;
//             normal.v[1] /= l;
//             normal.v[2] /= l;
//             // Check if triangle is visible
//             if (normal.v[0] * (triProjected.p[0].v[0] - this.vCamera.v[0]) + 
//                 normal.v[1] * (triProjected.p[0].v[1] - this.vCamera.v[1]) +
//                 normal.v[2] * (triProjected.p[0].v[2] - this.vCamera.v[2]) < 0) {
//                 // Light calculations
//                 let vLight = new vec3d(0, 0, -1);
//                 let l2 = Math.sqrt(vLight.v[0]**2 + vLight.v[1]**2 + vLight.v[2]**2);
//                 vLight.v[0] /= l2;
//                 vLight.v[1] /= l2;
//                 vLight.v[2] /= l2;
//                 let color = normal.v[0] * vLight.v[0] +
//                             normal.v[1] * vLight.v[1] + 
//                             normal.v[2] * vLight.v[2];
//                 color = (color + 1) * (255 / 2);
//                 this.draw2d_triangle(triProjected.p[0].v[0], triProjected.p[0].v[1], 
//                                      triProjected.p[1].v[0], triProjected.p[1].v[1], 
//                                      triProjected.p[2].v[0], triProjected.p[2].v[1]);
//                 this.fill2d_triangle(triProjected.p[0].v[0], triProjected.p[0].v[1], 
//                                      triProjected.p[1].v[0], triProjected.p[1].v[1], 
//                                      triProjected.p[2].v[0], triProjected.p[2].v[1], color);
//             }
//         });
//         window.requestAnimationFrame(scene.render);
//     }
//     // start () {
//     //     var interval = setInterval(() => {
//     //         if (this.capChanged) {
//     //             clearInterval(interval);
//     //             this.start();
//     //         }
//     //         this.render();
//     //     }, this.interval);
//     // }
// }
// const scene = new Scene();
// // scene.start();
// window.requestAnimationFrame(scene.render);
