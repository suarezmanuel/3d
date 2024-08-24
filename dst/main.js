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
import { draw2d_triangle, draw_textured_triangle } from './shapes/drawing.js';
import { vec3d, vec2d, mat4x4, mesh, triangle3d } from './shapes/geometry.js';
import { Camera } from './utils/camera.js';
import { png_sampler } from './utils/png.js';
const backgroundColor = "rgb(104, 109, 118)";
let fpsCap = 1;
let capChanged = false;
function updatefps(elapsedTime, intervalMs, lastTime) {
    let currentTime = new Date().getTime();
    elapsedTime = (currentTime - lastTime) / 1000;
    let fps = 1 / elapsedTime;
    intervalMs = 1000 / fpsCap;
    // update html fps counter
    let fpsElement = document.getElementById('fps-counter');
    fpsElement.innerText = `FPS: ${fps.toFixed(2)}`;
    return [currentTime, elapsedTime, intervalMs];
}
let dx = 0;
let dy = 0;
export class Scene {
    // add thing
    // remove thing
    // set light source
    // get light source
    constructor() {
        this.Znear = 0.01;
        this.Zfar = 100;
        this.Fov = 90;
        this.AspectRatio = 0;
        this.FovRad = 0;
        this.intervalMs = 0;
        this.distance = 10;
        this.elapsedTime = 0;
        // light shines from player, if normal is towards player it should be lighter
        this.vLight = new vec3d(0, 0, -1);
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d");
        // this.mesh = new mesh();
        // this.mesh.setCubeMesh();
        // this.mesh.setMeshFromFile("../resources/mountains.obj");
        this.sampler = new png_sampler();
        this.camera = new Camera(10, 100);
        this.AspectRatio = this.canvas.height / this.canvas.width;
        this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
        // make canvas crisp
        const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * dpi;
        this.canvas.height = this.canvas.clientHeight * dpi;
        this.ctx.scale(dpi, dpi);
        this.lastTime = new Date().getTime();
        this.fTheta = 0;
        this.objects = [];
        for (let i = 0; i < 1; i++) {
            for (let j = 0; j < 1; j++) {
                for (let k = 0; k < 1; k++) {
                    let m = new mesh();
                    m.setCubeMesh(i, j, k);
                    this.objects.push(m);
                }
            }
        }
        this.depthBuffer = [];
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
            fpsCap = Math.max(parseFloat(target.value), 1);
            capChanged = true;
            document.getElementById('fpsCapValue').innerText = target.value;
        });
        // handles all keys
        document.addEventListener('keydown', (event) => {
            this.camera.keys[event.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.camera.keys[event.key.toLowerCase()] = false;
        });
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === this.canvas) {
                dx = event.movementX;
                dy = event.movementY;
                dx /= this.canvas.width;
                dy /= this.canvas.height;
            }
        });
        this.canvas.addEventListener('click', (event) => {
            this.canvas.requestPointerLock();
        });
    }
    IntializeTextureSampler() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sampler.init_sampler("../files/minecraft_0.png");
        });
    }
    render() {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        [this.lastTime, this.elapsedTime, this.intervalMs] = updatefps(this.elapsedTime, this.intervalMs, this.lastTime);
        let matView = this.camera.getViewMatrix();
        this.camera.updateMovement(this.elapsedTime, dx, dy);
        dx = 0;
        dy = 0;
        let trisToRaster = [];
        // apply camera rotation and stuff
        let world_mat = mat4x4.mat_make_rotZ(this.fTheta);
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_rotX(this.fTheta * 0.5));
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_rotY(this.fTheta));
        world_mat = world_mat.mat_multiply(mat4x4.mat_make_trans(0, 0, this.distance));
        let proj_mat = mat4x4.mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar);
        this.objects.forEach((o) => {
            o.tris.forEach((tri) => {
                let triRotated = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
                let triViewed = new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d());
                world_mat.vec_matrix_multiply(tri.p[0], triRotated.p[0]);
                world_mat.vec_matrix_multiply(tri.p[1], triRotated.p[1]);
                world_mat.vec_matrix_multiply(tri.p[2], triRotated.p[2]);
                // pass the texture coordinates forward
                triRotated.t[0] = tri.t[0];
                triRotated.t[1] = tri.t[1];
                triRotated.t[2] = tri.t[2];
                let line1 = triRotated.p[1].sub_vector(triRotated.p[0]);
                let line2 = triRotated.p[2].sub_vector(triRotated.p[0]);
                let normal = line1.cross_product(line2);
                normal = normal.normalize();
                let camRay = triRotated.p[0].sub_vector(this.camera.v);
                // if face can be seen
                if (normal.dot_product(camRay) < 0) {
                    // normalize light source
                    // this.vLight = this.vLight.normalize();
                    if (triRotated.color == "") {
                        let color = normal.dot_product(this.vLight);
                        triRotated.color = "rgb( " + (color + 1) * (255 / 2) + " " + (color + 1) * (255 / 2) + " " + (color + 1) * (255 / 2) + ")";
                    }
                    // convert world space to view space
                    matView.vec_matrix_multiply(triRotated.p[0], triViewed.p[0]);
                    matView.vec_matrix_multiply(triRotated.p[1], triViewed.p[1]);
                    matView.vec_matrix_multiply(triRotated.p[2], triViewed.p[2]);
                    triViewed.color = triRotated.color;
                    // pass the texture coordinates forward
                    triViewed.t[0] = triRotated.t[0];
                    triViewed.t[1] = triRotated.t[1];
                    triViewed.t[2] = triRotated.t[2];
                    let clipped_triangle_count = 0;
                    let clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d()),
                        new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())];
                    // clip against z_near plane, normal is along the z axis
                    clipped_triangle_count = triangle3d.triangle_clip_against_plane(new vec3d(0, 0, 0.1), new vec3d(0, 0, 1), triViewed, clipped[0], clipped[1]);
                    for (let n = 0; n < clipped_triangle_count; n++) {
                        let triProjected = new triangle3d(new vec3d(0, 0, 0), new vec3d(0, 0, 0), new vec3d(0, 0, 0), new vec2d(0, 0, 1), new vec2d(0, 0, 1), new vec2d(0, 0, 1));
                        // project triangle from 3D to 2D
                        proj_mat.vec_matrix_multiply(clipped[n].p[0], triProjected.p[0]);
                        proj_mat.vec_matrix_multiply(clipped[n].p[1], triProjected.p[1]);
                        proj_mat.vec_matrix_multiply(clipped[n].p[2], triProjected.p[2]);
                        // pass the texture coordinates forward
                        triProjected.color = clipped[n].color;
                        triProjected.t[0].u = clipped[n].t[0].u;
                        triProjected.t[0].v = clipped[n].t[0].v;
                        triProjected.t[0].w = clipped[n].t[0].w;
                        triProjected.t[1].u = clipped[n].t[1].u;
                        triProjected.t[1].v = clipped[n].t[1].v;
                        triProjected.t[1].w = clipped[n].t[1].w;
                        triProjected.t[2].u = clipped[n].t[2].u;
                        triProjected.t[2].v = clipped[n].t[2].v;
                        triProjected.t[2].w = clipped[n].t[2].w;
                        // scale texture coordinates into view
                        triProjected.t[0].u = triProjected.t[0].u / triProjected.p[0].v[3];
                        triProjected.t[1].u = triProjected.t[1].u / triProjected.p[1].v[3];
                        triProjected.t[2].u = triProjected.t[2].u / triProjected.p[2].v[3];
                        triProjected.t[0].v = triProjected.t[0].v / triProjected.p[0].v[3];
                        triProjected.t[1].v = triProjected.t[1].v / triProjected.p[1].v[3];
                        triProjected.t[2].v = triProjected.t[2].v / triProjected.p[2].v[3];
                        triProjected.t[0].w = 1 / triProjected.p[0].v[3];
                        triProjected.t[1].w = 1 / triProjected.p[1].v[3];
                        triProjected.t[2].w = 1 / triProjected.p[2].v[3];
                        // scale triangle into view
                        triProjected.p[0] = triProjected.p[0].div_vector(triProjected.p[0].v[3]);
                        triProjected.p[1] = triProjected.p[1].div_vector(triProjected.p[1].v[3]);
                        triProjected.p[2] = triProjected.p[2].div_vector(triProjected.p[2].v[3]);
                        let vecOffset = new vec3d(1, 1, 0, 0);
                        triProjected.p[0] = triProjected.p[0].add_vector(vecOffset);
                        triProjected.p[1] = triProjected.p[1].add_vector(vecOffset);
                        triProjected.p[2] = triProjected.p[2].add_vector(vecOffset);
                        let vecScale = new vec3d(0.25 * this.canvas.width, 0.21 * this.canvas.height, 1, 1);
                        triProjected.p[0] = triProjected.p[0].mult_vector_vector(vecScale);
                        triProjected.p[1] = triProjected.p[1].mult_vector_vector(vecScale);
                        triProjected.p[2] = triProjected.p[2].mult_vector_vector(vecScale);
                        trisToRaster.push(triProjected);
                    }
                }
            });
        });
        trisToRaster.sort((tri1, tri2) => {
            let z1 = (tri1.p[0].v[2] + tri1.p[1].v[2] + tri1.p[2].v[2]) / 3;
            let z2 = (tri2.p[0].v[2] + tri2.p[1].v[2] + tri2.p[2].v[2]) / 3;
            return (z1 > z2) ? -1 : 1;
        });
        // this.depthBuffer.fill(0);
        trisToRaster.forEach((tri) => {
            let listTriangles = [];
            listTriangles.push(tri);
            let newTrianglesCount = 1;
            let clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d()),
                new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())];
            // test triangle against each screen border plane
            triangle3d.clip_triangles_against_screen(listTriangles, newTrianglesCount, clipped, this.canvas);
            listTriangles.forEach((tri) => {
                // rasterizing triangles
                draw2d_triangle(tri.p[0].v[0], tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], this.ctx);
                draw_textured_triangle(tri.p[0].v[0], tri.p[0].v[1], tri.t[0].u, tri.t[0].v, tri.t[0].w, tri.p[1].v[0], tri.p[1].v[1], tri.t[1].u, tri.t[1].v, tri.t[1].w, tri.p[2].v[0], tri.p[2].v[1], tri.t[2].u, tri.t[2].v, tri.t[2].w, this.sampler, this.ctx, this.depthBuffer);
                // fill2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color, this.ctx);
            });
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var intervalId = setInterval(() => {
                if (capChanged) {
                    clearInterval(intervalId);
                    this.init();
                }
                this.render();
            }, this.intervalMs);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.IntializeTextureSampler();
                this.init();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    displaySampledTexture() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const canvas = await sample_rectangle(0, 0, 100, 100, "../files/minecraft_0.png");
                // this.canvas2 = await sample_rectangle(80, 80, 16, 16, 16, 16, "../files/minecraft_0.png");
                // this.ctx2 = this.canvas2.getContext("2d");
                // canvas.width = 100; canvas.height = 100;
                const container = document.getElementById('sampledTexture');
                if (container) {
                    container.appendChild(this.canvas2);
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
    get light() {
        return this.vLight;
    }
    set light(v) {
        v.normalize();
        this.vLight = v;
    }
}
const scene = new Scene();
scene.displaySampledTexture();
scene.light = new vec3d(1, 0, 0);
scene.start();
