var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import png from '../node_modules/simplepngjs/dist/index.js'
import { draw_textured_triangle } from './shapes/drawing.js';
import { vec3d, vec2d, mat4x4, mesh, triangle3d } from './shapes/geometry.js';
import { Camera } from './utils/camera.js';
import { png_sampler, sample_rectangle } from './utils/png.js';
class Scene {
    // private spriteTexture1: sprite = new sprite();
    constructor(m) {
        this.Znear = 0.01;
        this.Zfar = 100;
        this.Fov = 90;
        this.AspectRatio = 0;
        this.FovRad = 0;
        this.fps = 0;
        this.fpsCap = 1;
        this.capChanged = false;
        this.interval = 0;
        this.distance = 10;
        this.elapsed_time = 0;
        this.moveSpeed = 10;
        this.f = 1;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d");
        this.me = new mesh();
        // this.me.setMeshFromFile("../resources/mountains.obj");
        this.image = new png_sampler();
        // this.spriteTexture1 = new sprite("../jario")
        this.me = m;
        this.camera = new Camera(this.moveSpeed);
        this.AspectRatio = this.canvas.height / this.canvas.width;
        this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
        document.getElementById('Fov').addEventListener('input', (event) => {
            const target = event.target;
            this.Fov = parseFloat(target.value);
            document.getElementById('FovValue').innerText = target.value;
            this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
        });
        document.getElementById('Distance').addEventListener('input', (event) => {
            const target = event.target;
            this.distance = parseFloat(target.value);
            document.getElementById('DistanceValue').innerText = target.value;
            // console.log("kaka");
        });
        document.getElementById('fpsCap').addEventListener('input', (event) => {
            const target = event.target;
            this.fpsCap = Math.max(parseFloat(target.value), 1);
            this.capChanged = true;
            document.getElementById('fpsCapValue').innerText = target.value;
        });
        // handles all keys
        document.addEventListener('keydown', (event) => {
            this.camera.keys[event.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.camera.keys[event.key.toLowerCase()] = false;
        });
        this.lastTime = new Date().getTime();
        this.fTheta = 0;
    }
    initalize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.image.init_sampler("../files/minecraft_0.png");
        });
    }
    render() {
        this.me.roundAllTex();
        this.ctx.fillStyle = "rgb(104, 109, 118)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let currentTime = new Date().getTime();
        this.elapsed_time = (currentTime - this.lastTime) / 1000;
        this.fps = 1 / this.elapsed_time;
        this.interval = 1000 / this.fpsCap;
        // fps
        let fpsElement = document.getElementById('fps-counter');
        fpsElement.innerText = `FPS: ${this.fps.toFixed(2)}`;
        this.lastTime = currentTime;
        // this.fTheta += this.elapsed_time;
        let matView = this.camera.getViewMatrix();
        this.camera.updateMovement(this.elapsed_time);
        let trisToRaster = [];
        let world_mat = mat4x4.mat_make_rotZ(this.fTheta);
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_rotX(this.fTheta * 0.5));
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_rotY(this.fTheta));
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_trans(0, 0, this.distance));
        let proj_mat = mat4x4.mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar);
        this.me.tris.forEach((tri) => {
            let triRotated = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
            let triViewed = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
            // console.log("tri", tri);
            world_mat.vec_matrix_multiply(tri.p[0], triRotated.p[0]);
            world_mat.vec_matrix_multiply(tri.p[1], triRotated.p[1]);
            world_mat.vec_matrix_multiply(tri.p[2], triRotated.p[2]);
            // pass the texture coordinates forward
            triRotated.t[0] = tri.t[0];
            triRotated.t[1] = tri.t[1];
            triRotated.t[2] = tri.t[2];
            // console.log("rotated", triRotated);
            let line1 = triRotated.p[1].sub_vector(triRotated.p[0]);
            let line2 = triRotated.p[2].sub_vector(triRotated.p[0]);
            let normal = line1.cross_product(line2);
            normal = normal.normalize();
            let camRay = triRotated.p[0].sub_vector(this.camera.v);
            if (normal.dot_product(camRay) < 0) {
                let triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
                // light shines on player, if normal is towards player it should be lighter
                let vLight = new vec3d(0, 0, -1);
                // normalize light source
                vLight = vLight.normalize();
                let color = normal.dot_product(vLight);
                triRotated.color = "rgb( " + (color + 1) * (255 / 2) + " " + (color + 1) * (255 / 2) + " " + (color + 1) * (255 / 2) + ")";
                // console.log("tri", tri);
                // console.log("rotated", triRotated);
                // convert world space to view space
                matView.vec_matrix_multiply(triRotated.p[0], triViewed.p[0]);
                matView.vec_matrix_multiply(triRotated.p[1], triViewed.p[1]);
                matView.vec_matrix_multiply(triRotated.p[2], triViewed.p[2]);
                triViewed.color = triRotated.color;
                // pass the texture coordinates forward
                triViewed.t[0] = triRotated.t[0];
                triViewed.t[1] = triRotated.t[1];
                triViewed.t[2] = triRotated.t[2];
                // console.log(JSON.stringify(triViewed.t, null, 2));
                // console.log("viewed", triViewed);
                let clipped_triangle_count = 0;
                let clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d()),
                    new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())];
                // let t = 0;
                // clip against z_near plane, normal is along the z axis
                clipped_triangle_count = triangle3d.triangle_clip_against_plane(new vec3d(0, 0, 0.1), new vec3d(0, 0, 1), triViewed, clipped[0], clipped[1]);
                // console.log(clipped_triangle_count);
                for (let n = 0; n < clipped_triangle_count; n++) {
                    // triProjected.color = clipped[n].color;
                    // project triangle from 3D to 2D
                    proj_mat.vec_matrix_multiply(clipped[n].p[0], triProjected.p[0]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[1], triProjected.p[1]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[2], triProjected.p[2]);
                    // pass the texture coordinates forward
                    triProjected.color = clipped[n].color;
                    triProjected.t[0] = clipped[n].t[0];
                    triProjected.t[1] = clipped[n].t[1];
                    triProjected.t[2] = clipped[n].t[2];
                    // scale texture coordinates into view
                    // triProjected.t[0].u = triProjected.t[0].u / triProjected.p[0].v[3];
                    // triProjected.t[1].u = triProjected.t[1].u / triProjected.p[1].v[3];
                    // triProjected.t[2].u = triProjected.t[2].u / triProjected.p[2].v[3];
                    // triProjected.t[0].v = triProjected.t[0].v / triProjected.p[0].v[3];
                    // triProjected.t[1].v = triProjected.t[1].v / triProjected.p[1].v[3];
                    // triProjected.t[2].v = triProjected.t[2].v / triProjected.p[2].v[3];
                    // triProjected.t[0].w = 1 / triProjected.p[0].v[3];
                    // triProjected.t[1].w = 1 / triProjected.p[1].v[3];
                    // triProjected.t[2].w = 1 / triProjected.p[2].v[3];
                    // scale triangle into view, was previously in vec_matrix_multiply, but removed for conciseness
                    triProjected.p[0] = triProjected.p[0].div_vector(triProjected.p[0].v[3]);
                    triProjected.p[1] = triProjected.p[1].div_vector(triProjected.p[1].v[3]);
                    triProjected.p[2] = triProjected.p[2].div_vector(triProjected.p[2].v[3]);
                    let vecOffset = new vec3d(1, 1, 0, 0);
                    triProjected.p[0] = triProjected.p[0].add_vector(vecOffset);
                    triProjected.p[1] = triProjected.p[1].add_vector(vecOffset);
                    triProjected.p[2] = triProjected.p[2].add_vector(vecOffset);
                    let vecScale = new vec3d(0.5 * this.canvas.width, 0.5 * this.canvas.height, 1, 1);
                    triProjected.p[0] = triProjected.p[0].mult_vector_vector(vecScale);
                    triProjected.p[1] = triProjected.p[1].mult_vector_vector(vecScale);
                    triProjected.p[2] = triProjected.p[2].mult_vector_vector(vecScale);
                    trisToRaster.push(triProjected);
                    triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
                }
            }
        });
        trisToRaster.sort((tri1, tri2) => {
            let z1 = (tri1.p[0].v[2] + tri1.p[1].v[2] + tri1.p[2].v[2]) / 3;
            let z2 = (tri2.p[0].v[2] + tri2.p[1].v[2] + tri2.p[2].v[2]) / 3;
            return (z1 > z2) ? -1 : 1;
        });
        trisToRaster.forEach((tri) => {
            let listTriangles = [];
            listTriangles.push(tri);
            let newTrianglesCount = 1;
            let clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d()),
                new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())];
            // test triangle against each screen border plane
            for (let p = 0; p < 4; p++) {
                let trisToAdd = 0;
                while (newTrianglesCount > 0) {
                    let test = listTriangles.pop();
                    newTrianglesCount--;
                    switch (p) {
                        case 0:
                            trisToAdd = triangle3d.triangle_clip_against_plane(new vec3d(0, 0, 0), new vec3d(0, 1, 0), test, clipped[0], clipped[1]);
                            break;
                        case 1:
                            trisToAdd = triangle3d.triangle_clip_against_plane(new vec3d(0, this.canvas.height - 1, 0), new vec3d(0, -1, 0), test, clipped[0], clipped[1]);
                            break;
                        case 2:
                            trisToAdd = triangle3d.triangle_clip_against_plane(new vec3d(1, 0, 0), new vec3d(1, 0, 0), test, clipped[0], clipped[1]);
                            break;
                        case 3:
                            trisToAdd = triangle3d.triangle_clip_against_plane(new vec3d(this.canvas.width - 1, 0, 0), new vec3d(-1, 0, 0), test, clipped[0], clipped[1]);
                            break;
                    }
                    for (let w = 0; w < trisToAdd; w++) {
                        listTriangles.unshift(clipped[w]);
                    }
                    // console.log("kaka")
                    clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d()),
                        new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())];
                }
                newTrianglesCount = listTriangles.length;
            }
            // console.log("after");
            // listTriangles.forEach((tri: triangle3d) => {
            //     console.log(JSON.stringify(tri.t, null, 2));
            // })
            listTriangles.forEach((tri) => {
                // tri.p[0].v[0] *= -1; tri.p[0].v[1] *= -1; tri.p[0].v[2] *= -1;
                // tri.p[1].v[0] *= -1; tri.p[1].v[1] *= -1; tri.p[1].v[2] *= -1;
                // tri.p[2].v[0] *= -1; tri.p[2].v[1] *= -1; tri.p[2].v[2] *= -1;
                // tri.t[0].u *= -1; tri.t[0].v *= -1;
                // tri.t[1].u *= -1; tri.t[1].v *= -1;
                // tri.t[2].u *= -1; tri.t[2].v *= -1;
                // rasterizing triangles
                // draw2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], this.ctx);
                draw_textured_triangle(tri.p[0].v[0], tri.p[0].v[1], tri.t[0].u, tri.t[0].v, tri.t[0].w, tri.p[1].v[0], tri.p[1].v[1], tri.t[1].u, tri.t[1].v, tri.t[1].w, tri.p[2].v[0], tri.p[2].v[1], tri.t[2].u, tri.t[2].v, tri.t[2].w, this.image, this.ctx);
                // fill2d_triangle(tris.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color, this.ctx);
            });
        });
    }
    start() {
        var interval = setInterval(() => {
            if (this.capChanged) {
                clearInterval(interval);
                this.start();
            }
            this.render();
            // console.log(m.stringify());
        }, this.interval);
    }
    displaySampledTexture() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const canvas = yield sample_rectangle(0, 0, 100, 100, "../files/minecraft_0.png");
                // const canvas = await sample_rectangle(80, 80, 16, 16, "../files/minecraft_0.png");
                const container = document.getElementById('sampledTexture');
                if (container) {
                    container.appendChild(canvas);
                }
                else {
                    console.error("Container not found");
                }
            }
            catch (error) {
                console.error("Error sampling rectangle:", error);
            }
        });
    }
}
function initAndStart(scene) {
    return __awaiter(this, void 0, void 0, function* () {
        yield scene.initalize();
        scene.displaySampledTexture();
        scene.start();
    });
}
let m = new mesh();
m.setCubeMesh();
// console.log(m.stringify());
const scene = new Scene(m);
initAndStart(scene).catch(console.error);
// let m = new mesh();
// m.setCubeMesh();
// // here the first two triangles have already the texture coordinates zeroed
// console.log("after mesh init", m);
