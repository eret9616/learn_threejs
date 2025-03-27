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
      mixer:null,  // 动画混合器，用于控制和管理所有动画
      swimingWeight:0,  // 游泳动画的权重
      circlingWeight:0,  // 绕圈动画的权重
      biteWeight:0,  // 撕咬动画的权重

      /**
       * 准备动画交叉淡入淡出效果
       * @param {string} startAction - 当前正在播放的动画名称
       * @param {THREE.AnimationAction} endAction - 要切换到的新动画动作
       * @param {number} duration - 过渡动画的持续时间（秒）
       */
      prepareCrossFade(startAction,endAction,duration){
        // 如果没有起始动画（比如从静止状态开始）
        if(startAction === ''){
          // 直接淡入新动画
          endAction.fadeIn(duration)
          endAction.play()
        }else{
          // 如果有起始动画，等待当前动画完成一轮后开始过渡
          const onLoopFinished = (event)=>{
            // 检查是否是当前动画完成了一轮
            if(event.action._clip.name === startAction._clip.name){
              // 设置新动画的参数
              endAction.setEffectiveTimeScale(1)  // 设置动画播放速度
              endAction.setEffectiveWeight(1)     // 设置动画权重为1（完全显示）
              endAction.time = 0                  // 重置动画时间到开始

              // 使用扭曲效果进行动画交叉淡入淡出
              // true参数表示使用扭曲效果，使过渡更自然
              startAction.crossFadeTo(endAction,duration,true)
              endAction.play()
              // 移除事件监听器，避免重复触发
              this.mixer.removeEventListener('loop',onLoopFinished)
            }
          }
          // 添加动画循环完成事件监听
          this.mixer.addEventListener('loop',onLoopFinished)
        }
      },
      createObjects() {
        const _this = this
        // 创建GLTF加载器，用于加载3D模型
        const gltfLoader = new GLTFLoader()
        // 创建DRACO加载器，用于解码压缩的模型数据
        const dracoLoader = new DRACOLoader('/src/assets/draco')
        
        // 设置GLTF加载器使用DRACO加载器
        gltfLoader.setDRACOLoader(dracoLoader)
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        
        let modelLoaded = false
        
        // 加载鲨鱼模型
        gltfLoader.load('public/models/shark_animation/scene.gltf',
          (gltf)=>{
            console.log('loaded')
            console.log(gltf)

            // 创建动画混合器，用于控制所有动画
            const mixer = this.mixer = new THREE.AnimationMixer(gltf.scene)
            
            // 从模型文件中提取三个动画并创建动画动作
            const swimingAction = mixer.clipAction(gltf.animations[0])  // 游泳动画
            const circlingAction = mixer.clipAction(gltf.animations[1]) // 绕圈动画
            const biteAction = mixer.clipAction(gltf.animations[2])     // 撕咬动画

            // 调整模型的方向
            gltf.scene.rotation.y =  Math.PI

            // 遍历模型中的所有网格对象
            gltf.scene.traverse(obj=>{
              if(obj.isMesh && obj.material){
                const {gltfExtensions}=obj.material.userData

                if(gltfExtensions){
                  const pbr = gltfExtensions.KHR_materials_pbrSpecularGlossiness
                  if(pbr){
                    // 加载材质贴图
                    const textureLoader = new THREE.TextureLoader()
                    // 加载漫反射贴图
                    const map  = new THREE.TextureLoader().load('public/models/shark_animation/textures/material_0_diffuse.png')
                    // 加载镜面光泽贴图
                    const specularGlossinessTexture = textureLoader.load('public/models/shark_animation/textures/material_0_specularGlossiness.png')
                    
                    // 设置贴图参数
                    map.flipY = false
                    map.colorSpace = THREE.SRGPColorSpace
                    specularGlossinessTexture.flipY = false
                    specularGlossinessTexture.colorSpace = THREE.SRGPColorSpace

                    // 创建物理材质
                    const material = new THREE.MeshPhysicalMaterial({
                      map,  // 漫反射贴图
                      color: new THREE.Color(
                        pbr.diffuseFactor[0],
                        pbr.diffuseFactor[1],
                        pbr.diffuseFactor[2]
                      ),
                      sheen:pbr.glossinessFactor,  // 光泽度
                      specularIntensityMap:specularGlossinessTexture,  // 镜面强度贴图
                      specularColor: new THREE.Color(
                        pbr.specularFactor[0],
                        pbr.specularFactor[1],
                        pbr.specularFactor[2]
                      ),
                      roughness:0.2  // 粗糙度
                    })
                    obj.material = material
                    this.dirLight.target = obj
                  }
                }
              }
            })
            
            this.scene.add(gltf.scene)
            modelLoaded = true

            // 创建GUI控制面板
            const gui = new GUI()
            const params = {
              animation:'',  // 当前动画状态
              timeScale:1,   // 动画播放速度
              pause(){       // 暂停所有动画
                swimingAction.paused = true
                circlingAction.paused = true
                biteAction.paused = true 
              },
              // 从静止状态切换到游泳状态
              '静止=>游动'(){
                params.animation='swiming'; // 确保 GUI 控制面板显示正确的当前动
                _this.prepareCrossFade('',swimingAction,2)
              },
              // 从游泳状态切换到撕咬状态
              '游动=>撕咬'(){
                params.animation='bite' // 确保 GUI 控制面板显示正确的当前动
                _this.prepareCrossFade('',biteAction,1)
              }
            }
            // 添加动画选择下拉菜单
            gui.add(params,'animation',{
              无:'',
              游动:'swiming',
              绕圈:'circling',
              撕咬:'bite'
            }).name('切换动画').onChange(val=>{
              // 停止所有动画
              swimingAction.stop()
              circlingAction.stop()
              biteAction.stop() 

              // 根据选择播放对应动画
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
            // 添加暂停按钮
            gui.add(params,'pause')
            // 添加动画速度控制滑块
            gui.add(params,'timeScale',0,4,0.01).name('动画播放速度').onChange(val=>{
              _this.mixer.timeScale = val;
            })
            // 添加动画过渡按钮
            gui.add(params,'静止=>游动');
            gui.add(params,'游动=>撕咬')
          },
          xhr=>{
            // 加载进度回调
          },
          error=>{
            console.log(error)
          }
        )
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
