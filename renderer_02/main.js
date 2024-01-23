



/*
the FollowFromUpCamera always look at the car from a position abova right over the car
*/
FollowFromUpCamera = function(){

  /* the only data it needs is the position of the camera */
  this.frame = glMatrix.mat4.create();
  
  /* update the camera with the current car position */
  this.update = function(car_position){
    this.frame = car_position;
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    let up = glMatrix.vec4.create();
    
    glMatrix.vec3.transformMat4(eye, [0.0,20.0,0.0, 1.0], this.frame);
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
  
  /* update the camera with the current car position */
  this.update = function(car_frame){
    this.frame = car_frame.slice();
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    glMatrix.vec3.transformMat4(eye, [0, 3.0, 5, 1.0], this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,-3.0,1.0], this.frame);
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);	
  }
}


FirstPersonCamera = function (){
    /* the only data it needs is the frame of the camera */
    this.frame = [0,0,0];

    /* update the camera with the current car position */
    this.update = function(car_frame){
        this.frame = car_frame.slice();
    }

    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
        let eye = glMatrix.vec3.create();
        let target = glMatrix.vec3.create();
        glMatrix.vec3.transformMat4(eye, [0, 0.8, 0.1, 1.0], this.frame);
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-3.0,1.0], this.frame);
        return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);
    }
}

