



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
    
    glMatrix.vec3.transformMat4(eye, [0 ,30,0], this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0,1.0], this.frame);
    glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
    
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
    glMatrix.vec3.transformMat4(target, [0.0,0.0,-3.0,0.0], this.frame);
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
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-3.0,0.0], this.frame);
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
        glMatrix.vec3.transformMat4(target, [0.0,1.0,-1.0,0.0], this.frame);
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
};

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, fillColor, lineColor) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(this.lightShader.aPositionIndex);
  gl.vertexAttribPointer(this.lightShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
  gl.enableVertexAttribArray(this.lightShader.aNormalIndex);
  gl.vertexAttribPointer(this.lightShader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.uniform4fv(this.lightShader.uColorLocation, fillColor);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);

  if(obj.indexBufferEdges != undefined) {
      gl.uniform4fv(this.lightShader.uColorLocation, lineColor);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
      gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(this.lightShader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

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

  this.f1_body = loadOnGPU(gl, f175_body);
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
      ComputeNormals(Game.scene.buildingsObj[i]);
      Renderer.createObjectBuffers(gl, Game.scene.buildingsObj[i]);
  }
};



/*
draw the car
*/
Renderer.drawCar = function (gl) {
    M                 = glMatrix.mat4.create();
    rotate_transform  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix      = glMatrix.mat4.create();


    glMatrix.mat4.fromScaling(scale_matrix,[1,1,1]);
    glMatrix.mat4.mul(M, translate_matrix, scale_matrix)
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);
    gl.uniform1f(this.lightShader.uKd, 0.7);
    gl.uniform1f(this.lightShader.uKs, 1.5);
    this.drawObject(gl,this.f1_body,[0.66,0.02,0.10,1.0],[0.66,0.02,0.10,1.0]);


    /* draw the wheels */
    gl.uniform1f(this.lightShader.uKd, 0.9);
    gl.uniform1f(this.lightShader.uKs, 0.2);

    if(typeof Renderer.drawCar.speed_acc == 'undefined')
    {
        Renderer.drawCar.speed_acc = glMatrix.mat4.create();
    }
    speed_rotate_transform = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(speed_rotate_transform, Renderer.car.speed * 0.5, [1,0,0]);
    glMatrix.mat4.mul(Renderer.drawCar.speed_acc, Renderer.drawCar.speed_acc, speed_rotate_transform);


    glMatrix.mat4.identity(M);


    steer_rotate_transform = glMatrix.mat4.create();


    /*steering wheel*/
    glMatrix.mat4.fromRotation(steer_rotate_transform, Math.PI*(1 + 0.75*Renderer.car.wheelsAngle/0.3), [0, 0, 1]);
    glMatrix.mat4.fromRotation(rotate_transform, Math.PI/2, [1, 0, 0]);
    glMatrix.mat4.fromTranslation(translate_matrix, [0,0.6,-0.48]);


    glMatrix.mat4.mul(M, rotate_transform, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M, translate_matrix, M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);

    this.drawObject(gl,this.steer,[0.55,0.55,0.55,1.0],[0.0,0.0,0.0,1.0]);



    glMatrix.mat4.fromRotation(steer_rotate_transform, Renderer.car.wheelsAngle,[0,1,0]);
    /*front left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix, [-0.8,0.4,-1.55]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);

    this.drawObject(gl,this.LF_wheel,[0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0]);


    /*front right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.8,0.4,-1.55]);
    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M, steer_rotate_transform, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);


    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.RF_wheel,[0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0]);


    /*back right*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.RR_wheel,[0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0]);

    /*back left*/
    glMatrix.mat4.identity(M);
    glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,0.33,2.05]);

    glMatrix.mat4.mul(M, Renderer.drawCar.speed_acc, M);
    glMatrix.mat4.mul(M,translate_matrix,M);
    glMatrix.mat4.mul(M, Renderer.car.frame, M);

    gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);
    this.drawObject(gl,this.LR_wheel,[0.25,0.25,0.25,1.0],[0.0,0.0,0.0,1.0]);
};

Renderer.drawStreetlamps = function (gl) {
    rotate_matrix  = glMatrix.mat4.create();
    translate_matrix  = glMatrix.mat4.create();
    scale_matrix = glMatrix.mat4.create();
    T = glMatrix.mat4.create();
    M = glMatrix.mat4.create();

    gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);

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
        gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, M);
        this.drawObject(gl, this.streetlamp, [0.5, 0.5, 0.5, 1.0], [0.5, 0.5, 0.5, 1.0]);
    }

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


  gl.useProgram(this.lightShader);
  
  gl.uniformMatrix4fv(this.lightShader.uProjectionMatrixLocation,false,glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 3, ratio, 0.01, 500));

  gl.uniform3fv(this.lightShader.uLightDirectionLocation, Game.scene.weather.sunLightDirection);

  lampsPositionArray = new Float32Array(Game.scene.lamps.length * 3);
  for(let i=0; i < Game.scene.lamps.length; i++)
  {
      lampsPositionArray[3*i] = Game.scene.lamps[i].position[0];
      lampsPositionArray[3*i+1] = Game.scene.lamps[i].height;
      lampsPositionArray[3*i+2] = Game.scene.lamps[i].position[2];
  }

  gl.uniform3fv(this.lightShader.uLampsPositionLocation, lampsPositionArray);

  Renderer.cameras[Renderer.currentCamera].update(this.car.frame);


  
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  
  // initialize the stack with the identity
  this.stack.loadIdentity();
  // multiply by the view matrix
  this.stack.multiply(invV);

  // drawing the car
  //this.stack.push();
  //this.stack.multiply(this.car.frame); // projection * viewport
  //gl.uniformMatrix4fv(this.lightShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawCar(gl);
  //this.stack.pop();

  gl.uniformMatrix4fv(this.lightShader.uViewMatrixLocation, false, this.stack.matrix);
  gl.uniformMatrix4fv(this.lightShader.uModelMatrixLocation, false, glMatrix.mat4.create());

  // drawing the static elements (ground, track and buldings)
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], [0.3, 0.7, 0.2, 1.0]);
 	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], [0.9, 0.8, 0.7, 1.0]);
	for (var i in Game.scene.buildingsObj) 
		this.drawObject(gl, Game.scene.buildingsObj[i], [0.8, 0.8, 0.8, 1.0], [0.8, 0.8, 0.8, 1.0]);

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
  Renderer.lightShader = new lightShader(Renderer.gl);

  /*
  add listeners for the mouse / keyboard events
  */
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
