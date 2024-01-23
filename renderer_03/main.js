



/*
the FollowFromUpCamera always look at the car from a position abova right over the car
*/

FollowFromUpCamera = function(){

  /* the only data it needs is the position of the camera */
  this.frame = glMatrix.mat4.create();
  this.eye = glMatrix.vec4.fromValues(0.0,50.0,0.0, 1.0);
  /* update the camera with the current car position */
  this.update = function(car_position){
    this.frame = car_position;
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    let up = glMatrix.vec4.create();
    
    glMatrix.vec3.transformMat4(eye, this.eye, this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0, 1.0], this.frame);
    glMatrix.vec4.transformMat4(up, [0.0,0.0,-1.0,0.0], this.frame);
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up.slice(0,3));	
  }
}

/*
the ChaseCamera always look at the car from behind the car, slightly above
*/
ChaseCamera = function(){

  /* the only data it needs is the frame of the camera */
  this.frame = [0,0,0];
  this.eye = glMatrix.vec4.fromValues(0, 3.0, 5, 1.0);
  /* update the camera with the current car position */
  this.update = function(car_frame){
    this.frame = car_frame.slice();
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    glMatrix.vec3.transformMat4(eye, this.eye, this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,-3.0,1.0], this.frame);
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);	
  }
}


FirstPersonCamera = function (){
    /* the only data it needs is the frame of the camera */
    this.frame = [0,0,0];
    this.eye = glMatrix.vec4.fromValues(0, 0.8, 0.1, 1.0);
    /* update the camera with the current car position */
    this.update = function(car_frame){
        this.frame = car_frame.slice();
    }

    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
        let eye = glMatrix.vec3.create();
        let target = glMatrix.vec3.create();
        glMatrix.vec3.transformMat4(eye, this.eye, this.frame);
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-3.0,1.0], this.frame);
        return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);
    }
}

TVCamera = function (){
    /* the only data it needs is the frame of the camera */
    this.frame = [0,0,0];
    this.eye = glMatrix.vec4.fromValues(0, 1.05, 0.20, 1.0);

    /* update the camera with the current car position */
    this.update = function(car_frame){
        this.frame = car_frame.slice();
    }

    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
        let eye = glMatrix.vec3.create();
        let target = glMatrix.vec3.create();
        glMatrix.vec3.transformMat4(eye, this.eye, this.frame);
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-2.0,1.0], this.frame);
        return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);
    }
}

FreeCamera = function (){
    /* the only data it needs is the frame of the camera */
    this.frame = glMatrix.mat4.create();
    this.eye = glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0);
    this.direction = glMatrix.vec4.fromValues(0.0, 0.0, -1.0, 0.0);
    this.rotate = glMatrix.mat4.create();

    this.control_keys = [];

    this.update = function(car_frame){
        this.frame = car_frame.slice();
        glMatrix.vec4.transformMat4(this.direction, [0.0, 0.0, -1.0, 0.0], glMatrix.mat4.invert(glMatrix.mat4.create(), this.matrix()));
        if(this.control_keys[' ']){
            this.eye[1] += 0.05;
        }
        if(this.control_keys['Shift']){
            this.eye[1] -= 0.05;
        }
        if(this.control_keys['ArrowUp'] || this.control_keys['w']){
            this.eye[2] += 0.1 * this.direction[2];
            this.eye[0] += 0.1 * this.direction[0];
        }
        if(this.control_keys['ArrowDown'] || this.control_keys['s']){
            this.eye[2] -= 0.1 * this.direction[2];
            this.eye[0] -= 0.1 * this.direction[0];
        }
        if(this.control_keys['ArrowRight'] || this.control_keys['d']){
            this.eye[2] += 0.1 * this.direction[0];
            this.eye[0] -= 0.1 * this.direction[2];
        }
        if(this.control_keys['ArrowLeft'] || this.control_keys['a']){
            this.eye[2] -= 0.1 * this.direction[0];
            this.eye[0] += 0.1 * this.direction[2];
        }

    }

    /* return the transformation matrix to transform from world coordinates to the view reference frame */
    this.matrix = function(){
        let target = glMatrix.vec4.create();
        glMatrix.vec4.add(target, this.eye, [0.0, 0.0, -1.0, 0.0])
        let view = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(view, this.eye, target,[0, 1, 0]);
        glMatrix.mat4.mul(view, this.rotate, view);
        return view
    }
}