TVCamera = function (){
    /* the only data it needs is the frame of the camera */
    this.frame = [0,0,0];

    /* update the camera with the current car position */
    this.update = function(car_frame){
        this.frame = car_frame.slice();
    }

    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
        let eye = glMatrix.vec3.create();
        let target = glMatrix.vec3.create();
        glMatrix.vec3.transformMat4(eye, [0, 1.3, 0.4, 1.0], this.frame);
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-1.0,1.0], this.frame);
        return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye, target,[0, 1, 0]);
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

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, shader, fillColor, lineColor, sampler, Nsampler) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(shader.aPositionIndex);
  gl.vertexAttribPointer(shader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  if(obj.normalBuffer != undefined && shader == this.textureShader) {
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
      gl.enableVertexAttribArray(shader.aNormalIndex);
      gl.vertexAttribPointer(shader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);
  }

  if(obj.texCoordBuffer != undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
      gl.enableVertexAttribArray(shader.aTexCoordIndex);
      gl.vertexAttribPointer(shader.aTexCoordIndex, 2, gl.FLOAT, false, 0, 0);
  }

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);


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
  else if(shader == this.textureShader)
  {
      gl.uniform1i(shader.uUseNormalMapLocation, 0);
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
  this.createObjectBuffers(gl,this.cylinder );
  
  // Renderer.createObjectBuffers(gl, this.triangle);

  this.f1_body1 = loadOnGPU(gl, f175_body1);
  this.f1_body2 = loadOnGPU(gl, f175_body2);
  this.f1_body3 = loadOnGPU(gl, f175_body3);
  this.f1_body4 = loadOnGPU(gl, f175_body4);
  this.LF_wheel = loadOnGPU(gl, LF_wheel);
  this.RF_wheel = loadOnGPU(gl, RF_wheel);
  this.LR_wheel = loadOnGPU(gl, LR_wheel);
  this.RR_wheel = loadOnGPU(gl, RR_wheel);
  this.steer = loadOnGPU(gl, steer);
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
Renderer.drawCar = function (gl) {
    M                 = glMatrix.mat4.create();
    rotate_transform  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix      = glMatrix.mat4.create();


    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, Renderer.car.frame);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);
    gl.uniform1f(this.textureShader.uKd, 0.7);
    gl.uniform1f(this.textureShader.uKs, 1.5);
    this.drawObject(gl,this.f1_body1, this.textureShader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body2, this.textureShader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body3, this.textureShader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);
    this.drawObject(gl,this.f1_body4, this.textureShader,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);

    /* draw the wheels */
    gl.uniform1f(this.textureShader.uKd, 0.9);
    gl.uniform1f(this.textureShader.uKs, 0.2);

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

    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);

    this.drawObject(gl,this.steer, this.textureShader, [0.55,0.55,0.55,1.0],[0.0,0.0,0.0,1.0]);



    glMatrix.mat4.fromRotation(steer_rotate_transform, Renderer.car.wheelsAngle,[0,1,0]);
    /*front left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix, [-0.8,0.4,-1.55]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);

    this.drawObject(gl,this.LF_wheel, this.textureShader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);


    /*front right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.8,0.4,-1.55]);
    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);


    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.RF_wheel, this.textureShader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);


    /*back right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.RR_wheel, this.textureShader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);

    /*back left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.LR_wheel, this.textureShader, [0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0], 7);
};

Renderer.drawStreetlamps = function (gl) {
    rotate_matrix  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix = glMatrix.mat4.create();
    T = glMatrix.mat4.create();
    M = glMatrix.mat4.create();

    gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);

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
        gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, M);
        this.drawObject(gl, this.streetlamp, this.textureShader, [0.5, 0.5, 0.5, 1.0], [0.5, 0.5, 0.5, 1.0]);
    }
}
Renderer.drawSkybox = function(gl, projT,viewT){
    gl.uniformMatrix4fv(this.skyboxShader.uProjectionMatrixLocation,false,projT);
    gl.uniformMatrix4fv(this.skyboxShader.uViewMatrixLocation,false,viewT);

    //gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, Renderer.cubeMap);
    gl.uniform1i(this.skyboxShader.uCMSamplerLocation,6);

    gl.depthMask(false);
    this.drawObject(gl,this.cube,this.skyboxShader);
    gl.depthMask(true);
}

Renderer.drawScene = function (gl) {

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;
  this.stack = new MatrixStack();

  gl.viewport(0, 0, width, height);
  
  gl.enable(gl.DEPTH_TEST);

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  let projectionMatrix = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projectionMatrix,3.14 / 3, ratio, 0.01, 500);

  Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
  let invV = Renderer.cameras[Renderer.currentCamera].matrix();



  gl.useProgram(this.skyboxShader);
  this.drawSkybox(gl, projectionMatrix, invV);
  gl.useProgram(this.textureShader);


  gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation,false, projectionMatrix);


  gl.uniform3fv(this.textureShader.uLightDirectionLocation, Game.scene.weather.sunLightDirection);

  lampsPositionArray = new Float32Array(Game.scene.lamps.length * 3);
  for(let i=0; i < Game.scene.lamps.length; i++)
  {
      lampsPositionArray[3*i] = Game.scene.lamps[i].position[0];
      lampsPositionArray[3*i+1] = Game.scene.lamps[i].height;
      lampsPositionArray[3*i+2] = Game.scene.lamps[i].position[2];
  }

  gl.uniform3fv(this.textureShader.uLampsPositionLocation, lampsPositionArray);


  let rHeadLight = glMatrix.vec3.create();
  let rTarget = glMatrix.vec3.create();
  glMatrix.vec3.transformMat4(rHeadLight, [0.55, 0.83, -0.45, 1.0], this.car.frame);
  glMatrix.vec3.transformMat4(rTarget, [1.0,-0.8,-6.0,1.0], this.car.frame);
  let rHeadLightMatrix = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(rHeadLightMatrix, rHeadLight, rTarget,[0, 1, 0]);

  let lHeadLight = glMatrix.vec3.create();
  let lTarget = glMatrix.vec3.create();
  glMatrix.vec3.transformMat4(lHeadLight, [-0.55, 0.83, -0.45, 1.0], this.car.frame);
  glMatrix.vec3.transformMat4(lTarget, [-1.0,-0.8,-6.0,1.0], this.car.frame);
  let lHeadLightMatrix = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(lHeadLightMatrix, lHeadLight, lTarget,[0, 1, 0]);

  let projectHeadLights = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projectHeadLights, 3.14 / 6, 1, 0.1, 50);

    gl.uniformMatrix4fv(this.textureShader.urHeadLightViewLocation, false, rHeadLightMatrix);
    gl.uniformMatrix4fv(this.textureShader.ulHeadLightViewLocation, false, lHeadLightMatrix);
    gl.uniformMatrix4fv(this.textureShader.uHeadLightsProjectLocation, false, projectHeadLights);
    gl.uniform1i(this.textureShader.uProjSamplerLocation, 5);

  // initialize the stack with the identity
  this.stack.loadIdentity();
  // multiply by the view matrix
  this.stack.multiply(invV);

  // drawing the car
  this.drawCar(gl);

  gl.uniformMatrix4fv(this.textureShader.uViewMatrixLocation, false, this.stack.matrix);
  gl.uniformMatrix4fv(this.textureShader.uModelMatrixLocation, false, glMatrix.mat4.create());

  // drawing the static elements (ground, track and buldings)
	this.drawObject(gl, Game.scene.groundObj, this.textureShader, [0.3, 0.7, 0.2, 1.0], [0.3, 0.7, 0.2, 1.0], 3);
    gl.uniform1f(this.textureShader.uKd, 0.9);
    gl.uniform1f(this.textureShader.uKs, 1.0);
 	this.drawObject(gl, Game.scene.trackObj, this.textureShader, [0.9, 0.8, 0.7, 1.0], [0.9, 0.8, 0.7, 1.0], 0, 4);
	for (var i in Game.scene.buildingsObjTex) {
        this.drawObject(gl, Game.scene.buildingsObjTex[i], this.textureShader, [0.8, 0.8, 0.8, 1.0], [0.8, 0.8, 0.8, 1.0], 1);
        this.drawObject(gl, Game.scene.buildingsObjTex[i].roof, this.textureShader, [0.8, 0.8, 0.8, 1.0], [0.8, 0.8, 0.8, 1.0], 2);
    }

    this.drawStreetlamps(gl);


    gl.useProgram(null);
};



Renderer.Display = function () {
  Renderer.drawScene(Renderer.gl);
  window.requestAnimationFrame(Renderer.Display) ;
};


Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.textureShader = new textureShader(Renderer.gl);
  Renderer.skyboxShader = new skyboxShader(Renderer.gl);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener("keydown", function(e) {
      if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
      }
  }, false);
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);

  Renderer.Display();
}

on_mouseMove = function(e){}

on_keyup = function(e){
	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function(e){
	Renderer.car.control_keys[e.key] = true;
}

window.onload = Renderer.setupAndStart;


update_camera = function (value){
  Renderer.currentCamera = value;
}
