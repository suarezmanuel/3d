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

    updateMovement (elapsed_time: number, dx: number, dy: number) {

        this.fYaw   += (dx * Math.PI) * this.lookSpeed * elapsed_time;
        let a = (dy * Math.PI/2) * this.lookSpeed * elapsed_time;
        this.fPitch = (Math.abs(this.fPitch - a) < 0.99*Math.PI/2) ? this.fPitch - a : Math.sign(this.fPitch)*0.99*Math.PI/2;
        let vForward = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);

        if (this.keys[' ']) {
            // move up
            this.v.v[1] -= this.moveSpeed * elapsed_time;
        }
        if (this.keys['shift']) {
            // move down
            this.v.v[1] += this.moveSpeed * elapsed_time;
        }
        if (this.keys['a']) {
            // this.v.v[0] -= this.moveSpeed * elapsed_time;
            let a = vForward.cross_product(this.vUp); 
            this.v = this.v.add_vector(a);
        }
        if (this.keys['d']) {
            // this.v.v[0] += this.moveSpeed * elapsed_time;
            let b = this.vUp.cross_product(vForward); 
            this.v = this.v.add_vector(b);
        }
        if (this.keys['w']) {
            // this.v.v[2] += this.moveSpeed * elapsed_time;
            let vForwardP = new vec3d();
            // vForwardP.v[0] = vForward.v[0]; vForwardP.v[2] = vForward.v[2]; 
            this.v = this.v.add_vector(vForward);
        }
        if (this.keys['s']) {
            // this.v.v[2] -= this.moveSpeed * elapsed_time;
            let vForwardP = new vec3d();
            // vForwardP.v[0] = vForward.v[0]; vForwardP.v[2] = vForward.v[2]; 
            this.v = this.v.sub_vector(vForward);
        }
    }

    // lookdir, vtarget
    getViewMatrix () {
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