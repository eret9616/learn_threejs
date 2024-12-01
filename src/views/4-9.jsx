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
import { func } from 'three/examples/jsm/nodes/Nodes.js';

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
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 2, 4);

        this.scene.add(ambientLight, directionalLight);
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
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg'
        );

        const aoTexture = textureLoader.load(
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_ambientOcclusion.jpg'
        );

        const bumpTexture = textureLoader.load(
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_height.png'
        );

        const normalTexture = textureLoader.load(
          'src/assets/textures/Glass_Vintage_001/Glass_Vintage_001_normal.jpg'
        );

        const roughnessTexture = textureLoader.load(
          'src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_roughness.jpg'
        );

        this.aoTexture = aoTexture;
        this.texture = texture;
        this.bumpTexture = bumpTexture;
        this.normalTexture = normalTexture;
        this.roughnessTexture = roughnessTexture;
      },
      createObjects() {
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const material = new THREE.MeshStandardMaterial({
          map: this.texture,
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.mesh = mesh;
        mesh.position.x = -2;

        const boxGeometry = new THREE.SphereGeometry(2, 64, 64);
        const boxMaterial = new THREE.MeshStandardMaterial({
          map: this.texture,
          //   aoMap: this.aoTexture,
          //   aoMapIntensity: 0.8,
          //   normalMap: this.normalTexture,
          //   bumpMap: this.bumpTexture,
          //   bumpScale: 10,
          roughtnessMap: this.roughnessTexture,
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        boxGeometry.setAttribute(
          'uv2',
          new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
        );
        console.log(boxGeometry);

        box.position.x = 2.5;
        this.box = box;
        this.scene.add(mesh, box);
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
        this.camera = pCamera;
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;
        gui.add(_this.orbitControls, 'enabled');
        gui.add(_this.box.material, 'aoMapIntensity', 0, 1, 0.1);

        gui
          .add(_this.box.material.normalScale, 'x', 0, 10, 0.1)
          .onChange((val) => {
            _this.box.material.normalScale = new THREE.Vector2(
              val,
              _this.box.material.normalScale.y
            );
          });

        gui
          .add(_this.box.material.normalScale, 'y', 0, 10, 0.1)
          .onChange((val) => {
            _this.box.material.normalScale = new THREE.Vector2(
              _this.box.material.normalScale.x,
              val
            );
          });

        gui.add(_this.box.material, 'roughness', 0, 1, 0.1);
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