/* the main object to be implementd */
var Renderer = new Object();

/* array of cameras that will be used */
Renderer.cameras = [];
// add a FollowFromUpCamera
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
Renderer.cameras.push(new FirstPersonCamera());
Renderer.cameras.push(new TVCamera());
Renderer.cameras.push(new FreeCamera());

// set the camera currently in use
Renderer.currentCamera = 0;

/*
create the buffers for an object as specified in common/shapes/triangle.js
*/
Renderer.createObjectBuffers = function (gl, obj) {

  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  obj.indexBufferTriangles = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // create edges
  var edges = new Uint16Array(obj.numTriangles * 3 * 2);
  for (var i = 0; i < obj.numTriangles; ++i) {
    edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
    edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
  }

  obj.indexBufferEdges = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  obj.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  if(obj.texCoords != undefined) {
  obj.texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
};


function createFramebuffer(gl, size){
    var depthTexture = gl.createTexture();
    const depthTextureSize = size;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level

    var colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        depthTextureSize,
        depthTextureSize,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        colorTexture,         // texture
        0);                    // mip level

    gl.bindTexture(gl.TEXTURE_2D,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    depthFramebuffer.depthTexture = depthTexture;
    depthFramebuffer.colorTexture = colorTexture;
    depthFramebuffer.size = depthTextureSize;

    return depthFramebuffer;
}

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, shader, fillColor, lineColor, sampler, Nsampler) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(shader.aPositionIndex);
  gl.vertexAttribPointer(shader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  if(obj.normalBuffer != undefined && shader.aNormalIndex != undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
      gl.enableVertexAttribArray(shader.aNormalIndex);
      gl.vertexAttribPointer(shader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
  }

  if(obj.texCoordBuffer != undefined && shader.aTexCoordIndex != undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
      gl.enableVertexAttribArray(shader.aTexCoordIndex);
      gl.vertexAttribPointer(shader.aTexCoordIndex, 2, gl.FLOAT, false, 0, 0);
  }




  if(sampler != undefined) {
      gl.uniform1i(shader.uUseTextureLocation, 1);
      gl.uniform1i(shader.uSamplerLocation, sampler);
  }
  else if(fillColor != undefined) {
      gl.uniform1i(shader.uUseTextureLocation, 0);
      gl.uniform4fv(shader.uColorLocation, fillColor);
  }

  if(Nsampler != undefined)
  {
      gl.uniform1i(shader.uUseNormalMapLocation, 1);
      gl.uniform1i(shader.uNSamplerLocation, Nsampler);
  }
  else if(shader.uUseNormalMapLocation != undefined)
  {
      gl.uniform1i(shader.uUseNormalMapLocation, 0);
  }
  if(obj.indexBufferEdges != undefined && sampler == undefined && shader == this.textureShader){
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.0, 1.0);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);

  if(obj.indexBufferEdges != undefined && sampler == undefined && shader == this.textureShader) {
      gl.uniform4fv(shader.uColorLocation, lineColor);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
      gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(shader.aPositionIndex);
  gl.disableVertexAttribArray(shader.aNormalIndex);
  gl.disableVertexAttribArray(shader.aTexCoordIndex);
};

Renderer.loadTexture = function(gl, tu, url, format, s_wrap, t_wrap){
    var ext = gl.getExtension("EXT_texture_filter_anisotropic") ||
  		  gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
  		  gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    var image = new Image();
    image.src = url;
    image.addEventListener('load',function(){
        gl.activeTexture(gl.TEXTURE0+tu);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D,0,format,format,gl.UNSIGNED_BYTE,image);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,s_wrap);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,t_wrap);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 6.0);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
}

Renderer.setCubeFace = function (gl, texture, face, imgdata) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgdata);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

Renderer.loadCubeFace = function (gl, texture, face, path) {
    var imgdata = new Image();
    imgdata.onload = function () {
        Renderer.setCubeFace(gl, texture, face, imgdata);
    }
    imgdata.src = path;
}

