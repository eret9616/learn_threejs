import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const Page = () => {
  useEffect(() => {
    const $ = {
      cameraIndex: 0,
      createScene() {
        console.log(THREE);
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
        const geometry = new THREE.BufferGeometry();
        const colors = [];
        const color = new THREE.Color();
        const positions = [];

        // 设置所有定点的坐标和颜色值
        for (let i = 0; i < 500; i++) {
          for (let j = 0; j < 500; j++) {
            const x = i - 250;
            const y = j - 250;

            positions.push(x, y, 0);
            color.setRGB(i / 100, j / 100, Math.random());
            colors.push(color.r, color.g, color.b);
          }
        }

        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(colors, 3)
        );
        geometry.computeBoundingSphere();

        const material = new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.1,
        });

        const point = new THREE.Points(geometry, material);

        point.rotation.x = -Math.PI / 2;
        this.point = point;
        this.scene.add(point);
      },
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          1,
          10
        );
        pCamera.position.set(1, 1, 10); // x,y,z
        pCamera.lookAt(this.scene.position);
        this.scene.add(pCamera);
        this.camera = pCamera;
        this.pCamera = pCamera;
        // 用第二个相机观察
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );
        watcherCamera.position.set(2, 2, 6); // x,y,z
        watcherCamera.lookAt(this.scene.position);
        this.watcherCamera = watcherCamera;
        this.scene.add(watcherCamera);
        this.camera = watcherCamera; // 覆盖camera
      },
      datGui() {
        const _this = this;
        const gui = new dat.GUI({ width: 200 });
      },
      helpers() {
        // const cameraHelper = new THREE.CameraHelper(this.pCamera);
        // this.scene.add(cameraHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper);
        // this.cameraHelper = cameraHelper;
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
      },
      clock: new THREE.Clock(),
      tick() {
        const elapsedTime = this.clock.getElapsedTime() * 2;

        // update objects
        const { position } = this.point.geometry.attributes;

        console.log(position);

        for (let i = 0; i < position.count; i++) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z =
            Math.sin(x * 0.5 + elapsedTime) * 0.5 +
            Math.cos(y * 0.5 + elapsedTime) * 0.5;
          position.setXYZ(i, x, y, z);
        }

        position.needsUpdate = true;

        // this.point.rotation.z += 0.01;
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
            this.renderer.setSize(width, height);
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
