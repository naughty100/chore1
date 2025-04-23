/**
 * Matrix.js - 简单的WebGL矩阵变换库
 */

// 创建4x4单位矩阵
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

// 创建平移矩阵
function createTranslationMatrix(tx, ty, tz) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1
    ]);
}

// 创建缩放矩阵
function createScaleMatrix(sx, sy, sz) {
    return new Float32Array([
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ]);
}

// 创建Z轴旋转矩阵（2D平面旋转）
function createRotationZMatrix(angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return new Float32Array([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

// 矩阵乘法
function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    
    return result;
}

// 创建复合变换矩阵：先平移，然后旋转，最后缩放
function createTransformMatrix(tx, ty, angle, sx, sy) {
    const translationMatrix = createTranslationMatrix(tx, ty, 0);
    const rotationMatrix = createRotationZMatrix(angle);
    const scaleMatrix = createScaleMatrix(sx, sy, 1);
    
    // 先执行缩放，再旋转，最后平移
    const temp = multiplyMatrices(rotationMatrix, scaleMatrix);
    return multiplyMatrices(translationMatrix, temp);
} 