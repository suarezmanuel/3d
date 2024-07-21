export class _number {
    public val = 0;
}

export class vec2d {

    public u: number;
    public v: number;

    constructor (u: number=0, v: number=0) {
        this.u = u;
        this.v = v; 

        this.roundVec();
    }

    private round (n: number) {
        return Math.round(n * 1e6) / 1e6;
    }

    roundVec () {
        this.u = this.round(this.u);
        this.v = this.round(this.v);
    }
} 

export class vec3d {

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

    // returns either the intersection vector or nothing
    static vector_intersect_plane (plane_point: vec3d, plane_normal: vec3d, line_start: vec3d, line_end: vec3d, t: _number) {
        plane_normal = plane_normal.normalize();
        let plane_d =  -plane_normal.dot_product(plane_point);
        let ad = line_start.dot_product(plane_normal);
        let bd = line_end.dot_product(plane_normal);
        t.val = (-plane_d - ad) / (bd - ad);
        let line_start_to_end = line_end.sub_vector(line_start);
        let line_to_intersect = line_start_to_end.mult_vector_scalar(t.val);
        return line_start.add_vector(line_to_intersect);
    }   

    static distance_point_to_plane (plane_normal: vec3d, plane_point: vec3d, point: vec3d) {
        return (plane_normal.v[0]*point.v[0]+plane_normal.v[1]*point.v[1]+plane_normal.v[2]*point.v[2] - plane_normal.dot_product(plane_point));
    }
}

export class triangle3d {
    
    public p: [vec3d, vec3d, vec3d];
    public t: [vec2d, vec2d, vec2d];
    public color: string;

    constructor(a: vec3d, b: vec3d, c: vec3d, d: vec2d, e: vec2d, f: vec2d, color="rgb(255,255,255)") {
        this.p = [a, b, c];
        this.t = [d, e, f];
        // this.t = [new vec2d(d.u, d.v), new vec2d(e.u, e.v), new vec2d(f.u, f.v)];
        this.color = color;
    }

    roundTex () {
        this.t.forEach(c => c.roundVec());
    }

    // either output via tri1 or tri2, maybe both
    static triangle_clip_against_plane (plane_point: vec3d, plane_normal: vec3d, in_tri: triangle3d, out_tri: triangle3d, out_tri2: triangle3d) {
    
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
        let d0 = vec3d.distance_point_to_plane(plane_normal, plane_point, in_tri.p[0]);
        let d1 = vec3d.distance_point_to_plane(plane_normal, plane_point, in_tri.p[1]);
        let d2 = vec3d.distance_point_to_plane(plane_normal, plane_point, in_tri.p[2]);

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
            out_tri.t = [...in_tri.t];
            return 1;
        }

        if (insidePointCount == 1 && outsidePointCount == 2) {
            
            out_tri.color = in_tri.color;
            // out_tri.color = "rgb( 80, 255, 80)";

            out_tri.p[0] = inside_points[0];
            out_tri.t[0] = inside_tex[0];

            let t = new _number();
            out_tri.p[1] = vec3d.vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0], t);
            out_tri.t[1].u = t.val * (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u;
            out_tri.t[1].v = t.val * (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v;

            out_tri.p[2] = vec3d.vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[1], t);
            out_tri.t[2].u = t.val * (outside_tex[1].u - inside_tex[0].u) + inside_tex[0].u;
            out_tri.t[2].v = t.val * (outside_tex[1].v - inside_tex[0].v) + inside_tex[0].v;
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
            out_tri.p[2] = vec3d.vector_intersect_plane(plane_point, plane_normal, inside_points[0], outside_points[0], t);
            out_tri.t[2].u = t.val * (outside_tex[0].u - inside_tex[0].u) + inside_tex[0].u;
            out_tri.t[2].v = t.val * (outside_tex[0].v - inside_tex[0].v) + inside_tex[0].v;

            out_tri2.p[0] = inside_points[1];
            out_tri2.t[0] = inside_tex[1];
            
            out_tri2.p[1] = out_tri.p[2];
            out_tri2.t[1] = out_tri.t[2];
            
            out_tri2.p[2] = vec3d.vector_intersect_plane(plane_point, plane_normal, inside_points[1], outside_points[0], t);
            out_tri2.t[2].u = t.val * (outside_tex[0].u - inside_tex[1].u) + inside_tex[1].u;
            out_tri2.t[2].v = t.val * (outside_tex[0].v - inside_tex[1].v) + inside_tex[1].v;

            return 2;
        }

        return 0;
    }
}

export class mesh {

    public tris: triangle3d[];

    constructor() {
        this.tris = [];
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

                    this.tris.push(new triangle3d(v1, v2, v3, new vec2d(), new vec2d(), new vec2d()));
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

    toJSON() {
        return {
            tris: this.tris.map(tri => ({
                p: tri.p.map(point => ({
                    v: [...point.v]
                })),
                t: tri.t.map(tex => ({
                    u: tex.u,
                    v: tex.v
                })),
                color: tri.color
            }))
        };
    }

    stringify() {
        return JSON.stringify(this.toJSON(), null, 2);
    }

    roundAllTex () {
        this.tris.forEach(t => t.roundTex());
    }
}

export class mat4x4 {
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

        dest.v = [s1, s2, s3, s4];
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

    static mat_identity() {

        let ident = new mat4x4();
        ident.mat[0][0] = 1;
        ident.mat[1][1] = 1;
        ident.mat[2][2] = 1;
        ident.mat[3][3] = 1;
    
        return ident;
    }
    
    static mat_make_projection(theta: number, a: number, z_near: number, z_far: number) {
        let proj_mat = new mat4x4();
        proj_mat.mat[0][0] = a * theta;
        proj_mat.mat[1][1] = theta;
        proj_mat.mat[2][2] = z_far / (z_far - z_near);
        proj_mat.mat[3][2] = (-z_far * z_near) / (z_far - z_near);
        proj_mat.mat[2][3] = 1;
        proj_mat.mat[3][3] = 0;
    
        return proj_mat;
    }
    
    static mat_make_rotX (theta: number) {
        let rot_mat = new mat4x4();
        rot_mat.mat = [
            [1, 0, 0, 0],
            [0, Math.cos(theta), Math.sin(theta), 0],
            [0, -Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 0, 1],
        ];
    
        return rot_mat;
    }
    
    static mat_make_rotY (theta: number) {
        let rot_mat = new mat4x4();
        rot_mat.mat = [
            [Math.cos(theta), 0, -Math.sin(theta), 0],
            [0, 1, 0, 0],
            [Math.sin(theta), 0, Math.cos(theta), 0],
            [0, 0, 0, 1],
        ];
    
        return rot_mat;
    }
    
    static mat_make_rotZ (theta: number) {
        let rot_mat = new mat4x4();
        rot_mat.mat = [
            [Math.cos(theta), Math.sin(theta), 0, 0],
            [-Math.sin(theta), Math.cos(theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];
    
        return rot_mat;
    }
    
    static mat_make_trans (x: number, y: number, z: number) {
        let trans_matrix = new mat4x4();
        trans_matrix.mat = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [x, y, z, 1]
        ];
        return trans_matrix;
    }
    
    static mat_point_at (pos: vec3d, target: vec3d, up: vec3d) {
        // given a camera vector and its forward direction, we want to be able to point 
        // its forward direction somewhere else, the camera vector is the camera's location
        
        // pos -  where it should be in 3d space
        // target - curr forward vector
        // up - vector thats orthogonal to forward vector and points up

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
    static quick_inverse (mat: mat4x4) {
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
}


