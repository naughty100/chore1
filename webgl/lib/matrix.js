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

// 创建透视投影矩阵
function createPerspectiveMatrix(fieldOfViewInRadians, aspect, near, far) {
    const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ]);
}

// 创建视图矩阵 (LookAt)
function createLookAtMatrix(cameraPosition, target, up) {
    // 计算Z轴向量 (从目标指向相机)
    const zAxis = normalizeVector(subtractVectors(cameraPosition, target));
    // 计算X轴向量 (上向量与Z轴的叉积)
    const xAxis = normalizeVector(crossVectors(up, zAxis));
    // 计算Y轴向量 (Z轴与X轴的叉积)
    const yAxis = normalizeVector(crossVectors(zAxis, xAxis));

    // 创建视图矩阵
    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dotVector(xAxis, cameraPosition),
        -dotVector(yAxis, cameraPosition),
        -dotVector(zAxis, cameraPosition),
        1,
    ]);
}

// 创建法线矩阵 (模型视图矩阵的逆转置矩阵的左上3x3部分)
// 注意：这是一个简化的版本，假设没有非均匀缩放
// 在实际应用中，通常计算完整的逆转置矩阵
function createNormalMatrix(modelViewMatrix) {
    // 提取左上3x3部分
    const mat3 = new Float32Array([
        modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
        modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
        modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
    ]);
    
    // (简化) 如果没有非均匀缩放，可以直接使用左上3x3部分
    // 实际需要计算逆转置
    // let normalMatrix = mat3Inverse(mat3);
    // normalMatrix = mat3Transpose(normalMatrix);
    // return normalMatrix; 
    
    // 暂时返回3x3部分，适用于均匀缩放和旋转/平移
    return mat3;
}

// ------------ 辅助向量函数 ------------

// 向量减法 v1 - v2
function subtractVectors(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

// 向量叉积 v1 x v2
function crossVectors(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

// 向量点积 v1 . v2
function dotVector(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

// 向量归一化
function normalizeVector(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) { // 避免除以零
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
} 