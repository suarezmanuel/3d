import { mat4x4, vec3d } from "../shapes/geometry.js";

export class Camera {
    
    public  v = new vec3d();
    public  keys: { [key: string]: boolean } = {}
    private moveSpeed = 0;
    private lookSpeed = 0;
    public  vLookDirection = new vec3d(0,0,0);
    public  vUp            = new vec3d(0,1,0);
    public  vTarget        = new vec3d(0,0,1);
    private fYaw = 0;
    private fPitch = 0;

    constructor(moveSpeed: number, lookSpeed: number) {
        // handles all keys
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        })

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        })

        this.moveSpeed = moveSpeed;
        this.lookSpeed = lookSpeed;
    }

    move_camera_up(n: number) {
        this.v.v[1] -= n;
    }

    move_camera_down(n: number) {
        this.v.v[1] += n;
    }

    move_camera_right(n: number) {
        this.v.v[0] += n;
    }

    move_camera_left(n: number) {
        this.v.v[0] -= n;
    }

    updateMovement (elapsed_time: number, dx: number, dy: number) {

        // if (Math.abs(dx) <= 0.01) dx = 0;
        // if (Math.abs(dy) <= 0.01) dy = 0;
        this.fYaw   += (dx * Math.PI) * this.lookSpeed * elapsed_time;
        this.fPitch -= (dy * Math.PI/2) * this.lookSpeed * elapsed_time;
        // if (this.keys['arrowleft']) {
        //     this.fYaw -= this.moveSpeed / 10 * elapsed_time;
        // }
        // if (this.keys['arrowright']) {
        //     this.fYaw += this.moveSpeed / 10 * elapsed_time;
        // }
        // if (this.keys['arrowup']) {
        //     this.fPitch += this.moveSpeed / 10 * elapsed_time;
        // }
        // if (this.keys['arrowdown']) {
        //     this.fPitch -= this.moveSpeed / 10 * elapsed_time;
        // }
        // console.log(this.shift);
        if (this.keys[' ']) {
            this.move_camera_up(this.moveSpeed * elapsed_time);
        }
        if (this.keys['shift']) {
            this.move_camera_down(this.moveSpeed * elapsed_time);
        }
        if (this.keys['a']) {
            let vForwarddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            let a = vForwarddd.cross_product(this.vUp); 
            this.v = this.v.add_vector(a);
        }
        if (this.keys['d']) {
            let vForwardddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            // let b = new vec3d(0,1,0).cross_product(vForwardddd); 
            let b = this.vUp.cross_product(vForwardddd); 
            this.v = this.v.add_vector(b);
        }
        if (this.keys['w']) {
            // we want to travel along the lookDir vector
            // thus we define a velocity vector as such
            let vForward = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            this.v = this.v.add_vector(vForward);
        }
        if (this.keys['s']) {
            let vForwardd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            this.v = this.v.sub_vector(vForwardd);
        }
    }

    // lookdir, vtarget
    getViewMatrix () {

        // this.fPitch = (Math.abs(this.fPitch) >= 0.99*Math.PI/2) ? Math.sign(this.fPitch) * (0.99*Math.PI/2) : this.fPitch;
        this.vUp = new vec3d(0,1,0);
        this.vTarget = new vec3d(0,0,1);
        // rotate it along the y axis, turning left or right
        let matCameraRotation = mat4x4.mat_make_rotY(this.fYaw);
        mat4x4.mat_make_rotX(this.fPitch).vec_matrix_multiply(this.vTarget, this.vTarget);
        // we get new forward facing vector
        matCameraRotation.vec_matrix_multiply(this.vTarget, this.vLookDirection);
        // add it to camera to traverse in looking direction
        this.vTarget = this.v.add_vector(this.vLookDirection);

        let matCamera = mat4x4.mat_point_at(this);

        // view matrix for camera
        return mat4x4.quick_inverse(matCamera);
    }

    get pos () : vec3d {
        return this.v;
    }

    set pos (v : vec3d) {
        this.v = v;
    }

    // point at point
}