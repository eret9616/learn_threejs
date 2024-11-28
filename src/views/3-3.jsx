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
// mergeBufferGeometries
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
        const carGeometry = new THREE.BoxGeometry(2, 0.2, 1);

        const material = new THREE.MeshLambertMaterial({ color: 0x1890ff });
        const car = new THREE.Mesh(carGeometry, material);

        this.scene.add(car);

        // 车轮
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10);
        const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);

        // 4个wheel的name都叫 wheel
        wheel1.name = 'wheel';
        wheel2.name = 'wheel';
        wheel3.name = 'wheel';
        wheel4.name = 'wheel';

        wheel1.rotation.x = -Math.PI / 2;
        wheel1.position.set(-0.5, 0, 0.4);
        //
        wheel2.rotation.x = -Math.PI / 2;
        wheel2.position.set(-0.5, 0, -0.4);
        //
        wheel3.rotation.x = -Math.PI / 2;
        wheel3.position.set(0.5, 0, -0.4);
        //
        wheel4.rotation.x = -Math.PI / 2;
        wheel4.position.set(0.5, 0, 0.4);

        const lightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        const light1 = new THREE.Mesh(lightGeometry, lightMaterial);
        light1.position.set(-1.05, 0, 0.2);
        const light2 = new THREE.Mesh(lightGeometry, lightMaterial);
        light2.position.set(-1.05, 0, -0.2);

        const group = new THREE.Group();
        group.add(car, wheel1, wheel2, wheel3, wheel4, light1, light2);
        group.position.y = 0.2;
        this.group = group;

        console.log(group);
        // 合并几何体体
        // const geometry = mergeBufferGeometries([carGeometry, wheelGeometry]);
        // const mesh = new THREE.Mesh(geometry, material);
        // mesh.position.y = -1;
        // this.scene.add(mesh);
        this.scene.add(group);
        // this.scene.add(car, wheel1, wheel2, wheel3, wheel4, light1, light2);
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
        const gridHelper = new THREE.GridHelper(100, 10, 0xcd37aa, 0x4a4a4a);

        this.scene.add(axesHelper);
        // 创建辅助平面
        // const gridHelper = new THREE.GridHelper();
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
      // 让小车动起来
      runCar() {
        console.log(this.group.children);
        const { children } = this.group;

        const delta = 4;
        const speed = ((2 * Math.PI * 0.2) / 360) * delta;

        for (const i in children) {
          const mesh = children[i];
          if (mesh.name === 'wheel') {
            mesh.rotation.y += THREE.MathUtils.radToDeg(delta);
          }
        }
        this.group.position.x -= speed;

        if (this.group.position.x < -10) {
          this.group.position.x = 10;
        }
      },
      tick() {
        this.orbitControls.update();
        this.runCar();
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
