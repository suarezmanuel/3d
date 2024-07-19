// import png from '../node_modules/simplepngjs/dist/index.js'
import { png_sampler, sample_rectangle } from './png2.js';

class _number {
    public val = 0;
}

class vec2d {
    public u: number;
    public v: number;

    constructor (u: number=0, v:number=0) {
        this.u = u;
        this.v = v; 
    }
}

class vec3d {

    public v: [number, number, number, number]

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.v = [x,y,z,w]
    }

    add_vector (u: vec3d) {
        return new vec3d(this.v[0]+u.v[0], this.v[1]+u.v[1], this.v[2]+u.v[2]);
    }

    sub_vector (u: vec3d) {
        return new vec3d(this.v[0]-u.v[0], this.v[1]-u.v[1], this.v[2]-u.v[2]);
    }

    normalize () {
        let l = Math.sqrt(this.v[0]*this.v[0] + this.v[1]*this.v[1] + this.v[2]*this.v[2]);
        if (l == 0) { l=1; }

        return new vec3d(this.v[0]/l, this.v[1]/l, this.v[2]/l);
    }

    dot_product(u: vec3d) {
        return this.v[0]*u.v[0] + this.v[1]*u.v[1] + this.v[2]*u.v[2];
    }

    cross_product(u: vec3d) {
        let res = new vec3d();

        res.v[0] = this.v[1] * u.v[2] - this.v[2] * u.v[1];
        res.v[1] = this.v[2] * u.v[0] - this.v[0] * u.v[2];
        res.v[2] = this.v[0] * u.v[1] - this.v[1] * u.v[0];

        return res;
    }

    mult_vector_vector(u: vec3d) {
        return new vec3d(this.v[0] * u.v[0], this.v[1] * u.v[1], this.v[2] * u.v[2]);
    }

    mult_vector_scalar(n: number) {
        return new vec3d(this.v[0] * n, this.v[1] * n, this.v[2] * n);
    }

    div_vector(n: number) {
        return new vec3d(this.v[0] / n, this.v[1] / n, this.v[2] / n);
    }
}

class triangle3d {

    public p: [vec3d, vec3d, vec3d];
    public t: [vec2d, vec2d, vec2d];
    public color: string;
    constructor(a: vec3d, b: vec3d, c: vec3d, d: vec2d=new vec2d(), e: vec2d=new vec2d(), f: vec2d= new vec2d(), color="rgb( 255 255 255 )") {
        this.p = [a, b, c];
        this.t = [d, e, f];
        this.color = color;
    }
}

class mesh {

    public tris: triangle3d[];

    constructor(tris: triangle3d[]) {
        this.tris = tris;
    }

    async setMeshFromFile(file: string) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.text();
            // console.log(data);

            const lines = data.split('\n');
            const vertices: vec3d[] = [];
            this.tris = [];

            for (let line of lines) {
                if (line.startsWith('v ')) {
                    const coords = line.split(' ');
                    const x = -parseFloat(coords[1]);
                    const y = -parseFloat(coords[2]);
                    const z = parseFloat(coords[3]);
                    vertices.push(new vec3d(x, y, z));

                } else if (line.startsWith('f ')) {
                    
                    const polys = line.split(' ');
                    const v1 = vertices[parseInt(polys[1].split('/')[0]) - 1];
                    const v2 = vertices[parseInt(polys[2].split('/')[0]) - 1];
                    const v3 = vertices[parseInt(polys[3].split('/')[0]) - 1];

                    this.tris.push(new triangle3d(v1, v2, v3));
                }
            }

            // console.log(this.tris);

