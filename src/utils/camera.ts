import { mat4x4, vec3d } from "../shapes/geometry.js";

export class Camera {
    
    public  v = new vec3d();
    public  keys: { [key: string]: boolean } = {}
    private moveSpeed = 0;
    private vLookDirection = new vec3d(0,0,0);
    private vUp            = new vec3d(0,1,0);
    private vTarget        = new vec3d(0,0,1);
    private fYaw = 0;

    constructor(moveSpeed: number) {
        // handles all keys
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        })

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        })

        this.moveSpeed = moveSpeed;
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

    updateMovement (elapsed_time: number) {

        if (this.keys['arrowup']) {
            this.move_camera_up(this.moveSpeed * elapsed_time);
        }
        if (this.keys['arrowdown']) {
            this.move_camera_down(this.moveSpeed * elapsed_time);
        }
        if (this.keys['arrowleft']) {
            // move_camera_left(1);
            let vForwarddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            let a = vForwarddd.cross_product(new vec3d(0,1,0)); 
            this.v = this.v.add_vector(a);
        }
        if (this.keys['arrowright']) {
            let vForwardddd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            let b = new vec3d(0,1,0).cross_product(vForwardddd); 
            this.v = this.v.add_vector(b);
        }
        if (this.keys['w']) {
            // we want to travel along the lookDir vector
            // thus we define a velocity vector as such
            let vForward = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            this.v = this.v.add_vector(vForward);
        }
        if (this.keys['a']) {
            this.fYaw -= this.moveSpeed / 10 * elapsed_time;
        }
        if (this.keys['s']) {
            let vForwardd = this.vLookDirection.mult_vector_scalar( this.moveSpeed * elapsed_time);
            this.v = this.v.sub_vector(vForwardd);
        }
        if (this.keys['d']) {
            this.fYaw += this.moveSpeed / 10 * elapsed_time;
        }
    }

    // lookdir, vtarget
    getViewMatrix () {

         // rotate it along the y axis, simulating turning left or right
         let matCameraRotation = mat4x4.mat_make_rotY(this.fYaw);
         // we get new forward facing vector
         matCameraRotation.vec_matrix_multiply(this.vTarget, this.vLookDirection);

         this.vLookDirection = this.vLookDirection.normalize();
         // add it to camera to traverse in looking direction
         this.vTarget = this.v.add_vector(this.vLookDirection);
 
         let matCamera = mat4x4.mat_point_at(this.v, this.vTarget, this.vUp);
 
         // view matrix for camera
         return mat4x4.quick_inverse(matCamera);
    }
}