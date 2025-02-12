import { useEffect } from 'react';
import * as THREE from 'three';
import vertShader from './8-5-shader/shader.vert';
import fragShader from './8-5-shader/shader.frag';
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
        scene.fog = new THREE.Fog(0x000000, 0, 20);
        this.scene = scene;
      },
      createLights() {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        this.scene.add(ambientLight, directionalLight);
      },
      // 生成两数之间的随机数
      random: (min, max) => min + Math.random() * (max - min),
      createGeometry(numbers) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numbers * 3);

        // 创建numbers个顶点
        for (let i = 0; i < numbers; i++) {
          const x = Math.random();
          const y = Math.random();
          const z = Math.random();
          positions[i * 3] = Math.sin(i);
          positions[i * 3 + 1] = Math.cos(i);
          positions[i * 3 + 2] = this.random(-50, 0);
        }

        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.computeBoundingSphere();
        return geometry;
      },
      createObjects(numbers) {
        const texture = new THREE.TextureLoader().load(
          '/src/assets/textures/star_1.png'
        );
        const material = new THREE.ShaderMaterial({
          //   uniforms: {
          // pointTexture: {
          //   value: texture,
          // },
          //   },
          vertexShader: vertShader,
          fragmentShader: fragShader,
          //   vertexColors: true,
          //   size: 0.2,
          //   color: 0xffffff,
          transparent: true,
          depthTest: true, // 深度测试
          depthWrite: false, // 材质是否对深度缓冲区有影响
          //   map: texture,
          uniforms: {
            color: {
              value: new THREE.Color(0xffffff),
            },
            pointTexture: {
              value: texture,
            },
            fogColor: {
              value: new THREE.Color(0x000000),
            },
            fogNear: {
              value: 0,
            },
            fogFar: {
              value: 10,
            },
          },
          blending: THREE.AdditiveBlending,
        });
        const point = new THREE.Points(this.createGeometry(numbers), material);

        this.point = point;
        this.scene.add(point);
      },
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.01,
          1000
        );
        pCamera.position.set(0, 0, 0); // x,y,z
        pCamera.lookAt(this.scene);
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
        particles: 1000,
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
          .add(_this.params, 'particles', 1, 5000, 1)
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
        const point = this.scene.children.find((x) => x.type === 'Points');
        const { attributes: attrs } = point.geometry;

        point.rotation.z += 0.01;
        for (let i = 0; i < attrs.position.array.length; i++) {
          if (i % 3 === 2) {
            // 判断当前粒子是否在相机后面
            const z = attrs.position.array[i];
            const distance = z - this.camera.position.z;
            if (distance >= 0) {
              attrs.position.array[i] = -50 + Math.random() * 2;
            }

            // 移动粒子z轴坐标
            attrs.position.array[i] += 0.05;
          }
        }

        attrs.position.needsUpdate = true;

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
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
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