            // You can parse the .obj file data here and set it to this.tris
        } catch (error) {
            console.error('Failed to fetch file:', error);
        }
    }

    setCubeMesh() {
        this.tris = [
            new triangle3d(new vec3d(0, 0, 0), new vec3d(0, 1, 0), new vec3d(1, 1, 0), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(0, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 0, 0), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),

            new triangle3d(new vec3d(1, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 1, 1), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(1, 0, 0), new vec3d(1, 1, 1), new vec3d(1, 0, 1), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),
            
            new triangle3d(new vec3d(0, 1, 0), new vec3d(0, 1, 1), new vec3d(1, 1, 1), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(0, 1, 0), new vec3d(1, 1, 1), new vec3d(1, 1, 0), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),
            
            new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 0, 0), new vec3d(1, 0, 0), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(0, 0, 1), new vec3d(1, 0, 0), new vec3d(1, 0, 1), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),
            
            new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 1, 0), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(0, 0, 1), new vec3d(0, 1, 0), new vec3d(0, 0, 0), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),
            
            new triangle3d(new vec3d(1, 0, 1), new vec3d(1, 1, 1), new vec3d(0, 1, 1), new vec2d(0, 1), new vec2d(0, 0), new vec2d(1, 0)),
            new triangle3d(new vec3d(1, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 0, 1), new vec2d(0, 1), new vec2d(1, 0), new vec2d(1, 1)),
        ];
    }
}

class sprite {

}

class mat4x4 {
    public mat: number[][];

    constructor() {
        this.mat = [];
        for (let i = 0; i < 4; i++) {
            this.mat[i] = [];
            for (let j = 0; j < 4; j++) {
                this.mat[i][j] = 0;
            }
        }
    }

    vec_matrix_multiply(x: vec3d , dest: vec3d) {

        let s1 = this.mat[0][0] * x.v[0] + this.mat[1][0] * x.v[1] + this.mat[2][0] * x.v[2] + this.mat[3][0] * x.v[3];
        let s2 = this.mat[0][1] * x.v[0] + this.mat[1][1] * x.v[1] + this.mat[2][1] * x.v[2] + this.mat[3][1] * x.v[3];
        let s3 = this.mat[0][2] * x.v[0] + this.mat[1][2] * x.v[1] + this.mat[2][2] * x.v[2] + this.mat[3][2] * x.v[3];
        let s4 = this.mat[0][3] * x.v[0] + this.mat[1][3] * x.v[1] + this.mat[2][3] * x.v[2] + this.mat[3][3] * x.v[3];

        dest.v[0] = s1; dest.v[1] = s2; dest.v[2] = s3;  dest.v[3] = s4;
    }

