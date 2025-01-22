import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
      createObjects() {},
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          1,
          10
        );
        pCamera.position.set(0, 0, 3); // x,y,z
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
      datGui() {},
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
      tick() {
        // this.mesh.rotation.y += 0.01;
        this.orbitControls.update();
        // this.cameraHelper.update();  // 移除这行
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
