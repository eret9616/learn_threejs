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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

        this.scene.add(ambientLight, directionalLight);
      },
      createObjects() {
        // 创建立方体几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        // 创建立方体的基础材质
        const material = new THREE.MeshLambertMaterial({ color: 0x1890ff });
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);
        this.mesh = mesh;
      },
      createCamera() {
        // 创建相机对象
        const frustumSize = 2; // 设置显示相机前方高为4的内容

        const aspect = this.width / this.height;
        const pCamera = new THREE.OrthographicCamera(
          -aspect * frustumSize,
          aspect * frustumSize,
          frustumSize,
          -frustumSize,
          0.1,
          1000
        );

        pCamera.position.set(1, 1, 2); // x,y,z
        pCamera.lookAt(this.scene.position);
        this.scene.add(pCamera);
        this.camera = pCamera;

        // 创建缩略图相机
        const thumbnailCamera = new THREE.OrthographicCamera(
          (-150 / 200) * frustumSize,
          (150 / 200) * frustumSize,
          frustumSize,
          -frustumSize,
          0.1,
          1000
        );
        thumbnailCamera.position.set(1, 1, 2);
        thumbnailCamera.lookAt(this.scene.position);
        this.thumbnailCamera = thumbnailCamera;
        this.scene.add(thumbnailCamera);
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;
        gui.add(_this.orbitControls, 'enabled');
        gui.add(_this.orbitControls, 'dampingFactor', 0.01, 0.2, 0.01); // 阻尼系数
        gui.add(_this.orbitControls, 'enablePan'); // 旋转速度
        // panspeed
        gui.add(_this.orbitControls, 'panSpeed', 1, 10, 1);
        gui.add(_this.orbitControls, 'autoRotate');
        gui.add(_this.orbitControls, 'autoRotateSpeed', 1, 10, 1);
        gui.add(_this.orbitControls, 'enableZoom');
        gui.add(_this.orbitControls, 'zoomSpeed', 1, 10, 1);
      },
      helpers() {
        const axesHelper = new THREE.AxesHelper();

        this.scene.add(axesHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper);
      },
      clipScene(renderer) {
        const dpr = window.devicePixelRatio || 1;
        // 裁剪
        renderer.setScissor(0, 0, this.width, this.height);
        renderer.setClearColor(0x999999, 0.5);
        // 设置渲染器屏幕像素比
        renderer.setPixelRatio(dpr);
        //设置渲染器大小
        renderer.setSize(this.width, this.height);
        // 执行渲染
        renderer.render(this.scene, this.camera);
      },
      clipThumbnail(renderer) {
        // w: 150 h:200 margin: 10
        const w = this.width - 150 - 10;
        // const h = this.height - 200 - 10;

        this.thumbnailCamera.position.copy(this.camera.position);
        this.thumbnailCamera.rotation.copy(this.camera.rotation);
        this.thumbnailCamera.zoom = this.camera.zoom * 0.5;
        this.thumbnailCamera.updateProjectionMatrix();

        renderer.setScissor(w, 10, 150, 200);
        renderer.setViewport(w, 10, 150, 200);
        renderer.setClearColor(0x000000);

        renderer.render(this.scene, this.thumbnailCamera);
      },
      render() {
        if (!this.renderer) {
          // 创建渲染器
          this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
          });
        }

        this.renderer.setScissorTest(true);

        // 全局裁剪
        this.clipScene(this.renderer);
        // 罗略图
        this.clipThumbnail(this.renderer);
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

        this.render();
        // this.renderer.render(this.scene, this.camera);
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
        // this.datGui();
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
