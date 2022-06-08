lightShader = function (gl) {//line 1,Listing 2.14
  var vertexShaderSource = `
    uniform   mat4 uModelMatrix;
    uniform   mat4 uViewMatrix;
    uniform   mat4 uProjectionMatrix;
    uniform   vec3 uLightDirection;
    uniform   vec3 uLampsPosition[12];
            
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    
    varying vec3 vLVS;
    varying vec3 vPosVS;
    varying vec3 vNVS;
    varying vec3 vLampsVS[12];
    varying vec3 vDownVS;
    
    void main(void)                                
    {     
      vLVS = normalize(uViewMatrix * vec4(uLightDirection, 0.0)).xyz;
      vPosVS = (uViewMatrix * uModelMatrix * vec4(aPosition, 1.0)).xyz;
      vNVS = normalize(uViewMatrix * uModelMatrix * vec4(aNormal, 0.0)).xyz;
                                             
      for(int i=0; i < 12; i++)
      {
        vLampsVS[i] = (uViewMatrix * vec4(uLampsPosition[i], 1.0)).xyz;
      }
      vDownVS = normalize(uViewMatrix * vec4(0.0, -1.0, 0.0, 0.0)).xyz;
      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);   
    }                                              
  `;

  var fragmentShaderSource = `
    precision highp float;                         
    uniform vec4 uColor;
    uniform float uKd;
    uniform float uKs;
    
    varying vec3 vLVS;
    varying vec3 vPosVS;
    varying vec3 vNVS;
    varying vec3 vLampsVS[12];
    varying vec3 vDownVS;
                           
    void main(void)                                
    {                
      vec3 L = normalize(vLVS);
      vec3 N = normalize(vNVS);
      vec3 V = normalize(-vPosVS);
      vec3 R = -L+2.0 * dot(L,N)*N;
      
      float ambient = 0.3;
      float diffusive = max(dot(N, L), 0.0);
      float specular = max(dot(R, V), 0.0);
      
      
      float spotlight = 0.0;
      for(int i=0; i < 12; i++)
      {
        float alpha = acos(dot(normalize(vPosVS - vLampsVS[i]), vDownVS));
        if(alpha > 3.14 / 6.0){
          spotlight += 0.0;
        } else if(alpha < 3.14 / 12.0){
          spotlight += 0.5;
        } else{
          spotlight += 0.5 * pow(cos(alpha), 4.0);
        }
      }

      vec3 output_color = (ambient + uKd*diffusive + uKs*pow(specular, 5.0) + spotlight) * uColor.xyz;
                                
      gl_FragColor = vec4(output_color, 1.0);         
    }                                             
  `;

  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  // Create the shader program
  var aPositionIndex = 0;
  var aNormalIndex = 1;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, aNormalIndex, "aNormal");
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var str = "Unable to initialize the shader program.\n\n";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }

  shaderProgram.aPositionIndex = aPositionIndex;
  shaderProgram.aNormalIndex = aNormalIndex;
  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.uLightDirectionLocation = gl.getUniformLocation(shaderProgram, "uLightDirection")
  shaderProgram.uLampsPositionLocation = gl.getUniformLocation(shaderProgram, "uLampsPosition")
  shaderProgram.uKd = gl.getUniformLocation(shaderProgram, "uKd")
  shaderProgram.uKs = gl.getUniformLocation(shaderProgram, "uKs")
  return shaderProgram;
};