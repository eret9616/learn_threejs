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
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(5, 20, 5); // 调整光源位置到更高处
        directionalLight.castShadow = true; // 启用阴影

        this.scene.add(ambientLight, directionalLight);

        // 添加光的helper查看光源位置
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
        this.scene.add(directionalLightHelper);
      },
      createObjects() {
        const _this = this
        const gltfLoader = new GLTFLoader()
        const dracoLoader = new DRACOLoader('/src/assets/draco')
        
        gltfLoader.setDRACOLoader(dracoLoader)
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        gltfLoader.load('public/models/Fox/glTF-Binary/Fox.glb',
          (gltf)=>{
            console.log('loaded')
            console.log(gltf)
            gltf.scene.scale.set(0.05,0.05,0.05)
            // gltf.scene.position.y = -10
            
            this.scene.add(gltf.scene)
          },
          xhr=>{
            // console.log(xhr)
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

        pCamera.position.set(0, 1, 2); // x,y,z
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
      tick() {
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
      start your project
      <canvas id="c" />;
    </>
  );
};

export default Page;
