import { useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// DragControls
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras.js';
import{GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import{GUI} from 'dat.gui'


const Page = () => {
  useEffect(() => {
    const $ = {
      createScene() {
        const canvas = document.getElementById('c');
        const width = window.innerWidth;
        const height = window.innerHeight;
        // Set the canvas width and height
        canvas.height = height;
        canvas.width = width;
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        const scene = new THREE.Scene();
        this.scene = scene;

        scene.background = new THREE.Color(0xeeeeee)
      },
      createLights() {
        // 添加全局光照 - 增加环境光强度
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        
        // 平行光 - 调整位置和强度
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 20, 5); // 调整光源位置到更高处
        directionalLight.castShadow = true; // 启用阴影
        this.dirLight = directionalLight
        this.scene.add(ambientLight, directionalLight);

        // 添加光的helper查看光源位置
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
        this.scene.add(directionalLightHelper);
      },
      mixer:null,
      swimingWeight:0,
      circlingWeight:0,
      biteWeight:0,
      prepareCrossFade(startAction,endAction,duration){
        if(startAction === ''){
          endAction.fadeIn(duration)
          endAction.play()
        }else{
          const onLoopFinished = (event)=>{
            console.log(event)
            if(event.action._clip.name === startAction._clip.name){
              endAction.setEffectiveTimeScale(1)
              endAction.setEffectiveWeight(1)
              endAction.time = 0

              // 是否使用扭曲进入淡入淡出交叉动画
              startAction.crossFadeTo(endAction,dudation,true)
              endAction.play()
              this.mixer.removeEventListener('loop',onLoopFinished)
            }
          }
          this.mixer.addEventListener('loop',onLoopFinished)
        }
      },
      createObjects() {
        const _this = this
        const gltfLoader = new GLTFLoader()
        const dracoLoader = new DRACOLoader('/src/assets/draco')
        
        gltfLoader.setDRACOLoader(dracoLoader)
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        
        let modelLoaded = false
        
        gltfLoader.load('public/models/shark_animation/scene.gltf',
          (gltf)=>{
            console.log('loaded')
            console.log(gltf)

            const mixer = this.mixer = new THREE.AnimationMixer(gltf.scene)
            const swimingAction = mixer.clipAction(gltf.animations[0])
            const circlingAction = mixer.clipAction(gltf.animations[1])
            const biteAction = mixer.clipAction(gltf.animations[2])
            // swimingAction.play()

            // gltf.scene.scale.set(0.05,0.05,0.05)
            gltf.scene.rotation.y =  Math.PI
            // gltf.scene.position.y = -10

            gltf.scene.traverse(obj=>{
              if(obj.isMesh && obj.material){
                const {gltfExtensions}=obj.material.userData

                if(gltfExtensions){
                  const pbr = gltfExtensions.KHR_materials_pbrSpecularGlossiness
                  debugger
                  if(pbr){
                    console.log(pbr)
                    const textureLoader = new THREE.TextureLoader()
                    const map  = new THREE.TextureLoader().load('public/models/shark_animation/textures/material_0_diffuse.png')
                    const specularGlossinessTexture = textureLoader.load('public/models/shark_animation/textures/material_0_specularGlossiness.png')
                    
                    map.flipY = false
                    map.colorSpace = THREE.SRGPColorSpace
                    specularGlossinessTexture.flipY = false
                    specularGlossinessTexture.colorSpace = THREE.SRGPColorSpace

                    const material = new THREE.MeshPhysicalMaterial({
                      map,
                      color: new THREE.Color(
                        pbr.diffuseFactor[0],
                        pbr.diffuseFactor[1],
                        pbr.diffuseFactor[2]
                      ),
                      sheen:pbr.glossinessFactor,
                      specularIntensityMap:specularGlossinessTexture,
                      specularColor: new THREE.Color(
                        pbr.specularFactor[0],
                        pbr.specularFactor[1],
                        pbr.specularFactor[2]
                      ),
                      roughness:0.2
                    })
                    obj.material = material
                    this.dirLight.target = obj
                    // this.directionalLight.target =
                  }
                }
                console.log(obj.material)
              }
              // if(obj.name === '')
            })
            
            this.scene.add(gltf.scene)
            modelLoaded = true

            const gui = new GUI()
            const params = {
              animation:'',
              timeScale:1,
              pause(){
                swimingAction.paused = true
                circlingAction.paused = true
                biteAction.paused = true 
              },
              '静止=>游动'(){
                params.animation='swiming';
                _this.prepareCrossFade('',swimingAction,2)
              },
              '游动=>撕咬'(){
                params.animation='bite'
                _this.prepareCrossFade('',biteAction,1)

              }
            }
            gui.add(params,'animation',{
              无:'',
              游动:'swiming',
              绕圈:'circling',
              撕咬:'bite'
            }).name('切换动画').onChange(val=>{
              swimingAction.stop()
              circlingAction.stop()
              biteAction.stop() 

              switch(val){
                case '':
                break;
                case 'swiming':
                swimingAction.play()
                break;
                case 'circling':
                circlingAction.play()
                break;
                case 'bite':
                  biteAction.play()
                  break;
              }
            })
            gui.add(params,'pause')
            gui.add(params,'timeScale',0,4,0.01).name('动画播放速度').onChange(val=>{
              _this.mixer.timeScale = val;
            })
            gui.add(params,'静止=>游动');
            gui.add(params,'游动=>撕咬')
          },
          xhr=>{
            // console.log(xhr)
          },
          error=>{
            console.log(error)
          }
        )


        // window.addEventListener('wheel',e=>{
        //   e.stopPropagation()
        //   e.preventDefault()



        //   if(modelLoaded){
        //      let body_2001,body_3001,body_4001
        //      let body_2002,body_3002,body_4002

        //      _this.scene.traverse(obj=>{
        //       if(obj.name === 'body_2001'){
        //         body_2001 = obj
        //      } else if(obj.name === 'body_3001'){
        //         body_3001 = obj
        //      } else if(obj.name === 'body_4001'){
        //         body_4001 = obj
        //      } else if(obj.name === 'body_2002'){
        //         body_2002 = obj
        //      } else if(obj.name === 'body_3002'){
        //         body_3002 = obj
        //      } else if(obj.name === 'body_4002'){
        //         body_4002 = obj
        //      }})
      
            
        //     body_2001.position.x += e.deltaY/4
        //     body_3001.position.x += e.deltaY/2
        //     body_4001.position.x += e.deltaY
        //     body_2002.position.y += e.deltaY/4 
        //     body_3002.position.y += e.deltaY/2 
        //     body_4002.position.y += e.deltaY
        //   }
        // },{passive:false})
      },
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );

        pCamera.position.set(0, 10, 18); // x,y,z
        pCamera.lookAt(this.scene.position);
        this.scene.add(pCamera);
        this.camera = pCamera;
      },
      datGui() {
    
      },
      helpers() {
        const axesHelper = new THREE.AxesHelper();

        this.scene.add(axesHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper);
      },
      render() {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          logarithmicDepthBuffer: true, // 解决深度冲突问题
        });
        //设置渲染器大小
        renderer.setSize(this.width, this.height);
        renderer.shadowMap.enabled = true; // 启用阴影
        // 执行渲染
        renderer.render(this.scene, this.camera);
        this.renderer = renderer;
      },
      controls() {
        // 创建轨道控制器
        const orbitControls = new OrbitControls(this.camera, this.canvas);
        orbitControls.enableDamping = true;
        orbitControls.enableZoom = false
        this.orbitControls = orbitControls;
        console.log(orbitControls);

        const dragControls = new DragControls(
          [],
          this.camera,
          this.canvas
        );

        dragControls.addEventListener('dragstart', () => {
          // 拖拽开启事件
          orbitControls.enabled = false;
        });

        dragControls.addEventListener('dragend', () => {
          // 拖拽结束事件
          orbitControls.enabled = true;
        });
      },
      count: 0, //当前点的index
      clock:new THREE.Clock(),
      tick() {
        const deltaTime = this.clock.getDelta()
        // update mixer
        this.mixer&& this.mixer.update(deltaTime)
        this.orbitControls.update();

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => {
          return this.tick();
        });
      },
      fitView() {
        window.addEventListener(
          'resize',
          () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          },
          false //
        );
      },
      init() {
        this.createScene();
        this.createLights();
        this.createObjects();
        this.createCamera();
        this.helpers();
        this.render();
        this.controls();
        this.tick();
        this.fitView();
        this.datGui();
      },
    };
    $.init();
  }, []);

  return (
    <>
      <canvas id="c" />;
    </>
  );
};

export default Page;