    mat_multiply(other: mat4x4) {

        let result = new mat4x4();

        for (let i=0; i < 4; i++) {
            for (let j=0; j < 4; j++) {
                let sum = 0;
                for (let k=0; k < 4; k++) {
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

function mat_make_projection(theta: number, a: number, z_near: number, z_far: number) {
    let proj_mat = new mat4x4();
    proj_mat.mat[0][0] = a * theta;
    proj_mat.mat[1][1] = theta;
    proj_mat.mat[2][2] = z_far / (z_far - z_near);
    proj_mat.mat[3][2] = (-z_far * z_near) / (z_far - z_near);
    proj_mat.mat[2][3] = 1;
    proj_mat.mat[3][3] = 0;

    return proj_mat;
}

function mat_make_rotX (theta: number) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [1, 0, 0, 0],
        [0, Math.cos(theta), Math.sin(theta), 0],
        [0, -Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 0, 1],
    ];

    return rot_mat;
}

function mat_make_rotY (theta: number) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [Math.cos(theta), 0, -Math.sin(theta), 0],
        [0, 1, 0, 0],
        [Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1],
    ];

    return rot_mat;
}

function mat_make_rotZ (theta: number) {
    let rot_mat = new mat4x4();
    rot_mat.mat = [
        [Math.cos(theta), Math.sin(theta), 0, 0],
        [-Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    return rot_mat;
}

function mat_make_trans (x: number, y: number, z: number) {
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
function vector_intersect_plane (plane_point: vec3d, plane_normal: vec3d, line_start: vec3d, line_end: vec3d, t: _number) {
    plane_normal = plane_normal.normalize();
    let plane_d =  -plane_normal.dot_product(plane_point);
    let ad = line_start.dot_product(plane_normal);
    let bd = line_end.dot_product(plane_normal);
    t.val = (-plane_d - ad) / (bd - ad);
    let line_start_to_end = line_end.sub_vector(line_start);
    let line_to_intersect = line_start_to_end.mult_vector_scalar(t.val);
    return line_start.add_vector(line_to_intersect);
}

function distance_point_to_plane (plane_normal: vec3d, plane_point: vec3d, point: vec3d) {
    return (plane_normal.v[0]*point.v[0]+plane_normal.v[1]*point.v[1]+plane_normal.v[2]*point.v[2] - plane_normal.dot_product(plane_point));
}

// either output via tri1 or tri2, maybe both
function triangle_clip_against_plane (plane_point: vec3d, plane_normal: vec3d, in_tri: triangle3d, out_tri: triangle3d, out_tri2: triangle3d) {
   
    // make sure the plane normal is normalized
    plane_normal = plane_normal.normalize();

    let insidePointCount = 0;
    let outsidePointCount = 0;
    let insideTexCount = 0;
    let outsideTexCount = 0;

    let inside_points: vec3d[] = [new vec3d(), new vec3d(), new vec3d()];
    let outside_points: vec3d[] = [new vec3d(), new vec3d(), new vec3d()];
    let inside_tex: vec2d[] = [new vec2d(), new vec2d(), new vec2d()];
    let outside_tex: vec2d[] = [new vec2d(), new vec2d(), new vec2d()];

    // get distance from each vertex of triangle to plane
    let d0 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[0]);
    let d1 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[1]);
    let d2 = distance_point_to_plane(plane_normal, plane_point, in_tri.p[2]);

    if (d0 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[0]; inside_tex[insideTexCount++] = in_tri.t[0];
    } else {
        outside_points[outsidePointCount++] = in_tri.p[0]; outside_tex[outsideTexCount++] = in_tri.t[0];
    }

    if (d1 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[1];  inside_tex[insideTexCount++] = in_tri.t[1];
    } else {
        outside_points[outsidePointCount++] = in_tri.p[1]; outside_tex[outsideTexCount++] = in_tri.t[1];
    }

    if (d2 >= 0) {
        inside_points[insidePointCount++] = in_tri.p[2];  inside_tex[insideTexCount++] = in_tri.t[2];
    } else {
        outside_points[outsidePointCount++] = in_tri.p[2]; outside_tex[outsideTexCount++] = in_tri.t[2];
    }

    // outside of plane
    if (insidePointCount == 0) {
        return 0;
    }

    if (insidePointCount == 3) {
        // no changes were made
        out_tri.color = in_tri.color;
        out_tri.p = [...in_tri.p];
        return 1;
    }

    if (insidePointCount == 1 && outsidePointCount == 2) {
        
        out_tri.color = in_tri.color;
        // out_tri.color = "rgb( 80, 255, 80)";

        out_tri.p[0] = inside_points[0];
        out_tri.t[0] = inside_tex[0];
        let t = new _number();
        out_tri.p[1] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0], t);
        out_tri.t[1].u = t.val* (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u;
        out_tri.t[1].v = t.val* (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v;

        out_tri.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[1], t);
        out_tri.t[2].u = t.val* (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u;
        out_tri.t[2].v = t.val* (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v;
        return 1;
    }

    if (insidePointCount == 2 && outsidePointCount == 1) {
        
        // out_tri.color = "rgb( 255, 80, 80)";
        // out_tri2.color =  "rgb( 80, 80, 255)";

        out_tri.color = in_tri.color;
        out_tri2.color = in_tri.color;

        out_tri.p[0] = inside_points[0];
        out_tri.p[1] = inside_points[1];
        out_tri.t[0] = inside_tex[0];
        out_tri.t[1] = inside_tex[1];
        let t = new _number();
        out_tri.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0], t);
        out_tri.t[2].u = t.val* (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u;
        out_tri.t[2].v = t.val* (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v;

        out_tri2.p[0] = inside_points[1];
        out_tri2.p[1] = out_tri.p[2];
        out_tri2.t[0] = inside_tex[1];
        out_tri2.t[1] = outside_tex[2];
        out_tri2.p[2] = vector_intersect_plane(plane_point, plane_normal, inside_points[1], outside_points[0], t);
        out_tri2.t[2].u = t.val* (outside_tex[0].u - inside_tex[1].u) + inside_tex[0].u;
        out_tri2.t[2].v = t.val* (outside_tex[0].v - inside_tex[1].v) + inside_tex[0].v;

        return 2;
    }

    return 0;
}

// given a camera vector and its forward direction, we want to be able to point 
// its forward direction somewhere else, the camera vector is the camera's location

// pos -  where it should be in 3d space
// target - curr forward vector
// up - vector thats orthogonal to forward vector and points up
function mat_point_at (pos: vec3d, target: vec3d, up: vec3d) {

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

    matrix.mat[0][0] = newRight.v[0];   matrix.mat[0][1] = newRight.v[1];   matrix.mat[0][2] = newRight.v[2];   matrix.mat[0][3] = 0; 
    matrix.mat[1][0] = newUp.v[0];      matrix.mat[1][1] = newUp.v[1];      matrix.mat[1][2] = newUp.v[2];      matrix.mat[1][3] = 0; 
    matrix.mat[2][0] = newForward.v[0]; matrix.mat[2][1] = newForward.v[1]; matrix.mat[2][2] = newForward.v[2]; matrix.mat[2][3] = 0; 
    matrix.mat[3][0] = pos.v[0];        matrix.mat[3][1] = pos.v[1];        matrix.mat[3][2] = pos.v[2];        matrix.mat[3][3] = 1; 
    return matrix;
}

// works only for orthogonal matrices, i.e. rotation, translation matrices
function quick_inverse (mat: mat4x4) {
    let matrix = new mat4x4();
    matrix.mat[0][0] = mat.mat[0][0]; matrix.mat[0][1] = mat.mat[1][0]; matrix.mat[0][2] = mat.mat[2][0]; matrix.mat[0][3] = 0.0;
    matrix.mat[1][0] = mat.mat[0][1]; matrix.mat[1][1] = mat.mat[1][1]; matrix.mat[1][2] = mat.mat[2][1]; matrix.mat[1][3] = 0.0;
    matrix.mat[2][0] = mat.mat[0][2]; matrix.mat[2][1] = mat.mat[1][2]; matrix.mat[2][2] = mat.mat[2][2]; matrix.mat[2][3] = 0.0;
    matrix.mat[3][0] = -(mat.mat[3][0] * matrix.mat[0][0] + mat.mat[3][1] * matrix.mat[1][0] + mat.mat[3][2] * matrix.mat[2][0]);
    matrix.mat[3][1] = -(mat.mat[3][0] * matrix.mat[0][1] + mat.mat[3][1] * matrix.mat[1][1] + mat.mat[3][2] * matrix.mat[2][1]);
    matrix.mat[3][2] = -(mat.mat[3][0] * matrix.mat[0][2] + mat.mat[3][1] * matrix.mat[1][2] + mat.mat[3][2] * matrix.mat[2][2]);
    matrix.mat[3][3] = 1.0;
    return matrix;
}

class Scene {

    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private meshCub = new mesh([new triangle3d(new vec3d(), new vec3d(), new vec3d(), new vec2d(), new vec2d(), new vec2d())]);;
    private image: png_sampler;

    private vCamera: vec3d;
    private vLookDirection: vec3d = new vec3d();
    private fYaw: number;

    private Znear = 0.01;
    private Zfar = 100;
    private Fov = 90;
    private AspectRatio: number = 0;
    private FovRad: number = 0;
    private fTheta: number;

    private fps: number = 0;
    private fpsCap: number = 1;
    private capChanged: boolean = false;
    private interval: number = 0;

    
    private distance: number = 10;

    private lastTime: number;
    private elapsed_time: number = 0

    private moveSpeed: number = 10;

    // key is keyboard button name, true if held down
    private keys: { [key: string]: boolean } = {}

    // private spriteTexture1: sprite = new sprite();

    constructor() {

        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;

        // this.meshCub.setMeshFromFile("../resources/mountains.obj");
        this.image = new png_sampler ();

        // this.spriteTexture1 = new sprite("../jario")
        this.meshCub.setCubeMesh();

        this.AspectRatio = this.canvas.height / this.canvas.width;
        this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));

        document.getElementById('Fov')!.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this.Fov = parseFloat(target.value);
            document.getElementById('FovValue')!.innerText = target.value;
            this.FovRad = 1 / Math.tan((this.Fov * 0.5) * (Math.PI / 180));
        });

