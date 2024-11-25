import { useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const Page = () => {
  useEffect(() => {
    const $ = {
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
        // 创建立方体几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        console.log(geometry);

        // 创建立方体的基础材质
        const material = new THREE.MeshLambertMaterial({ color: 0x1890ff });
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.mesh = mesh;
      },
      createCamera() {
        const size = 4;
        // 创建相机对象
        const orthoCamera = new THREE.OrthographicCamera(
          -size,
          size,
          size / 2,
          -size / 2,
          0.1,
          3
        );
        // 设置相机位置
        orthoCamera.position.set(2, 2, 3); // x,y,z
        // 单位是向量
        // 相机朝向
        orthoCamera.lookAt(this.scene.position);
        this.scene.add(orthoCamera);
        this.orthoCamera = orthoCamera;
        console.log(this.orthoCamera);
        this.camera = orthoCamera;

        // 用第二个相机观察
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height
        );
        watcherCamera.position.set(2, 2, 6); // x,y,z
        watcherCamera.lookAt(this.scene.position);
        this.scene.add(watcherCamera);
        this.camera = watcherCamera; // 覆盖camera
      },
      helpers() {
        const axesHelper = new THREE.AxesHelper();
        const cameraHelper = new THREE.CameraHelper(this.orthoCamera);

        this.scene.add(axesHelper, cameraHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper);

        this.cameraHelper = cameraHelper;
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
        this.mesh.rotation.y += 0.01;
        this.orbitControls.update();
        this.cameraHelper.update();
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
