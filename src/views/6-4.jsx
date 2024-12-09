import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';

const Page = () => {
  useEffect(() => {
    const $ = {
      createScene() {
        const canvas = document.getElementById('c');
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        // 创建3D场景对象
        const scene = new THREE.Scene();
        this.scene = scene;
      },
      createLights() {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        this.ambientLight = ambientLight;

        RectAreaLightUniformsLib.init();
        // 添加面光源
        const rectLight = new THREE.RectAreaLight(0xffffff, 10, 2, 4);
        rectLight.position.set(0, 1, 5);
        const rectHelper = new RectAreaLightHelper(rectLight);

        this.rectLight = rectLight;

        this.scene.add(ambientLight, rectLight, rectHelper);
      },
      loadTextures() {
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
        const textureLoader = new THREE.TextureLoader(manager);

        const floorTexture = textureLoader.load(
          '/src/assets/textures/floor_tiles_06/floor_tiles_06_diff_2k.jpg'
        );

        const wallTexture = textureLoader.load(
          'src/assets/textures/large_sandstone_blocks/large_sandstone_blocks_diff_2k.jpg'
        );

        const photoTexture = textureLoader.load(
          'src/assets/textures/frames/A02I7634.png'
        );

        floorTexture.wrapS = THREE.RepeatWrapping; // 水平重复
        floorTexture.wrapT = THREE.RepeatWrapping; // 垂直重复
        floorTexture.repeat.set(100, 100); // 重

        this.photoTexture = photoTexture;
        this.floorTexture = floorTexture;
        this.wallTexture = wallTexture;
      },
      createObjects() {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({
            color: 0x1890ff,
          })
        );
        this.box = box;

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(100, 100),
          new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            roughness: 0,
          })
        );

        const wall = new THREE.Mesh(
          new THREE.PlaneGeometry(10, 10),
          new THREE.MeshStandardMaterial({
            map: this.wallTexture,
          })
        );

        // 添加相框
        const frameGeometry = new THREE.PlaneGeometry(4.4, 6.4);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0xd08a38,
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        const photoGeometry = new THREE.PlaneGeometry(4, 6);
        const photoMaterial = new THREE.MeshStandardMaterial({
          map: this.photoTexture,
          roughness: 0,
        });
        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
        const group = new THREE.Group();
        group.add(frame, photo);
        frame.position.z = 0.001;
        photo.position.z = 0.002;
        group.position.z = -5;
        group.position.y = 5;

        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.8;
        floor.position.z = -2;

        wall.position.y = 0.8;
        wall.position.z = -5;

        this.scene.add(box, floor, wall, group);
      },
      createCamera() {
        // 创建第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );
        watcherCamera.position.set(0, 0, 4);
        watcherCamera.lookAt(this.scene.position);
        this.scene.add(watcherCamera);
        this.camera = watcherCamera;
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;
        // 控制环境光是否可见
        const ambientLightFolder = gui.addFolder('环境光');
        ambientLightFolder.add(this.ambientLight, 'visible').name('可见');
        ambientLightFolder.open();

        const boxFolder = gui.addFolder('box');
        boxFolder.add(_this.box.position, 'x', -20, 20, 0.1).onChange(() => {
          _this.rectLight.lookAt(_this.box.position);
        });
        boxFolder.add(_this.box.position, 'y', -20, 20, 0.1).onChange(() => {
          _this.rectLight.lookAt(_this.box.position);
        });
        boxFolder.add(_this.box.position, 'z', -20, 20, 0.1).onChange(() => {
          _this.rectLight.lookAt(_this.box.position);
        });
        boxFolder.open();

        const r = gui.addFolder('矩形面光源');
        r.open();
        r.add(_this.rectLight, 'visible');
        r.add(_this.rectLight, 'intensity', 0, 20, 0.1);
        r.addColor(_this.rectLight, 'color').onChange((val) => {
          _this.rectLight.color = new THREE.Color(val.r, val.g, val.b);
        });
        r.add(_this.rectLight, 'width', 0, 10, 0.1);
        r.add(_this.rectLight, 'height', 0, 10, 0.1);
        r.add(_this.rectLight.position, 'x', -10, 10, 0.1);
        r.add(_this.rectLight.position, 'y', -10, 10, 0.1);
        r.add(_this.rectLight.position, 'z', -10, 10, 0.1);
        r.add(_this.rectLight.rotation, 'x', -Math.PI, Math.PI, 0.01);
        r.add(_this.rectLight.rotation, 'y', -Math.PI, Math.PI, 0.01);
        r.add(_this.rectLight.rotation, 'z', -Math.PI, Math.PI, 0.01);
      },
      helpers() {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        // 创建辅助平面
        this.scene.add(axesHelper);
      },
      render() {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
        });

        renderer.shadowMap.enabled = true;
        // 设置渲染器屏幕像素比
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        // 设置渲染器大小
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
      },
      tick() {
        this.orbitControls.update();
        // this.texture.offset.x+=0.01
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.tick());
      },
      fitView() {
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
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
      <canvas id="c" />;
    </>
  );
};

export default Page;
