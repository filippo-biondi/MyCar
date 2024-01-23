function Rectangle (p1, p3) {
    this.name = "rectangle";

    if(p1 == undefined || p2 == undefined) {
        p1 = [-1.0, -1.0];
        p3 = [1.0, 1.0];
    }

    let p2 = [p3[0], p1[1]];
    let p4 = [p1[0], p3[1]];

    this.vertices = new Float32Array([
        p1[0], p1[1], 0.0,
        p2[0], p2[1], 0.0,
        p3[0], p3[1], 0.0,
        p4[0], p4[1], 0.0
        ]);

    this.texCoords = new Float32Array([
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]);

    this.normals = new Float32Array([
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ]);

    this.triangleIndices = new Uint16Array([
        0, 1, 2,  0, 2, 3
    ]);

    this.numVertices = this.vertices.length/3;
    this.numTriangles = this.triangleIndices.length/3;
}