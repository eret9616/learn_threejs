import { useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// DragControls
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras.js';

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
      },
      createLights() {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

        // this.scene.add(ambientLight, directionalLight);
        this.directionalLight = directionalLight;
      },
      loadTextures() {
        // 方法1
        // const img = new Image();
        // const texture = new THREE.Texture(img);
        // img.onload = function () {
        //   console.log(texture);
        //   texture.needsUpdate = true;
        // };
        // img.src =
        //   'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg';

        // 方法2
        // const textureLoader = new THREE.TextureLoader();
        // this.texture = textureLoader.load(
        //   'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg',
        //   function (texture) {
        //     // this.mesh.material.map = texture;
        //   },
        //   null,
        //   (error) => {
        //     console.log(error);
        //   }
        // );

        // 方法3
        const manager = new THREE.LoadingManager();
        manager.onStart = function (url, itemsLoaded, itemsTotal) {
          console.log(
            'Started loading file: ' +
              url +
              '.\nLoaded ' +
              itemsLoaded +
              ' of ' +
              itemsTotal +
              ' files.'
          );
        };

        manager.onLoad = function () {
          console.log('Loading complete!');
        };

        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
          console.log(
            'Loading file: ' +
              url +
              '.\nLoaded ' +
              itemsLoaded +
              ' of ' +
              itemsTotal +
              ' files.'
          );
        };

        manager.onError = function (url) {
          console.log('There was an error loading ' + url);
        };

        const loader = new OBJLoader(manager);
        loader.load('file.obj', function (object) {
          //
        });

        const textureLoader = new THREE.TextureLoader(manager);

        let texture = textureLoader.load(
          '/src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg'
        );

        const aoTexture = textureLoader.load(
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_ambientOcclusion.jpg'
        );

        const bumpTexture = textureLoader.load(
          'src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_height.png'
        );

        const normalTexture = textureLoader.load(
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_normal.jpg'
        );

        const roughnessTexture = textureLoader.load(
          'src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_roughness.jpg'
        );

        const metalTexture = textureLoader.load(
          'src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_metallic.jpg'
        );

        const specularTexture = textureLoader.load(
          '/src/assets/textures/earth/earth_specular_2048.jpg'
        );

        const matcapTexture = textureLoader.load(
          'src/assets/textures/matcaps/BA472D_CA6E67-256px.png'
        );

        this.texture = texture;
        this.aoTexture = aoTexture;
        this.bumpTexture = bumpTexture;
        this.normalTexture = normalTexture;
        this.roughnessTexture = roughnessTexture;
        this.metalTexture = metalTexture;
        this.specularTexture = specularTexture;
        this.matcapTexture = matcapTexture;

        // 环境贴图加载器
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const envTexture = cubeTextureLoader.load([
          '/src/assets/textures/fullscreen/1.left.jpg',
          '/src/assets/textures/fullscreen/1.right.jpg',
          '/src/assets/textures/fullscreen/1.top.jpg',
          '/src/assets/textures/fullscreen/1.bottom.jpg',
          '/src/assets/textures/fullscreen/1.front.jpg',
          '/src/assets/textures/fullscreen/1.back.jpg',
        ]);

        this.envTexture = envTexture;
      },
      createObjects() {
        const geometry = new THREE.SphereGeometry(0.5, 64, 64);
        const material = new THREE.MeshDepthMaterial();
        const mesh1 = new THREE.Mesh(geometry, material);
        const mesh2 = new THREE.Mesh(geometry, material);
        const mesh3 = new THREE.Mesh(geometry, material);
        const mesh4 = new THREE.Mesh(geometry, material);
        mesh1.position.z = 0;
        mesh2.position.z = 1;
        mesh3.position.z = 2;
        mesh4.position.z = 3;

        this.mesh1 = mesh1;
        this.scene.add(mesh1, mesh2, mesh3, mesh4);
      },
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );

        pCamera.position.set(0, 1, 6); // x,y,z
        pCamera.lookAt(this.scene.position);
        this.scene.add(pCamera);
        this.pCamera = pCamera;
        this.camera = pCamera;
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;

        gui.add(_this.camera.position, 'z', 0.1, 10, 0.1).name('cameraZ');
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
        });
        // 设置渲染器屏幕像素比
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        //设置渲染器大小
        renderer.setSize(this.width, this.height);
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
          [this.mesh1],
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
        this.loadTextures();
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
