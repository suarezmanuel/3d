import { png_sampler } from '../utils/png.js'

export function draw2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(a1, a2);
    ctx.lineTo(b1, b2);
    ctx.lineTo(c1, c2);
    ctx.closePath();
    ctx.stroke();
}

export function draw2d_vector(c1: number, c2: number, x: number, y: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(c1, c2);
    ctx.lineTo(x, y);
    ctx.stroke();
}

export function fill2d_triangle(a1: number, a2: number, b1: number, b2: number, c1: number, c2: number, color: string, ctx: CanvasRenderingContext2D) {
    // we want to color in a grey scale, color is from 0 to 255
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(a1, a2);
    ctx.lineTo(b1, b2);
    ctx.lineTo(c1, c2);
    ctx.closePath();
    ctx.fill();
}

export function draw_textured_triangle (x1: number, y1: number, u1: number, v1: number, w1: number,
                                        x2: number, y2: number, u2: number, v2: number, w2: number,
                                        x3: number, y3: number, u3: number, v3: number, w3: number,
                                        tex: png_sampler, ctx: CanvasRenderingContext2D) {

    // let arr = [x1, y1, x2, y2, x3, y3];
    // arr.forEach((x) => Math.floor(x));
    // [x1, y1, x2, y2, x3, y3] = arr;

    // Sort the vertices by y-coordinate (y1 <= y2 <= y3)
    if (y2 < y1) {
        [y1, y2] = [y2, y1];
        [x1, x2] = [x2, x1];
        [u1, u2] = [u2, u1];
        [v1, v2] = [v2, v1];
        [w1, w2] = [w2, w1];
    }
    if (y3 < y1) {
        [y1, y3] = [y3, y1];
        [x1, x3] = [x3, x1];
        [u1, u3] = [u3, u1];
        [v1, v3] = [v3, v1];
        [w1, w3] = [w3, w1];
    }
    if (y3 < y2) {
        [y2, y3] = [y3, y2];
        [x2, x3] = [x3, x2];
        [u2, u3] = [u3, u2];
        [v2, v3] = [v3, v2];
        [w2, w3] = [w3, w2];
    }

    // Calculate slopes
    let dy1 = y2 - y1;
    let dx1 = x2 - x1;
    let du1 = u2 - u1;
    let dv1 = v2 - v1;
    let dw1 = w2 - w1;

    let dy2 = y3 - y1;
    let dx2 = x3 - x1;
    let du2 = u3 - u1;
    let dv2 = v3 - v1;
    let dw2 = w3 - w1;

    let tex_u, tex_v, tex_w;

    // Calculate step sizes
    let dax_step = 0, dbx_step = 0,
    du1_step = 0, dv1_step = 0,
    du2_step = 0, dv2_step = 0,
    dw1_step = 0, dw2_step = 0;

    if (dy1) dax_step = dx1 / Math.abs(dy1);
    if (dy2) dbx_step = dx2 / Math.abs(dy2);

    if (dy1) du1_step = du1 / Math.abs(dy1);
    if (dy1) dv1_step = dv1 / Math.abs(dy1);
    if (dy1) dw1_step = dw1 / Math.abs(dy1);

    if (dy2) du2_step = du2 / Math.abs(dy2);
    if (dy2) dv2_step = dv2 / Math.abs(dy2);
    if (dy2) dw2_step = dw2 / Math.abs(dy2);

    // First half of the triangle
    if (dy1) {

        for (let i = y1; i <= y2; i++) {

            let ax = Math.floor(x1 + (i - y1) * dax_step);
            let bx = Math.floor(x1 + (i - y1) * dbx_step);

            let tex_su = u1 + (i - y1) * du1_step;
            let tex_sv = v1 + (i - y1) * dv1_step;
            let tex_sw = w1 + (i - y1) * dw1_step;

            let tex_eu = u1 + (i - y1) * du2_step;
            let tex_ev = v1 + (i - y1) * dv2_step;
            let tex_ew = w1 + (i - y1) * dw2_step;

            if (ax > bx) {
                [ax, bx, tex_su, tex_eu, tex_sv, tex_ev, tex_sw, tex_ew] = [bx, ax, tex_eu, tex_su, tex_ev, tex_sv, tex_ew, tex_sw];
            }

            tex_u = tex_su;
            tex_v = tex_sv;
            tex_w = tex_sw;

            let tstep = 1 / (bx - ax);
            // console.log(tstep);
            let t = 0;

            for (let j = ax; j < bx; j++) {

                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;
                
                // console.log(JSON.stringify(tex_w, null, 2));
                let pixel = tex.sample_pixel(tex_u / tex_w, tex_v / tex_w, 80, 16);
                // let pixel = tex.sample_pixel(tex_u / tex_w,(1-tex_v) / tex_w, 80, 16);
                ctx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
                ctx.fillRect(j, i, 1, 1);
                
                t += tstep;
            }
        }
    }

    // Second half of the triangle
    dy1 = y3 - y2;
    dx1 = x3 - x2;
    dv1 = v3 - v2;
    du1 = u3 - u2;
    dw1 = w3 - w2;

    if (dy1) dax_step = dx1 / Math.abs(dy1);
    if (dy2) dbx_step = dx2 / Math.abs(dy2);

    du1_step = 0;
    dv1_step = 0;
    dw1_step = 0;
    if (dy1) du1_step = du1 / Math.abs(dy1);
    if (dy1) dv1_step = dv1 / Math.abs(dy1);
    if (dy1) dw1_step = dw1 / Math.abs(dy1);

    if (dy1) {
            
        for (let i = y2; i <= y3; i++) {

            let ax = x2 + (i - y2) * dax_step;
            let bx = x1 + (i - y1) * dbx_step;

            let tex_su = u2 + (i - y2) * du1_step;
            let tex_sv = v2 + (i - y2) * dv1_step;
            let tex_sw = w2 + (i - y2) * dw1_step;

            let tex_eu = u1 + (i - y1) * du2_step;
            let tex_ev = v1 + (i - y1) * dv2_step;
            let tex_ew = w1 + (i - y1) * dw2_step;

            if (ax > bx) {
                [ax, bx] = [bx, ax];
                [tex_su, tex_eu] = [tex_eu, tex_su];
                [tex_sv, tex_ev] = [tex_ev, tex_sv];
                [tex_sw, tex_ew] = [tex_ew, tex_sw];
            }

            tex_u = tex_su;
            tex_v = tex_sv;
            tex_w = tex_sw;

            let tstep = 1 / Math.abs(bx - ax);
            let t = 0;

            for (let j = ax; j < bx; j++) {

                tex_u = (1 - t) * tex_su + t * tex_eu;
                tex_v = (1 - t) * tex_sv + t * tex_ev;
                tex_w = (1 - t) * tex_sw + t * tex_ew;
                
                let pixel = tex.sample_pixel(tex_u / tex_w, tex_v / tex_w, 80, 16);
                // let pixel = tex.sample_pixel(tex_u / tex_w,(1-tex_v) / tex_w, 80, 16);
                ctx.fillStyle = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
                ctx.fillRect(j, i, 1, 1);
                // console.log(tex_u-tex_v);
                t += tstep;
            }
        }
    }
}