        document.getElementById('Distance')!.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this.distance = parseFloat(target.value);
            document.getElementById('DistanceValue')!.innerText = target.value;
            // console.log("kaka");
        });

        document.getElementById('fpsCap')!.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this.fpsCap = Math.max(parseFloat(target.value), 1);
            this.capChanged = true;
            document.getElementById('fpsCapValue')!.innerText = target.value;
        })

        // handles all keys
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        })

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        })
    

        this.lastTime = new Date().getTime();
        this.fTheta = 0;

        this.vCamera = new vec3d();
        this.vLookDirection = new vec3d();
        this.fYaw = 0;
    }

    async initalize() {

        await this.image.init_sampler("../files/image.png");
    }

    draw2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(a1, a2);
        this.ctx.lineTo(b1, b2);
        this.ctx.lineTo(c1, c2);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    draw2d_vector(c1: number, c2: number, x: number, y: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(c1, c2);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    fill2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number, color: string) {
        // we want to color in a grey scale, color is from 0 to 255
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(a1, a2);
        this.ctx.lineTo(b1, b2);
        this.ctx.lineTo(c1, c2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    textured_triangle(x1: number, y1: number, u1: number, v1: number,
        x2: number, y2: number, u2: number, v2: number,
        x3: number, y3: number, u3: number, v3: number,
        tex: png_sampler, ctx: CanvasRenderingContext2D) {

// Sort the vertices by y-coordinate (y1 <= y2 <= y3)
if (y2 < y1) {
[x1, x2, y1, y2, u1, u2, v1, v2] = [x2, x1, y2, y1, u2, u1, v2, v1];
}
if (y3 < y1) {
[x1, x3, y1, y3, u1, u3, v1, v3] = [x3, x1, y3, y1, u3, u1, v3, v1];
}
if (y3 < y2) {
[x2, x3, y2, y3, u2, u3, v2, v3] = [x3, x2, y3, y2, u3, u2, v3, v2];
}

// Calculate slopes
let dy1 = y2 - y1;
let dx1 = x2 - x1;
let du1 = u2 - u1;
let dv1 = v2 - v1;

let dy2 = y3 - y1;
let dx2 = x3 - x1;
let du2 = u3 - u1;
let dv2 = v3 - v1;

let tex_u, tex_v;

// Calculate step sizes
let dax_step = 0, dbx_step = 0,
du1_step = 0, dv1_step = 0,
du2_step = 0, dv2_step = 0;

if (dy1) dax_step = dx1 / Math.abs(dy1);
if (dy2) dbx_step = dx2 / Math.abs(dy2);

if (dy1) du1_step = du1 / Math.abs(dy1);
if (dy1) dv1_step = dv1 / Math.abs(dy1);

if (dy2) du2_step = du2 / Math.abs(dy2);
if (dy2) dv2_step = dv2 / Math.abs(dy2);

// First half of the triangle
if (dy1) {
for (let i = Math.floor(y1); i <= Math.floor(y2); i++) {
  let ax = x1 + (i - y1) * dax_step;
  let bx = x1 + (i - y1) * dbx_step;

  let tex_su = u1 + (i - y1) * du1_step;
  let tex_sv = v1 + (i - y1) * dv1_step;
  let tex_eu = u1 + (i - y1) * du2_step;
  let tex_ev = v1 + (i - y1) * dv2_step;

  if (ax > bx) {
      [ax, bx, tex_su, tex_eu, tex_sv, tex_ev] = [bx, ax, tex_eu, tex_su, tex_ev, tex_sv];
  }

  tex_u = tex_su;
  tex_v = tex_sv;

  let tstep = 1 / (bx - ax);
  let t = 0;

  for (let j = Math.floor(ax); j < Math.floor(bx); j++) {
      tex_u = (1 - t) * tex_su + t * tex_eu;
      tex_v = (1 - t) * tex_sv + t * tex_ev;
      
      // Clamp texture coordinates to [0, 1] range
      let u = Math.max(0, Math.min(1, tex_u));
      let v = Math.max(0, Math.min(1, tex_v));
      
      // Scale texture coordinates to image size
      let px = Math.floor(u * (tex.width - 1));
      let py = Math.floor(v * (tex.height - 1));
      
      let pixel = tex.sample_pixel(px, py);
      ctx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
      ctx.fillRect(j, i, 1, 1);
      
      t += tstep;
  }
}
}

// Second half of the triangle
dy1 = y3 - y2;
dx1 = x3 - x2;
du1 = u3 - u2;
dv1 = v3 - v2;

if (dy1) dax_step = dx1 / Math.abs(dy1);
if (dy2) dbx_step = dx2 / Math.abs(dy2);

du1_step = 0;
dv1_step = 0;
if (dy1) du1_step = du1 / Math.abs(dy1);
if (dy1) dv1_step = dv1 / Math.abs(dy1);

if (dy1) {
for (let i = Math.floor(y2); i <= Math.floor(y3); i++) {
  let ax = x2 + (i - y2) * dax_step;
  let bx = x1 + (i - y1) * dbx_step;

  let tex_su = u2 + (i - y2) * du1_step;
  let tex_sv = v2 + (i - y2) * dv1_step;
  let tex_eu = u1 + (i - y1) * du2_step;
  let tex_ev = v1 + (i - y1) * dv2_step;

  if (ax > bx) {
      [ax, bx, tex_su, tex_eu, tex_sv, tex_ev] = [bx, ax, tex_eu, tex_su, tex_ev, tex_sv];
  }

  tex_u = tex_su;
  tex_v = tex_sv;

  let tstep = 1 / (bx - ax);
  let t = 0;

  for (let j = Math.floor(ax); j < Math.floor(bx); j++) {
      tex_u = (1 - t) * tex_su + t * tex_eu;
      tex_v = (1 - t) * tex_sv + t * tex_ev;
      
      // Clamp texture coordinates to [0, 1] range
      let u = Math.max(0, Math.min(1, tex_u));
      let v = Math.max(0, Math.min(1, tex_v));
      
      // Scale texture coordinates to image size
      let px = Math.floor(u * (tex.width - 1));
      let py = Math.floor(v * (tex.height - 1));
      
      let pixel = tex.sample_pixel(px, py);
      ctx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
      ctx.fillRect(j, i, 1, 1);
      
      t += tstep;
  }
}
}
}


    move_camera_up(n: number) {
        this.vCamera.v[1] -= n;
    }

    move_camera_down(n: number) {
        this.vCamera.v[1] += n;
    }

    move_camera_right(n: number) {
        this.vCamera.v[0] += n;
    }

    move_camera_left(n: number) {
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
            let vForwarddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * this.elapsed_time);
            let a = vForwarddd.cross_product(new vec3d(0,1,0)); 
            this.vCamera = this.vCamera.add_vector(a);
        }
        if (this.keys['arrowright']) {
            let vForwardddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * this.elapsed_time);
            let b = new vec3d(0,1,0).cross_product(vForwardddd); 
            this.vCamera = this.vCamera.add_vector(b);
        }
        if (this.keys['w']) {
            // we want to travel along the lookDir vector
            // thus we define a velocity vector as such
            let vForward = this.vLookDirection.mult_vector_scalar( this.moveSpeed * this.elapsed_time);
            this.vCamera = this.vCamera.add_vector(vForward);
        }
        if (this.keys['a']) {
            this.fYaw -= this.moveSpeed / 10 * this.elapsed_time;
        }
        if (this.keys['s']) {
            let vForwardd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * this.elapsed_time);
            this.vCamera = this.vCamera.sub_vector(vForwardd);
        }
        if (this.keys['d']) {
                this.fYaw += this.moveSpeed / 10 * this.elapsed_time;
        }


        this.ctx.fillStyle = "rgb(104, 109, 118)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let currentTime = new Date().getTime();
        this.elapsed_time = (currentTime - this.lastTime) / 1000;
        this.fps = 1/this.elapsed_time;
        this.interval = 1000 / this.fpsCap;

        // fps
        let fpsElement = document.getElementById('fps-counter');
        fpsElement!.innerText = `FPS: ${this.fps.toFixed(2)}`;

        this.lastTime = currentTime;
        // this.fTheta += this.elapsed_time;


        // this.vLookDirection =  new vec3d(0,0,1);
        let vUp = new vec3d(0,1,0);
        // unit vector fixed in the z axis
        let vTarget = new vec3d(0,0,1);
        // rotate it along the y axis, simulating turning left or right
        let matCameraRotation = mat_make_rotY(this.fYaw);
        // we get new forward facing vector
        matCameraRotation.vec_matrix_multiply(vTarget, this.vLookDirection);
        // add it to camera to traverse in looking direction
        vTarget = this.vCamera.add_vector(this.vLookDirection);

        let matCamera = mat_point_at(this.vCamera, vTarget, vUp);

        // view matrix for camera
        let matView = quick_inverse(matCamera);



        let trisToRaster: triangle3d[] = [];

        let world_mat = mat_make_rotZ(this.fTheta);
        world_mat = world_mat.mat_multiply(mat_make_rotX(this.fTheta*0.5));
        world_mat = world_mat.mat_multiply(mat_make_rotY(this.fTheta));
        world_mat = world_mat.mat_multiply(mat_make_trans(0, 0, this.distance));

        let proj_mat = mat_make_projection(this.FovRad, this.AspectRatio, this.Znear, this.Zfar);


        this.meshCub.tris.forEach((tri: triangle3d) => {


            let triRotated = new triangle3d(new vec3d(), new vec3d(), new vec3d());
            let triViewed = new triangle3d(new vec3d(), new vec3d(), new vec3d());

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

            let camRay = triRotated.p[0].sub_vector(this.vCamera);
            

            if (normal.dot_product(camRay) < 0) {

                let triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d());

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
                let clipped : triangle3d[] = [new triangle3d(new vec3d(),new vec3d(),new vec3d(), new vec2d(0, 1), new vec2d(0, 1), new vec2d(1, 0)), new triangle3d(new vec3d(),new vec3d(),new vec3d())];

                // let t = 0;
                // clip against z_near plane, normal is along the z axis
                clipped_triangle_count = triangle_clip_against_plane(new vec3d(0,0,0.1), new vec3d(0,0,1), triViewed, clipped[0], clipped[1]);
                // console.log(clipped_triangle_count);

                for (let n=0; n < clipped_triangle_count; n++) {

                    // light shines on player, if normal is towards player it should be lighter
                    let vLight = new vec3d(0,0,-1);
                    // normalize light source
                    vLight = vLight.normalize();
                    let color = normal.dot_product(vLight);

                    triProjected.color = "rgb( " + (color+1) * (255/2) + " " + (color+1) * (255/2) + " " + (color+1) * (255/2) + ")";

                    // triProjected.color = clipped[n].color;
                    // project triangle from 3D to 2D
                    proj_mat.vec_matrix_multiply(clipped[n].p[0], triProjected.p[0]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[1], triProjected.p[1]);
                    proj_mat.vec_matrix_multiply(clipped[n].p[2], triProjected.p[2]);
                    // triProjected.color = clipped[n].color;
                    // pass the texture coordinates forward
                    triProjected.t[0] = clipped[n].t[0];
                    triProjected.t[1] = clipped[n].t[1];
                    triProjected.t[2] = clipped[n].t[2];

                    // scale texture coordinates into view
                    triProjected.t[0].u = triProjected.t[0].u / triProjected.p[0].v[3];
                    triProjected.t[1].u = triProjected.t[1].u / triProjected.p[1].v[3];
                    triProjected.t[2].u = triProjected.t[2].u / triProjected.p[2].v[3];

                    triProjected.t[0].u = triProjected.t[0].u / triProjected.p[0].v[3];
                    triProjected.t[1].u = triProjected.t[1].u / triProjected.p[1].v[3];
                    triProjected.t[2].u = triProjected.t[2].u / triProjected.p[2].v[3];


                    // scale triangle into view, was previously in vec_matrix_multiply, but removed for conciseness
                    triProjected.p[0] = triProjected.p[0].div_vector(triProjected.p[0].v[3]);
                    triProjected.p[1] = triProjected.p[1].div_vector(triProjected.p[1].v[3]);
                    triProjected.p[2] = triProjected.p[2].div_vector(triProjected.p[2].v[3]);


                    let vecOffset = new vec3d(1,1,0,0);
                    triProjected.p[0] = triProjected.p[0].add_vector(vecOffset);
                    triProjected.p[1] = triProjected.p[1].add_vector(vecOffset);
                    triProjected.p[2] = triProjected.p[2].add_vector(vecOffset);

                    let vecScale = new vec3d(0.5*this.canvas.width, 0.5 * this.canvas.height, 1, 1);
                    triProjected.p[0] = triProjected.p[0].mult_vector_vector(vecScale);
                    triProjected.p[1] = triProjected.p[1].mult_vector_vector(vecScale);
                    triProjected.p[2] = triProjected.p[2].mult_vector_vector(vecScale);
                
                    trisToRaster.push(triProjected);

                    triProjected = new triangle3d(new vec3d(), new vec3d(), new vec3d());
                }
            }
        });


        trisToRaster.sort((tri1, tri2) => {
            let z1 = (tri1.p[0].v[2] + tri1.p[1].v[2] + tri1.p[2].v[2]) / 3;
            let z2 = (tri2.p[0].v[2] + tri2.p[1].v[2] + tri2.p[2].v[2]) / 3;
            return (z1 > z2) ? -1 : 1;
        })


        trisToRaster.forEach((tri: triangle3d) => {

            let listTriangles: triangle3d[] = [];
            listTriangles.push(tri);
            let newTrianglesCount = 1;
            let clipped = [new triangle3d(new vec3d(),new vec3d(),new vec3d(), new vec2d(0, 1), new vec2d(0, 1), new vec2d(1, 0)), new triangle3d(new vec3d(),new vec3d(),new vec3d())];

            // test triangle against each screen border plane
            for (let p=0; p < 4; p++) {
                
                let trisToAdd = 0;

                while (newTrianglesCount > 0) {

                    let test = listTriangles.pop()!;
                    newTrianglesCount--;

                    switch(p) {
                        case 0:
                            trisToAdd = triangle_clip_against_plane(new vec3d(0,0,0), new vec3d(0,1,0), test, clipped[0], clipped[1]);
                            break;
                        case 1:
                            trisToAdd = triangle_clip_against_plane(new vec3d(0,this.canvas.height -1,0), new vec3d(0,-1,0), test, clipped[0], clipped[1]);
                            break;
                        case 2:
                            trisToAdd = triangle_clip_against_plane(new vec3d(1,0,0), new vec3d(1,0,0), test, clipped[0], clipped[1]);
                            break;
                        case 3:
                            trisToAdd = triangle_clip_against_plane(new vec3d(this.canvas.width-1,0,0), new vec3d(-1,0,0), test, clipped[0], clipped[1]);
                            break;
                    }

                    for (let w = 0; w < trisToAdd; w++) {
                        listTriangles.unshift(clipped[w]);
                    }

                    clipped = [new triangle3d(new vec3d(),new vec3d(),new vec3d(), new vec2d(0, 1), new vec2d(0, 1), new vec2d(1, 0)), new triangle3d(new vec3d(),new vec3d(),new vec3d())];
                }

                newTrianglesCount = listTriangles.length;
            }



            listTriangles.forEach((tri: triangle3d) => {
                // rasterizing triangles
                this.textured_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.t[0].u, tri.t[0].v, 
                                       tri.p[1].v[0],tri.p[1].v[1], tri.t[1].u, tri.t[1].v, 
                                       tri.p[2].v[0],tri.p[2].v[1], tri.t[2].u, tri.t[2].v, this.image, this.ctx);

                // this.draw2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1]);
                // this.fill2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color);
            })
        });

        // console.log(this.Znear);
        // trisToRaster.forEach((tri: triangle3d) => {
        //     // rasterizing triangles
        //     this.draw2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1]);
        //     this.fill2d_triangle(tri.p[0].v[0],tri.p[0].v[1], tri.p[1].v[0], tri.p[1].v[1], tri.p[2].v[0], tri.p[2].v[1], tri.color);
        // });
    }

    start () {
        var interval = setInterval(() => {
            if (this.capChanged) {
                clearInterval(interval);
                this.start();
            }
            this.render();
        }, this.interval);
    }

    async displaySampledTexture() {
        try {
            // const canvas = await sample_rectangle(0, 0, 1024, 512, "../files/minecraft_0.png");
            const canvas = await sample_rectangle(80, 80, 16, 16, "../files/image.png");
            const container = document.getElementById('sampledTexture');
            if (container) {
                container.appendChild(canvas);
            } else {
                console.error("Container not found");
            }
        } catch (error) {
            console.error("Error sampling rectangle:", error);
        }
    }
}

async function initAndStart () {

    const scene = new Scene();
    await scene.initalize();
    scene.displaySampledTexture();
    scene.start();
}

initAndStart().catch(console.error);
