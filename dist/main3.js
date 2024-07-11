"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class vec3d {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.v = [x, y, z, w];
    }
    add_vector(u) {
        return new vec3d(this.v[0] + u.v[0], this.v[1] + u.v[1], this.v[2] + u.v[2]);
    }
    sub_vector(u) {
        return new vec3d(this.v[0] - u.v[0], this.v[1] - u.v[1], this.v[2] - u.v[2]);
    }
    normalize() {
        let l = Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2]);
        if (l == 0) {
            l = 1;
        }
        return new vec3d(this.v[0] / l, this.v[1] / l, this.v[2] / l);
    }
    dot_product(u) {
        return this.v[0] * u.v[0] + this.v[1] * u.v[1] + this.v[2] * u.v[2];
    }
    cross_product(u) {
        let res = new vec3d();
        res.v[0] = this.v[1] * u.v[2] - this.v[2] * u.v[1];
        res.v[1] = this.v[2] * u.v[0] - this.v[0] * u.v[2];
        res.v[2] = this.v[0] * u.v[1] - this.v[1] * u.v[0];
        return res;
    }
    mult_vector_vector(u) {
        return new vec3d(this.v[0] * u.v[0], this.v[1] * u.v[1], this.v[2] * u.v[2]);
    }
    mult_vector_scalar(n) {
        return new vec3d(this.v[0] * n, this.v[1] * n, this.v[2] * n);
    }
    div_vector(n) {
        return new vec3d(this.v[0] / n, this.v[1] / n, this.v[2] / n);
    }
}
class triangle3d {
    constructor(a, b, c, color = 255) {
        this.p = [a, b, c];
        this.color = color;
    }
}
class mesh {
    constructor(tris) {
        this.tris = tris;
    }
    setMeshFromFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(file);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = yield response.text();
                // console.log(data);
                const lines = data.split('\n');
                const vertices = [];
                this.tris = [];
                for (let line of lines) {
                    if (line.startsWith('v ')) {
                        const coords = line.split(' ');
                        const x = parseFloat(coords[1]);
                        const y = parseFloat(coords[2]);
                        const z = parseFloat(coords[3]);
                        vertices.push(new vec3d(x, y, z));
                    }
                    else if (line.startsWith('f ')) {
                        const polys = line.split(' ');
                        const v1 = vertices[parseInt(polys[1].split('/')[0]) - 1];
                        const v2 = vertices[parseInt(polys[2].split('/')[0]) - 1];
                        const v3 = vertices[parseInt(polys[3].split('/')[0]) - 1];
                        this.tris.push(new triangle3d(v1, v2, v3));
                    }
                }
                // console.log(this.tris);
                // You can parse the .obj file data here and set it to this.tris
            }
            catch (error) {
                console.error('Failed to fetch file:', error);
            }
        });
    }
}
class mat4x4 {
    constructor() {
        this.mat = [];
        for (let i = 0; i < 4; i++) {
            this.mat[i] = [];
            for (let j = 0; j < 4; j++) {
                this.mat[i][j] = 0;
            }
        }
    }
    vec_matrix_multiply(x, dest) {
        let s1 = this.mat[0][0] * x.v[0] + this.mat[1][0] * x.v[1] + this.mat[2][0] * x.v[2] + this.mat[3][0] * x.v[3];
        let s2 = this.mat[0][1] * x.v[0] + this.mat[1][1] * x.v[1] + this.mat[2][1] * x.v[2] + this.mat[3][1] * x.v[3];
        let s3 = this.mat[0][2] * x.v[0] + this.mat[1][2] * x.v[1] + this.mat[2][2] * x.v[2] + this.mat[3][2] * x.v[3];
        let s4 = this.mat[0][3] * x.v[0] + this.mat[1][3] * x.v[1] + this.mat[2][3] * x.v[2] + this.mat[3][3] * x.v[3];
        dest.v[0] = s1;
        dest.v[1] = s2;
        dest.v[2] = s3;
        dest.v[3] = s4;
    }
    mat_multiply(other) {
        let result = new mat4x4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    // ik kj
                    sum += this.mat[i][k] * other.mat[k][j];
                }
                result.mat[i][j] = sum;
            }
        }
        return result;
    }
}
function mat_identity() {
    let ident = new mat4x4();
    ident.mat[0][0] = 1;
    ident.mat[1][1] = 1;
    ident.mat[2][2] = 1;
    ident.mat[3][3] = 1;
    return ident;
}
function mat_make_projection(theta, a, z_near, z_far) {
    let proj_mat = new mat4x4();
    proj_mat.mat[0][0] = a * theta;
    proj_mat.mat[1][1] = theta;
    proj_mat.mat[2][2] = z_far / (z_far - z_near);
    proj_mat.mat[3][2] = (-z_far * z_near) / (z_far - z_near);
    proj_mat.mat[2][3] = 1;
    proj_mat.mat[3][3] = 0;
    return proj_mat;
}
function mat_make_rotX(theta) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [1, 0, 0, 0],
        [0, Math.cos(theta), Math.sin(theta), 0],
        [0, -Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 0, 1],
    ];
    return rot_mat;
}
function mat_make_rotY(theta) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [Math.cos(theta), 0, -Math.sin(theta), 0],
        [0, 1, 0, 0],
        [Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1],
    ];
    return rot_mat;
}
function mat_make_rotZ(theta) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [Math.cos(theta), Math.sin(theta), 0, 0],
        [-Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    return rot_mat;
}
function mat_make_trans(x, y, z) {
    let trans_matrix = new mat4x4();
    trans_matrix.mat = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ];
    return trans_matrix;
}
// returns either the intersection vector or nothing
function vector_intersect_plane(plane_point, plane_normal, line_start, line_end) {
    plane_normal = plane_normal.normalize();
    let plane_d = -plane_normal.dot_product(plane_point);
    let ad = line_start.dot_product(plane_normal);
    let bd = line_end.dot_product(plane_normal);
    let t = (-plane_d - ad) / (bd - ad);
    let line_start_to_end = line_end.sub_vector(line_start);
    let line_to_intersect = line_start_to_end.mult_vector_scalar(t);
    return line_start.add_vector(line_to_intersect);
}
function distance_point_to_plane(plane_normal, plane_point, point) {
    return (plane_normal.v[0] * point.v[0] + plane_normal.v[1] * point.v[1] + plane_normal.v[2] * point.v[2] - plane_normal.dot_product(plane_point));
}
// either output via tri1 or tri2, maybe both
function triangle_clip_against_plane(plane_point, plane_normal, in_tri, out_tri, out_tri2) {
    // make sure the plane normal is normalized
    plane_normal = plane_normal.normalize();
    let insidePointCount = 0;
    let outsidePointCount = 0;
    let inside_points = [new vec3d(), new vec3d(), new vec3d()];
    let outside_points = [new vec3d(), new vec3d(), new vec3d()];
    // get distance from each vertex of triangle to plane
    let d0 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[0]);
    let d1 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[1]);
    let d2 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[2]);
    if (d0 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[0];
    }
    else {
        outside_points[outsidePointCount++] = in_tri.p[0];
    }
    if (d1 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[1];
    }
    else {
        outside_points[outsidePointCount++] = in_tri.p[1];
    }
    if (d2 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[2];
    }
    else {
        outside_points[outsidePointCount++] = in_tri.p[2];
    }
    // outside of plane
    if (insidePointCount == 0) {
        return 0;
    }
    if (insidePointCount == 3) {
        // no changes were made
        out_tri.color = in_tri.color;
        // out_tri.p[0] = in_tri.p[0];
        // out_tri.p[1] = in_tri.p[1];
        // out_tri.p[2] = in_tri.p[2];
        out_tri.p = [...in_tri.p];
        return 1;
    }
    if (insidePointCount == 1 && outsidePointCount == 2) {
        out_tri.color = in_tri.color;
        out_tri.p[0] = inside_points[0];
        out_tri.p[1] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0]);
        out_tri.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[1]);
        return 1;
    }
    if (insidePointCount == 2 && outsidePointCount == 1) {
        out_tri.color = in_tri.color;
        out_tri2.color = in_tri.color;
        out_tri.p[0] = inside_points[0];
        out_tri.p[1] = inside_points[1];
        out_tri.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0]);
        out_tri2.p[0] = inside_points[1];
        out_tri2.p[1] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0]);
        out_tri2.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[1], outside_points[0]);
        return 2;
    }
    return 0;
}
// given a camera vector and its forward direction, we want to be able to point 
// its forward direction somewhere else, the camera vector is the camera's location
// pos -  where it should be in 3d space
// target - curr forward vector
// up - vector thats orthogonal to forward vector and points up
function mat_point_at(pos, target, up) {
    // calculate a new forward vector
    let newForward = target.sub_vector(pos);
    newForward = newForward.normalize();
    // calculate new up vector, in case we rotate the y
    let a = newForward.mult_vector_scalar(up.dot_product(newForward));
    let newUp = up.sub_vector(a);
    newUp = newUp.normalize();
    // calculate a new right vector
    let newRight = newUp.cross_product(newForward);
    let matrix = new mat4x4();
    matrix.mat[0][0] = newRight.v[0];
    matrix.mat[0][1] = newRight.v[1];
    matrix.mat[0][2] = newRight.v[2];
    matrix.mat[0][3] = 0;
    matrix.mat[1][0] = newUp.v[0];
    matrix.mat[1][1] = newUp.v[1];
    matrix.mat[1][2] = newUp.v[2];
    matrix.mat[1][3] = 0;
    matrix.mat[2][0] = newForward.v[0];
    matrix.mat[2][1] = newForward.v[1];
    matrix.mat[2][2] = newForward.v[2];
    matrix.mat[2][3] = 0;
    matrix.mat[3][0] = pos.v[0];
    matrix.mat[3][1] = pos.v[1];
    matrix.mat[3][2] = pos.v[2];
    matrix.mat[3][3] = 1;
    return matrix;
}
// works only for orthogonal matrices, i.e. rotation, translation matrices
function quick_inverse(mat) {
    let matrix = new mat4x4();
    matrix.mat[0][0] = mat.mat[0][0];
    matrix.mat[0][1] = mat.mat[1][0];
    matrix.mat[0][2] = mat.mat[2][0];
    matrix.mat[0][3] = 0.0;
    matrix.mat[1][0] = mat.mat[0][1];
    matrix.mat[1][1] = mat.mat[1][1];
    matrix.mat[1][2] = mat.mat[2][1];
    matrix.mat[1][3] = 0.0;
    matrix.mat[2][0] = mat.mat[0][2];
    matrix.mat[2][1] = mat.mat[1][2];
    matrix.mat[2][2] = mat.mat[2][2];
    matrix.mat[2][3] = 0.0;
    matrix.mat[3][0] = -(mat.mat[3][0] * matrix.mat[0][0] + mat.mat[3][1] * matrix.mat[1][0] + mat.mat[3][2] * matrix.mat[2][0]);
    matrix.mat[3][1] = -(mat.mat[3][0] * matrix.mat[0][1] + mat.mat[3][1] * matrix.mat[1][1] + mat.mat[3][2] * matrix.mat[2][1]);
    matrix.mat[3][2] = -(mat.mat[3][0] * matrix.mat[0][2] + mat.mat[3][1] * matrix.mat[1][2] + mat.mat[3][2] * matrix.mat[2][2]);
    matrix.mat[3][3] = 1.0;
    return matrix;
}
class Scene {
    ;
    constructor() {
        this.meshCub = new mesh([new triangle3d(new vec3d(), new vec3d(), new vec3d())]);
        this.vLookDirection = new vec3d();
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
        // key is keyboard button name, true if held down
        this.keys = {};
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d");
        this.meshCub.setMeshFromFile("../axis.obj");
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
            this.keys[event.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
        this.lastTime = new Date().getTime();
        this.fTheta = 0;
        this.vCamera = new vec3d();
        this.vLookDirection = new vec3d();
        this.fYaw = 0;
    }
    draw2d_triangle(a1, a2, b1, b2, c1, c2) {
        this.ctx.beginPath();
        this.ctx.moveTo(a1, a2);
        this.ctx.lineTo(b1, b2);
        this.ctx.lineTo(c1, c2);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    draw2d_vector(c1, c2, x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(c1, c2);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }
    fill2d_triangle(a1, a2, b1, b2, c1, c2, color) {
        // we want to color in a grey scale, color is from 0 to 255
        this.ctx.fillStyle = "rgb(" + color + " " + color + " " + color + ")";
        this.ctx.beginPath();
        this.ctx.moveTo(a1, a2);
        this.ctx.lineTo(b1, b2);
        this.ctx.lineTo(c1, c2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    move_camera_up(n) {
        this.vCamera.v[1] -= n;
    }
    move_camera_down(n) {
        this.vCamera.v[1] += n;
    }
    move_camera_right(n) {
        this.vCamera.v[0] += n;
    }
    move_camera_left(n) {
        this.vCamera.v[0] -= n;
    }
    render() {
        if (this.keys['arrowup']) {
            this.move_camera_up(this.moveSpeed * this.elapsed_time);
        }
        if (this.keys['arrowdown']) {
            this.move_camera_down(this.moveSpeed * this.elapsed_time);
        }
        if (this.keys['arrowleft']) {
            // this.move_camera_left(1);
            let vForwarddd = this.vLookDirection.mult_vector_scalar(this.moveSpeed * this.elapsed_time);
            let a = vForwarddd.cross_product(new vec3d(0, 1, 0));
            this.vCamera = this.vCamera.add_vector(a);
        }
        if (this.keys['arrowright']) {
            let vForwardddd = this.vLookDirection.mult_vector_scalar(this.moveSpeed * this.elapsed_time);
            let b = new vec3d(0, 1, 0).cross_product(vForwardddd);
            this.vCamera = this.vCamera.add_vector(b);
        }
        if (this.keys['w']) {
            // we want to travel along the lookDir vector
            // thus we define a velocity vector as such
            let vForward = this.vLookDirection.mult_vector_scalar(this.moveSpeed * this.elapsed_time);
            this.vCamera = this.vCamera.add_vector(vForward);
        }
        if (this.keys['a']) {
            this.fYaw -= this.moveSpeed / 10 * this.elapsed_time;
        }
        if (this.keys['s']) {
            let vForwardd = this.vLookDirection.mult_vector_scalar(this.moveSpeed * this.elapsed_time);
            this.vCamera = this.vCamera.sub_vector(vForwardd);
        }
        if (this.keys['d']) {
            this.fYaw += this.moveSpeed / 10 * this.elapsed_time;
        }
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
        // this.vLookDirection =  new vec3d(0,0,1);
        let vUp = new vec3d(0, 1, 0);
        // unit vector fixed in the z axis
        let vTarget = new vec3d(0, 0, 1);
        // rotate it along the y axis, simulating turning left or right
        let matCameraRotation = mat_make_rotY(this.fYaw);
        // we get new forward facing vector
        matCameraRotation.vec_matrix_multiply(vTarget, this.vLookDirection);
        // add it to camera to traverse in looking direction
        vTarget = this.vCamera.add_vector(this.vLookDirection);
        let matCamera = mat_point_at(this.vCamera, vTarget, vUp);
        // view matrix for camera
        let matView = quick_inverse(matCamera);
        let trisToRaster = [];
        let world_mat = mat_make_rotZ(this.fTheta);
        world_mat = world_mat.mat_multiply(mat_make_rotX(this.fTheta * 0.5));
        world_mat = world_mat.mat_multiply(mat_make_rotY(this.fTheta));
        world_mat = world_mat.mat_multiply(mat_make_trans(0, 0, this.distance));
        let proj_mat = mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar);
        this.meshCub.tris.forEach((tri) => {
            let triRotated = new triangle3d(new vec3d(), new vec3d(), new vec3d());
            let triViewed = new triangle3d(new vec3d(), new vec3d(), new vec3d());
            world_mat.vec_matrix_multiply(tri.p[0], triRotated.p[0]);
            world_mat.vec_matrix_multiply(tri.p[1], triRotated.p[1]);
            world_mat.vec_matrix_multiply(tri.p[2], triRotated.p[2]);
            let line1 = triRotated.p[1].sub_vector(triRotated.p[0]);
            let line2 = triRotated.p[2].sub_vector(triRotated.p[0]);
            let normal = line1.cross_product(line2);
            normal = normal.normalize();
            let camRay = triRotated.p[0].sub_vector(this.vCamera);
            if (normal.dot_product(camRay) < 0) {
                let triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d());
                // convert world space to view space
                matView.vec_matrix_multiply(triRotated.p[0], triViewed.p[0]);
                matView.vec_matrix_multiply(triRotated.p[1], triViewed.p[1]);
                matView.vec_matrix_multiply(triRotated.p[2], triViewed.p[2]);
                triViewed.color = triRotated.color;
                let clipped_triangle_count = 0;
                let clipped = [new triangle3d(new vec3d(), new vec3d(), new vec3d()), new triangle3d(new vec3d(), new vec3d(), new vec3d())];
                // clip against z_near plane, normal is along the z axis
                clipped_triangle_count = triangle_clip_against_plane(new vec3d(0, 0, 0.01), new vec3d(0, 0, 1), triViewed, clipped[0], clipped[1]);
                // console.log(clipped_triangle_count);
                for (let n = 0; n < clipped_triangle_count; n++) {
                    // console.log(clipped[n].p[0]);
                    // console.log(clipped[n].p[1]);
                    // console.log(clipped[n].p[2]);
                    triProjected.color = clipped[n].color;
                    // project triangle from 3D to 2D
                    proj_mat.vec_matrix_multiply(clipped[n].p[0], triProjected.p[0]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[1], triProjected.p[1]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[2], triProjected.p[2]);
                    triProjected.color = clipped[n].color;
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
                    // light shines on player, if normal is towards player it should be lighter
                    let vLight = new vec3d(0, 0, -1);
                    // normalize light source
                    vLight = vLight.normalize();
                    let color = normal.dot_product(vLight);
                    triProjected.color = (color + 1) * (255 / 2);
                    trisToRaster.push(triProjected);
                }
            }
        });
        trisToRaster.sort((tri1, tri2) => {
            let z1 = (tri1.p[0].v[2] + tri1.p[1].v[2] + tri1.p[2].v[2]) / 3;
            let z2 = (tri2.p[0].v[2] + tri2.p[1].v[2] + tri2.p[2].v[2]) / 3;
            return (z1 > z2) ? -1 : 1;
        });
        // trisToRaster.forEach((tri: triangle3d) => {
        //     let listTriangles: triangle3d[] = [];
        //     listTriangles.push(tri);
        //     let newTrianglesCount = 1;
        //     let clipped = [new triangle3d(new vec3d(),new vec3d(),new vec3d()), new triangle3d(new vec3d(),new vec3d(),new vec3d())];
        //     // test triangle against each screen border plane
        //     for (let p=0; p < 4; p++) {
        //         let trisToAdd = 0;
        //         while (newTrianglesCount > 0) {
        //             let test = listTriangles.pop()!;
        //             // if (test == undefined) {console.log("scream");}
        //             newTrianglesCount--;
        //             trisToAdd = triangle_clip_against_plane(new vec3d(20,0,0), new vec3d(1,0,0), test!, clipped[0], clipped[1]);
        //             // console.log("kakakkakka");
        //             switch(p) {
        //                 case 0:
        //                     trisToAdd = triangle_clip_against_plane(new vec3d(0,0,0), new vec3d(0,1,0), test, clipped[0], clipped[1]);
        //                     break;
        //                 case 1:
        //                     trisToAdd = triangle_clip_against_plane(new vec3d(0,this.canvas.height -1,0), new vec3d(0,-1,0), test, clipped[0], clipped[1]);
        //                     break;
        //                 case 2:
        //                     trisToAdd = triangle_clip_against_plane(new vec3d(20,0,0), new vec3d(1,0,0), test, clipped[0], clipped[1]);
        //                     break;
        //                 case 3:
        //                     trisToAdd = triangle_clip_against_plane(new vec3d(this.canvas.width -20,0,0), new vec3d(-1,0,0), test, clipped[0], clipped[1]);
        //                     break;
        //             }
        //             for (let w = 0; w < trisToAdd; w++) {
        //                 listTriangles.push(clipped[w]);
        //             }
        //         }
        //         newTrianglesCount = listTriangles.length;
        //     }
        //     listTriangles.forEach((tri: triangle3d) => {
        //         // rasterizing triangles
        //         this.draw2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1]);
        //         this.fill2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color);
        //     })
        // });
        console.log(this.Znear);
        trisToRaster.forEach((tri) => {
            // tri.p[0].v[0] *= -1;
            // tri.p[1].v[0] *= -1;
            // tri.p[2].v[0] *= -1;
            // tri.p[0].v[1] *= -1;
            // tri.p[1].v[1] *= -1;
            // tri.p[2].v[1] *= -1;
            // rasterizing triangles
            this.draw2d_triangle(tri.p[0].v[0], tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1]);
            this.fill2d_triangle(tri.p[0].v[0], tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color);
        });
    }
    start() {
        var interval = setInterval(() => {
            if (this.capChanged) {
                clearInterval(interval);
                this.start();
            }
            this.render();
        }, this.interval);
    }
}
const scene = new Scene();
scene.start();
