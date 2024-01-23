textureShader = function (gl) {//line 1,Listing 2.14
  var vertexShaderSource = `
    uniform   mat4 uModelMatrix;
    uniform   mat4 uViewMatrix;
    uniform   mat4 uProjectionMatrix;
    uniform   vec3 uLightDirection;
    uniform   vec3 uLampsPosition[12];
    uniform   mat4 urHeadLightView;
    uniform   mat4 ulHeadLightView;
    uniform   mat4 uHeadLightsProject;
            
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoords;
    
    varying vec3 vLVS;
    varying vec3 vPosVS;
    varying vec3 vNVS;
    varying vec3 vLampsVS[12];
    varying vec3 vDownVS;
    varying vec2 vTexCoords;
    varying mat4 toViewSpace;
    varying vec4 vrHeadLightCoords;
    varying vec4 vlHeadLightCoords;
    
    
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
      vTexCoords = aTexCoords;
      toViewSpace = uViewMatrix * uModelMatrix;
      
      vrHeadLightCoords = uHeadLightsProject * urHeadLightView * uModelMatrix * vec4(aPosition,1.0);
      vlHeadLightCoords = uHeadLightsProject * ulHeadLightView * uModelMatrix * vec4(aPosition,1.0);

      gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);   
    }                                              
  `;

  var fragmentShaderSource = `
    precision highp float; 
                            
    uniform vec4 uColor;
    uniform float uKd;
    uniform float uKs;
    uniform sampler2D uSampler;
    uniform sampler2D uNSampler;
    uniform int uUseTexture;
    uniform int uUseNormalMap;
    uniform sampler2D uProjSampler;
    
    varying vec3 vLVS;
    varying vec3 vPosVS;
    varying vec3 vNVS;
    varying vec3 vLampsVS[12];
    varying vec3 vDownVS;
    varying vec2 vTexCoords;
    varying mat4 toViewSpace; 
    varying vec4 vrHeadLightCoords;
    varying vec4 vlHeadLightCoords;                    
    
    void main(void)                                
    {                
      vec3 L = normalize(vLVS);
      vec3 N;
      if(uUseNormalMap == 1)
      {
        N = normalize((toViewSpace * vec4(texture2D(uNSampler, vTexCoords).xyz, 0.0)).xyz);
      }
      else
      {
        N = normalize(vNVS);
      }
      
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
      vec3 output_color;
      if(uUseTexture == 1)
      {
        output_color = (ambient + uKd*diffusive + uKs*pow(specular, 5.0) + spotlight) * texture2D(uSampler, vTexCoords).xyz;
      }
      else
      {
        output_color = (ambient + uKd*diffusive + uKs*pow(specular, 5.0) + spotlight) * uColor.xyz;                     
      }
       
      vec4 rHeadLightCoordsScaled = vrHeadLightCoords / vrHeadLightCoords.w;
      vec4 lHeadLightCoordsScaled = vlHeadLightCoords / vlHeadLightCoords.w;
      
      if(rHeadLightCoordsScaled.x >= -1.0 && rHeadLightCoordsScaled.x <= 1.0 && rHeadLightCoordsScaled.y >= -1.0 && rHeadLightCoordsScaled.y <= 1.0 && rHeadLightCoordsScaled.z >= -1.0 && rHeadLightCoordsScaled.z <= 1.0)
      {
        vec4 headLightsColor = texture2D(uProjSampler, rHeadLightCoordsScaled.xy / 2.0 + 0.5);
        output_color = mix(output_color, headLightsColor.xyz, headLightsColor.w/2.0);
      }
      if(lHeadLightCoordsScaled.x >= -1.0 && lHeadLightCoordsScaled.x <= 1.0 && lHeadLightCoordsScaled.y >= -1.0 && lHeadLightCoordsScaled.y <= 1.0 && lHeadLightCoordsScaled.z >= -1.0 && lHeadLightCoordsScaled.z <= 1.0)
      {
        vec4 headLightsColor = texture2D(uProjSampler, lHeadLightCoordsScaled.xy / 2.0 + 0.5);
        output_color = mix(output_color, headLightsColor.xyz, headLightsColor.w/2.0);
      }
      
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
  var aTexCoordsIndex = 2;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, aNormalIndex, "aNormal");
  gl.bindAttribLocation(shaderProgram, aTexCoordsIndex, "aTexCoords");
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
  shaderProgram.aTexCoordIndex = aTexCoordsIndex;
  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.uLightDirectionLocation = gl.getUniformLocation(shaderProgram, "uLightDirection");
  shaderProgram.uLampsPositionLocation = gl.getUniformLocation(shaderProgram, "uLampsPosition");
  shaderProgram.uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.uNSamplerLocation = gl.getUniformLocation(shaderProgram, "uNSampler");
  shaderProgram.uKd= gl.getUniformLocation(shaderProgram, "uKd");
  shaderProgram.uKs = gl.getUniformLocation(shaderProgram, "uKs");
  shaderProgram.uUseTextureLocation = gl.getUniformLocation(shaderProgram, "uUseTexture");
  shaderProgram.uUseNormalMapLocation = gl.getUniformLocation(shaderProgram, "uUseNormalMap");
  shaderProgram.urHeadLightViewLocation = gl.getUniformLocation(shaderProgram, "urHeadLightView");
  shaderProgram.ulHeadLightViewLocation = gl.getUniformLocation(shaderProgram, "ulHeadLightView");
  shaderProgram.uHeadLightsProjectLocation = gl.getUniformLocation(shaderProgram, "uHeadLightsProject");
  shaderProgram.uProjSamplerLocation = gl.getUniformLocation(shaderProgram, "uProjSampler");
  return shaderProgram;
};


skyboxShader = function (gl) {//line 1,Listing 2.14
  var vertexShaderSource = `
    uniform   mat4 uViewMatrix;
    uniform   mat4 uProjectionMatrix;
            
    attribute vec3 aPosition;
    
    varying vec3 vPos;
    
    
    void main(void)                                
    {     
      vPos = normalize(aPosition);
      gl_Position = uProjectionMatrix * vec4((uViewMatrix * vec4(aPosition, 0.0)).xyz, 1.0);   
    }                                              
  `;

  var fragmentShaderSource = `
    precision highp float; 
                            
    uniform samplerCube uCMSampler;

    varying vec3 vPos;                   
    
    void main(void)                                
    {                
      gl_FragColor = textureCube(uCMSampler, normalize(vPos));  
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
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
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
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uCMSamplerLocation = gl.getUniformLocation(shaderProgram, "uCMSampler");
  return shaderProgram;
};