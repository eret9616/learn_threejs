import { useEffect } from 'react';
import * as THREE from 'three';
import vertShader from './8-3-shader/shader.vert';
import fragShader from './8-3-shader/shader.frag';
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
      createGeometry(numbers) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numbers * 3);
        const colors = new Float32Array(numbers * 3);

        const size = new Float32Array(numbers);
        const opacity = new Float32Array(numbers);

        // 创建numbers个顶点
        for (let i = 0; i < numbers; i++) {
          const x = Math.random();
          const y = Math.random();
          const z = Math.random();
          positions[i * 3] = x * 60 - 30;
          positions[i * 3 + 1] = y * 60 - 30;
          positions[i * 3 + 2] = z * 60 - 30;

          colors[i * 3] = x;
          colors[i * 3 + 1] = y;
          colors[i * 3 + 2] = z;

          size[i] = Math.random();
          opacity[i] = Math.random();
        }

        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(size, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(opacity, 1));
        geometry.computeBoundingSphere();
        return geometry;
      },
      createObjects(numbers) {
        const material = new THREE.ShaderMaterial({
          vertexShader: vertShader,
          fragmentShader: fragShader,
          transparent: true,
          vertexColors: true,
        });
        const point = new THREE.Points(this.createGeometry(numbers), material);
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
        pCamera.position.set(0, 0, 80); // x,y,z
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
      params: {
        particles: 10000,
        vertexColors: true,
      },
      datGui() {
        const _this = this;
        const gui = new dat.GUI({ width: 200 });
        gui
          .add(_this.params, 'vertexColors')
          .name('顶点颜色')
          .onChange((value) => {
            _this.point.material.vertexColors = value;
            _this.point.material.needsUpdate = true;
          });
        gui
          .add(_this.params, 'particles', 1, 500000, 1)
          .name('粒子数量')
          .onChange((value) => {
            // 先销毁旧的粒子
            const point = _this.scene.children.find((child) => child.isPoints);
            if (point) {
              point.removeFromParent();
            }
            // 重新创建粒子
            _this.createObjects(value);
          });
      },
      helpers() {
        // const cameraHelper = new THREE.CameraHelper(this.pCamera);
        // this.scene.add(cameraHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper);
        // this.cameraHelper = cbeameraHelper;
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
        const point = this.scene.children.find((child) => child.isPoints);
        if (point) {
          point.rotation.x += 0.01 / 3;
          point.rotation.y += 0.01 / 3;
        }

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
        this.createObjects(this.params.particles);
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