Renderer.createCubeMap = function (tu,gl, posx, negx, posy, negy, posz, negz) {
    let texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+tu);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    if(typeof posx !='undefined'){
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_X, posx);
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, negx);
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, posy);
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, negy);
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, posz);
        Renderer.loadCubeFace(gl, texture, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, negz);
    }else{
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, gl.UNSIGNED_BYTE,null)
    }

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    return texture;
}
/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("mycar");
  // Renderer.triangle = new Triangle();

  this.cube = new Cube(10);
  ComputeNormals(this.cube);
  this.createObjectBuffers(gl,this.cube);
  
  this.cylinder = new Cylinder(10);
  ComputeNormals(this.cylinder);
  this.createObjectBuffers(gl,this.cylinder);

  this.rectangle = new Rectangle();
  this.createObjectBuffers(gl,this.rectangle);

  // Renderer.createObjectBuffers(gl, this.triangle);

  this.f1_body1 = loadOnGPU(gl, f175_body1);
  this.f1_body2 = loadOnGPU(gl, f175_body2);
  this.f1_body3 = loadOnGPU(gl, f175_body3);
  this.f1_body4 = loadOnGPU(gl, f175_body4);
  this.LF_wheel = loadOnGPU(gl, LF_wheel);
  this.RF_wheel = loadOnGPU(gl, RF_wheel);
  this.LR_wheel = loadOnGPU(gl, LR_wheel);
  this.RR_wheel = loadOnGPU(gl, RR_wheel);
  this.steer1 = loadOnGPU(gl, steer1);
  this.steer2 = loadOnGPU(gl, steer2);
  this.L_caliper = loadOnGPU(gl, L_caliper);
  this.R_caliper = loadOnGPU(gl, R_caliper);
  this.streetlamp = loadOnGPU(gl, streetlamp);

  ComputeNormals(Game.scene.trackObj);
  ComputeNormals(Game.scene.groundObj);
  Renderer.createObjectBuffers(gl,Game.scene.trackObj);
  Renderer.createObjectBuffers(gl,Game.scene.groundObj);
  for (var i = 0; i < Game.scene.buildings.length; ++i) {
      ComputeNormals(Game.scene.buildingsObjTex[i]);
      ComputeNormals(Game.scene.buildingsObjTex[i].roof);
      Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i]);
      Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof);
  }

  Renderer.loadTexture(gl, 0, "./../common/textures/street4.png", gl.RGB, gl.REPEAT, gl.REPEAT);
  Renderer.loadTexture(gl, 1, "./../common/textures/facade3.jpg", gl.RGB, gl.REPEAT, gl.REPEAT);
  Renderer.loadTexture(gl, 2, "./../common/textures/roof.jpg", gl.RGB, gl.REPEAT, gl.REPEAT);
  Renderer.loadTexture(gl, 3, "./../common/textures/grass_tile.png", gl.RGB, gl.REPEAT, gl.REPEAT);
  Renderer.loadTexture(gl, 4, "./../common/textures/asphalt_normal_map.jpg", gl.RGB, gl.REPEAT, gl.REPEAT);
  Renderer.loadTexture(gl, 5, "./../common/textures/headlight.png", gl.RGBA, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
  Renderer.loadTexture(gl, 7, "./../common/textures/f1_2022_tyres.png", gl.RGB, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

  Renderer.cubeMap = Renderer.createCubeMap(6,gl,
        "./../common/textures/cubemap/posx.jpg",
        "./../common/textures/cubemap/negx.jpg",
        "./../common/textures/cubemap/posy.jpg",
        "./../common/textures/cubemap/negy.jpg",
        "./../common/textures/cubemap/posz.jpg",
        "./../common/textures/cubemap/negz.jpg");
};

/*
draw the car
*/
Renderer.drawCar = function (gl, shader) {
    M                 = glMatrix.mat4.create();
    rotate_transform  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix      = glMatrix.mat4.create();


    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, Renderer.car.frame);
    gl.uniform1f(shader.uKd, 0.7);
    gl.uniform1f(shader.uKs, 1.5);
    this.drawObject(gl,this.f1_body1, shader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body2, shader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body3, shader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body4, shader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);


    gl.uniform1f(shader.uKd, 0.9);
    gl.uniform1f(shader.uKs, 0.2);

    if(typeof Renderer.drawCar.speed_acc == 'undefined')
    {
        Renderer.drawCar.speed_acc = glMatrix.mat4.create();
    }
    speed_rotate_transform = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(speed_rotate_transform, -Renderer.car.speed*0.75, [1,0,0]);
    glMatrix.mat4.mul(Renderer.drawCar.speed_acc, Renderer.drawCar.speed_acc, speed_rotate_transform);


    glMatrix.mat4.identity(M);


    steer_rotate_transform = glMatrix.mat4.create();


    /*steering wheel*/
    glMatrix.mat4.fromRotation(steer_rotate_transform, Math.PI*(1 + 0.75*Renderer.car.wheelsAngle/0.3), [0, 0, 1]);
    glMatrix.mat4.fromRotation(rotate_transform, Math.PI/2, [1, 0, 0]);
    glMatrix.mat4.fromTranslation(translate_matrix, [0,0.623,-0.44]);


    glMatrix.mat4.mul(M, rotate_transform, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M, translate_matrix, M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);

    this.drawObject(gl,this.steer1, shader, [0.55,0.55,0.55,1.0],[0.0,0.0,0.0,1.0]);
    this.drawObject(gl,this.steer2, shader, [0.55,0.55,0.55,1.0],[0.0,0.0,0.0,1.0]);


    /* draw the wheels */
    glMatrix.mat4.fromRotation(steer_rotate_transform, Renderer.car.wheelsAngle,[0,1,0]);
    /*front left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix, [-0.7,0.4,-1.55]);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.L_caliper, shader, [0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);

    glMatrix.mat4.identity(M);
    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.fromTranslation(translate_matrix, [-0.89,0.4,-1.55]);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.LF_wheel, shader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);


    /*front right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.7,0.4,-1.55]);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.R_caliper, shader, [0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);

    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.89,0.4,-1.55]);
    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.RF_wheel, shader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);


    /*back right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.RR_wheel, shader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);

    /*back left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl,this.LR_wheel, shader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);
};

Renderer.drawStreetlamps = function (gl, shader) {
    rotate_matrix  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix = glMatrix.mat4.create();
    T = glMatrix.mat4.create();
    M = glMatrix.mat4.create();

    glMatrix.mat4.fromRotation(rotate_matrix, -Math.PI/2.0, [1,0,0]);
    glMatrix.mat4.fromTranslation(translate_matrix, [0, -5, 0]);
    glMatrix.mat4.fromScaling(scale_matrix, [2, 2, 2]);

    glMatrix.mat4.mul(T, rotate_matrix, scale_matrix);
    glMatrix.mat4.mul(T, translate_matrix, T);

    glMatrix.mat4.fromRotation(rotate_matrix, Math.PI/2, [0,1,0]);
    glMatrix.mat4.mul(T, rotate_matrix, T);

    for(let i=0; i < Game.scene.lamps.length; i++)
    {
        glMatrix.mat4.fromTranslation(translate_matrix, Game.scene.lamps[i].position);
        glMatrix.mat4.mul(M, translate_matrix, T);
        gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
        this.drawObject(gl, this.streetlamp, shader, [0.5, 0.5, 0.5, 1.0], [0.5, 0.5, 0.5, 1.0]);
    }
}

Renderer.drawSkybox = function(gl, projT,viewT){
    gl.uniformMatrix4fv(this.skyboxShader.uProjectionMatrixLocation,false,projT);
    gl.uniformMatrix4fv(this.skyboxShader.uViewMatrixLocation,false,viewT);

    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Renderer.cubeMap);
    gl.uniform1i(this.skyboxShader.uCMSamplerLocation,6);

    gl.depthMask(false);
    this.drawObject(gl,this.cube,this.skyboxShader);
    gl.depthMask(true);
}

Renderer.drawSceneShadow = function (gl) {
    gl.enable(gl.DEPTH_TEST);
    // //shadow pass
    gl.useProgram(this.depthShader);

    let rHeadLight = glMatrix.vec3.create();
    let rTarget = glMatrix.vec3.create();
    glMatrix.vec3.transformMat4(rHeadLight, [0.35, 0.85, 0.0, 1.0], this.car.frame);
    glMatrix.vec3.transformMat4(rTarget, [0.55,-0.9,-6.0,1.0], this.car.frame);
    let rHeadLightMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(rHeadLightMatrix, rHeadLight, rTarget,[0, 1, 0]);

    let lHeadLight = glMatrix.vec3.create();
    let lTarget = glMatrix.vec3.create();
    glMatrix.vec3.transformMat4(lHeadLight, [-0.35, 0.85, 0.0, 1.0], this.car.frame);
    glMatrix.vec3.transformMat4(lTarget, [-0.55,-0.9,-6.0,1.0], this.car.frame);
    let lHeadLightMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(lHeadLightMatrix, lHeadLight, lTarget,[0, 1, 0]);

    let projectHeadLights = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectHeadLights, 3.14 / 6, 1, 0.1, 100);

    let light_matrix = glMatrix.mat4.create();
    glMatrix.mat4.mul(light_matrix, projectHeadLights, rHeadLightMatrix);
    gl.uniformMatrix4fv(this.depthShader.uLightMatrixLocation,false,light_matrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferR);
    gl.viewport(0, 0, 1024, 1024);
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawScene(gl,this.depthShader, projectHeadLights, lHeadLightMatrix);

    glMatrix.mat4.mul(light_matrix, projectHeadLights, lHeadLightMatrix);
    gl.uniformMatrix4fv(this.depthShader.uLightMatrixLocation,false, light_matrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferL);
    gl.viewport(0, 0, 1024, 1024);
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    this.drawScene(gl,this.depthShader, projectHeadLights, lHeadLightMatrix);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);

    //mirrors

    gl.useProgram(this.textureShader);
    let rMirror = glMatrix.vec4.create();  //mirror position
    let rViewDir = glMatrix.vec4.create();  //view direction
    let rMN = glMatrix.vec4.create();       //mirror normal
    let rMDir = glMatrix.vec4.create();     //reflected direction

    glMatrix.vec4.transformMat4(rMirror, [0.56, 0.77, -0.40, 1.0], this.car.frame);
    let rot = glMatrix.mat4.fromRotation(glMatrix.mat4.create(), -Math.PI/6 + 0.1, [0,1,0]);
    glMatrix.vec4.transformMat4(rMN, [0.0, 0.0, 1.0, 0.0], rot);
    glMatrix.vec4.transformMat4(rMN, rMN, this.car.frame);
    let t = glMatrix.vec4.create();
    let eye = glMatrix.vec4.create();
    if(Renderer.currentCamera != 4)
        glMatrix.vec4.transformMat4(eye, Renderer.cameras[Renderer.currentCamera].eye, this.car.frame);
    else
        eye = Renderer.cameras[Renderer.currentCamera].eye;
    glMatrix.vec4.sub(rViewDir, eye, rMirror);
    glMatrix.vec4.normalize(rViewDir, rViewDir);
    glMatrix.vec4.sub(rMDir, glMatrix.vec4.scale(t, rMN,2*glMatrix.vec4.dot(rViewDir, rMN)),rViewDir);
    let rMTarget = glMatrix.vec4.create();
    glMatrix.vec4.add(rMTarget, rMirror, rMDir);
    let rMirrorMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(rMirrorMatrix, rMirror, rMTarget,[0, 1, 0]);

    let mirror_projection = glMatrix.mat4.create();
    glMatrix.mat4.perspective(mirror_projection, Math.PI/12, 2.84, Renderer.near, Renderer.far);
    //glMatrix.mat4.ortho(mirror_projection, -0.71, 0.71, -0.25, 0.25, 0.01, 100);
    gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation,false, mirror_projection);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, rMirrorMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferMR);
    gl.viewport(0, 0, 512, 512);
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawScene(gl,this.textureShader, mirror_projection, rMirrorMatrix);

    let lMirror = glMatrix.vec4.create();
    let lViewDir = glMatrix.vec4.create();
    let lMN = glMatrix.vec4.create();
    let lMDir = glMatrix.vec4.create();
    let lMTarget = glMatrix.vec4.create();
    glMatrix.vec4.transformMat4(lMirror, [-0.56, 0.77, -0.40, 1.0], this.car.frame);
    glMatrix.mat4.fromRotation(rot, +Math.PI/6 - 0.1, [0,1,0]);
    glMatrix.vec4.transformMat4(lMN, [0.0, 0.0, 1.0, 0.0], rot);
    glMatrix.vec4.transformMat4(lMN, lMN, this.car.frame);
    if(Renderer.currentCamera != 4)
    {
        glMatrix.vec4.transformMat4(eye, Renderer.cameras[Renderer.currentCamera].eye, this.car.frame);
    }
    else
    {
        eye = Renderer.cameras[Renderer.currentCamera].eye;
    }
    glMatrix.vec4.sub(lViewDir, eye, lMirror);
    glMatrix.vec4.normalize(lViewDir, lViewDir);
    glMatrix.vec4.sub(lMDir, glMatrix.vec4.scale(t, lMN,2*glMatrix.vec4.dot(lViewDir, lMN)),lViewDir);
    glMatrix.vec4.add(lMTarget, lMirror, lMDir);
    let lMirrorMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(lMirrorMatrix, lMirror, lMTarget,[0, 1, 0]);

    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, lMirrorMatrix);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebufferML);
    gl.viewport(0, 0, 512, 512);
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawScene(gl,this.textureShader, mirror_projection, lMirrorMatrix);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);

    //light pass
    var width = this.canvas.width;
    var height = this.canvas.height;
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.textureShader);

    let projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix,Renderer.fov, Renderer.aspectRatio, Renderer.near, Renderer.far);
    Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
    let invV = Renderer.cameras[Renderer.currentCamera].matrix();

    gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation,false, projectionMatrix);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation,false,invV);
    gl.uniform1i(this.textureShader.urDepthSamplerLocation,8);
    gl.uniform1i(this.textureShader.ulDepthSamplerLocation,9);


    gl.clearColor(0.34, 0.5, 0.74, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferR.depthTexture);
    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferL.depthTexture);

    gl.activeTexture(gl.TEXTURE10);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferMR.colorTexture);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.activeTexture(gl.TEXTURE11);
    gl.bindTexture(gl.TEXTURE_2D, this.framebufferML.colorTexture);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.uniformMatrix4fv(this.textureShader.urHeadLightViewLocation, false, rHeadLightMatrix);
    gl.uniformMatrix4fv(this.textureShader.ulHeadLightViewLocation, false, lHeadLightMatrix);
    gl.uniformMatrix4fv(this.textureShader.uHeadLightsProjectLocation, false, projectHeadLights);
    gl.uniform3fv(this.textureShader.ulHeadLightPosLocation, lHeadLight);
    gl.uniform3fv(this.textureShader.urHeadLightPosLocation, rHeadLight);
    gl.uniform1i(this.textureShader.uProjSamplerLocation, 5);
    this.drawScene(gl,this.textureShader, projectionMatrix, invV);

    gl.activeTexture(gl.TEXTURE8);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE9);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE10);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE11);
    gl.bindTexture(gl.TEXTURE_2D, null);
};

Renderer.drawScene = function (gl, shader, projectionMatrix, invV) {

  gl.useProgram(this.skyboxShader);
  this.drawSkybox(gl, projectionMatrix, invV);
  gl.useProgram(shader);

  gl.uniform3fv(shader.uLightDirectionLocation, Game.scene.weather.sunLightDirection);

  lampsPositionArray = new Float32Array(Game.scene.lamps.length * 3);
  for(let i=0; i < Game.scene.lamps.length; i++)
  {
      lampsPositionArray[3*i] = Game.scene.lamps[i].position[0];
      lampsPositionArray[3*i+1] = Game.scene.lamps[i].height;
      lampsPositionArray[3*i+2] = Game.scene.lamps[i].position[2];
  }

  gl.uniform3fv(shader.uLampsPositionLocation, lampsPositionArray);

  // drawing the car


  gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, glMatrix.mat4.create());
  gl.uniform1f(shader.uKd, 0.9);
  gl.uniform1f(shader.uKs, 0.3);
  gl.uniform1f(shader.uKe, 0.0);
  // drawing the static elements (ground, track and buldings)

    this.drawCar(gl, shader);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, glMatrix.mat4.create());
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 1.0);
    this.drawObject(gl, Game.scene.groundObj, shader, [0.3, 0.7, 0.2, 1.0], [0.3, 0.7, 0.2, 1.0], 3);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    for (var i in Game.scene.buildingsObjTex) {
        this.drawObject(gl, Game.scene.buildingsObjTex[i], shader, [0.8, 0.8, 0.8, 1.0], [0.8, 0.8, 0.8, 1.0], 1);
        this.drawObject(gl, Game.scene.buildingsObjTex[i].roof, shader, [0.8, 0.8, 0.8, 1.0], [0.8, 0.8, 0.8, 1.0], 2);
    }

    this.drawStreetlamps(gl, shader);

    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, glMatrix.mat4.create());
    gl.uniform1f(shader.uKd, 0.9);
    gl.uniform1f(shader.uKs, 1.0);
    this.drawObject(gl, Game.scene.trackObj, shader, [0.9, 0.8, 0.7, 1.0], [0.9, 0.8, 0.7, 1.0], 0, 4);


    let M = glMatrix.mat4.create();
    let T = glMatrix.mat4.create();
    let R = glMatrix.mat4.create();
    glMatrix.mat4.fromScaling(M, [0.071, 0.025, 1.0]);
    glMatrix.mat4.fromRotation(R, -Math.PI/6 + 0.1, [0,1,0])
    glMatrix.mat4.fromTranslation(T, [0.56, 0.77, -0.40]);
    glMatrix.mat4.mul(M, R, M)
    glMatrix.mat4.mul(M, T, M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);
    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    gl.uniform1f(shader.uKd, 0.0);
    gl.uniform1f(shader.uKs, 0.0);
    gl.uniform1f(shader.uKe, 0.7);
    this.drawObject(gl, this.rectangle, shader, [1.0, 1.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0], 10);

    glMatrix.mat4.fromScaling(M, [0.071, 0.025, 1.0]);
    glMatrix.mat4.fromRotation(R, +Math.PI/6 - 0.1, [0,1,0])
    glMatrix.mat4.fromTranslation(T, [-0.56, 0.77, -0.40]);
    glMatrix.mat4.mul(M, R, M)
    glMatrix.mat4.mul(M, T, M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);
    gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, M);
    this.drawObject(gl, this.rectangle, shader, [1.0, 1.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0], 11);
};



Renderer.Display = function () {
  Renderer.drawSceneShadow(Renderer.gl);
  window.requestAnimationFrame(Renderer.Display) ;
};


Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
    Renderer.selectionCameras = document.getElementById("cameras")
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

    var ext = Renderer.gl.getExtension('WEBGL_depth_texture');
    if (!ext) {
        return alert('need WEBGL_depth_texture');
    }

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

    Renderer.canvas.height = window.innerHeight - 50;
    Renderer.canvas.width = window.innerWidth - 30;

    Renderer.fov = Math.PI / 3;
    Renderer.near = 0.01;
    Renderer.far = 100;
    Renderer.top = Math.tan(Renderer.fov * 0.5) * Renderer.near;
    Renderer.bottom = - Renderer.top;

    Renderer.aspectRatio = Renderer.canvas.width / Renderer.canvas.height;
    Renderer.left = Renderer.aspectRatio * Renderer.bottom;
    Renderer.right = Renderer.aspectRatio * Renderer.top;
    window.addEventListener('resize', resize);

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.textureShader = new textureShader(Renderer.gl);
  Renderer.skyboxShader = new skyboxShader(Renderer.gl);
  Renderer.depthShader = new depthShader(Renderer.gl);

  Renderer.framebufferR = createFramebuffer(Renderer.gl, 1024);
  Renderer.framebufferL = createFramebuffer(Renderer.gl, 1024);
  Renderer.framebufferMR = createFramebuffer(Renderer.gl, 512);
  Renderer.framebufferML = createFramebuffer(Renderer.gl, 512);


  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener("keydown", function(e) {
      if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
      }
  }, false);

  Renderer.startX = 0;
  Renderer.startY = 0;
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('mouseup',on_mouseUp,false);
  Renderer.canvas.addEventListener('mousedown',on_mouseDown,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);
  Renderer.canvas.addEventListener('wheel',on_mouseWheel,false);

  Renderer.canvas.focus();
  Renderer.Display();
}

resize = function (e) {
    Renderer.canvas.height = window.innerHeight - 50;
    Renderer.canvas.width = window.innerWidth - 30;
    Renderer.aspectRatio = Renderer.canvas.width / Renderer.canvas.height;
    Renderer.left = Renderer.aspectRatio * Renderer.bottom;
    Renderer.right = Renderer.aspectRatio * Renderer.top;
}

on_mouseUp = function (e){
    Renderer.rotating = false
}

on_mouseDown = function (e){
    Renderer.rotating = true
    Renderer.startX = e.clientX;
    Renderer.startY = e.clientY;
}

getRotationFromTarget = function (a, b)
{
    if(glMatrix.vec3.equals(a, b))
    {
        return glMatrix.mat4.create();
    }
    v1 = glMatrix.vec3.create();
    v2 = glMatrix.vec3.create();
    glMatrix.vec3.normalize(v1, a);
    glMatrix.vec3.normalize(v2, b);
    var alpha = Math.acos(glMatrix.vec3.dot(v2, v1));

    var axis = glMatrix.vec3.create();
    glMatrix.vec3.cross(axis, v2, v1);
    axis[1] = -axis[1];
    return glMatrix.mat4.fromRotation(glMatrix.mat4.create(), alpha, axis);
}

on_mouseMove = function(e){
    if(Renderer.currentCamera == 4 && Renderer.rotating)
    {
        var r = 10;

        p1x = Renderer.left + (e.clientX / Renderer.canvas.width) * (Renderer.right - Renderer.left);
        p1y = Renderer.bottom + (e.clientY / Renderer.canvas.height) * (Renderer.top - Renderer.bottom);
        p1 = glMatrix.vec3.fromValues(p1x, p1y, -Renderer.near);
        p0x = Renderer.left + (Renderer.startX / Renderer.canvas.width) * (Renderer.right - Renderer.left);
        p0y = Renderer.bottom + (Renderer.startY / Renderer.canvas.height) * (Renderer.top - Renderer.bottom);
        p0 = glMatrix.vec3.fromValues(p0x, p0y, -Renderer.near);

        glMatrix.vec3.scale(p1, p1, -r * Math.sqrt(1 / glMatrix.vec3.dot(p1, p1)));
        glMatrix.vec3.scale(p0, p0, -r * Math.sqrt(1 / glMatrix.vec3.dot(p0, p0)));

        var rotMat = getRotationFromTarget(p0, p1)

        glMatrix.mat4.mul(Renderer.cameras[4].rotate, rotMat, Renderer.cameras[4].rotate);
    }
    Renderer.startX = e.clientX;
    Renderer.startY = e.clientY;
}

on_keyup = function(e){
    if(Renderer.currentCamera == 4)
    {
        Renderer.cameras[4].control_keys[e.key] = false;
    }
    else
    {
	    Renderer.car.control_keys[e.key] = false;
    }
}
on_keydown = function(e){
    if(e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4' || e.key == '5')
    {
        let cam = parseInt(e.key) - 1;
        Renderer.selectionCameras.selectedIndex = cam;
        update_camera(cam)
    }
    if(Renderer.currentCamera == 4)
    {
        Renderer.cameras[4].control_keys[e.key] = true;
    }
    else
    {
	    Renderer.car.control_keys[e.key] = true;
    }
}

on_mouseWheel = function (e){
    e.preventDefault();
    if(Renderer.currentCamera == 4) {
        var direction = glMatrix.vec4.create()
        glMatrix.vec4.transformMat4(direction, [0.0, 0.0, -1.0, 0.0], glMatrix.mat4.invert(glMatrix.mat4.create(), Renderer.cameras[4].matrix()));
        glMatrix.vec4.scale(direction, direction, -0.2*e.deltaY / Math.abs(e.deltaY))
        glMatrix.vec4.add(Renderer.cameras[4].eye, Renderer.cameras[4].eye, direction);
    }
}

window.onload = Renderer.setupAndStart;


update_camera = function (value){
  Renderer.currentCamera = value;
  if(value == 4){
      glMatrix.vec4.transformMat4(Renderer.cameras[value].eye, [-3.5, 2.0, 0.0, 1.0], Renderer.car.frame);
      glMatrix.mat4.identity(Renderer.cameras[value].rotate);
  }
  Renderer.canvas.focus();
}
