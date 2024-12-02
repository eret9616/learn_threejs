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

        this.scene.add(ambientLight, directionalLight);
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
          'src/assets/textures/matcaps/6D3B1C_844C31-256px.png'
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
        const material = new THREE.MeshPhongMaterial({
          //   color: 0x1890ff,
          transparent: true,
          side: THREE.DoubleSide,
          //   matcap: this.matcapTexture,
          map: this.texture,
        });

        const box = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          material
        ); // 立方体
        const meshMaterial = new THREE.MeshPhongMaterial({
          //   color: 0x1890ff,
          //   matcap: this.matcapTexture,
          map: this.texture,
          //   normalMap: this.normalTexture,
          specular: 0x00ffff,
        });
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          meshMaterial
        ); // 立方体
        this.mesh = mesh;
        this.box = box;

        box.position.x = -1.2;
        mesh.position.x = 1.2;

        this.meshMaterial = meshMaterial;
        this.material = material;
        this.scene.add(mesh, box);
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
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;
        const params = {
          x: _this.meshMaterial.normalScale.x,
          y: _this.meshMaterial.normalScale.y,
        };
        gui.add(params, 'x', 0, 2, 0.1).onChange(function (val) {
          _this.meshMaterial.normalScale = new THREE.Vector2(val, params.y);
        });
        gui.add(params, 'y', 0, 2, 0.1).onChange(function (val) {
          _this.meshMaterial.normalScale = new THREE.Vector2(params.x, val);
        });

        gui.add(_this.directionalLight.position, 'x', -10, 10, 0.1);
        gui.add(_this.directionalLight.position, 'y', -10, 10, 0.1);
        gui.add(_this.directionalLight.position, 'z', -10, 10, 0.1);

        gui.add(_this.meshMaterial, 'shininess', 0, 10, 0.1);
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
          [this.mesh],
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
